// Remembers how many times something happened per key (e.g. per IP) in a time window.
'use strict';
function createLimiter(max, windowMs) {
  const hits = new Map();
  return {
    isBlocked(key) {
      const e = hits.get(key);
      if (!e) return false;
      if (e.reset < Date.now()) { hits.delete(key); return false; }
      return e.count >= max;
    },
    hit(key) {
      const now = Date.now();
      const e = hits.get(key);
      if (!e || e.reset < now) hits.set(key, { count: 1, reset: now + windowMs });
      else e.count++;
    },
    clear(key) { hits.delete(key); },
    retryMinutes(key) { const e = hits.get(key); return e ? Math.max(1, Math.ceil((e.reset - Date.now()) / 60000)) : 1; }
  };
}
module.exports = { createLimiter };
