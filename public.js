// Public (no login) endpoints: shop info, products, categories.
'use strict';
const db = require('../database/db');
const { router } = require('../lib/router');
const { sendJson } = require('../lib/http');
const settings = require('../lib/settings');
const v = require('../lib/validate');

function serializeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit,
    image: p.image ? `/uploads/products/${p.image}` : null,
    description: p.description || '',
    available: !!p.available,
    isDemo: !!p.is_demo,
    updatedAt: v.utc(p.updated_at)
  };
}

router.get('/api/health', (ctx) => sendJson(ctx.res, 200, { ok: true }));

router.get('/api/config', (ctx) => sendJson(ctx.res, 200, settings.publicConfig()));

// GET /api/products?search=&category=&available=true|false
router.get('/api/products', (ctx) => {
  const { search, category, available } = ctx.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (search && search.trim()) {
    const like = '%' + v.escapeLike(search.trim().slice(0, 60)) + '%';
    sql += " AND (name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')";
    params.push(like, like);
  }
  if (category && category !== 'All') { sql += ' AND category = ? COLLATE NOCASE'; params.push(category); }
  if (available === 'true') sql += ' AND available = 1';
  else if (available === 'false') sql += ' AND available = 0';
  sql += ' ORDER BY available DESC, name COLLATE NOCASE LIMIT 1000';
  sendJson(ctx.res, 200, db.all(sql, ...params).map(serializeProduct));
});

// Categories that currently have products (for the filter and the home page).
router.get('/api/categories', (ctx) => {
  const rows = db.all(`
    SELECT c.name, COUNT(p.id) AS total, COALESCE(SUM(p.available), 0) AS available
    FROM categories c LEFT JOIN products p ON p.category = c.name COLLATE NOCASE
    GROUP BY c.id HAVING COUNT(p.id) > 0
    ORDER BY c.sort_order, c.name COLLATE NOCASE`);
  sendJson(ctx.res, 200, rows);
});

module.exports = { serializeProduct };
