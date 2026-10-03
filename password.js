// Password hashing with scrypt (built into Node.js - strong and needs no packages).
'use strict';
const crypto = require('crypto');

const N = 16384, R = 8, P = 1, KEYLEN = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$');
}

function verifyPassword(password, stored) {
  try {
    const parts = String(stored).split('$');
    if (parts[0] !== 'scrypt' || parts.length !== 6) return false;
    const [, n, r, p, saltB64, hashB64] = parts;
    const expected = Buffer.from(hashB64, 'base64');
    const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length,
      { N: Number(n), r: Number(r), p: Number(p) });
    return crypto.timingSafeEqual(actual, expected);
  } catch (e) { return false; }
}

// Passwords created by the OLD version of this project (bcrypt) start with "$2".
function isLegacyHash(stored) { return /^\$2[aby]\$/.test(String(stored)); }

module.exports = { hashPassword, verifyPassword, isLegacyHash };
