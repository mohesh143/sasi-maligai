// Serves the website files (HTML, CSS, JS, product pictures).
'use strict';
const fs = require('fs');
const path = require('path');
const cfg = require('../config');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };

function notFound(res) {
  const body = '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found</title>' +
    '<body style="font-family:sans-serif;padding:24px"><h1>Page not found</h1><p><a href="/">Go to the home page</a></p></body>';
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}

// Returns a real file path inside baseDir, or null if the request tries to escape it.
function resolveInside(baseDir, relative) {
  let rel;
  try { rel = decodeURIComponent(relative); } catch (e) { return null; }
  if (rel.includes('\0')) return null;
  const base = path.resolve(baseDir);
  const full = path.resolve(base, '.' + path.sep + rel.replace(/^[/\\]+/, ''));
  if (full !== base && !full.startsWith(base + path.sep)) return null;
  const inside = full.slice(base.length);
  if (inside.split(path.sep).some((part) => part.startsWith('.'))) return null; // no hidden files
  return full;
}

function serveFile(req, res, file, cacheControl) {
  let st;
  try { st = fs.statSync(file); } catch (e) { return notFound(res); }
  if (st.isDirectory()) { file = path.join(file, 'index.html'); try { st = fs.statSync(file); } catch (e) { return notFound(res); } }
  const type = MIME[path.extname(file).toLowerCase()];
  if (!type) return notFound(res);
  const etag = `W/"${st.size}-${Math.floor(st.mtimeMs)}"`;
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag }); return res.end(); }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, ETag: etag, 'Cache-Control': cacheControl });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
}

function serveStatic(ctx) {
  const { req, res, url } = ctx;
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end('Method not allowed'); }
  if (url.pathname.startsWith('/uploads/products/')) {
    const file = resolveInside(cfg.UPLOAD_DIR, url.pathname.slice('/uploads/products/'.length));
    if (!file) return notFound(res);
    return serveFile(req, res, file, 'public, max-age=86400');
  }
  if (url.pathname.startsWith('/uploads')) return notFound(res);
  const file = resolveInside(cfg.CLIENT_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file) return notFound(res);
  serveFile(req, res, file, 'no-cache');
}

module.exports = { serveStatic };
