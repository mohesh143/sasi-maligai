// Admin account: first-time setup, login, logout, change password.
'use strict';
const db = require('../database/db');
const { router, HttpError } = require('../lib/router');
const { sendJson, readJson, isLocalRequest } = require('../lib/http');
const session = require('../lib/session');
const { hashPassword, verifyPassword, isLegacyHash } = require('../lib/password');
const { createLimiter } = require('../lib/limiter');
const { requireAdmin } = require('../middleware/auth');
const v = require('../lib/validate');

const loginLimiter = createLimiter(5, 5 * 60 * 1000); // 5 wrong tries, then wait 5 minutes
const MIN_PASSWORD = 8;

function adminCount() { return db.one('SELECT COUNT(*) AS c FROM admins').c; }

router.get('/api/admin/status', (ctx) => {
  sendJson(ctx.res, 200, {
    loggedIn: !!ctx.session,
    username: ctx.session ? ctx.session.username : null,
    needsSetup: adminCount() === 0
  });
});

// First-time admin creation. Only works while NO admin exists, and only from this computer.
router.post('/api/admin/setup', async (ctx) => {
  if (adminCount() > 0) throw new HttpError(403, 'An admin account already exists.');
  if (!isLocalRequest(ctx.req)) throw new HttpError(403, 'The admin account can only be created from the shop computer itself.');
  const body = await readJson(ctx.req);
  const username = v.text(body.username, 'Username', { min: 3, max: 30 });
  if (!/^[A-Za-z0-9_.-]+$/.test(username)) throw new HttpError(400, 'Username may only contain letters, numbers, dot, dash and underscore.');
  const password = String(body.password || '');
  if (password.length < MIN_PASSWORD) throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters.`);
  if (password.length > 200) throw new HttpError(400, 'Password is too long.');
  const result = db.run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', username, hashPassword(password));
  const sid = session.create(Number(result.lastInsertRowid), username);
  ctx.res.setHeader('Set-Cookie', session.cookieHeader(sid));
  sendJson(ctx.res, 201, { success: true, username });
});

router.post('/api/admin/login', async (ctx) => {
  const key = ctx.ip;
  if (loginLimiter.isBlocked(key)) {
    throw new HttpError(429, `Too many wrong attempts. Please wait about ${loginLimiter.retryMinutes(key)} minute(s) and try again.`);
  }
  const body = await readJson(ctx.req);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !password) throw new HttpError(400, 'Username and password are required.');
  if (password.length > 200) throw new HttpError(400, 'Invalid username or password.');

  const admin = db.one('SELECT * FROM admins WHERE username = ?', username);
  if (admin && isLegacyHash(admin.password_hash)) {
    throw new HttpError(409, 'This account was made by the older version of the website. Close this page, double-click "reset-admin-password.bat" in the project folder, then log in with the new password.', { legacy: true });
  }
  const ok = admin ? verifyPassword(password, admin.password_hash) : (verifyPassword(password, 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA'), false);
  if (!ok) {
    loginLimiter.hit(key);
    throw new HttpError(401, 'Invalid username or password.');
  }
  loginLimiter.clear(key);
  const sid = session.create(admin.id, admin.username); // a fresh session ID on every login
  ctx.res.setHeader('Set-Cookie', session.cookieHeader(sid));
  sendJson(ctx.res, 200, { success: true, username: admin.username });
});

router.post('/api/admin/logout', (ctx) => {
  if (ctx.sid) session.destroy(ctx.sid);
  ctx.res.setHeader('Set-Cookie', session.clearCookieHeader());
  sendJson(ctx.res, 200, { success: true });
});

router.post('/api/admin/change-password', requireAdmin, async (ctx) => {
  const body = await readJson(ctx.req);
  const current = String(body.currentPassword || '');
  const next = String(body.newPassword || '');
  if (next.length < MIN_PASSWORD) throw new HttpError(400, `New password must be at least ${MIN_PASSWORD} characters.`);
  if (next.length > 200) throw new HttpError(400, 'New password is too long.');
  const admin = db.one('SELECT * FROM admins WHERE id = ?', ctx.session.adminId);
  if (!admin || !verifyPassword(current, admin.password_hash)) throw new HttpError(401, 'Your current password is not correct.');
  db.run('UPDATE admins SET password_hash = ? WHERE id = ?', hashPassword(next), admin.id);
  sendJson(ctx.res, 200, { success: true });
});
