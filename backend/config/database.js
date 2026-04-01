/**
 * Database layer using sql.js (WebAssembly SQLite – no native compilation required).
 * Provides a synchronous API similar to better-sqlite3 after async initialization.
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');

let _db = null; // sql.js Database instance

/** Persist the in-memory database back to disk */
const saveDb = () => {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

/**
 * Returns a prepare-like object with .run(), .get(), .all() methods.
 * Parameters are passed as individual args (positional) to match better-sqlite3 API.
 */
const prepare = (sql) => ({
  /** Execute a write statement and return { lastInsertRowid } */
  run(...params) {
    _db.run(sql, params);
    const rowid = _db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    saveDb();
    return { lastInsertRowid: rowid };
  },
  /** Return a single row as a plain object, or undefined */
  get(...params) {
    const stmt = _db.prepare(sql);
    stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : undefined;
    stmt.free();
    return row;
  },
  /** Return all matching rows as an array of plain objects */
  all(...params) {
    const stmt = _db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }
});

/** Initialize the sql.js engine and open/create the SQLite database file */
const initializeDatabase = async () => {
  const wasmBinary = fs.readFileSync(require.resolve('sql.js/dist/sql-wasm.wasm'));
  const SQL = await initSqlJs({ wasmBinary });

  // Ensure the parent directory exists (important when DB_PATH is overridden, e.g. in Docker)
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _db = new SQL.Database();
  }

  // Enable foreign keys
  _db.run('PRAGMA foreign_keys = ON');

  // Create tables
  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','in-progress','completed')),
      user_id INTEGER NOT NULL,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  saveDb();
  console.log('Database initialized successfully');
};

// Exported db object – controllers call db.prepare(...)
const db = { prepare };

module.exports = { db, initializeDatabase };
