// Admin dashboard numbers.
'use strict';
const fs = require('fs');
const db = require('../database/db');
const cfg = require('../config');
const { router } = require('../lib/router');
const { sendJson } = require('../lib/http');
const { requireAdmin } = require('../middleware/auth');
const backup = require('../lib/backup');
const settings = require('../lib/settings');

router.get('/api/admin/stats', requireAdmin, (ctx) => {
  const total = db.one('SELECT COUNT(*) AS c FROM products').c;
  const available = db.one('SELECT COUNT(*) AS c FROM products WHERE available = 1').c;
  const fb = db.one('SELECT COUNT(*) AS c, AVG(rating) AS avg FROM feedback');
  const s = settings.getAll();
  const manual = backup.list().filter((b) => b.kind === 'backup');
  let dbKB = 0;
  try { dbKB = Math.round(fs.statSync(cfg.DB_PATH).size / 1024); } catch (e) { /* ignore */ }
  sendJson(ctx.res, 200, {
    totalProducts: total,
    availableProducts: available,
    unavailableProducts: total - available,
    categoryCount: db.one('SELECT COUNT(*) AS c FROM categories').c,
    feedbackCount: fb.c,
    averageRating: fb.avg ? Math.round(fb.avg * 10) / 10 : null,
    demoProducts: db.one('SELECT COUNT(*) AS c FROM products WHERE is_demo = 1').c,
    lastManualBackup: manual.length ? manual[0].createdAt : null,
    databaseKB: dbKB,
    missingShopDetails: ['phone', 'address', 'opening_hours'].filter((k) => !s[k])
  });
});
