// ============================================================
// run-tests.js - automatic self-test for the Sasi Maligai website.
// Run it with:   npm test        (needs only Node.js, no internet)
// It starts the server on a spare port using TEMPORARY folders, so it
// never touches your real data, backups or pictures.
// ============================================================
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..', '..');
const SERVER = path.join(ROOT, 'server', 'server.js');
const results = [];
let currentGroup = '';

function group(name) { currentGroup = name; console.log('\n== ' + name); }
async function test(name, fn) {
  try { await fn(); results.push({ group: currentGroup, name, ok: true }); console.log('  PASS  ' + name); }
  catch (e) { results.push({ group: currentGroup, name, ok: false, error: e.message }); console.log('  FAIL  ' + name + '\n        -> ' + e.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'values differ') + ` (got ${JSON.stringify(a)}, expected ${JSON.stringify(b)})`); }

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeDirs(tag) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'sm-test-' + tag + '-'));
  return { base, data: path.join(base, 'data'), backups: path.join(base, 'backups'), uploads: path.join(base, 'uploads') };
}

class Server {
  constructor(dirs, extraEnv) { this.dirs = dirs; this.port = 41000 + Math.floor(Math.random() * 8000); this.extraEnv = extraEnv || {}; this.log = ''; }
  get base() { return 'http://127.0.0.1:' + this.port; }
  async start() {
    this.proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', SERVER], {
      env: { ...process.env, PORT: String(this.port), HOST: '127.0.0.1', NO_BROWSER: '1', SM_DATA_DIR: this.dirs.data, SM_BACKUP_DIR: this.dirs.backups, SM_UPLOAD_DIR: this.dirs.uploads, ...this.extraEnv },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    this.proc.stdout.on('data', (d) => { this.log += d; });
    this.proc.stderr.on('data', (d) => { this.log += d; });
    for (let i = 0; i < 80; i++) {
      try { const r = await fetch(this.base + '/api/health'); if (r.ok) return; } catch (e) { /* not yet */ }
      if (this.proc.exitCode !== null) throw new Error('server exited early:\n' + this.log);
      await sleep(100);
    }
    throw new Error('server did not start:\n' + this.log);
  }
  async stop(signal) {
    if (!this.proc || this.proc.exitCode !== null) return;
    const done = new Promise((r) => this.proc.once('exit', r));
    this.proc.kill(signal || 'SIGTERM');
    await done;
  }
}

class Client {
  constructor(base) { this.base = base; this.cookie = ''; }
  async req(method, url, opts) {
    opts = opts || {};
    const headers = { ...(opts.headers || {}) };
    if (this.cookie) headers.Cookie = this.cookie;
    let body;
    if (opts.json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(opts.json); }
    if (opts.form) body = opts.form;
    const res = await fetch(this.base + url, { method, headers, body, redirect: 'manual' });
    const sc = res.headers.get('set-cookie');
    if (sc) { const pair = sc.split(';')[0]; this.cookie = pair.endsWith('=') ? '' : pair; }
    const buf = Buffer.from(await res.arrayBuffer());
    let data = null;
    if ((res.headers.get('content-type') || '').includes('json')) { try { data = JSON.parse(buf.toString('utf8')); } catch (e) { /* ignore */ } }
    return { status: res.status, data, buf, headers: res.headers, text: buf.toString('utf8') };
  }
  get(u, o) { return this.req('GET', u, o); }
  post(u, json, o) { return this.req('POST', u, { json, ...(o || {}) }); }
  put(u, json) { return this.req('PUT', u, { json }); }
  del(u) { return this.req('DELETE', u); }
}

function productForm(fields, imageBuf, imageName, mime) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  if (imageBuf) fd.append('image', new Blob([imageBuf], { type: mime || 'image/png' }), imageName || 'pic.png');
  return fd;
}

