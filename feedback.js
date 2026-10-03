// Customer feedback: anyone can send it, only the admin can read or delete it.
'use strict';
const db = require('../database/db');
const { router, HttpError } = require('../lib/router');
const { sendJson, readJson } = require('../lib/http');
const { createLimiter } = require('../lib/limiter');
const { requireAdmin } = require('../middleware/auth');
const v = require('../lib/validate');

const limiter = createLimiter(5, 60 * 60 * 1000); // 5 messages per hour per computer

router.post('/api/feedback', async (ctx) => {
  const body = await readJson(ctx.req);
  if (body.website) return sendJson(ctx.res, 201, { success: true }); // hidden field filled in = a spam robot; pretend it worked
  if (limiter.isBlocked(ctx.ip)) throw new HttpError(429, 'You have sent several messages already. Please try again later.');
  const name = v.text(body.name, 'Name', { min: 1, max: 100 });
  const message = v.text(body.message, 'Feedback', { min: 1, max: 1000 });
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Please choose a rating from 1 to 5 stars.');
  db.run('INSERT INTO feedback (name, rating, message) VALUES (?, ?, ?)', name, rating, message);
  limiter.hit(ctx.ip);
  sendJson(ctx.res, 201, { success: true });
});

router.get('/api/admin/feedback', requireAdmin, (ctx) => {
  const rows = db.all('SELECT id, name, rating, message, created_at FROM feedback ORDER BY id DESC LIMIT 1000');
  sendJson(ctx.res, 200, rows.map((r) => ({ ...r, created_at: v.utc(r.created_at) })));
});

router.delete('/api/admin/feedback/:id', requireAdmin, (ctx) => {
  const r = db.run('DELETE FROM feedback WHERE id = ?', v.id(ctx.params.id));
  if (!r.changes) throw new HttpError(404, 'Feedback not found.');
  sendJson(ctx.res, 200, { success: true });
});
