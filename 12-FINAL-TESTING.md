# 12 — FINAL TESTING

This is the checklist for **your Windows laptop**. Tests marked **Tested here** were already run automatically by the developer in a Linux test environment (see [FINAL-AUDIT.md](FINAL-AUDIT.md) for the full honest list). Tests marked **Needs your Windows test** can only be done on Windows. Please do them once and tick them.

## Part A — the automatic self-test (2 minutes)

### STEP 1 — Run the self-test

**What / why:** the project has 95+ built-in checks (login, products, pictures, backup, restore, restarts, upgrade from the old version). It uses temporary folders and never touches your real data.

1. Open the project folder, click the address bar, type `cmd`, press Enter.
2. Type:

```
npm test
```

**Expected result:** many lines starting with `PASS`, and at the end `==== N passed, 0 failed ====`.

**If it fails:** if `npm` is not recognized, type `node --disable-warning=ExperimentalWarning server\tests\run-tests.js` instead. If any line says `FAIL`, take a photo of it and ask for help.

## Part B — Windows-only tests

| # | Test | How | Expected | Done |
|---|---|---|---|---|
| W1 | start.bat works | Double-click start.bat | Black window says "running"; browser opens by itself | [ ] |
| W2 | Pages open | Open Home, Products, About, Contact | All four show, menu works | [ ] |
| W3 | Admin setup and login | Create the admin account; log out; log in | Dashboard appears | [ ] |
| W4 | Add a product with a picture | Admin > Products > Add | It appears on the customer Products page with the picture | [ ] |
| W5 | Edit and delete a product | Change a price; delete a test product | Changes show; deleted one is gone | [ ] |
| W6 | Feedback | Contact page > send feedback; Admin > Feedback | Message with the correct local time | [ ] |
| W7 | Shop settings | Change phone and address; refresh the website | New values show | [ ] |
| W8 | Create backup | Admin > Backup & Restore > Create backup now | File in the list and in the backups folder | [ ] |
| W9 | Restart the website | stop.bat, then start.bat | The product you added is still there | [ ] |
| W10 | Restart Windows | Add a product "Restart Test". Restart Windows. start.bat | "Restart Test" is still there | [ ] |
| W11 | Restore | Create a backup. Change a product's price. Press Restore on the backup, confirm | Old price is back; you are logged out; a "before-restore" file exists | [ ] |
| W12 | stop.bat works | Double-click stop.bat while running | "The website has been stopped" and the website no longer opens | [ ] |
| W13 | Phone layout | Open the website on a phone (see 04-WEBSITE-GUIDE.md) or narrow the browser window | No sideways scrolling; menu button works | [ ] |
| W14 | Reset password tool | Double-click reset-admin-password.bat (website stopped) | You can log in with the new password | [ ] |

## Part C — GitHub tests

| # | Test | Command | Expected | Done |
|---|---|---|---|---|
| G1 | status | `git status` | No `.env` or `.db` listed | [ ] |
| G2 | add | `git add .` | No message | [ ] |
| G3 | commit | `git commit -m "First version"` | "files changed" | [ ] |
| G4 | push | `git push -u origin main` | `main -> main` | [ ] |
| G5 | verify | Open your repository in the browser | Files listed; **no** `.env`; **no** `.db`; **no** `backups` content | [ ] |
| G6 | ignore check | `git check-ignore -v .env` | Shows a `.gitignore` line | [ ] |

The developer ran this exact command sequence against a local test repository (see FINAL-AUDIT.md). Pushing to the real github.com needs your account, so it **Needs your Windows test**.

## Part D — responsive check (optional)

In Chrome or Edge press **F12**, click the phone/tablet icon, and try the widths 320, 375, 414, 768, 1024, 1366 and 1920. Nothing should need sideways scrolling.
