// ============================================
// DATABASE CONNECTION & TABLE CREATION
// Using sql.js (pure JavaScript SQLite)
// ============================================

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'restaurant.db');

let db = null;

// ============================================
// Initialize the database
// sql.js is async, so we need to wait for it
// ============================================
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database file or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create all tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT    NOT NULL UNIQUE,
      password TEXT    NOT NULL,
      role     TEXT    DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT    NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      price       REAL    NOT NULL,
      category_id INTEGER NOT NULL,
      is_active   INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS waiters (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tables (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      status    TEXT    DEFAULT 'available',
      waiter_id INTEGER,
      FOREIGN KEY (waiter_id) REFERENCES waiters(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS table_items (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      item_id  INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (item_id)  REFERENCES items(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER  PRIMARY KEY AUTOINCREMENT,
      order_type  TEXT     NOT NULL,
      table_name  TEXT,
      waiter_name TEXT,
      total       REAL     NOT NULL,
      created_by  INTEGER,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id  INTEGER NOT NULL,
      item_id   INTEGER NOT NULL,
      item_name TEXT    NOT NULL,
      price     REAL    NOT NULL,
      quantity  INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  // Save database to disk
  saveDatabase();

  console.log('✅ Database tables created successfully');
  return db;
}

// ============================================
// Helper: Save database to disk
// sql.js works in-memory, so we need to save
// to a file after changes
// ============================================
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// ============================================
// Helper functions to make sql.js easier to use
// These mimic the better-sqlite3 API style
// ============================================

// Run a query that returns rows (SELECT)
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Run a query that returns one row
function get(sql, params = []) {
  const results = all(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Run a query that modifies data (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  // Get last insert ID
  const lastId = get('SELECT last_insert_rowid() as id');
  saveDatabase(); // Save to disk after every change
  return {
    changes,
    lastInsertRowid: lastId ? lastId.id : 0,
  };
}

// Get the raw database instance (for advanced use)
function getDb() {
  return db;
}

module.exports = {
  initDatabase,
  all,
  get,
  run,
  getDb,
  saveDatabase,
};
