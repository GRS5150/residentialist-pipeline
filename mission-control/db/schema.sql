-- The Residentialist Mission Control Database
-- SQLite Schema for evaluation pipeline + spec sheet ingestion

-- EVALUATION PIPELINE

CREATE TABLE IF NOT EXISTS evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eval_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  product_line TEXT NOT NULL,
  configuration TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('High', 'Normal', 'Low')),
  
  -- Pipeline state
  status TEXT DEFAULT 'Queued' CHECK (status IN ('Queued', 'Bot1_Running', 'Bot1_Done', 'Bot2_Running', 'Bot2_Done', 'Bot3_Running', 'Bot3_Done', 'Ready_To_Generate', 'Report_Generated', 'Pending_Sync', 'Synced')),
  
  -- Bot outputs (stored as JSON for flexibility)
  bot1_output TEXT,  -- Consensus Bot output
  bot2_output TEXT,  -- Evaluator Bot output
  bot3_output TEXT,  -- Material Safety Bot output
  
  -- Scores (extracted from bot2 for quick reference)
  quality_score REAL,
  durability_score REAL,
  performance_score REAL,
  overall_score REAL,
  material_safety_score REAL,
  rubric_version TEXT,  -- e.g. 'windows_v5'
  
  -- Report assembly
  report_frontend TEXT,  -- Client-facing report (markdown)
  report_backend TEXT,   -- Internal report (markdown)
  
  -- Sync status
  airtable_synced BOOLEAN DEFAULT 0,
  airtable_record_id TEXT,
  sync_timestamp DATETIME,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_eval_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_eval_category ON evaluations(category);
CREATE INDEX IF NOT EXISTS idx_eval_priority ON evaluations(priority);

-- SPEC SHEET INGESTION

CREATE TABLE IF NOT EXISTS spec_sheets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spec_id TEXT UNIQUE NOT NULL,
  
  -- Source
  source TEXT CHECK (source IN ('Email', 'Manual_Upload')) DEFAULT 'Email',
  email_message_id TEXT,  -- For Gmail/IMAP reference
  
  -- Property/builder info
  property_address TEXT,
  property_city TEXT,
  builder_name TEXT,
  
  -- Extraction results (JSON)
  raw_text TEXT,  -- Raw extracted text from PDF/document
  extracted_products TEXT,  -- JSON array of extracted products by category
  extraction_summary TEXT,  -- JSON: {category: count, ...}
  
  -- Extraction quality
  categories_found INTEGER,  -- Out of 16
  items_needing_review INTEGER,  -- Ambiguous or unreadable items
  
  -- Review state
  status TEXT DEFAULT 'Pending_Review' CHECK (status IN ('Pending_Review', 'In_Review', 'Approved', 'Discarded')),
  
  -- Editable fields (filled by human during review)
  edited_products TEXT,  -- JSON: user corrections/additions
  review_notes TEXT,
  reviewed_by TEXT,
  review_timestamp DATETIME,
  
  -- Airtable sync
  airtable_synced BOOLEAN DEFAULT 0,
  property_record_id TEXT,
  builder_record_id TEXT,
  installations_record_ids TEXT,  -- JSON array of record IDs
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  email_received_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_spec_status ON spec_sheets(status);
CREATE INDEX IF NOT EXISTS idx_spec_city ON spec_sheets(property_city);

-- ACTIVITY LOG (for dashboard real-time updates)

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eval_id TEXT,
  spec_id TEXT,
  
  activity_type TEXT NOT NULL,  -- e.g., 'eval_created', 'bot1_started', 'bot1_completed', 'spec_sheet_parsed', etc.
  actor TEXT,  -- 'System', 'User', 'Bot1', 'Bot2', 'Bot3'
  status_before TEXT,
  status_after TEXT,
  message TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (eval_id) REFERENCES evaluations(eval_id),
  FOREIGN KEY (spec_id) REFERENCES spec_sheets(spec_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_time ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_eval ON activity_log(eval_id);
CREATE INDEX IF NOT EXISTS idx_activity_spec ON activity_log(spec_id);

-- PRODUCT CATALOG (synced from Airtable, cached locally)

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  airtable_id TEXT UNIQUE,
  
  product_name TEXT NOT NULL,
  product_line TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Scores (if evaluated)
  overall_score REAL,
  quality_score REAL,
  durability_score REAL,
  performance_score REAL,
  material_safety_score REAL,
  
  rubric_version TEXT,
  eval_id TEXT,  -- Reference to evaluation if scored
  
  -- Metadata
  last_synced DATETIME,
  
  UNIQUE(product_name, product_line, category)
);

CREATE INDEX IF NOT EXISTS idx_product_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_name ON products(product_name);

-- TELEGRAM COMMAND LOG

CREATE TABLE IF NOT EXISTS telegram_commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command_id TEXT UNIQUE,
  
  command_type TEXT NOT NULL CHECK (command_type IN ('eval', 'status', 'help')),
  user_id TEXT,
  chat_id TEXT,
  
  command_text TEXT,
  eval_id TEXT,  -- If /eval command
  
  response_message_id INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (eval_id) REFERENCES evaluations(eval_id)
);

CREATE INDEX IF NOT EXISTS idx_telegram_user ON telegram_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_time ON telegram_commands(created_at DESC);
