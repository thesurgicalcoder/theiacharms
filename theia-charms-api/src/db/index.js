// SQLite access layer. Uses Node's built-in `node:sqlite` (Node 22.13+/24) and falls back to `better-sqlite3`.
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

let db = null;
const cache = new Map();

function openDriver(file) {
  try { const { DatabaseSync } = require('node:sqlite'); return new DatabaseSync(file); } catch { /* try fallback */ }
  try { const Better = require('better-sqlite3'); return new Better(file); } catch { /* none */ }
  throw new Error('No SQLite driver found. Install Node.js 24 LTS (SQLite is built in) or run "npm install" again so better-sqlite3 installs.');
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, seq INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE COLLATE NOCASE, slug TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL DEFAULT '', icon TEXT NOT NULL DEFAULT '✨', display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
  category_id INTEGER NOT NULL REFERENCES categories(id), category_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '', price REAL NOT NULL, original_price REAL, stock INTEGER NOT NULL DEFAULT 1,
  is_sold_out INTEGER NOT NULL DEFAULT 0, images TEXT NOT NULL DEFAULT '[]',
  is_featured INTEGER NOT NULL DEFAULT 0, is_new_arrival INTEGER NOT NULL DEFAULT 1, is_festive INTEGER NOT NULL DEFAULT 0,
  is_budget INTEGER NOT NULL DEFAULT 0, is_minimal INTEGER NOT NULL DEFAULT 0, is_gift INTEGER NOT NULL DEFAULT 0,
  is_daily_wear INTEGER NOT NULL DEFAULT 0, emoji TEXT NOT NULL DEFAULT '✨', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sold ON products(is_sold_out);
CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL DEFAULT '', subtitle TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '', link_url TEXT NOT NULL DEFAULT '', display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'viewer', is_active INTEGER NOT NULL DEFAULT 1,
  last_login TEXT, reset_token TEXT, reset_expires TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, user_name TEXT, user_role TEXT, action TEXT NOT NULL,
  target_type TEXT, target_id TEXT, details TEXT, timestamp TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_logs_time ON activity_logs(timestamp);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

const norm = (v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v);
const stmt = (sql) => {
  let s = cache.get(sql);
  if (!s) { s = db.prepare(sql); if (cache.size < 300) cache.set(sql, s); }
  return s;
};

function connect() {
  if (db) return db;
  const file = env.sqlitePath === ':memory:' ? ':memory:' : path.resolve(env.sqlitePath);
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  db = openDriver(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  console.log(`[db] SQLite ready (${file})`);
  return db;
}
const run = (sql, p = []) => stmt(sql).run(...p.map(norm));
const get = (sql, p = []) => stmt(sql).get(...p.map(norm));
const all = (sql, p = []) => stmt(sql).all(...p.map(norm));
function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { try { db.exec('ROLLBACK'); } catch { /* already rolled back */ } throw e; }
}
const ping = () => { try { return get('SELECT 1 AS ok').ok === 1; } catch { return false; } };
function close() { if (db) { try { db.close(); } catch { /* ignore */ } db = null; cache.clear(); } }

module.exports = { connect, run, get, all, tx, ping, close, now: () => new Date().toISOString() };
