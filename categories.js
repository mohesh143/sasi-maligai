// Admin category management.
'use strict';
const db = require('../database/db');
const { router, HttpError } = require('../lib/router');
const { sendJson, readJson } = require('../lib/http');
const { requireAdmin } = require('../middleware/auth');
const v = require('../lib/validate');

function catName(body) {
  const name = v.text(body.name, 'Category name', { min: 1, max: 40 });
  return name;
}

router.get('/api/admin/categories', requireAdmin, (ctx) => {
  sendJson(ctx.res, 200, db.all(`SELECT c.id, c.name, COUNT(p.id) AS productCount
    FROM categories c LEFT JOIN products p ON p.category = c.name COLLATE NOCASE
    GROUP BY c.id ORDER BY c.sort_order, c.name COLLATE NOCASE`));
});

router.post('/api/admin/categories', requireAdmin, async (ctx) => {
  const name = catName(await readJson(ctx.req));
  if (db.one('SELECT 1 FROM categories WHERE name = ?', name)) throw new HttpError(409, 'That category already exists.');
  const max = db.one('SELECT COALESCE(MAX(sort_order), 0) AS m FROM categories').m;
  const r = db.run('INSERT INTO categories (name, sort_order) VALUES (?, ?)', name, max + 1);
  sendJson(ctx.res, 201, { id: Number(r.lastInsertRowid), name, productCount: 0 });
});

// Renaming also updates every product in that category (all or nothing).
router.put('/api/admin/categories/:id', requireAdmin, async (ctx) => {
  const id = v.id(ctx.params.id);
  const name = catName(await readJson(ctx.req));
  const cat = db.one('SELECT * FROM categories WHERE id = ?', id);
  if (!cat) throw new HttpError(404, 'Category not found.');
  const clash = db.one('SELECT id FROM categories WHERE name = ? AND id <> ?', name, id);
  if (clash) throw new HttpError(409, 'Another category already has that name.');
  db.tx(() => {
    db.run('UPDATE categories SET name = ? WHERE id = ?', name, id);
    db.run("UPDATE products SET category = ?, updated_at = datetime('now') WHERE category = ? COLLATE NOCASE", name, cat.name);
  });
  sendJson(ctx.res, 200, { id, name });
});

router.delete('/api/admin/categories/:id', requireAdmin, (ctx) => {
  const id = v.id(ctx.params.id);
  const cat = db.one('SELECT * FROM categories WHERE id = ?', id);
  if (!cat) throw new HttpError(404, 'Category not found.');
  const n = db.one('SELECT COUNT(*) AS c FROM products WHERE category = ? COLLATE NOCASE', cat.name).c;
  if (n > 0) throw new HttpError(409, `${n} product(s) still use "${cat.name}". Move or delete those products first.`);
  db.run('DELETE FROM categories WHERE id = ?', id);
  sendJson(ctx.res, 200, { success: true });
});
