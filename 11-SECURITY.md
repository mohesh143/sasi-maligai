# 11 — SECURITY

## What the website already does for you

| Protection | How |
|---|---|
| Passwords | Stored only as a salted **scrypt hash**. Nobody (including this program) can read your password |
| No default password | You choose your own when you first open the admin page; it can only be created from the shop computer |
| Login sessions | A random 256-bit session ID in an HttpOnly, SameSite=Strict cookie; sessions end after 8 hours without use, and when the website restarts |
| Wrong-password limit | 5 wrong tries lock the login for 5 minutes |
| Protected admin | Every admin function checks your login on the server (tested for all of them) |
| Cross-site protection | Requests from other websites are refused |
| Input checks | Every form is checked on the server (length, number, type). Text is shown safely, so typed HTML cannot run |
| Safe uploads | Only real JPG/PNG/WEBP pictures up to 2 MB; random file names; the file type is checked by content, not by name |
| Database safety | Never dropped or reset; upgrades are recorded, run in transactions, and preceded by an automatic backup |
| Local only by default | Only this computer can open the website unless you change `HOST` |
| Security headers | Content-Security-Policy (no outside scripts), no framing, no content sniffing |

## What YOU must do

1. Choose a **strong password** (8+ characters, not your phone number) and keep it on paper.
2. Make **backups** and keep a copy on **USB**.
3. Keep the GitHub repository **Private**.
4. **Never** upload `.env`, `data`, `backups` or `uploads` (the `.gitignore` file prevents it - do not delete that file).
5. Do not leave the admin page open on a shared computer. Press **Log out**.
6. Keep Windows and your browser updated.

## GitHub safety

`.gitignore` blocks: `.env` and `.env.*`, `node_modules`, the `data` folder, the `backups` folder, `uploads/products/*`, every `*.db`/`*.sqlite` file, logs, temporary files and ZIP files. Only the empty placeholder files `data/.gitkeep`, `backups/.gitkeep` and `uploads/products/.gitkeep` are uploaded, so the folders exist after a download.

Before every first upload run `git status` and read the list (see 08-GITHUB-GUIDE.md).

## Design rules for FUTURE features (customer accounts, bills, credit/Kada...)

This version has **no customer accounts**. When you add them later, these rules keep one customer's information away from another's. They are written here so future work follows them:

1. **Every customer-owned table has a `customer_id` column** (bills, credit/Kada entries, payments, purchase history, addresses).
2. **Every customer query must include `WHERE customer_id = <the logged-in customer's id>`**, with the id taken from the **session**, never from the browser's request. A customer must never be able to type another customer's id.
3. **Customers and the shop admin use separate login sessions and separate route groups** (for example `/api/customer/...` and `/api/admin/...`). Customer routes use a `requireCustomer` check that sets `ctx.customerId`; admin routes keep `requireAdmin`.
4. **Customer-specific prices** live in their own table keyed by `customer_id`; the public product list never exposes them.
5. **Add a test for every customer route**: log in as customer A, request customer B's data directly, and expect a refusal (404/403).
6. **Add new tables only through a new numbered migration** in `server/database/migrations.js` (append at the end, never edit an old one). It runs once, in a transaction, after an automatic backup.
7. Passwords for customers use the same `hashPassword`/`verifyPassword` functions as the admin.
8. Never put customer personal data in the public config or in logs.

## If you think someone knows your password

1. Log in and change it: **Account > Change password**.
2. Restart the website (this logs everyone out).
3. If you cannot log in: stop.bat, then reset-admin-password.bat.
