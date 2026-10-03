// Login sessions are kept in memory (nothing secret is stored in the browser except a random ID).
// Restarting the server logs everyone out - that is expected and safe.
'use strict';
const crypto = require('crypto');
const { SESSION_HOURS } = require('../config');

const COOKIE = 'sm_sid';
const sessions = new Map();
const TTL = SESSION_HOURS * 60 * 60 * 1000;

function create(adminId, username) {
  const sid = crypto.randomBytes(32).toString('hex');
  sessions.set(sid, { adminId, username, expires: Date.now() + TTL });
  return sid;
}
function get(sid) {
  const s = sessions.get(sid);
  if (!s) return null;
  if (s.expires < Date.now()) { sessions.delete(sid); return null; }
  s.expires = Date.now() + TTL; // sliding expiry
  return s;
}
function destroy(sid) { sessions.delete(sid); }
function destroyAll() { sessions.clear(); }
function cookieHeader(sid) {
  return `${COOKIE}=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}`;
}
function clearCookieHeader() { return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`; }

setInterval(() => { const now = Date.now(); for (const [k, v] of sessions) if (v.expires < now) sessions.delete(k); }, 10 * 60 * 1000).unref();

module.exports = { COOKIE, create, get, destroy, destroyAll, cookieHeader, clearCookieHeader };
