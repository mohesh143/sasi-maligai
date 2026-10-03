// ============================================================
// server.js - Sasi Maligai website server (no npm packages needed)
// Start it by double-clicking start.bat
// ============================================================
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ---- Node.js version check (friendly message instead of a scary error) ----
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 16)) {
  console.error('\nThis website needs Node.js version 22.16 or newer. You have ' + process.versions.node + '.');
  console.error('Please install the newest "LTS" version from https://nodejs.org and run start.bat again.\n');
  process.exit(1);
}

const cfg = require('./config');
const db = require('./database/db');
const { router, dispatch, HttpError } = require('./lib/router');
const { sendJson, parseCookies, clientIp } = require('./lib/http');
const session = require('./lib/session');
const backup = require('./lib/backup');
const { serveStatic } = require('./lib/static');

require('./routes/public');
require('./routes/auth');
require('./routes/products');
require('./routes/categories');
require('./routes/feedback');
require('./routes/settings');
require('./routes/dashboard');
require('./routes/backups');

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; " +
    "frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
}

// Blocks requests that come from a different website (basic CSRF protection).
function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  let host;
  try { host = new URL(origin).host; } catch (e) { throw new HttpError(403, 'Request blocked.'); }
  if (host !== req.headers.host) throw new HttpError(403, 'Request blocked.');
}

async function handle(req, res) {
  securityHeaders(res);
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
  const ctx = { req, res, url, query: Object.fromEntries(url.searchParams), params: {}, ip: clientIp(req), sid: null, session: null };
  try {
    if (url.pathname.startsWith('/api/')) {
      ctx.sid = parseCookies(req.headers.cookie)[session.COOKIE] || null;
      ctx.session = ctx.sid ? session.get(ctx.sid) : null;
      if (req.method !== 'GET' && req.method !== 'HEAD') checkOrigin(req);
      if (!(await dispatch(ctx))) throw new HttpError(404, 'API route not found.');
    } else {
      serveStatic(ctx);
    }
  } catch (err) {
    if (res.headersSent) { res.destroy(); return; }
    if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message, ...err.extra });
    console.error('[error]', req.method, req.url, err);
    if (url.pathname.startsWith('/api/')) return sendJson(res, 500, { error: 'Something went wrong on the server. Please try again.' });
    res.writeHead(500, { 'Content-Type': 'text/plain' }); res.end('Server error');
  }
}

function start() {
  try {
    const { isNew } = db.open();
    if (isNew) console.log('[setup] First run: open the Admin page to create your admin account.');
  } catch (e) {
    console.error('\nThe database could not be opened:\n  ' + e.message);
    console.error('Your data files were NOT changed. See documentation/10-TROUBLESHOOTING.md\n');
    process.exit(1);
  }

  const autoBackup = () => {
    try { const n = backup.ensureDailyAuto(db.get()); if (n) console.log('[backup] Automatic daily backup: ' + n); }
    catch (e) { console.error('[backup] automatic backup failed:', e.message); }
  };
  autoBackup();
  setInterval(autoBackup, 6 * 60 * 60 * 1000).unref();

  const server = http.createServer((req, res) => { handle(req, res); });
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`\nPort ${cfg.PORT} is already in use. The website may already be running in another black window.`);
      console.error('Close that window (or run stop.bat) and try again.\n');
    } else console.error('\nServer error:', e.message);
    db.close();
    process.exit(1);
  });

  server.listen(cfg.PORT, cfg.HOST, () => {
    try { fs.writeFileSync(cfg.PID_FILE, String(process.pid)); } catch (e) { /* ignore */ }
    const shown = cfg.HOST === '0.0.0.0' ? 'localhost' : cfg.HOST === '127.0.0.1' ? 'localhost' : cfg.HOST;
    console.log('==================================================');
    console.log('  Sasi Maligai website is running!');
    console.log(`  Website : http://${shown}:${cfg.PORT}`);
    console.log(`  Admin   : http://${shown}:${cfg.PORT}/admin/login.html`);
    console.log('  To stop : close this window, or press CTRL+C, or run stop.bat');
    console.log('==================================================');
    if (cfg.OPEN_BROWSER && process.platform === 'win32') exec(`start "" "http://localhost:${cfg.PORT}"`);
  });

  let closing = false;
  function shutdown() {
    if (closing) return; closing = true;
    console.log('\nStopping the website...');
    server.close();
    db.close();
    try { fs.unlinkSync(cfg.PID_FILE); } catch (e) { /* ignore */ }
    process.exit(0);
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('uncaughtException', (e) => console.error('[unexpected error]', e));
  process.on('unhandledRejection', (e) => console.error('[unexpected error]', e));
}

start();
