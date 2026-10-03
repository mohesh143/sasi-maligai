// ============================================================
// reset-admin.js - set a new admin password (run via reset-admin-password.bat).
// Use it if you forgot the admin password, or after upgrading from the
// very first version of this project. Shop data is NOT touched.
// ============================================================
'use strict';
const readline = require('readline');
const db = require('../database/db');
const { hashPassword } = require('../lib/password');

const rl = readline.createInterface({ input: process.stdin, terminal: false });
const queue = []; const waiting = []; let ended = false;
rl.on('line', (l) => { if (waiting.length) waiting.shift()(l); else queue.push(l); });
rl.on('close', () => { ended = true; while (waiting.length) waiting.shift()(null); });
function ask(question) {
  process.stdout.write(question);
  return new Promise((resolve) => { if (queue.length) resolve(queue.shift()); else if (ended) resolve(null); else waiting.push(resolve); });
}

(async () => {
  console.log('==================================================');
  console.log('  Sasi Maligai - set a new admin password');
  console.log('==================================================');
  console.log('Note: the password is visible while you type. Make sure nobody is watching.\n');
  db.open();
  const admins = db.all('SELECT id, username FROM admins ORDER BY id');
  const first = admins.length ? admins[0].username : 'admin';
  const u = await ask(`Username [${first}]: `);
  const username = (u || '').trim() || first;
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) { console.log('\nUsername must be 3-30 letters/numbers.'); process.exit(1); }
  const p1 = await ask('New password (at least 8 characters): ');
  const p2 = await ask('Type the new password again: ');
  if (p1 === null || p1 !== p2) { console.log('\nThe passwords were not the same. Nothing was changed.'); process.exit(1); }
  if (p1.length < 8 || p1.length > 200) { console.log('\nPassword must be 8 to 200 characters. Nothing was changed.'); process.exit(1); }
  const hash = hashPassword(p1);
  const existing = db.one('SELECT id FROM admins WHERE username = ?', username);
  if (existing) db.run('UPDATE admins SET password_hash = ? WHERE id = ?', hash, existing.id);
  else db.run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', username, hash);
  console.log(`\nDone. You can now log in as "${username}" with the new password.`);
  db.close();
  process.exit(0);
})().catch((e) => { console.error('\nSomething went wrong:', e.message); process.exit(1); });
