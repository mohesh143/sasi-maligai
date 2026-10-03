# FINAL AUDIT — Sasi Maligai

Honest status of every requirement. **"Tested?"** uses only three values:

* **Tested here** — actually run in the developer's Linux test environment (Node 22.22, Chromium 141) with the result checked.
* **Needs your Windows test** — can only be verified on your Windows laptop (see [12-FINAL-TESTING.md](12-FINAL-TESTING.md)).
* **Not tested** — nothing was run for it.

"Tested here" does **not** mean "tested on Windows". Where a feature was tested on Linux but also depends on Windows behaviour, the Notes say so.

## What was run

| Test | Result |
|---|---|
| `npm test` (server/tests/run-tests.js): API, security, database, backup/restore, restart survival, upgrade from the old version, project-file checks | **105 checks, 105 passed** (last run before packaging) |
| Real-browser test (Chromium, clicking the real pages on a fresh server) | **16 of 16 passed** |
| Layout test: 12 pages × 7 widths (320, 375, 414, 768, 1024, 1366, 1920) = 84 combinations; no horizontal scroll, no overflowing element | **0 failures**; no JavaScript or Content-Security-Policy errors |
| Real `git` round trip against a local bare repository (init, add, commit, branch, remote, push, clone, update push) with fake `.env`, database, backups, pictures, `node_modules`, log and ZIP files present | Private files were **not** tracked or cloned; the clone started and served data without `npm install` |
| HTML guides opened in Chromium at 375 px and 1280 px | 40 images load, no broken image, no sideways scroll |
| Secret scan of the project (passwords, keys, tokens, `admin123`) | Nothing found |

The browser tests ran in Chromium on Linux. They are **not** a substitute for Edge/Chrome on your Windows laptop or for a real phone.

## Important differences from the project you uploaded

| Change | Reason |
|---|---|
| **No npm packages any more.** Express, express-session, multer, bcryptjs, dotenv and better-sqlite3 were replaced by Node.js built-ins (`http`, `node:sqlite`, `crypto`) | Your laptop is low-power and you are a beginner: `npm install` needs internet and the old SQLite package may need compiling on Windows. Now only Node.js is needed. **Requires Node.js 22.16 or newer.** |
| Passwords use scrypt instead of bcrypt | bcrypt was a removed package. An admin account made by the old version cannot log in until you run `reset-admin-password.bat` (tested here with a simulated old database). Shop data is not affected |
| No default admin password; the first visit creates the account (from the shop computer only) | The old `admin123` default was a risk |
| Shop details moved from `.env` into the database (Admin > Shop settings) | So you never edit files |
| Server listens on this computer only by default | Safer; see 04-WEBSITE-GUIDE.md to allow phones |

## Requirement-by-requirement

