require("dotenv").config({path: "/home/ubuntu/.openclaw/workspace/residentialist/.env"});
// IMAP Monitor for Spec Sheet Ingestion
// Watches configured email folder for spec sheet attachments
// Triggers parser and stores results in SQLite for review

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const SpecSheetParser = require('./spec_sheet_parser');

class IMAPMonitor {
  constructor(config, dbPath) {
    this.config = {
      user: process.env.EMAIL_ADDRESS,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.IMAP_SERVER,
      port: process.env.IMAP_PORT || 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false
      },
      ...config
    };

    this.dbPath = dbPath;
    this.db = null;
    this.imap = null;
    this.parser = new SpecSheetParser();
    this.isRunning = false;
    this.processedMessageIds = new Set();
  }

  async init() {
    /**
     * Initialize database connection and IMAP client
     */
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) reject(err);
        console.log('[IMAP] Database connected');

        this.imap = new Imap(this.config);

        this.imap.on('error', (err) => {
          console.error('[IMAP] Error:', err);
        });

        this.imap.on('end', () => {
          console.log('[IMAP] Connection ended');
        });

        resolve();
      });
    });
  }

  async start(pollingIntervalMs = 300000) {
    /**
     * Start monitoring email folder
     * Polls every 5 minutes by default
     */
    if (this.isRunning) {
      console.log('[IMAP] Monitor already running');
      return;
    }

    this.isRunning = true;
    console.log('[IMAP] Monitor started');

    // Wait for IMAP connection to be ready
    await new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log('[IMAP] Connection authenticated');
        resolve();
      });
      
      this.imap.once('error', (err) => {
        console.error('[IMAP] Connection error:', err);
        reject(err);
      });
      
      this.imap.connect();
    });

    // Now open mailbox and check for emails
    await this.openBox();
    await this.checkNewEmails();

    // Then poll at interval
    this.pollInterval = setInterval(async () => {
      try {
        await this.checkNewEmails();
      } catch (err) {
        console.error('[IMAP] Polling error:', err);
      }
    }, pollingIntervalMs);
  }

  async stop() {
    /**
     * Stop monitoring
     */
    this.isRunning = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.imap) this.imap.closeBox(false, () => this.imap.end());
    if (this.db) this.db.close();
    console.log('[IMAP] Monitor stopped');
  }

  async openBox() {
    return new Promise((resolve, reject) => {
      const boxName = process.env.EMAIL_FOLDER || 'INBOX';
      this.imap.openBox(boxName, false, (err, box) => {
        if (err) reject(err);
        console.log(`[IMAP] Opened box: ${boxName}`);
        resolve(box);
      });
    });
  }

  async checkNewEmails() {
    /**
     * Search for unread emails with attachments since last check
     */
    return new Promise((resolve, reject) => {
      // Search for unseen emails with attachments
      this.imap.search(['UNSEEN'], (err, results) => {
        if (err) {
          console.error('[IMAP] Search error:', err);
          reject(err);
          return;
        }

        if (results.length === 0) {
          console.log('[IMAP] No new emails');
          resolve([]);
          return;
        }

        console.log(`[IMAP] Found ${results.length} new email(s)`);
        this.processEmails(results).then(resolve).catch(reject);
      });
    });
  }

  async processEmails(messageIds) {
    /**
     * Fetch and process a batch of emails
     */
    const processed = [];

    for (const messageId of messageIds) {
      try {
        const email = await this.fetchEmail(messageId);
        if (email && email.attachments && email.attachments.length > 0) {
          const result = await this.processEmail(email);
          processed.push(result);
        }
        // Mark as read
        this.imap.setFlags(messageId, ['\\Seen'], () => {});
      } catch (err) {
        console.error(`[IMAP] Error processing message ${messageId}:`, err);
      }
    }

    return processed;
  }

  async fetchEmail(messageId) {
    /**
     * Fetch a single email with full content
     * Collects message as buffer, then passes to simpleParser
     */
    return new Promise((resolve, reject) => {
      const f = this.imap.fetch(messageId, { bodies: '' });

      f.on('message', (msg) => {
        // Collect message into buffer
        const chunks = [];
        
        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            chunks.push(chunk);
          });
          
          stream.on('end', async () => {
            const buffer = Buffer.concat(chunks);
            try {
              const parsed = await simpleParser(buffer);
              resolve(parsed);
            } catch (err) {
              reject(err);
            }
          });
        });
        
        msg.on('attributes', () => {
          // Attributes received
        });
      });

      f.on('error', reject);
    });
  }

  async processEmail(email) {
    /**
     * Extract spec sheet data from email and store in database
     */
    console.log(`[IMAP] Processing email from ${email.from.text}`);

    const spec_id = `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract property/builder info from email headers
    const subject = email.subject || '';
    const body = email.text || email.html || '';

    // Simple heuristics to extract address/builder
    const addressMatch = subject.match(/(\d+\s+[\w\s,]+(?:st|rd|nd|th|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|place|pl))/i);
    const cityMatch = subject.match(/([A-Z][a-z]+),\s*[A-Z]{2}/);

    const propertyAddress = addressMatch ? addressMatch[1] : 'Address not extracted';
    const propertyCity = cityMatch ? cityMatch[1] : 'City not extracted';
    const builderName = email.from.text || 'Builder info not provided';

    // Extract text from attachments (PDF, Word, etc.)
    let extractedText = body; // Start with email body
    const attachmentPromises = (email.attachments || []).map(async (attachment) => {
      try {
        // For PDFs: would need pdf-parse or similar
        // For now, store binary and note that PDF parsing requires additional setup
        if (attachment.filename.endsWith('.pdf')) {
          console.log(`[IMAP] PDF attachment found: ${attachment.filename} (requires pdf-parse setup)`);
          // TODO: Add PDF text extraction
        } else if (attachment.filename.endsWith('.docx')) {
          console.log(`[IMAP] DOCX attachment found: ${attachment.filename} (requires docx parsing setup)`);
          // TODO: Add DOCX text extraction
        }
      } catch (err) {
        console.error(`[IMAP] Attachment error:`, err);
      }
    });

    await Promise.all(attachmentPromises);

    // Parse spec sheet
    const parseResult = this.parser.parse(extractedText);

    // Store in database
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO spec_sheets (
          spec_id, source, email_message_id, property_address, property_city, builder_name,
          raw_text, extracted_products, extraction_summary, categories_found, items_needing_review,
          email_received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        spec_id,
        'Email',
        messageId,
        propertyAddress,
        propertyCity,
        builderName,
        extractedText,
        JSON.stringify(parseResult.extracted_products),
        JSON.stringify(parseResult.extraction_summary),
        parseResult.total_items_extracted,
        parseResult.items_needing_review_count,
        new Date().toISOString()
      );

      stmt.finalize((err) => {
        if (err) {
          console.error('[IMAP] DB insert error:', err);
          reject(err);
          return;
        }

        console.log(`[IMAP] Spec sheet stored: ${spec_id}`);

        // Log activity
        this.logActivity(spec_id, null, 'spec_sheet_parsed', 'System', null, 'Pending_Review',
          `Parsed ${parseResult.total_items_extracted} products from ${propertyAddress}, ${propertyCity}`
        );

        // Send Telegram notification
        this.sendTelegramNotification(spec_id, parseResult, propertyAddress, propertyCity, builderName);

        resolve({
          spec_id,
          parseResult,
          propertyAddress,
          propertyCity,
          builderName
        });
      });
    });
  }

  sendTelegramNotification(spec_id, parseResult, address, city, builder) {
    /**
     * Send notification to Telegram about new spec sheet
     * This will be called from the sessions_send mechanism
     */
    const message = `
New spec sheet received — ${address}, ${city} (${builder})
Extracted ${parseResult.total_items_extracted} of 16 product categories.
${parseResult.items_needing_review_count} items need review.

Dashboard: [Mission Control → Review Queue]
Spec ID: ${spec_id}
    `.trim();

    // This will be sent via message tool or Telegram API
    // For now, log it
    console.log(`[TELEGRAM] ${message}`);
  }

  logActivity(eval_id, spec_id, activity_type, actor, status_before, status_after, message) {
    /**
     * Log activity for dashboard
     */
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO activity_log (eval_id, spec_id, activity_type, actor, status_before, status_after, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(eval_id, spec_id, activity_type, actor, status_before, status_after, message);
      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close() {
    this.stop();
  }
}

module.exports = IMAPMonitor;

// CLI usage
if (require.main === module) {
  const config = {
    user: process.env.EMAIL_ADDRESS,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.IMAP_SERVER,
    port: process.env.IMAP_PORT || 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  };

  const monitor = new IMAPMonitor(config, './residentialist.db');

  monitor.init().then(() => {
    monitor.start(300000); // Poll every 5 minutes
  }).catch(err => {
    console.error('Failed to start monitor:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    monitor.close();
    process.exit(0);
  });
}
