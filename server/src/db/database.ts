import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
let dbPath = path.join(dbDir, 'elm_platform.db');
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (e) {
  dbPath = ':memory:';
}

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'SYSTEMS_ENGINEER',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Projects Table
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Trackers Table
    CREATE TABLE IF NOT EXISTS trackers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      prefix TEXT NOT NULL,
      fields_schema TEXT DEFAULT '{}',
      workflow_schema TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Folders Table
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracker_id INTEGER NOT NULL,
      parent_id INTEGER,
      name TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    -- Engineering Objects Table
    CREATE TABLE IF NOT EXISTS engineering_objects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracker_id INTEGER NOT NULL,
      folder_id INTEGER,
      object_key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      owner_id INTEGER NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      metadata_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    -- Object Versions Table
    CREATE TABLE IF NOT EXISTS object_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      object_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      metadata_json TEXT DEFAULT '{}',
      changed_fields TEXT DEFAULT '[]',
      change_reason TEXT,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (object_id) REFERENCES engineering_objects(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    -- Test Steps Table
    CREATE TABLE IF NOT EXISTS test_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_case_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      action TEXT NOT NULL,
      expected_result TEXT NOT NULL,
      FOREIGN KEY (test_case_id) REFERENCES engineering_objects(id) ON DELETE CASCADE
    );

    -- Test Set Items Table
    CREATE TABLE IF NOT EXISTS test_set_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_set_id INTEGER NOT NULL,
      test_case_id INTEGER NOT NULL,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (test_set_id) REFERENCES engineering_objects(id) ON DELETE CASCADE,
      FOREIGN KEY (test_case_id) REFERENCES engineering_objects(id) ON DELETE CASCADE
    );

    -- Test Configurations Table
    CREATE TABLE IF NOT EXISTS test_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      software_version TEXT NOT NULL,
      firmware_version TEXT NOT NULL,
      hardware_revision TEXT NOT NULL,
      sensor_config TEXT,
      parameter_config TEXT,
      battery_config TEXT,
      environment_config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Test Runs Table
    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      test_set_id INTEGER NOT NULL,
      test_config_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      overall_status TEXT DEFAULT 'NOT_RUN',
      executed_by INTEGER NOT NULL,
      started_at DATETIME,
      completed_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (test_set_id) REFERENCES engineering_objects(id) ON DELETE CASCADE,
      FOREIGN KEY (test_config_id) REFERENCES test_configs(id) ON DELETE CASCADE,
      FOREIGN KEY (executed_by) REFERENCES users(id)
    );

    -- Test Run Results Table
    CREATE TABLE IF NOT EXISTS test_run_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_run_id INTEGER NOT NULL,
      test_case_id INTEGER NOT NULL,
      status TEXT DEFAULT 'NOT_RUN',
      notes TEXT,
      executed_at DATETIME,
      FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE,
      FOREIGN KEY (test_case_id) REFERENCES engineering_objects(id) ON DELETE CASCADE
    );

    -- Test Step Results Table
    CREATE TABLE IF NOT EXISTS test_step_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_run_result_id INTEGER NOT NULL,
      test_step_id INTEGER NOT NULL,
      status TEXT DEFAULT 'NOT_RUN',
      actual_result TEXT,
      notes TEXT,
      FOREIGN KEY (test_run_result_id) REFERENCES test_run_results(id) ON DELETE CASCADE,
      FOREIGN KEY (test_step_id) REFERENCES test_steps(id) ON DELETE CASCADE
    );

    -- Generic Relationships Table
    CREATE TABLE IF NOT EXISTS relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER NOT NULL,
      source_version INTEGER,
      target_id INTEGER NOT NULL,
      target_version INTEGER,
      relationship_type TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_id) REFERENCES engineering_objects(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES engineering_objects(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Change Requests Table
    CREATE TABLE IF NOT EXISTS change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      cr_key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'DRAFT',
      priority TEXT DEFAULT 'MEDIUM',
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    -- Change Request Items Table
    CREATE TABLE IF NOT EXISTS change_request_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      change_request_id INTEGER NOT NULL,
      object_id INTEGER NOT NULL,
      proposed_change_notes TEXT,
      FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (object_id) REFERENCES engineering_objects(id) ON DELETE CASCADE
    );

    -- Baselines Table
    CREATE TABLE IF NOT EXISTS baselines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      version_tag TEXT NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Baseline Items Table
    CREATE TABLE IF NOT EXISTS baseline_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baseline_id INTEGER NOT NULL,
      object_id INTEGER NOT NULL,
      object_version INTEGER NOT NULL,
      FOREIGN KEY (baseline_id) REFERENCES baselines(id) ON DELETE CASCADE,
      FOREIGN KEY (object_id) REFERENCES engineering_objects(id) ON DELETE CASCADE
    );

    -- Artifacts / Files Table
    CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      object_id INTEGER,
      test_run_id INTEGER,
      test_step_result_id INTEGER,
      filename TEXT NOT NULL,
      stored_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      category TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (object_id) REFERENCES engineering_objects(id) ON DELETE SET NULL,
      FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE SET NULL,
      FOREIGN KEY (test_step_result_id) REFERENCES test_step_results(id) ON DELETE SET NULL,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    -- Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      details_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
