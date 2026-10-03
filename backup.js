// ============================================================
// backup.js - creating, listing, validating and pruning backups.
// A backup is simply a complete copy of the database file,
// created with SQLite's VACUUM INTO (safe even while the site runs).
// ============================================================
'use strict';
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const cfg = require('../config');
const { HttpError } = require('./router');

const KINDS = ['backup', 'auto', 'before-restore', 'before-update', 'safety'];
const KEEP = { auto: 14, 'before-restore': 10, 'before-update': 10, safety: 10 }; // manual backups are NEVER deleted

function pad(n) { return String(n).padStart(2, '0'); }
function stamp(d) {
  d = d || new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function uniqueName(kind) {
  const base = `sasi-maligai-${kind}-${stamp()}`;
  let name = `${base}.db`, i = 2;
  while (fs.existsSync(path.join(cfg.BACKUP_DIR, name))) name = `${base}-${i++}.db`;
  return name;
}
function kindOf(name) {
  const m = /^sasi-maligai-(backup|auto|before-restore|before-update|safety)-\d{4}-/.exec(name);
  return m ? m[1] : 'other';
}

// Creates a backup copy of the open database. Returns the file name.
function snapshot(db, kind) {
  fs.mkdirSync(cfg.BACKUP_DIR, { recursive: true });
  const name = uniqueName(kind);
  const dest = path.join(cfg.BACKUP_DIR, name);
  db.exec(`VACUUM INTO '${dest.replace(/'/g, "''")}'`);
  if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) throw new Error('Backup file was not created.');
  prune(kind);
  return name;
}

function list() {
  fs.mkdirSync(cfg.BACKUP_DIR, { recursive: true });
  return fs.readdirSync(cfg.BACKUP_DIR)
    .filter((f) => f.toLowerCase().endsWith('.db'))
    .map((f) => {
      const st = fs.statSync(path.join(cfg.BACKUP_DIR, f));
      return { filename: f, kind: kindOf(f), sizeKB: Math.max(1, Math.round(st.size / 1024)), createdAt: st.mtime.toISOString(), mtimeMs: st.mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .map(({ mtimeMs, ...rest }) => rest);
}

function prune(kind) {
  const keep = KEEP[kind];
  if (!keep) return;
  list().filter((b) => b.kind === kind).slice(keep).forEach((b) => {
    try { fs.unlinkSync(path.join(cfg.BACKUP_DIR, b.filename)); } catch (e) { /* ignore */ }
  });
}

// Only plain file names ending in .db inside the backups folder are accepted.
function safePath(name) {
  if (typeof name !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._ -]*\.db$/.test(name) || name.includes('..')) {
    throw new HttpError(400, 'Invalid backup file name.');
  }
  const full = path.join(cfg.BACKUP_DIR, name);
  if (path.dirname(full) !== path.resolve(cfg.BACKUP_DIR) && path.dirname(full) !== cfg.BACKUP_DIR) {
    throw new HttpError(400, 'Invalid backup file name.');
  }
  if (!fs.existsSync(full)) throw new HttpError(404, 'Backup file not found.');
  return full;
}

// Opens a file read-only and checks that it is a healthy Sasi Maligai database.
function validate(file) {
  let t = null;
  try {
    t = new DatabaseSync(file, { readOnly: true });
    const check = t.prepare('PRAGMA integrity_check').all();
    if (check.length !== 1 || Object.values(check[0])[0] !== 'ok') return { ok: false, reason: 'The file is damaged (integrity check failed).' };
    const tables = t.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((r) => r.name);
    for (const need of ['products', 'feedback', 'admins']) {
      if (!tables.includes(need)) return { ok: false, reason: 'This is not a Sasi Maligai backup (missing table: ' + need + ').' };
    }
    const count = (tbl) => t.prepare(`SELECT COUNT(*) AS c FROM ${tbl}`).get().c;
    return { ok: true, counts: { products: count('products'), feedback: count('feedback'), admins: count('admins') } };
  } catch (e) {
    return { ok: false, reason: 'This file is not a valid database.' };
  } finally {
    if (t) { try { t.close(); } catch (e) { /* ignore */ } }
  }
}

// One automatic backup per day (made when the server starts and re-checked every few hours).
function ensureDailyAuto(db) {
  const today = stamp().slice(0, 10);
  const has = list().some((b) => b.kind === 'auto' && b.filename.includes(`-auto-${today}-`));
  if (has) return null;
  return snapshot(db, 'auto');
}

module.exports = { snapshot, list, safePath, validate, ensureDailyAuto, kindOf, stamp };
