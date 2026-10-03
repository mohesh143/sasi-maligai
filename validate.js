// Input validation helpers. Every check throws a friendly 400 error.
'use strict';
const { HttpError } = require('./router');

function text(value, label, opts) {
  const { min = 0, max = 200 } = opts || {};
  const s = (value === undefined || value === null ? '' : String(value)).replace(/\u0000/g, '').trim();
  if (s.length < min) throw new HttpError(400, min === 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`);
  if (s.length > max) throw new HttpError(400, `${label} is too long (maximum ${max} characters).`);
  return s;
}

function money(value, label) {
  const n = Number(String(value).trim());
  if (String(value).trim() === '' || !Number.isFinite(n) || n < 0 || n > 1000000) {
    throw new HttpError(400, `${label} must be a number between 0 and 1,000,000.`);
  }
  return Math.round(n * 100) / 100;
}

function id(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, 'Invalid id.');
  return n;
}

function escapeLike(s) { return s.replace(/[\\%_]/g, '\\$&'); }

// SQLite stores UTC like "2026-10-02 08:30:00". Browsers need "2026-10-02T08:30:00Z".
function utc(s) { return s ? String(s).replace(' ', 'T') + 'Z' : s; }

module.exports = { text, money, id, escapeLike, utc };
