// Admin: create, download and safely restore backups.
'use strict';
const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const cfg = require('../config');
const { router, HttpError } = require('../lib/router');
const { sendJson, readJson } = require('../lib/http');
const { requireAdmin } = require('../middleware/auth');
const backup = require('../lib/backup');
const session = require('../lib/session');

router.get('/api/admin/backups', requireAdmin, (ctx) => sendJson(ctx.res, 200, backup.list()));

router.post('/api/admin/backups', requireAdmin, (ctx) => {
  try {
    const filename = backup.snapshot(db.get(), 'backup');
    sendJson(ctx.res, 201, { success: true, filename });
  } catch (e) {
    console.error('[backup] failed:', e);
    throw new HttpError(500, 'Backup failed. Check that the disk is not full, then try again.');
  }
});

// What is inside a backup? (shown in the confirmation box before restoring)
router.get('/api/admin/backups/info', requireAdmin, (ctx) => {
  const file = backup.safePath(ctx.query.file);
  const check = backup.validate(file);
  const current = {
    products: db.one('SELECT COUNT(*) AS c FROM products').c,
    feedback: db.one('SELECT COUNT(*) AS c FROM feedback').c
  };
  sendJson(ctx.res, 200, { filename: ctx.query.file, ...check, current });
});

router.get('/api/admin/backups/download', requireAdmin, (ctx) => {
  const file = backup.safePath(ctx.query.file);
  const st = fs.statSync(file);
  ctx.res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': st.size,
    'Content-Disposition': `attachment; filename="${path.basename(file)}"`,
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(file).pipe(ctx.res);
});

// Restore: validate -> safety backup -> copy -> swap -> reopen. Nothing is deleted first.
router.post('/api/admin/backups/restore', requireAdmin, async (ctx) => {
  const body = await readJson(ctx.req);
  if (body.confirm !== true) throw new HttpError(400, 'Restore needs your confirmation first.');
  const source = backup.safePath(body.filename);

  const check = backup.validate(source);
  if (!check.ok) throw new HttpError(400, `This backup cannot be used: ${check.reason} Your current data was not changed.`);

  let safety;
  try { safety = backup.snapshot(db.get(), 'before-restore'); }
  catch (e) { throw new HttpError(500, 'Could not make the safety backup, so nothing was restored. Your current data was not changed.'); }

  const temp = path.join(cfg.DATA_DIR, 'restore-temp.db');
  try {
    fs.copyFileSync(source, temp);
    const recheck = backup.validate(temp);
    if (!recheck.ok) throw new Error('copy failed validation');
    db.swapDatabase(temp);
  } catch (e) {
    console.error('[restore] failed:', e);
    try { fs.unlinkSync(temp); } catch (e2) { /* ignore */ }
    throw new HttpError(500, 'Restore failed. Your original data is still in place. Details were written in the black server window.');
  }
  session.destroyAll(); // the restored database has its own admin passwords
  const ctxClear = session.clearCookieHeader();
  ctx.res.setHeader('Set-Cookie', ctxClear);
  sendJson(ctx.res, 200, {
    success: true,
    restored: body.filename,
    safetyBackup: safety,
    counts: check.counts,
    message: 'Restore complete. No restart is needed. For safety you have been logged out: log in again using the admin password that was valid when that backup was made. Your previous data was saved as ' + safety + '.'
  });
});
