# Sasi Maligai — Grocery Shop Website

A simple, fast website and admin panel for the **Sasi Maligai** grocery shop. Built to run on a low-power Windows laptop with **only Node.js installed** — no `npm install`, no cloud services, no heavy libraries.

> Beginner? Open **documentation/01-START-HERE.md** (or double-click **documentation/BEGINNER-GUIDE.html**).

## Features

**Customers** (no account needed)
* Home page with shop introduction, categories, products available today, address, opening hours, phone, WhatsApp button and Google Maps button (buttons appear only when set)
* Products page: search, category filter, availability filter, price, unit, picture, description
* Contact page with map and a feedback form (name, 1–5 stars, message)
* Works on phones, tablets, laptops and desktops (checked from 320 px to 1920 px wide)

**Admin**
* Secure login and logout, change password, dashboard with reminders
* Products: add, edit, delete, availability switch, picture upload (large photos are shrunk automatically)
* Category management, feedback management
* **Shop settings** (name, phone, WhatsApp, email, address, hours, Google Maps, texts) — no code editing
* **Backup & Restore** with validation, automatic safety copies and a confirmation box
* Works on mobile

**Safety**
* The database is **never** dropped, reset or recreated at start-up
* Safe, recorded, transaction-based upgrades (`server/database/migrations.js`) with an automatic backup before an upgrade
* Automatic daily backup (newest 14 kept); manual backups are never deleted

## Requirements

* Windows 10 or 11 (also works on macOS/Linux)
* **Node.js 22.16 or newer** (free, the "LTS" version from https://nodejs.org)
* A web browser (Chrome or Edge)

Nothing else. The project has **zero npm dependencies**: it uses the SQLite database built into Node.js.

## Installation

1. Install Node.js (see `documentation/02-INSTALLATION.md`).
2. Unzip the project to a folder, for example the Desktop.

## Start

Double-click **`start.bat`**. A black window opens and your browser opens at **http://localhost:3000**.

| What | Address |
|---|---|
| Website | http://localhost:3000 |
| Admin | http://localhost:3000/admin/login.html |

The black window **is** the website: keep it open.

## Stop and restart

* Close the black window, or double-click **`stop.bat`**, or press CTRL+C in the window.
* Start again with `start.bat`. All your data is still there.

## Admin access setup

There is **no default password**. The first time you open the admin page it asks you to create your username and password (only possible on the shop computer itself). Forgot it? Stop the website and double-click **`reset-admin-password.bat`**.

## Where is my data?

| What | Location |
|---|---|
| Database | `data/sasi-maligai.db` |
| Backups | `backups/` (files like `sasi-maligai-backup-2026-10-02-143000.db`) |
| Product pictures | `uploads/products/` |
| Optional technical settings | `.env` (copy of `.env.example`; not needed normally) |

## Backup and restore

* **Admin > Backup & Restore > Create backup now**
* Copy the `backups` and `uploads` folders to a USB drive every week.
* **Restore:** press Restore, read the confirmation box, press *Yes*. The backup is checked first, a safety copy of the current data is made automatically, and nothing is changed if anything looks wrong. No restart needed.
* Details: `documentation/07-BACKUP-RESTORE.md`

## Self-test

```
npm test
```

Runs 95+ automatic checks in temporary folders (login, products, pictures, backup/restore, restarts, upgrade from the old version). It never touches your real data.

## GitHub

Step-by-step from zero: `documentation/08-GITHUB-GUIDE.md` and `documentation/GITHUB-GUIDE.html`. The short version, in the project folder:

```
git init
git add .
git commit -m "First version of Sasi Maligai website"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/sasi-maligai.git
git push -u origin main
```

`.gitignore` keeps `.env`, `data/`, `backups/`, `uploads/products/*`, `*.db`, `node_modules/`, logs and ZIP files off GitHub. Keep the repository **Private**.

## Security

Scrypt-hashed passwords, random server-side sessions in HttpOnly SameSite=Strict cookies, login rate limit, protected admin API, server-side validation, safe image uploads (content checked, 2 MB limit), Content-Security-Policy, local-only by default. See `documentation/11-SECURITY.md`.

## Troubleshooting

See `documentation/10-TROUBLESHOOTING.md` (17 common problems, each with why / how to check / fix / expected result).

## Project layout

```
sasi-maligai/
├── client/           pages, css/style.css, js/, admin/
├── server/           server.js, config.js, lib/, routes/, middleware/, database/, tools/, tests/
├── data/             live database (private, not in Git)
├── backups/          backups (private, not in Git)
├── uploads/products/ pictures (private, not in Git)
├── documentation/    guides, images, FINAL-AUDIT.md
├── start.bat  stop.bat  reset-admin-password.bat
├── package.json  README.md  .gitignore  .gitattributes  .env.example
```

## Future development

The foundation is ready for more features without rebuilding:

* **Add a table:** append a new numbered entry at the end of `MIGRATIONS` in `server/database/migrations.js`. It runs once, safely, after an automatic backup.
* **Add an API:** create a file in `server/routes/` and `require` it in `server/server.js`.
* Planned ideas: customer accounts, purchase history, customer-specific prices, billing/POS, credit (Kada) and payments, suppliers, expenses, inventory, sales reports.
* **Customer data must stay private:** one customer must never see another's bills, credit, payments or personal data. The rules to follow are in `documentation/11-SECURITY.md` (every customer query filtered by the logged-in customer's id taken from the session, separate customer/admin sessions, a test for every customer route).