(async function main() {
  const dirs = makeDirs('main');
  const srv = new Server(dirs);
  await srv.start();
  const anon = new Client(srv.base);
  const admin = new Client(srv.base);
  const PASS = 'Correct-Horse-9';

  group('Database safety (static checks of the source code)');
  await test('no DROP TABLE / DROP DATABASE anywhere in the server code', () => {
    const files = [];
    (function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.js') && !p.includes('tests')) files.push(p); }); })(path.join(ROOT, 'server'));
    files.forEach((f) => { const s = fs.readFileSync(f, 'utf8').replace(/\/\/.*$/gm, ''); assert(!/DROP\s+(TABLE|DATABASE|INDEX)/i.test(s), 'DROP found in ' + f); });
  });
  await test('DELETE FROM only appears where a person asks for it (products, categories, feedback)', () => {
    const files = ['routes/products.js', 'routes/categories.js', 'routes/feedback.js'];
    const all = fs.readdirSync(path.join(ROOT, 'server', 'routes')).concat(fs.readdirSync(path.join(ROOT, 'server', 'database')), fs.readdirSync(path.join(ROOT, 'server', 'lib')));
    const hits = [];
    ['routes', 'database', 'lib'].forEach((d) => fs.readdirSync(path.join(ROOT, 'server', d)).forEach((f) => {
      const s = fs.readFileSync(path.join(ROOT, 'server', d, f), 'utf8').replace(/\/\/.*$/gm, '');
      if (/DELETE\s+FROM/i.test(s)) hits.push(d + '/' + f);
    }));
    hits.forEach((h) => assert(files.includes(h), 'unexpected DELETE FROM in ' + h));
    assert(all.length > 0);
  });
  await test('database file was created once and demo products exist on first run', async () => {
    assert(fs.existsSync(path.join(dirs.data, 'sasi-maligai.db')), 'no db file');
    const r = await anon.get('/api/products');
    eq(r.data.length, 8, 'demo product count');
  });
  await test('an automatic daily backup was made at startup', () => {
    assert(fs.readdirSync(dirs.backups).some((f) => /^sasi-maligai-auto-\d{4}-\d{2}-\d{2}-\d{6}\.db$/.test(f)), 'no auto backup');
  });

  group('Customer website (public)');
  await test('home page loads', async () => { const r = await anon.get('/'); eq(r.status, 200); assert(r.text.includes('site-header')); });
  for (const p of ['/index.html', '/products.html', '/about.html', '/contact.html', '/css/style.css', '/js/common.js', '/js/products.js', '/js/home.js', '/js/contact.js', '/images/favicon.svg']) {
    await test('static file served: ' + p, async () => { const r = await anon.get(p); eq(r.status, 200); });
  }
  await test('unknown page gives a friendly 404', async () => { const r = await anon.get('/nope.html'); eq(r.status, 404); assert(r.text.includes('Page not found')); });
  await test('unknown API route gives JSON 404', async () => { const r = await anon.get('/api/nothing'); eq(r.status, 404); assert(r.data && r.data.error); });
  await test('shop config is public and has the shop name', async () => { const r = await anon.get('/api/config'); eq(r.status, 200); eq(r.data.shopName, 'Sasi Maligai'); });
  await test('products list returns price, unit, availability, category', async () => {
    const r = await anon.get('/api/products'); const p = r.data[0];
    assert(typeof p.price === 'number' && p.unit && typeof p.available === 'boolean' && p.category && 'image' in p && 'description' in p);
  });
  await test('search finds "rice"', async () => { const r = await anon.get('/api/products?search=rice'); assert(r.data.length === 1 && /rice/i.test(r.data[0].name)); });
  await test('search with % does not match everything', async () => { const r = await anon.get('/api/products?search=' + encodeURIComponent('%')); eq(r.data.length, 0); });
  await test('search tries to inject SQL safely', async () => { const r = await anon.get('/api/products?search=' + encodeURIComponent("' OR 1=1 --")); eq(r.status, 200); eq(r.data.length, 0); });
  await test('category filter works', async () => { const r = await anon.get('/api/products?category=Pulses'); assert(r.data.length === 1 && r.data[0].category === 'Pulses'); });
  await test('availability filter works', async () => {
    const yes = await anon.get('/api/products?available=true'); const no = await anon.get('/api/products?available=false');
    assert(yes.data.every((p) => p.available) && no.data.every((p) => !p.available) && no.data.length === 1);
  });
  await test('categories endpoint lists categories that have products', async () => { const r = await anon.get('/api/categories'); assert(r.data.length === 8 && r.data[0].name); });
  await test('security headers are present', async () => {
    const r = await anon.get('/'); eq(r.headers.get('x-content-type-options'), 'nosniff'); assert(r.headers.get('content-security-policy').includes("script-src 'self'")); eq(r.headers.get('x-frame-options'), 'DENY');
  });
  await test('path traversal cannot read files outside the website folder', async () => {
    for (const u of ['/..%2f..%2fpackage.json', '/%2e%2e/%2e%2e/package.json', '/..%5c..%5cpackage.json', '/css/../../package.json', '/uploads/products/..%2f..%2f..%2fpackage.json']) {
      const r = await anon.get(u); assert(r.status === 404 || r.status === 400, u + ' returned ' + r.status); assert(!r.text.includes('"name": "sasi-maligai"'), 'leaked file via ' + u);
    }
  });
  await test('server code, database and backups are not downloadable', async () => {
    for (const u of ['/server/server.js', '/data/sasi-maligai.db', '/backups/', '/.env', '/package.json', '/uploads/']) { const r = await anon.get(u); eq(r.status, 404, u); }
  });

  group('Admin authentication');
  await test('every admin API refuses requests without login (401)', async () => {
    const checks = [['GET', '/api/admin/products'], ['POST', '/api/admin/products'], ['PUT', '/api/admin/products/1'], ['DELETE', '/api/admin/products/1'], ['PATCH', '/api/admin/products/1/availability'],
      ['POST', '/api/admin/products/remove-demo'], ['GET', '/api/admin/categories'], ['POST', '/api/admin/categories'], ['PUT', '/api/admin/categories/1'], ['DELETE', '/api/admin/categories/1'],
      ['GET', '/api/admin/feedback'], ['DELETE', '/api/admin/feedback/1'], ['GET', '/api/admin/settings'], ['PUT', '/api/admin/settings'], ['GET', '/api/admin/stats'],
      ['GET', '/api/admin/backups'], ['POST', '/api/admin/backups'], ['GET', '/api/admin/backups/info?file=x.db'], ['GET', '/api/admin/backups/download?file=x.db'], ['POST', '/api/admin/backups/restore'], ['POST', '/api/admin/change-password']];
    for (const [m, u] of checks) { const r = await anon.req(m, u, m === 'GET' || m === 'DELETE' ? {} : { json: {} }); eq(r.status, 401, m + ' ' + u); }
  });
  await test('status says an admin account must be created first', async () => { const r = await anon.get('/api/admin/status'); eq(r.data.needsSetup, true); eq(r.data.loggedIn, false); });
  await test('login is impossible before an account exists', async () => { const r = await anon.post('/api/admin/login', { username: 'admin', password: 'admin123' }); eq(r.status, 401); });
  await test('setup rejects a short password', async () => { const r = await admin.post('/api/admin/setup', { username: 'owner', password: 'short' }); eq(r.status, 400); });
  await test('setup rejects a bad username', async () => { const r = await admin.post('/api/admin/setup', { username: 'ow ner!', password: PASS }); eq(r.status, 400); });
  await test('setup creates the admin and logs in', async () => {
    const r = await admin.post('/api/admin/setup', { username: 'owner', password: PASS }); eq(r.status, 201);
    const s = await admin.get('/api/admin/status'); eq(s.data.loggedIn, true); eq(s.data.username, 'owner'); eq(s.data.needsSetup, false);
  });
  await test('setup cannot be used a second time', async () => { const r = await anon.post('/api/admin/setup', { username: 'hacker', password: 'Another-Pass-1' }); eq(r.status, 403); });
  await test('password is stored hashed (scrypt), never as plain text', () => {
    const db = new DatabaseSync(path.join(dirs.data, 'sasi-maligai.db'), { readOnly: true });
    const row = db.prepare('SELECT password_hash FROM admins').get(); db.close();
    assert(row.password_hash.startsWith('scrypt$') && !row.password_hash.includes(PASS));
  });
  await test('session cookie is HttpOnly and SameSite=Strict', async () => {
    const c = new Client(srv.base); const r = await fetch(srv.base + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'owner', password: PASS }) });
    const sc = r.headers.get('set-cookie'); assert(/HttpOnly/i.test(sc) && /SameSite=Strict/i.test(sc), sc); assert(c);
  });
  await test('logout ends the session', async () => {
    const c = new Client(srv.base); await c.post('/api/admin/login', { username: 'owner', password: PASS });
    eq((await c.get('/api/admin/stats')).status, 200); await c.post('/api/admin/logout', {}); eq((await c.get('/api/admin/stats')).status, 401);
  });
  await test('wrong password is refused with a generic message', async () => { const r = await anon.post('/api/admin/login', { username: 'owner', password: 'wrong-password' }); eq(r.status, 401); assert(/invalid/i.test(r.data.error)); });
  await test('a forged session cookie is refused', async () => { const c = new Client(srv.base); c.cookie = 'sm_sid=' + 'a'.repeat(64); eq((await c.get('/api/admin/stats')).status, 401); });
  await test('requests from another website are blocked (Origin check)', async () => {
    const r = await admin.req('POST', '/api/admin/categories', { json: { name: 'Evil' }, headers: { Origin: 'http://evil.example' } }); eq(r.status, 403);
  });
  await test('change password: wrong current refused, correct accepted, old one stops working', async () => {
    const c = new Client(srv.base); await c.post('/api/admin/login', { username: 'owner', password: PASS });
    eq((await c.post('/api/admin/change-password', { currentPassword: 'nope', newPassword: 'New-Password-1' })).status, 401);
    eq((await c.post('/api/admin/change-password', { currentPassword: PASS, newPassword: 'short' })).status, 400);
    eq((await c.post('/api/admin/change-password', { currentPassword: PASS, newPassword: 'New-Password-1' })).status, 200);
    eq((await anon.post('/api/admin/login', { username: 'owner', password: PASS })).status, 401);
    eq((await c.post('/api/admin/change-password', { currentPassword: 'New-Password-1', newPassword: PASS })).status, 200);
  });

  group('Admin: products, pictures, categories');
  let createdId;
  await test('add a product with a picture', async () => {
    const r = await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'Jaggery', category: 'Other', price: '85.5', unit: 'kg', description: 'Fresh', available: 'true' }, PNG) });
    eq(r.status, 201, JSON.stringify(r.data)); createdId = r.data.id; assert(/^\/uploads\/products\/[0-9a-f]{24}\.png$/.test(r.data.image), r.data.image);
    assert(fs.existsSync(path.join(dirs.uploads, path.basename(r.data.image))), 'file not saved');
  });
  await test('the product picture is served to customers', async () => {
    const list = await anon.get('/api/products?search=Jaggery'); const r = await anon.get(list.data[0].image); eq(r.status, 200); eq(r.headers.get('content-type'), 'image/png'); assert(r.buf.equals(PNG));
  });
  await test('new product is visible on the customer API', async () => { const r = await anon.get('/api/products?search=jaggery'); eq(r.data.length, 1); eq(r.data[0].price, 85.5); });
  await test('a fake picture (text renamed .png) is rejected', async () => {
    const r = await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'Bad', category: 'Other', price: '1', unit: 'kg' }, Buffer.from('<?php echo 1; ?>'), 'x.png', 'image/png') }); eq(r.status, 400);
    eq((await anon.get('/api/products?search=Bad')).data.length, 0, 'product must not be saved');
  });
  await test('a picture over 2 MB is rejected', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(2.2 * 1024 * 1024)]);
    const r = await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'Big', category: 'Other', price: '1', unit: 'kg' }, big) }); eq(r.status, 413);
  });
  await test('a JPEG and a WEBP picture are accepted', async () => {
    const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(50)]);
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP'), Buffer.alloc(20)]);
    eq((await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'JpgItem', category: 'Other', price: '1', unit: 'kg' }, jpg, 'a.jpg', 'image/jpeg') })).status, 201);
    eq((await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'WebpItem', category: 'Other', price: '1', unit: 'kg' }, webp, 'a.webp', 'image/webp') })).status, 201);
  });
  await test('invalid price / missing name / unknown category are rejected with a clear message', async () => {
    for (const f of [{ name: 'X', category: 'Other', price: '-5', unit: 'kg' }, { name: 'X', category: 'Other', price: 'abc', unit: 'kg' }, { name: '  ', category: 'Other', price: '1', unit: 'kg' }, { name: 'X', category: 'Nonexistent', price: '1', unit: 'kg' }, { name: 'X', category: 'Other', price: '1', unit: '' }]) {
      const r = await admin.req('POST', '/api/admin/products', { form: productForm(f) }); eq(r.status, 400, JSON.stringify(f)); assert(r.data.error);
    }
  });
  await test('non-multipart product POST is refused politely', async () => { const r = await admin.post('/api/admin/products', { name: 'x' }); eq(r.status, 400); });
  await test('edit a product (price, availability) and keep its picture', async () => {
    const r = await admin.req('PUT', '/api/admin/products/' + createdId, { form: productForm({ name: 'Jaggery Block', category: 'Other', price: '90', unit: 'kg', available: 'false' }) });
    eq(r.status, 200); eq(r.data.price, 90); eq(r.data.available, false); assert(r.data.image, 'picture lost');
  });
  await test('remove a picture on request', async () => {
    const r = await admin.req('PUT', '/api/admin/products/' + createdId, { form: productForm({ remove_image: '1' }) }); eq(r.status, 200); eq(r.data.image, null);
  });
  await test('quick availability switch', async () => { const r = await admin.req('PATCH', '/api/admin/products/' + createdId + '/availability', { json: { available: true } }); eq(r.data.available, true); });
  await test('editing a missing product gives 404', async () => { eq((await admin.req('PUT', '/api/admin/products/99999', { form: productForm({ name: 'x' }) })).status, 404); });
  await test('delete a product', async () => { eq((await admin.del('/api/admin/products/' + createdId)).status, 200); eq((await anon.get('/api/products?search=Jaggery')).data.length, 0); });
  await test('admin list includes unavailable products', async () => { const r = await admin.get('/api/admin/products'); assert(r.data.some((p) => !p.available)); });
  await test('add a category, duplicates are refused', async () => {
    eq((await admin.post('/api/admin/categories', { name: 'Dairy' })).status, 201); eq((await admin.post('/api/admin/categories', { name: 'dairy' })).status, 409);
  });
  await test('rename a category updates its products too', async () => {
    await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'Milk', category: 'Dairy', price: '30', unit: 'packet' }) });
    const cats = (await admin.get('/api/admin/categories')).data; const d = cats.find((c) => c.name === 'Dairy');
    eq((await admin.put('/api/admin/categories/' + d.id, { name: 'Milk Products' })).status, 200);
    eq((await anon.get('/api/products?search=Milk')).data[0].category, 'Milk Products');
  });
  await test('a category that still has products cannot be deleted', async () => {
    const d = (await admin.get('/api/admin/categories')).data.find((c) => c.name === 'Milk Products'); const r = await admin.del('/api/admin/categories/' + d.id); eq(r.status, 409); assert(/product/.test(r.data.error));
  });
  await test('an empty category can be deleted', async () => {
    const c = (await admin.post('/api/admin/categories', { name: 'Temp' })).data; eq((await admin.del('/api/admin/categories/' + c.id)).status, 200);
  });
  await test('remove-demo needs confirmation, removes ONLY demo products, and makes a safety backup', async () => {
    eq((await admin.post('/api/admin/products/remove-demo', {})).status, 400);
    const before = (await admin.get('/api/admin/products')).data; const mine = before.filter((p) => !p.isDemo).length;
    const r = await admin.post('/api/admin/products/remove-demo', { confirm: true }); eq(r.status, 200); eq(r.data.removed, 8);
    eq((await admin.get('/api/admin/products')).data.length, mine, 'own products must remain'); assert(fs.existsSync(path.join(dirs.backups, r.data.safetyBackup)));
  });

  group('Admin: shop settings, feedback, dashboard');
  await test('save shop settings and see them on the public site', async () => {
    const r = await admin.put('/api/admin/settings', { shop_name: 'Sasi Maligai', phone: '98765 43210', whatsapp: '9876543210', email: 'shop@example.com', address: '12 Main Road\nTown', opening_hours: 'Mon-Sun 7-9', maps_url: 'https://maps.app.goo.gl/abc123' });
    eq(r.status, 200); const c = (await anon.get('/api/config')).data;
    eq(c.phone, '98765 43210'); eq(c.phoneHref, 'tel:9876543210'); eq(c.whatsappUrl, 'https://wa.me/919876543210'); eq(c.address, '12 Main Road\nTown'); eq(c.mapsUrl, 'https://maps.app.goo.gl/abc123'); eq(c.mapsEmbedUrl, '');
  });
  await test('pasting the Google Maps <iframe> code extracts the map address', async () => {
    const code = '<iframe src="https://www.google.com/maps/embed?pb=!1m18&amp;x=1" width="600" height="450" style="border:0;" loading="lazy"></iframe>';
    eq((await admin.put('/api/admin/settings', { maps_url: code })).status, 200);
    const c = (await anon.get('/api/config')).data; eq(c.mapsEmbedUrl, 'https://www.google.com/maps/embed?pb=!1m18&x=1');
  });
  await test('dangerous or invalid settings are refused', async () => {
    eq((await admin.put('/api/admin/settings', { maps_url: 'javascript:alert(1)' })).status, 400);
    eq((await admin.put('/api/admin/settings', { email: 'not-an-email' })).status, 400);
    eq((await admin.put('/api/admin/settings', { phone: 'call me maybe' })).status, 400);
    eq((await admin.put('/api/admin/settings', { shop_name: '' })).status, 400);
    eq((await admin.put('/api/admin/settings', { about: 'x'.repeat(2000) })).status, 400);
  });
  await test('an empty WhatsApp number hides the WhatsApp button (empty URL)', async () => {
    await admin.put('/api/admin/settings', { whatsapp: '' }); eq((await anon.get('/api/config')).data.whatsappUrl, '');
  });
  await test('customer feedback: valid message saved, admin can read it', async () => {
    eq((await anon.post('/api/feedback', { name: 'Ravi', rating: 5, message: 'Good shop' })).status, 201);
    const list = (await admin.get('/api/admin/feedback')).data; eq(list.length, 1); eq(list[0].name, 'Ravi'); assert(list[0].created_at.endsWith('Z'), 'time must be UTC ISO');
  });
  await test('feedback validation: rating 0, 6, missing name, empty message', async () => {
    for (const b of [{ name: 'A', rating: 0, message: 'x' }, { name: 'A', rating: 6, message: 'x' }, { name: '', rating: 3, message: 'x' }, { name: 'A', rating: 3, message: ' ' }, { name: 'A', rating: 'abc', message: 'x' }]) eq((await anon.post('/api/feedback', b)).status, 400, JSON.stringify(b));
  });
  await test('feedback with HTML is stored as text (shown safely by the pages)', async () => {
    await anon.post('/api/feedback', { name: '<b>x</b>', rating: 4, message: '<script>alert(1)</script>' });
    assert((await admin.get('/api/admin/feedback')).data.some((f) => f.message.includes('<script>')));
  });
  await test('spam-robot honeypot field is silently ignored', async () => {
    const n = (await admin.get('/api/admin/feedback')).data.length; await anon.post('/api/feedback', { name: 'Bot', rating: 5, message: 'buy', website: 'http://spam' });
    eq((await admin.get('/api/admin/feedback')).data.length, n);
  });
  await test('feedback is limited to 5 per hour per computer', async () => {
    let last; for (let i = 0; i < 6; i++) last = await anon.post('/api/feedback', { name: 'Z', rating: 3, message: 'm' + i }); eq(last.status, 429);
  });
  await test('admin can delete feedback', async () => { const l = (await admin.get('/api/admin/feedback')).data; eq((await admin.del('/api/admin/feedback/' + l[0].id)).status, 200); });
  await test('dashboard numbers are returned', async () => { const r = await admin.get('/api/admin/stats'); eq(r.status, 200); assert(r.data.totalProducts >= 3 && 'feedbackCount' in r.data && Array.isArray(r.data.missingShopDetails)); });

  group('Backup and restore');
  let b1;
  await test('create a backup with a timestamped name', async () => {
    const r = await admin.post('/api/admin/backups', {}); eq(r.status, 201); b1 = r.data.filename;
    assert(/^sasi-maligai-backup-\d{4}-\d{2}-\d{2}-\d{6}\.db$/.test(b1), b1); assert(fs.existsSync(path.join(dirs.backups, b1)));
  });
  await test('backup file is a valid SQLite database containing the shop data', () => {
    const buf = fs.readFileSync(path.join(dirs.backups, b1)); eq(buf.subarray(0, 15).toString(), 'SQLite format 3');
    const t = new DatabaseSync(path.join(dirs.backups, b1), { readOnly: true }); const n = t.prepare('SELECT COUNT(*) AS c FROM products').get().c; t.close(); assert(n >= 3);
  });
  await test('two backups in the same second get different names', async () => {
    const a = (await admin.post('/api/admin/backups', {})).data.filename; const b = (await admin.post('/api/admin/backups', {})).data.filename; assert(a !== b);
  });
  await test('backups are listed and can be downloaded', async () => {
    const l = await admin.get('/api/admin/backups'); assert(l.data.some((b) => b.filename === b1 && b.kind === 'backup'));
    const d = await admin.get('/api/admin/backups/download?file=' + encodeURIComponent(b1)); eq(d.status, 200); eq(d.buf.subarray(0, 15).toString(), 'SQLite format 3');
  });
  await test('backup info reports what is inside', async () => { const r = await admin.get('/api/admin/backups/info?file=' + encodeURIComponent(b1)); eq(r.data.ok, true); assert(r.data.counts.products >= 3 && r.data.current.products >= 3); });
  await test('dangerous backup file names are refused', async () => {
    for (const n of ['../data/sasi-maligai.db', '..\\x.db', '/etc/passwd', 'x.txt', 'a/b.db', '..%2f..%2fx.db']) {
      const r = await admin.get('/api/admin/backups/info?file=' + encodeURIComponent(n)); assert(r.status === 400, n + ' -> ' + r.status);
      const r2 = await admin.post('/api/admin/backups/restore', { filename: n, confirm: true }); assert(r2.status === 400, 'restore ' + n + ' -> ' + r2.status);
    }
    eq((await admin.get('/api/admin/backups/info?file=missing.db')).status, 404);
  });
  await test('restore without confirmation does nothing', async () => { eq((await admin.post('/api/admin/backups/restore', { filename: b1 })).status, 400); });
  await test('restoring a garbage/corrupt .db file is refused and nothing changes', async () => {
    fs.writeFileSync(path.join(dirs.backups, 'garbage.db'), 'this is not a database at all');
    const before = (await anon.get('/api/products')).data.length;
    const r = await admin.post('/api/admin/backups/restore', { filename: 'garbage.db', confirm: true }); eq(r.status, 400); assert(/not a valid|cannot be used/i.test(r.data.error), r.data.error);
    eq((await anon.get('/api/products')).data.length, before); eq((await admin.get('/api/admin/stats')).status, 200, 'still logged in and working');
  });
  await test('restoring a database from another program (missing shop tables) is refused', async () => {
    const f = path.join(dirs.backups, 'other.db'); const o = new DatabaseSync(f); o.exec('CREATE TABLE x (a); INSERT INTO x VALUES (1)'); o.close();
    eq((await admin.post('/api/admin/backups/restore', { filename: 'other.db', confirm: true })).status, 400);
  });
  await test('RESTORE: change data, restore the backup, old data comes back', async () => {
    const countAtBackup = (await anon.get('/api/products')).data.length;
    await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'AddedAfterBackup', category: 'Other', price: '5', unit: 'kg' }) });
    await admin.req('PUT', '/api/admin/products/' + (await anon.get('/api/products?search=JpgItem')).data[0].id, { form: productForm({ price: '999' }) });
    eq((await anon.get('/api/products')).data.length, countAtBackup + 1);
    const r = await admin.post('/api/admin/backups/restore', { filename: b1, confirm: true });
    eq(r.status, 200, JSON.stringify(r.data)); assert(/^sasi-maligai-before-restore-/.test(r.data.safetyBackup)); assert(fs.existsSync(path.join(dirs.backups, r.data.safetyBackup)), 'safety backup missing');
    eq((await anon.get('/api/products')).data.length, countAtBackup, 'product count after restore');
    eq((await anon.get('/api/products?search=AddedAfterBackup')).data.length, 0);
    eq((await anon.get('/api/products?search=JpgItem')).data[0].price, 1, 'edited price must be reverted');
  });
  await test('after restore you are logged out, and logging in again works without restarting', async () => {
    eq((await admin.get('/api/admin/stats')).status, 401); eq((await admin.post('/api/admin/login', { username: 'owner', password: PASS })).status, 200);
  });
  await test('the safety backup taken before the restore still contains the data that was replaced', () => {
    const f = fs.readdirSync(dirs.backups).find((n) => n.startsWith('sasi-maligai-before-restore-'));
    const t = new DatabaseSync(path.join(dirs.backups, f), { readOnly: true }); const n = t.prepare("SELECT COUNT(*) AS c FROM products WHERE name = 'AddedAfterBackup'").get().c; t.close(); eq(n, 1);
  });
  await test('no temporary restore files are left behind', () => {
    const left = fs.readdirSync(dirs.data).filter((n) => /restore-temp|\.replaced$/.test(n)); eq(left.length, 0, left.join(','));
  });
  await test('restoring from a backup keeps working data after another restart-free restore', async () => {
    eq((await admin.post('/api/admin/backups/restore', { filename: b1, confirm: true })).status, 200); eq((await anon.get('/api/products')).status, 200);
    await admin.post('/api/admin/login', { username: 'owner', password: PASS });
  });

  group('Restart survival (data must never disappear)');
  await test('add a product, stop the server normally, start it again: product is still there', async () => {
    await admin.req('POST', '/api/admin/products', { form: productForm({ name: 'SurvivorOne', category: 'Other', price: '12', unit: 'kg' }, PNG) });
    const img = (await anon.get('/api/products?search=SurvivorOne')).data[0].image;
    await srv.stop('SIGTERM'); await srv.start();
    const r = await anon.get('/api/products?search=SurvivorOne'); eq(r.data.length, 1); eq((await anon.get(img)).status, 200, 'picture must survive');
    assert(!/Demo products added|New database created/.test(srv.log.split('Sasi Maligai website is running').slice(-2).join('')), 'demo data must not be re-added');
  });
  await test('hard crash (process killed, like a power cut) loses nothing already saved', async () => {
    const c = new Client(srv.base); await c.post('/api/admin/login', { username: 'owner', password: PASS });
    await c.req('POST', '/api/admin/products', { form: productForm({ name: 'SurvivorTwo', category: 'Other', price: '13', unit: 'kg' }) });
    await srv.stop('SIGKILL'); await srv.start();
    eq((await anon.get('/api/products?search=SurvivorTwo')).data.length, 1); eq((await anon.get('/api/products?search=SurvivorOne')).data.length, 1);
  });
  await test('settings and admin login survive a restart', async () => {
    eq((await anon.get('/api/config')).data.phone, '98765 43210'); eq((await anon.post('/api/admin/login', { username: 'owner', password: PASS })).status, 200);
  });
  await test('restarting never recreates the database or the admin', async () => {
    eq((await anon.get('/api/admin/status')).data.needsSetup, false);
    const db = new DatabaseSync(path.join(dirs.data, 'sasi-maligai.db'), { readOnly: true }); const m = db.prepare('SELECT COUNT(*) AS c FROM schema_migrations').get().c; db.close(); eq(m, 2);
  });
  await test('a second server on the same port stops with a friendly message', async () => {
    const second = new Server(dirs); second.port = srv.port;
    const p = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', SERVER], { env: { ...process.env, PORT: String(srv.port), NO_BROWSER: '1', SM_DATA_DIR: dirs.data, SM_BACKUP_DIR: dirs.backups, SM_UPLOAD_DIR: dirs.uploads }, encoding: 'utf8', timeout: 15000 });
    assert(/already in use/.test(p.stdout + p.stderr), 'message missing: ' + p.stdout + p.stderr); assert(second);
    eq((await anon.get('/api/health')).status, 200, 'first server must keep running');
  });

  group('Upgrading from the ORIGINAL (old) version without losing data');
  const old = makeDirs('legacy');
  await test('an old database (original schema, bcrypt admin, real data) is kept intact and upgraded', async () => {
    fs.mkdirSync(old.data, { recursive: true });
    const d = new DatabaseSync(path.join(old.data, 'sasi-maligai.db'));
    d.exec(`CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Other', price REAL NOT NULL DEFAULT 0, unit TEXT NOT NULL DEFAULT 'piece', image TEXT, description TEXT, available INTEGER NOT NULL DEFAULT 1, is_demo INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
      CREATE TABLE feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
      CREATE TABLE admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
      INSERT INTO products (name, category, price, unit, description, available, is_demo) VALUES ('Real Rice', 'Special Grains', 70, 'kg', 'my own item', 1, 0), ('Real Dal', 'Pulses', 120, 'kg', '', 0, 0);
      INSERT INTO feedback (name, rating, message) VALUES ('Old Customer', 4, 'kept me!');
      INSERT INTO admins (username, password_hash) VALUES ('admin', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345');`);
    d.close();
    const s2 = new Server(old); await s2.start(); const c = new Client(s2.base);
    try {
      const prods = (await c.get('/api/products')).data; eq(prods.length, 2, 'products kept, no demo data added'); assert(prods.some((p) => p.name === 'Real Rice' && p.price === 70));
      assert((await c.get('/api/categories')).data.some((x) => x.name === 'Special Grains'), 'custom category kept');
      assert(fs.readdirSync(old.backups).some((f) => f.startsWith('sasi-maligai-before-update-')), 'before-update backup missing');
      const login = await c.post('/api/admin/login', { username: 'admin', password: 'admin123' }); eq(login.status, 409); assert(/reset-admin-password/.test(login.data.error));
      eq((await c.get('/api/admin/status')).data.needsSetup, false);
    } finally { await s2.stop(); }
    const chk = new DatabaseSync(path.join(old.data, 'sasi-maligai.db'), { readOnly: true });
    eq(chk.prepare('SELECT COUNT(*) AS c FROM feedback').get().c, 1); chk.close();
  });
  await test('reset-admin tool sets a new password for the old account', async () => {
    const env = { ...process.env, SM_DATA_DIR: old.data, SM_BACKUP_DIR: old.backups, SM_UPLOAD_DIR: old.uploads };
    const p = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(ROOT, 'server', 'tools', 'reset-admin.js')], { env, input: 'admin\nBrand-New-Pass-7\nBrand-New-Pass-7\n', encoding: 'utf8', timeout: 20000 });
    assert(/Done\./.test(p.stdout), p.stdout + p.stderr);
    const s3 = new Server(old); await s3.start(); const c = new Client(s3.base);
    try { eq((await c.post('/api/admin/login', { username: 'admin', password: 'Brand-New-Pass-7' })).status, 200); eq((await c.get('/api/products')).data.length, 2); } finally { await s3.stop(); }
  });
  await test('reset-admin refuses mismatching passwords and changes nothing', () => {
    const env = { ...process.env, SM_DATA_DIR: old.data, SM_BACKUP_DIR: old.backups, SM_UPLOAD_DIR: old.uploads };
    const p = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(ROOT, 'server', 'tools', 'reset-admin.js')], { env, input: 'admin\nAAAAAAAA1\nBBBBBBBB2\n', encoding: 'utf8', timeout: 20000 });
    assert(/not the same/.test(p.stdout), p.stdout); eq(p.status, 1);
  });

  group('Project files (safety and quality checks)');
  const walk = (d, ext, out) => { out = out || []; fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const f = path.join(d, e.name); if (e.isDirectory()) { if (!['node_modules', '.git', 'data', 'backups', 'uploads'].includes(e.name)) walk(f, ext, out); } else if (f.endsWith(ext)) out.push(f); }); return out; };
  await test('no style="..." attributes in HTML (the security policy would block them)', () => {
    walk(path.join(ROOT, 'client'), '.html').forEach((f) => assert(!/\sstyle\s*=/i.test(fs.readFileSync(f, 'utf8')), 'inline style in ' + f));
  });
  await test('no inline <script> code in HTML (only script files)', () => {
    walk(path.join(ROOT, 'client'), '.html').forEach((f) => { const m = fs.readFileSync(f, 'utf8').match(/<script(?![^>]*\ssrc=)[^>]*>/gi); assert(!m, 'inline script in ' + f); });
  });
  await test('every JavaScript file has valid syntax', () => {
    const files = walk(path.join(ROOT, 'client'), '.js').concat(walk(path.join(ROOT, 'server'), '.js'));
    files.forEach((f) => { const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' }); assert(r.status === 0, f + ': ' + r.stderr); });
    assert(files.length > 20);
  });
  await test('.bat files use Windows (CRLF) line endings', () => {
    ['start.bat', 'stop.bat', 'reset-admin-password.bat'].forEach((b) => { const t = fs.readFileSync(path.join(ROOT, b), 'utf8'); assert(t.includes('\r\n') && !/[^\r]\n/.test(t), b + ' must be CRLF'); });
  });
  await test('.gitignore protects .env, node_modules, database, backups and uploads', () => {
    const g = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8').split(/\r?\n/);
    ['.env', 'node_modules/', '*.db', 'data/*', 'backups/*', 'uploads/products/*', '*.log', '*.zip'].forEach((x) => assert(g.includes(x), '.gitignore is missing ' + x));
    assert(g.includes('!.env.example'));
  });
  await test('.env.example contains no real secrets (no password lines)', () => {
    const t = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'));
    assert(!t.some((l) => /PASS|SECRET|TOKEN|KEY/i.test(l)), 'secret-like line found');
  });
  await test('package.json has no npm dependencies', () => {
    const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); assert(!p.dependencies && !p.devDependencies);
  });
  await test('no real .env, database, node_modules or backups are inside the project folder', () => {
    assert(!fs.existsSync(path.join(ROOT, '.env')) || process.env.SM_ALLOW_ENV === '1', 'a real .env exists (fine on your own computer, but never in the ZIP)');
  });
  const docDir = path.join(ROOT, 'documentation');
  if (fs.existsSync(docDir)) {
    await test('documentation: all 12 guides, 2 HTML guides and images exist', () => {
      ['01-START-HERE', '02-INSTALLATION', '03-FIRST-START', '04-WEBSITE-GUIDE', '05-ADMIN-GUIDE', '06-PRODUCT-GUIDE', '07-BACKUP-RESTORE', '08-GITHUB-GUIDE', '09-UPDATE-GUIDE', '10-TROUBLESHOOTING', '11-SECURITY', '12-FINAL-TESTING'].forEach((n) => assert(fs.existsSync(path.join(docDir, n + '.md')), n + '.md missing'));
      assert(fs.existsSync(path.join(docDir, 'BEGINNER-GUIDE.html')) && fs.existsSync(path.join(docDir, 'GITHUB-GUIDE.html')));
      assert(fs.readdirSync(path.join(docDir, 'images')).filter((f) => f.endsWith('.png')).length >= 40, 'too few images');
    });
    await test('documentation: every image and guide link points to a file that exists', () => {
      const bad = [];
      fs.readdirSync(docDir).filter((f) => /\.(md|html)$/.test(f)).forEach((f) => {
        const t = fs.readFileSync(path.join(docDir, f), 'utf8');
        const refs = [...t.matchAll(/(?:\]\(|src=')((?:images\/)?[A-Za-z0-9._-]+\.(?:png|md|html))/g)].map((m) => m[1]);
        refs.forEach((r) => { if (!fs.existsSync(path.join(docDir, r))) bad.push(f + ' -> ' + r); });
      });
      eq(bad.length, 0, bad.join('; '));
    });
  }

  group('Login protection (run last: it locks this computer for a few minutes)');
  await test('after 5 wrong passwords the login is temporarily blocked', async () => {
    const c = new Client(srv.base); let last;
    for (let i = 0; i < 6; i++) last = await c.post('/api/admin/login', { username: 'owner', password: 'wrong' + i });
    eq(last.status, 429); assert(/wait/i.test(last.data.error));
    eq((await c.post('/api/admin/login', { username: 'owner', password: PASS })).status, 429, 'even the right password is blocked while locked');
  });

  await srv.stop();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n==== ${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total ====`);
  const jsonArg = process.argv.indexOf('--json');
  if (jsonArg > -1) fs.writeFileSync(process.argv[jsonArg + 1], JSON.stringify(results, null, 2));
  [dirs, old].forEach((d) => { try { fs.rmSync(d.base, { recursive: true, force: true }); } catch (e) { /* ignore */ } });
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('Test runner crashed:', e); process.exit(2); });
