// ============================================================
// config.js - reads the optional .env file and defines folder paths.
// No npm packages are needed: the .env reader below is tiny.
// ============================================================
'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

function loadEnv(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return; } // .env is optional
  text = text.replace(/^\uFEFF/, ''); // Notepad sometimes adds an invisible mark
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;               // comments and blank lines
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
loadEnv(path.join(ROOT, '.env'));

function intOr(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : fallback;
}

const DATA_DIR = process.env.SM_DATA_DIR || path.join(ROOT, 'data');

module.exports = {
  ROOT,
  PORT: intOr(process.env.PORT, 3000),
  // 127.0.0.1 = only this computer can open the site (safest default)
  HOST: process.env.HOST || '127.0.0.1',
  DATA_DIR,
  DB_PATH: path.join(DATA_DIR, 'sasi-maligai.db'),
  PID_FILE: path.join(DATA_DIR, 'server.pid'),
  BACKUP_DIR: process.env.SM_BACKUP_DIR || path.join(ROOT, 'backups'),
  UPLOAD_DIR: process.env.SM_UPLOAD_DIR || path.join(ROOT, 'uploads', 'products'),
  CLIENT_DIR: path.join(ROOT, 'client'),
  MAX_IMAGE_BYTES: 2 * 1024 * 1024,
  SESSION_HOURS: 8,
  OPEN_BROWSER: process.env.NO_BROWSER !== '1'
};
