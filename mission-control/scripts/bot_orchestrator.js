// Bot Orchestrator
// Manages the three-bot evaluation pipeline for windows (and future categories)
// Spawns sub-agents, monitors progress, handles errors and retries

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class BotOrchestrator {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.activeEvals = new Map(); // Track running evaluations
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) reject(err);
        else {
          console.log('[Orchestrator] Database connected');
          resolve();
        }
      });
    });
  }

  async createEvaluation(productName, productLine, configuration, category, priority = 'Normal') {
    /**
     * Create new evaluation entry and initialize pipeline
     * Returns: eval_id
     */
    const eval_id = `eval_${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO evaluations (
          eval_id, product_name, product_line, configuration, category, priority, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(eval_id, productName, productLine, configuration, category, priority, 'Queued');
      stmt.finalize((err) => {
        if (err) {
          console.error('[Orchestrator] Failed to create evaluation:', err);
          reject(err);
        } else {
          console.log(`[Orchestrator] Created evaluation: ${eval_id}`);
          this.logActivity(eval_id, null, 'eval_created', 'User', null, 'Queued',
            `New evaluation queued: ${productName} ${productLine} [${configuration}]`
          );
          resolve(eval_id);
        }
      });
    });
  }

  async startEvaluation(eval_id) {
    /**
     * Start the three-bot pipeline for an evaluation
     * This spawns Bot 1 (Consensus Bot) and sets up cascade to Bot 2 and Bot 3
     */

    const evalData = await this.getEvaluation(eval_id);
    if (!evalData) throw new Error(`Evaluation not found: ${eval_id}`);

    console.log(`[Orchestrator] Starting evaluation: ${eval_id}`);

    // Update status
    await this.updateEvaluationStatus(eval_id, 'Bot1_Running');

    // Spawn Bot 1 (Consensus Bot)
    const bot1Task = `
Evaluate this windows product using the Consensus Bot pipeline:

Product: ${evalData.product_name}
Line: ${evalData.product_line}
Configuration: ${evalData.configuration}

Use the Windows Eval Knowledge File for source hierarchy.
Run the certification gate first.
Research professional consensus.
Document all findings, red findings, yellow findings, geographic flags.

Return structured JSON output.
    `;

    const bot1_session = await this.spawnBot(
      'Bot1_Consensus',
      bot1Task,
      eval_id,
      'bot1'
    );

    this.activeEvals.set(eval_id, {
      bot1_session,
      status: 'Bot1_Running',
      started: new Date(),
      stages: ['Bot1_Running', 'Bot2_Running', 'Bot3_Running', 'Ready_To_Generate']
    });

    // Store session ID for tracking
    await this.updateEvaluationMeta(eval_id, { bot1_session_id: bot1_session });

    this.logActivity(eval_id, null, 'bot1_started', 'System', 'Queued', 'Bot1_Running',
      `Consensus Bot spawned (session: ${bot1_session})`
    );

    return bot1_session;
  }

  async spawnBot(botRole, task, eval_id, botNumber) {
    /**
     * Spawn a sub-agent for a specific bot role
     * This uses sessions_spawn from OpenClaw
     * 
     * Returns: session_key (or session ID for tracking)
     */

    console.log(`[Orchestrator] Spawning ${botRole} for ${eval_id}`);

    // In a real implementation, this would call sessions_spawn
    // For now, return a placeholder session ID
    const sessionKey = `${botRole}_${eval_id}_${Date.now()}`;

    // TODO: Call sessions_spawn with:
    // - agentId: or model selection
    // - task: bot-specific task with knowledge files
    // - label: descriptive label for tracking
    // - cleanup: 'keep' to preserve session for logging

    return sessionKey;
  }

  async handleBot1Completion(eval_id, bot1_output) {
    /**
     * Called when Bot 1 completes
     * Validates output and spawns Bot 2
     */

    console.log(`[Orchestrator] Bot 1 completed for ${eval_id}`);

    // Store Bot 1 output
    await this.updateEvaluationOutput(eval_id, 'bot1_output', bot1_output);
    await this.updateEvaluationStatus(eval_id, 'Bot1_Done');

    this.logActivity(eval_id, null, 'bot1_completed', 'Bot1', 'Bot1_Running', 'Bot1_Done',
      'Consensus research completed'
    );

    // Spawn Bot 2 (Evaluator Bot)
    const evalData = await this.getEvaluation(eval_id);

    const bot2Task = `
Score this windows product using the Evaluator Bot pipeline:

From Consensus Bot output:
${bot1_output}

Use:
- Windows Eval Knowledge File v1.1
- Windows Deterministic Rubrics v5
- Universal Rubric Principles v1.1

Score Quality, Durability, and Performance with full subscore breakdown.
Apply Principle 3 to Air Infiltration (state disclosure tier explicitly).
Apply configuration tags.
Compare to calibration benchmarks.
Run mechanical validation.

Return structured scoring output with JSON.
    `;

    const bot2_session = await this.spawnBot(
      'Bot2_Evaluator',
      bot2Task,
      eval_id,
      'bot2'
    );

    await this.updateEvaluationStatus(eval_id, 'Bot2_Running');
    await this.updateEvaluationMeta(eval_id, { bot2_session_id: bot2_session });

    this.logActivity(eval_id, null, 'bot2_started', 'System', 'Bot1_Done', 'Bot2_Running',
      `Evaluator Bot spawned (session: ${bot2_session})`
    );

    return bot2_session;
  }

  async handleBot2Completion(eval_id, bot2_output) {
    /**
     * Called when Bot 2 completes
     * Extracts scores, validates, and spawns Bot 3
     */

    console.log(`[Orchestrator] Bot 2 completed for ${eval_id}`);

    // Store Bot 2 output
    await this.updateEvaluationOutput(eval_id, 'bot2_output', bot2_output);

    // Extract scores (in real implementation, parse JSON from bot2_output)
    // For now, placeholder extraction
    const scores = this.extractScores(bot2_output);
    await this.updateScores(eval_id, scores);

    await this.updateEvaluationStatus(eval_id, 'Bot2_Done');

    this.logActivity(eval_id, null, 'bot2_completed', 'Bot2', 'Bot2_Running', 'Bot2_Done',
      `Scoring completed: Quality ${scores.quality}, Durability ${scores.durability}, Performance ${scores.performance}`
    );

    // Spawn Bot 3 (Material Safety Bot) - can run in parallel with Bot 2 if needed
    const evalData = await this.getEvaluation(eval_id);
    const bot1_output = await this.getEvaluationOutput(eval_id, 'bot1_output');

    const bot3Task = `
Evaluate material safety for this windows product using the Material Safety Bot:

Product: ${evalData.product_name}
Line: ${evalData.product_line}

From Consensus Bot research:
${bot1_output.substring(0, 2000)}...

Use:
- Windows Material Safety Knowledge File v1.1

Evaluate frame material, glazing chemistry, installation foam, interior finish.
Check certifications (Greenguard, ILFI Declare, etc.).
Identify any healthy homes flags.
Score 1-10 or output "Not Rated".

Return structured Material Safety assessment with JSON.
    `;

    const bot3_session = await this.spawnBot(
      'Bot3_MaterialSafety',
      bot3Task,
      eval_id,
      'bot3'
    );

    await this.updateEvaluationStatus(eval_id, 'Bot3_Running');
    await this.updateEvaluationMeta(eval_id, { bot3_session_id: bot3_session });

    this.logActivity(eval_id, null, 'bot3_started', 'System', 'Bot2_Done', 'Bot3_Running',
      `Material Safety Bot spawned (session: ${bot3_session})`
    );

    return bot3_session;
  }

  async handleBot3Completion(eval_id, bot3_output) {
    /**
     * Called when Bot 3 completes
     * All three bots done — evaluation ready for report assembly
     */

    console.log(`[Orchestrator] Bot 3 completed for ${eval_id}`);

    // Store Bot 3 output
    await this.updateEvaluationOutput(eval_id, 'bot3_output', bot3_output);

    // Extract material safety score
    const matSafetyScore = this.extractMaterialSafetyScore(bot3_output);
    await this.updateMaterialSafetyScore(eval_id, matSafetyScore);

    // Mark as ready for report generation
    await this.updateEvaluationStatus(eval_id, 'Ready_To_Generate');

    this.logActivity(eval_id, null, 'bot3_completed', 'Bot3', 'Bot3_Running', 'Ready_To_Generate',
      `Material Safety assessment complete: score ${matSafetyScore}`
    );

    // Send notification
    await this.notifyReady(eval_id);
  }

  async notifyReady(eval_id) {
    /**
     * Notify Ray that evaluation is ready for report generation
     */
    const evalData = await this.getEvaluation(eval_id);
    const message = `
Evaluation ready for report assembly:
${evalData.product_name} ${evalData.product_line} [${evalData.configuration}]

Scores:
- Quality: ${evalData.quality_score}
- Durability: ${evalData.durability_score}
- Performance: ${evalData.performance_score}
- Overall: ${evalData.overall_score}
- Material Safety: ${evalData.material_safety_score}

Action: Review scores and click "Generate Report" in Mission Control.
    `.trim();

    console.log(`[NOTIFY] ${message}`);
    // This would send via Telegram or dashboard notification
  }

  extractScores(bot2_output) {
    /**
     * Parse scores from Bot 2 JSON output
     * In real implementation: JSON.parse and extract nested scores
     */
    return {
      quality: 0,
      durability: 0,
      performance: 0,
      overall: 0,
      rubric_version: 'windows_v5'
    };
  }

  extractMaterialSafetyScore(bot3_output) {
    /**
     * Parse material safety score from Bot 3 output
     */
    return 0;
  }

  async getEvaluation(eval_id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM evaluations WHERE eval_id = ?',
        [eval_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async updateEvaluationStatus(eval_id, newStatus) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE evaluations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE eval_id = ?',
        [newStatus, eval_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async updateEvaluationOutput(eval_id, field, output) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE evaluations SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE eval_id = ?`;
      this.db.run(query, [output, eval_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async updateScores(eval_id, scores) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE evaluations SET
          quality_score = ?, durability_score = ?, performance_score = ?,
          overall_score = ?, rubric_version = ?, updated_at = CURRENT_TIMESTAMP
         WHERE eval_id = ?`,
        [scores.quality, scores.durability, scores.performance, scores.overall, scores.rubric_version, eval_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async updateMaterialSafetyScore(eval_id, score) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE evaluations SET material_safety_score = ?, updated_at = CURRENT_TIMESTAMP WHERE eval_id = ?',
        [score, eval_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async updateEvaluationMeta(eval_id, meta) {
    // Store as JSON in a meta field or individual fields
    // Placeholder for additional metadata storage
    console.log(`[Orchestrator] Meta update for ${eval_id}:`, meta);
  }

  async getEvaluationOutput(eval_id, field) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT ${field} FROM evaluations WHERE eval_id = ?`,
        [eval_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row[field] : null);
        }
      );
    });
  }

  logActivity(eval_id, spec_id, activity_type, actor, status_before, status_after, message) {
    const stmt = this.db.prepare(`
      INSERT INTO activity_log (eval_id, spec_id, activity_type, actor, status_before, status_after, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(eval_id, spec_id, activity_type, actor, status_before, status_after, message);
    stmt.finalize();
  }

  close() {
    if (this.db) this.db.close();
  }
}

module.exports = BotOrchestrator;
