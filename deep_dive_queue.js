/**
 * THE RESIDENTIALIST — Deep Dive Queue
 * Manages batch deep dive processing with sequential execution and Telegram notifications.
 * 
 * Usage:
 *   const { DeepDiveQueue } = require('./deep_dive_queue');
 *   const queue = new DeepDiveQueue();
 *   await queue.addBatch([{ product_name: 'Pella 250', operation_type: 'double_hung' }]);
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { runProductDeepDive } = require('./deep_dive_pipeline');
const { checkManufacturer, detectManufacturer, runManufacturerSearch, runManufacturerRefresh } = require('./manufacturer_manager');

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const DELAY_BETWEEN_CALLS = 5000; // 5 seconds between API calls

/**
 * Send a Telegram notification.
 */
async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log(`[TELEGRAM] (disabled) ${message}`);
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🏠 Residentialist\n${message}`,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error(`[TELEGRAM] Send failed: ${err.message}`);
  }
}

class DeepDiveQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.current = null;
    this.completedCount = 0;
    this.errorCount = 0;
    this.results = [];
    this.batchId = Date.now().toString(36);
  }

  /**
   * Add a batch of products to the queue.
   * Groups by manufacturer for efficiency.
   */
  async addBatch(products) {
    console.log(`\n[QUEUE] Adding batch of ${products.length} products (batch ${this.batchId})`);

    // Group by manufacturer
    const manufacturers = {};
    products.forEach(p => {
      const mfg = detectManufacturer(p.product_name);
      if (!manufacturers[mfg]) manufacturers[mfg] = [];
      manufacturers[mfg].push(p);
    });

    // Queue manufacturer searches first (if needed)
    for (const [mfg, prods] of Object.entries(manufacturers)) {
      const mfgStatus = checkManufacturer(mfg);
      if (mfgStatus.action !== 'skip') {
        this.queue.push({ type: mfgStatus.action, manufacturer: mfg });
        console.log(`[QUEUE] Added ${mfgStatus.action} for manufacturer: ${mfg}`);
      }
    }

    // Queue product deep dives
    products.forEach(p => {
      this.queue.push({ type: 'product_deepdive', ...p });
      console.log(`[QUEUE] Added deep dive: ${p.product_name} (${p.operation_type || 'general'})`);
    });

    console.log(`[QUEUE] Total items queued: ${this.queue.length}`);
    await sendTelegram(`📋 Deep dive batch started\n${products.length} products queued`);

    if (!this.processing) {
      await this.processNext();
    }
  }

  /**
   * Process the next item in the queue.
   */
  async processNext() {
    if (this.queue.length === 0) {
      this.processing = false;
      const summary = `✅ Deep dive batch complete (${this.batchId})\n` +
        `Completed: ${this.completedCount} | Errors: ${this.errorCount}`;
      console.log(`\n[QUEUE] ${summary}`);
      await sendTelegram(summary);
      return;
    }

    this.processing = true;
    this.current = this.queue.shift();
    const remaining = this.queue.length;

    try {
      if (this.current.type === 'full_search') {
        console.log(`\n[QUEUE] Processing manufacturer search: ${this.current.manufacturer} (${remaining} remaining)`);
        await runManufacturerSearch(this.current.manufacturer, PERPLEXITY_API_KEY);
        
      } else if (this.current.type === 'light_refresh') {
        console.log(`\n[QUEUE] Processing manufacturer refresh: ${this.current.manufacturer} (${remaining} remaining)`);
        await runManufacturerRefresh(this.current.manufacturer, PERPLEXITY_API_KEY);
        
      } else if (this.current.type === 'product_deepdive') {
        console.log(`\n[QUEUE] Processing deep dive: ${this.current.product_name} (${remaining} remaining)`);
        const result = await runProductDeepDive(
          this.current.product_name,
          this.current.operation_type
        );
        
        this.results.push(result);
        
        if (result.success) {
          this.completedCount++;
          const sources = result.structured?.auto_classification_summary?.total || '?';
          await sendTelegram(`✅ ${this.current.product_name}\n${sources} sources found → staged`);
        } else {
          this.errorCount++;
          await sendTelegram(`❌ ${this.current.product_name}\nError: ${result.error}`);
        }
      }
    } catch (err) {
      console.error(`[QUEUE] Error processing ${JSON.stringify(this.current)}: ${err.message}`);
      this.errorCount++;
      await sendTelegram(`❌ Queue error: ${err.message}`);
    }

    // Wait between calls
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_CALLS));
    await this.processNext();
  }

  /**
   * Get current queue status.
   */
  getStatus() {
    return {
      batch_id: this.batchId,
      processing: this.processing,
      current: this.current,
      queued: this.queue.length,
      completed: this.completedCount,
      errors: this.errorCount,
      queue_items: this.queue.map((item, i) => ({
        position: i + 1,
        type: item.type,
        name: item.product_name || item.manufacturer
      }))
    };
  }
}

// Singleton queue instance
let queueInstance = null;
function getQueue() {
  if (!queueInstance) queueInstance = new DeepDiveQueue();
  return queueInstance;
}

// ── CLI entry point ───────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node deep_dive_queue.js "Product 1" "Product 2" "Product 3"');
    console.log('  node deep_dive_queue.js --file batch_list.json');
    process.exit(1);
  }

  let products;
  if (args[0] === '--file') {
    const fileData = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    products = fileData.products || fileData;
  } else {
    products = args.map(name => ({ product_name: name, operation_type: 'double_hung' }));
  }

  const queue = getQueue();
  queue.addBatch(products)
    .then(() => {
      console.log('\nBatch processing complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error(`Fatal: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { DeepDiveQueue, getQueue, sendTelegram };
