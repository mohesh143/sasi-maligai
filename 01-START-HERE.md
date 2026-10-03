# 01 — START HERE

Welcome! This is the website for **Sasi Maligai**. It shows your products to customers, and lets **you** manage everything from a private admin page.

You do not need to know programming. Every guide below tells you exactly what to click and what to type, and what you should see.

## What you have

| Part | What it does |
|---|---|
| Customer website | Home, Products (search and filter), About, Contact and a feedback form |
| Admin panel | Login, products, pictures, categories, feedback, shop settings, backup and restore |
| `start.bat` | Double-click it to start the website |
| `stop.bat` | Double-click it to stop the website |
| `reset-admin-password.bat` | Use it if you forget the admin password |

**No downloads are needed except Node.js.** The project has no extra packages, so you never run `npm install`.

## Read the guides in this order

| # | Guide | When |
|---|---|---|
| 1 | [02-INSTALLATION.md](02-INSTALLATION.md) | Once: install Node.js and unzip the project |
| 2 | [03-FIRST-START.md](03-FIRST-START.md) | Once: start the website and create your admin account |
| 3 | [04-WEBSITE-GUIDE.md](04-WEBSITE-GUIDE.md) | What your customers see |
| 4 | [05-ADMIN-GUIDE.md](05-ADMIN-GUIDE.md) | Daily use of the admin panel and shop settings |
| 5 | [06-PRODUCT-GUIDE.md](06-PRODUCT-GUIDE.md) | Adding and changing products |
| 6 | [07-BACKUP-RESTORE.md](07-BACKUP-RESTORE.md) | **Read this early. Protects your data.** |
| 7 | [08-GITHUB-GUIDE.md](08-GITHUB-GUIDE.md) | Keep a copy of the program on GitHub |
| 8 | [09-UPDATE-GUIDE.md](09-UPDATE-GUIDE.md) | Updating the website safely |
| 9 | [10-TROUBLESHOOTING.md](10-TROUBLESHOOTING.md) | When something goes wrong |
| 10 | [11-SECURITY.md](11-SECURITY.md) | How your shop data is protected |
| 11 | [12-FINAL-TESTING.md](12-FINAL-TESTING.md) | Tests to run on your Windows laptop |

Prefer pictures? Open **BEGINNER-GUIDE.html** and **GITHUB-GUIDE.html** (double-click them; they open in your browser).

## The 5 things to remember

1. The black window **is** the website. Keep it open while the website is in use.
2. Open the website at **http://localhost:3000** and the admin at **http://localhost:3000/admin/login.html**.
3. Your shop data lives in the **data** folder. It is never reset when the website starts.
4. Make a **backup** (Admin > Backup & Restore) and copy the **backups** and **uploads** folders to a USB drive every week.
5. Never upload the **.env** file, the **data** folder or the **backups** folder to GitHub (the `.gitignore` file already prevents it).

## A note about the pictures in these guides

Pictures of the website and the admin panel are **real screenshots** of this project (with sample products). Pictures of Windows folders, the black window, Git and GitHub are **illustrations** (they say so in the corner), because those screens are on your computer and on GitHub's website. GitHub may change its design; the words stay the same.