| Requirement | Implemented? | Tested? | File/Location | Notes |
|---|---|---|---|---|
| **Part 1–2: Customer website** | | | | |
| Lightweight, fast | Yes | Tested here | `client/` (148 KB total) | Server ready in 0.14 s, about 58 MB memory (Linux). Not measured on your laptop |
| No gradients, heavy libraries, animations | Yes | Tested here | `client/css/style.css` | Checked by search: none used |
| Home page: name, intro, categories, available products, contact info, address, hours, phone | Yes | Tested here | `client/index.html`, `js/home.js` | Browser test + screenshot |
| WhatsApp button only if configured | Yes | Tested here | `js/common.js`, `lib/settings.js` | Appears with a number; disappears when empty |
| Google Maps button / map only if configured | Yes | Tested here | `contact.html`, `js/contact.js` | Button and pasted `<iframe>` embed both tested |
| Products: view, search, category filter, price, unit, availability, image, description | Yes | Tested here | `products.html`, `js/products.js`, `routes/public.js` | API and browser tests. Search is safe against `%` and SQL text |
| Browsing needs no account | Yes | Tested here | public routes | Verified without login |
| Contact page | Yes | Tested here | `client/contact.html` | |
| Feedback: name, 1–5 rating, message; admin can view | Yes | Tested here | `routes/feedback.js`, `contact.html`, `admin/feedback.html` | Validation, spam trap, 5-per-hour limit, HTML shown as plain text |
| Human-made look (not generic) | Yes | Not tested | `style.css` | A matter of opinion; the design is plain and uses system fonts |
| **Part 3: Admin panel** | | | | |
| Secure login, logout | Yes | Tested here | `routes/auth.js` | Hashing, cookie flags, forged cookie, rate limit |
| Dashboard | Yes | Tested here | `admin/dashboard.html` | |
| Product add / edit / delete / availability | Yes | Tested here | `routes/products.js` | API and browser |
| Product image upload (safe) | Yes | Tested here | `middleware/upload.js` | Fake image, over-2 MB file, JPG/PNG/WEBP; browser shrinks a 13.9 MB photo to about 290 KB |
| Category management | Yes | Tested here | `routes/categories.js` | Rename updates products; delete blocked while in use |
| Feedback management | Yes | Tested here | `admin/feedback.html` | |
| Shop settings | Yes | Tested here | `routes/settings.js` | |
| Backup and restore | Yes | Tested here | `routes/backups.js` | See Part 6 |
| Admin works on mobile | Yes | Tested here | `style.css` | Emulated phone widths in Chromium; **not tested on a real phone** |
| **Part 4: Shop settings** | | | | |
| Name, phone, WhatsApp, email, address, hours, Maps URL editable without code | Yes | Tested here | Admin > Shop settings; `05-ADMIN-GUIDE.md` | Saved, shown on the site, survives restart |
| **Part 5: Database safety** | | | | |
| Never DROP / reset / recreate on startup | Yes | Tested here | `database/db.js`, `migrations.js` | Test scans the code for `DROP`; restarts keep data |
| Survives server restart | Yes | Tested here | | Normal stop and `SIGKILL` (simulated power cut) |
| Survives computer and Windows restart | Yes | Needs your Windows test | | Data is on disk with SQLite WAL and full sync; a real Windows restart was not done |
| Safe migrations, transactions | Yes | Tested here | `migrations.js` | Old-schema database upgraded with data intact; before-update backup made |
| Demo products only on the very first run | Yes | Tested here | `database/db.js` | |
| **Part 6: Backup and restore** | | | | |
| Timestamped backup name | Yes | Tested here | `lib/backup.js` | `sasi-maligai-backup-YYYY-MM-DD-HHMMSS.db` |
| Automatic safety backup before restore | Yes | Tested here | `routes/backups.js` | File exists and holds the replaced data |
| Confirmation and clear "what next" message | Yes | Tested here | `admin-backup.js` | Browser test: Cancel changes nothing; success message |
| Restore validates the file | Yes | Tested here | `lib/backup.js` | Garbage, wrong-database and bad-name files refused |
| Failed restore keeps current data | Yes | Not tested | `database/db.js` swapDatabase | Rollback code exists; a failure *during* the swap was never simulated |
| Restore without restart | Yes | Tested here | | Login works after restore |
| Windows file replacement during restore | Yes | Needs your Windows test | `swapDatabase` | Uses rename with retries because Windows locks files |
| Download backup; USB copy instructions | Yes | Tested here (download) | `07-BACKUP-RESTORE.md` | Copying to a real USB drive was not done |
| **Part 7–8: Future features, data isolation** | | | | |
| Foundation for later features | Yes | Tested here | `migrations.js`, `routes/` | Mechanism tested by the upgrade test. No future tables were created on purpose |
| Customer data isolation | N/A: no customer accounts exist | Not tested | `11-SECURITY.md` | Design rules are written down for future work; nothing to test yet |
| **Part 9: Security** | | | | |
| Password hashing | Yes | Tested here | `lib/password.js` | Stored as `scrypt$...` |
| Secure sessions, auth middleware | Yes | Tested here | `lib/session.js`, `middleware/auth.js` | All 21 admin endpoints return 401 without login |
| Input validation | Yes | Tested here | `lib/validate.js` | |
| Cross-site request blocking | Yes | Tested here | `server.js` | |
| Safe uploads | Yes | Tested here | `middleware/upload.js` | |
| Path traversal / hidden files protected | Yes | Tested here | `lib/static.js` | Encoded `..` attempts refused; `/data`, `/server`, `.env` not downloadable |
| No secrets in project | Yes | Tested here | whole project | Scan found none |
| Security against a determined attacker | — | Not tested | | No professional security audit was done |
| **Part 10: GitHub preparation** | | | | |
| `.gitignore`, `README.md`, `.env.example` | Yes | Tested here | project root | |
| `.gitignore` blocks `.env`, `node_modules`, data, backups, pictures, logs, ZIP | Yes | Tested here | | Verified with real `git` and fake private files |
| Git commands: init, add, commit, branch, remote, push, clone | Yes | Tested here | `08-GITHUB-GUIDE.md` | Against a **local** repository, not github.com |
| Real GitHub account, repository, sign-in, push | Yes (guide) | Needs your Windows test | `GITHUB-GUIDE.html` | Requires your account |
| Installing Git on Windows, Git Credential sign-in window | Yes (guide) | Needs your Windows test | | |
| **Part 11: Beginner startup** | | | | |
| `start.bat`: checks Node, version, double start, starts the site | Yes | Needs your Windows test | `start.bat` | CRLF line endings verified; the batch commands could not be run on Linux |
| `stop.bat` | Yes | Needs your Windows test | `stop.bat` | Uses the process ID file written by the server (the file creation was tested) |
| `reset-admin-password.bat` and its tool | Yes | Tested here (the Node tool) | `server/tools/reset-admin.js` | The `.bat` wrapper needs your Windows test |
| Browser opens automatically | Yes | Needs your Windows test | `server/server.js` | Windows-only code path |
| Friendly message if port in use | Yes | Tested here | `server.js` | |
| **Part 12: Responsive** | | | | |
| 320, 375, 414, 768, 1024, 1366, 1920 px | Yes | Tested here | | 84 combinations, no overflow; no tap target under 34 px |
| Admin tables as cards on phones | Yes | Tested here | `style.css` | Seen in screenshots |
| **Part 13: Performance** | | | | |
| Minimal dependencies, no background services | Yes | Tested here | `package.json` | Zero dependencies. Only timers: daily-backup check and session cleanup |
| Image optimisation | Yes | Tested here | `admin-products.js` | In-browser shrink |
| **Part 14–15: Documentation** | | | | |
| 12 numbered guides exist | Yes | Tested here | `documentation/` | File existence and all links/images checked automatically |
| Step format (what, why, where, type, command, expected, if it fails) | Yes | Tested here | | Checked by script for the install, start, admin and GitHub guides; other guides were written by hand and not checked line by line |
| **Part 16: Images** | | | | |
| Real screenshots of the website and admin, annotated | Yes | Tested here | `documentation/images/01`–`16` | Taken from the running project with sample data |
| Windows / CMD / Git / GitHub pictures | Partly | Not tested | `documentation/images/20`–`49` | **Illustrations, not real screenshots**; labelled in each picture. Git output text came from a real run. GitHub's real pages may look different |
| **Part 17–18: HTML guides** | | | | |
| `BEGINNER-GUIDE.html`, `GITHUB-GUIDE.html` | Yes | Tested here | `documentation/` | Open in Chromium at 375 and 1280 px |
| **Part 19: Troubleshooting** | | | | |
| 17 problems with PROBLEM→WHY→CHECK→FIX→EXPECTED | Yes | Not tested | `10-TROUBLESHOOTING.md` | Written from the code's real messages; the "node.exe copy" fallback and the Windows-specific fixes have not been tried |
| **Part 20: README** | | | | |
| Complete README | Yes | Tested here | `README.md` | Existence and links only |
| **Part 21–25: Final testing and ZIP** | | | | |
| Checklist for Windows tests | Yes | — | `12-FINAL-TESTING.md` | For you to complete |
| Final ZIP without `node_modules`, `.env`, databases, secrets | Yes | Tested here | `Sasi-Maligai-Final.zip` | Contents inspected after packaging |
| Mobile layout on real devices | — | Needs your Windows test | | Use the guide's browser-simulator steps or a real phone |
| Node.js 24 or newer | — | Not tested | | Tests ran on Node 22.22 only; the code uses stable features and the version check accepts 22.16+ |
| Firefox, Safari, old Edge | — | Not tested | | Only Chromium was used |

## Known limitations

1. No Windows testing of any `.bat` file, the Windows restart, or the Windows file-replacement during restore.
2. GitHub and Windows screens in the guides are illustrations.
3. `node:sqlite` is marked "experimental" by Node.js; the start-up warning is hidden. The risk is that a future Node release changes it. Pinning to the version you installed avoids surprises.
4. Product pictures are not inside the `.db` backup; copy the `uploads` folder too (documented). Old pictures are never auto-deleted.
5. Sessions are in memory, so restarting the website logs you out.
6. Only one admin role; no customer accounts, billing, credit or reports yet.
7. If the old version's `admin123` account existed, you must run `reset-admin-password.bat` once.
