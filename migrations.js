// ============================================================
// migrations.js - SAFE, ADDITIVE database upgrades.
//
// DATA-SAFETY RULES (do not break these):
//   * Never DROP a table, never DELETE rows, never recreate the database.
//   * Only CREATE ... IF NOT EXISTS and ALTER TABLE ... ADD COLUMN.
//   * Each upgrade runs inside a transaction and is recorded in the
//     "schema_migrations" table, so it runs exactly once.
//   * Before applying upgrades to an EXISTING database, an automatic
//     backup ("sasi-maligai-before-update-...db") is created first.
//
// To add a new feature later (customers, bills, suppliers...):
//   add a NEW entry at the END of MIGRATIONS with the next version number.
//   Never edit an old entry after it has been used.
// ============================================================
'use strict';
const backup = require('../lib/backup');

const DEFAULT_CATEGORIES = ['Rice & Grains', 'Pulses', 'Cooking Oil', 'Spices', 'Snacks',
  'Biscuits', 'Beverages', 'Personal Care', 'Household', 'Other'];

function isPlaceholder(v) { return !v || /YOUR_|_HERE/i.test(v); }
function envOr(name, fallback) { return isPlaceholder(process.env[name]) ? fallback : process.env[name]; }

const MIGRATIONS = [
  {
    version: 1,
    name: 'baseline tables: products, feedback, admins',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'Other',
          price REAL NOT NULL DEFAULT 0,
          unit TEXT NOT NULL DEFAULT 'piece',
          image TEXT,
          description TEXT,
          available INTEGER NOT NULL DEFAULT 1,
          is_demo INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
          message TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    }
  },
  {
    version: 2,
    name: 'categories, shop settings, indexes',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE COLLATE NOCASE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL DEFAULT '',
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
      `);
      const addCat = db.prepare('INSERT OR IGNORE INTO categories (name, sort_order) VALUES (?, ?)');
      DEFAULT_CATEGORIES.forEach((c, i) => addCat.run(c, i + 1));
      // Keep every category that existing products already use.
      db.prepare('SELECT DISTINCT category FROM products').all()
        .forEach((r) => { if (r.category) addCat.run(r.category, 100); });

      const defaults = {
        shop_name: envOr('SHOP_NAME', 'Sasi Maligai'),
        tagline: envOr('SHOP_TAGLINE', 'Your neighbourhood grocery shop'),
        phone: envOr('SHOP_PHONE', ''),
        whatsapp: envOr('SHOP_WHATSAPP_NUMBER', ''),
        email: envOr('SHOP_EMAIL', ''),
        address: envOr('SHOP_ADDRESS', ''),
        opening_hours: envOr('SHOP_OPENING_HOURS', 'Mon - Sun: 7:00 AM - 9:30 PM'),
        maps_url: envOr('GOOGLE_MAPS_URL', ''),
        intro: 'Rice, pulses, cooking oil, spices, snacks and everyday household items - all in one shop.',
        about: 'Sasi Maligai is a neighbourhood grocery shop. Come in, or call us, to ask about any item.',
        why_us: ''
      };
      const addSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
      Object.entries(defaults).forEach(([k, v]) => addSetting.run(k, v));
    }
  }
];

function tableExists(db, name) {
  return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name);
}

function migrate(db, opts) {
  const isNew = !!(opts && opts.isNew);
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT (datetime('now')))`);
  const done = new Set(db.prepare('SELECT version FROM schema_migrations').all().map((r) => r.version));
  const pending = MIGRATIONS.filter((m) => !done.has(m.version));
  if (pending.length === 0) return { applied: [] };

  if (!isNew && tableExists(db, 'products')) {
    const name = backup.snapshot(db, 'before-update');
    console.log(`[database] Safety backup before update: ${name}`);
  }
  for (const m of pending) {
    db.exec('BEGIN IMMEDIATE');
    try {
      m.up(db);
      db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(m.version, m.name);
      db.exec('COMMIT');
      console.log(`[database] Applied update ${m.version}: ${m.name}`);
    } catch (e) {
      try { db.exec('ROLLBACK'); } catch (e2) { /* ignore */ }
      throw new Error(`Database update ${m.version} failed and was cancelled (your data is unchanged): ${e.message}`);
    }
  }
  return { applied: pending.map((m) => m.version) };
}

module.exports = { migrate, MIGRATIONS, DEFAULT_CATEGORIES };
