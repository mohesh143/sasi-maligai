// Safe image uploads: checks the REAL file type (not just the name), limits size,
// and saves with a random file name so nothing can overwrite or run as code.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cfg = require('../config');
const { HttpError } = require('../lib/router');
const { readBody, parseMultipart } = require('../lib/http');

function detectType(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return '.jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
  if (buf.length > 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return '.webp';
  return null;
}

// Reads a multipart form. Returns { fields, image } where image is { ext, data } or null.
async function readProductForm(ctx) {
  const type = ctx.req.headers['content-type'] || '';
  if (!/^multipart\/form-data/i.test(type)) throw new HttpError(400, 'Please submit the product form from the admin page.');
  const body = await readBody(ctx.req, cfg.MAX_IMAGE_BYTES + 512 * 1024);
  const { fields, file } = parseMultipart(body, type);
  let image = null;
  if (file) {
    if (file.data.length > cfg.MAX_IMAGE_BYTES) throw new HttpError(413, 'The picture is too large. Maximum size is 2 MB.');
    const ext = detectType(file.data);
    if (!ext) throw new HttpError(400, 'Only JPG, PNG or WEBP pictures are allowed.');
    image = { ext, data: file.data };
  }
  return { fields, image };
}

// Call this only AFTER all other checks passed, so failed saves leave no stray files.
function saveImage(image) {
  fs.mkdirSync(cfg.UPLOAD_DIR, { recursive: true });
  const name = crypto.randomBytes(12).toString('hex') + image.ext;
  fs.writeFileSync(path.join(cfg.UPLOAD_DIR, name), image.data, { flag: 'wx' });
  return name;
}

module.exports = { readProductForm, saveImage };
