// Admin: read and change the shop settings.
'use strict';
const { router } = require('../lib/router');
const { sendJson, readJson } = require('../lib/http');
const { requireAdmin } = require('../middleware/auth');
const settings = require('../lib/settings');

router.get('/api/admin/settings', requireAdmin, (ctx) => sendJson(ctx.res, 200, settings.getAll()));

router.put('/api/admin/settings', requireAdmin, async (ctx) => {
  const body = await readJson(ctx.req);
  sendJson(ctx.res, 200, settings.save(body));
});
