// ============================================================
// db.js - Database connection (SQLite built into Node.js).
//
// IMPORTANT DATA-SAFETY RULE:
// Nothing in this file drops tables, deletes rows, or recreates the
// database on startup. If the database file already exists it is
// opened as it is, and only safe, recorded upgrades are applied
// (see migrations.js). Demo products are added ONLY when the
// database file did not exist at all (very first run).
// ============================================================
'use strict';
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const cfg = require('../config');
const { migrate } = require('./migrations');

let conn = null;

function sleepSync(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

function connect() {
  fs.mkdirSync(cfg.DATA_DIR, { recursive: true });
  const c = new DatabaseSync(cfg.DB_PATH);
  // WAL = crash-safe journal. synchronous FULL = survives sudden power cuts.
  c.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA synchronous = FULL;');
  return c;
}

function seedDemoProducts(c) {
  const insert = c.prepare(`INSERT INTO products (name, category, price, unit, description, available, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, 1)`);
  const note = 'Demo product - edit or delete me.';
  c.exec('BEGIN IMMEDIATE');
  try {
    insert.run('Sona Masoori Rice', 'Rice & Grains', 65, 'kg', note + ' Good quality daily-use rice.', 1);
    insert.run('Toor Dal', 'Pulses', 140, 'kg', note, 1);
    insert.run('Sunflower Cooking Oil', 'Cooking Oil', 150, 'litre', note, 1);
    insert.run('Turmeric Powder', 'Spices', 35, 'packet', note, 1);
    insert.run('Mixture', 'Snacks', 50, 'packet', note, 1);
    insert.run('Parle-G Biscuit', 'Biscuits', 10, 'piece', note, 1);
    insert.run('Tea Powder', 'Beverages', 120, 'packet', note, 0);
    insert.run('Soap', 'Personal Care', 40, 'piece', note, 1);
    c.exec('COMMIT');
  } catch (e) { try { c.exec('ROLLBACK'); } catch (e2) { /* ignore */ } throw e; }
}

function open() {
  const isNew = !fs.existsSync(cfg.DB_PATH);
  conn = connect();
  try {
    migrate(conn, { isNew });
    if (isNew) { seedDemoProducts(conn); console.log('[database] New database created with a few demo products (first run only).'); }
  } catch (e) {
    try { conn.close(); } catch (e2) { /* ignore */ }
    conn = null;
    throw e;
  }
  return { isNew };
}

function get() { if (!conn) throw new Error('The database is not open.'); return conn; }
function close() { if (conn) { try { conn.close(); } catch (e) { /* ignore */ } conn = null; } }

const all = (sql, ...p) => get().prepare(sql).all(...p);
const one = (sql, ...p) => get().prepare(sql).get(...p);
const run = (sql, ...p) => get().prepare(sql).run(...p);

// Runs fn() inside a transaction: all changes are saved together, or none are.
function tx(fn) {
  const c = get();
  c.exec('BEGIN IMMEDIATE');
  try { const r = fn(); c.exec('COMMIT'); return r; }
  catch (e) { try { c.exec('ROLLBACK'); } catch (e2) { /* ignore */ } throw e; }
}

function retry(fn) {
  let last;
  for (let i = 0; i < 6; i++) { try { return fn(); } catch (e) { last = e; sleepSync(250); } }
  throw last;
}

// Replaces the live database with the (already validated) file at tempPath.
// The old database file is kept aside until the new one opens successfully.
function swapDatabase(tempPath) {
  const aside = cfg.DB_PATH + '.replaced';
  close();
  try {
    for (const ext of ['-wal', '-shm']) { try { fs.unlinkSync(cfg.DB_PATH + ext); } catch (e) { /* none */ } }
    if (fs.existsSync(aside)) fs.unlinkSync(aside);
    retry(() => fs.renameSync(cfg.DB_PATH, aside));
    retry(() => fs.renameSync(tempPath, cfg.DB_PATH));
    conn = connect();
    migrate(conn, { isNew: false });
    try { fs.unlinkSync(aside); } catch (e) { /* ignore */ }
  } catch (e) {
    // Put the original database back so the shop keeps working.
    close();
    try {
      if (fs.existsSync(aside)) {
        try { fs.unlinkSync(cfg.DB_PATH); } catch (e2) { /* ignore */ }
        fs.renameSync(aside, cfg.DB_PATH);
      }
      for (const ext of ['-wal', '-shm']) { try { fs.unlinkSync(cfg.DB_PATH + ext); } catch (e2) { /* none */ } }
      conn = connect();
    } catch (e3) { console.error('[restore] Could not reopen the original database:', e3); }
    throw e;
  }
}

module.exports = { open, get, close, all, one, run, tx, swapDatabase };
