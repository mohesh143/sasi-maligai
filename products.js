// Admin product management (all routes require login).
'use strict';
const db = require('../database/db');
const { router, HttpError } = require('../lib/router');
const { sendJson, readJson } = require('../lib/http');
const { requireAdmin } = require('../middleware/auth');
const { readProductForm, saveImage } = require('../middleware/upload');
const { serializeProduct } = require('./public');
const backup = require('../lib/backup');
const v = require('../lib/validate');

// NOTE: product pictures are never deleted from the uploads folder automatically.
// They are tiny, and keeping them means an older backup still shows its pictures.

function checkProduct(fields, existing) {
  const pick = (k, cur) => (fields[k] !== undefined ? fields[k] : cur);
  const name = v.text(pick('name', existing && existing.name), 'Product name', { min: 1, max: 120 });
  const categoryInput = v.text(pick('category', existing && existing.category), 'Category', { min: 1, max: 40 });
  const cat = db.one('SELECT name FROM categories WHERE name = ?', categoryInput);
  if (!cat) throw new HttpError(400, 'Please choose a category from the list (add new ones on the Categories page).');
  const price = v.money(pick('price', existing && existing.price), 'Price');
  const unit = v.text(pick('unit', existing && existing.unit), 'Unit', { min: 1, max: 20 });
  const description = v.text(pick('description', existing && existing.description), 'Description', { max: 500 });
  const availRaw = fields.available !== undefined ? fields.available : (existing ? existing.available : 1);
  const available = (availRaw === 'true' || availRaw === '1' || availRaw === 1 || availRaw === true) ? 1 : 0;
  return { name, category: cat.name, price, unit, description, available };
}

router.get('/api/admin/products', requireAdmin, (ctx) => {
  sendJson(ctx.res, 200, db.all('SELECT * FROM products ORDER BY name COLLATE NOCASE').map(serializeProduct));
});

router.post('/api/admin/products', requireAdmin, async (ctx) => {
  const { fields, image } = await readProductForm(ctx);
  const p = checkProduct(fields, null);
  const file = image ? saveImage(image) : null;
  const r = db.run(`INSERT INTO products (name, category, price, unit, image, description, available, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, p.name, p.category, p.price, p.unit, file, p.description, p.available);
  sendJson(ctx.res, 201, serializeProduct(db.one('SELECT * FROM products WHERE id = ?', r.lastInsertRowid)));
});

router.put('/api/admin/products/:id', requireAdmin, async (ctx) => {
  const id = v.id(ctx.params.id);
  const existing = db.one('SELECT * FROM products WHERE id = ?', id);
  if (!existing) throw new HttpError(404, 'Product not found.');
  const { fields, image } = await readProductForm(ctx);
  const p = checkProduct(fields, existing);
  let file = existing.image;
  if (image) file = saveImage(image);
  else if (fields.remove_image === '1') file = null;
  db.run(`UPDATE products SET name = ?, category = ?, price = ?, unit = ?, image = ?, description = ?, available = ?,
    is_demo = ?, updated_at = datetime('now') WHERE id = ?`,
  p.name, p.category, p.price, p.unit, file, p.description, p.available, existing.is_demo, id);
  sendJson(ctx.res, 200, serializeProduct(db.one('SELECT * FROM products WHERE id = ?', id)));
});

// Quick "in stock / out of stock" switch.
router.patch('/api/admin/products/:id/availability', requireAdmin, async (ctx) => {
  const id = v.id(ctx.params.id);
  const body = await readJson(ctx.req);
  const r = db.run("UPDATE products SET available = ?, updated_at = datetime('now') WHERE id = ?", body.available ? 1 : 0, id);
  if (!r.changes) throw new HttpError(404, 'Product not found.');
  sendJson(ctx.res, 200, serializeProduct(db.one('SELECT * FROM products WHERE id = ?', id)));
});

router.delete('/api/admin/products/:id', requireAdmin, (ctx) => {
  const id = v.id(ctx.params.id);
  const r = db.run('DELETE FROM products WHERE id = ?', id);
  if (!r.changes) throw new HttpError(404, 'Product not found.');
  sendJson(ctx.res, 200, { success: true });
});

// Removes ONLY products marked as demo. A safety backup is made first.
router.post('/api/admin/products/remove-demo', requireAdmin, async (ctx) => {
  const body = await readJson(ctx.req);
  if (body.confirm !== true) throw new HttpError(400, 'Please confirm first.');
  const safety = backup.snapshot(db.get(), 'safety');
  const r = db.run('DELETE FROM products WHERE is_demo = 1');
  sendJson(ctx.res, 200, { success: true, removed: r.changes, safetyBackup: safety });
});
