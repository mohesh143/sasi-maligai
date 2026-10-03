# 07 — BACKUP & RESTORE

> **The rule of this website:** it never deletes, resets or recreates your database on its own. Not at start-up, not after a restart, not after an update. A restore only happens when **you** press the button and confirm, and the current data is saved first.

## What is in a backup?

Products, categories, shop settings, feedback and the admin login. **Product pictures** are separate files in the **uploads** folder, so copy that folder too.

## Where are the files?

| What | Folder (inside sasi-maligai) |
|---|---|
| Live database | `data\sasi-maligai.db` (do not touch while the website runs) |
| Backups | `backups\` |
| Pictures | `uploads\products\` |

### STEP 1 — Create a backup

**What you are doing:** Making a copy of all your shop data.

**Why you are doing it:** You can return to it if something goes wrong.

**Where to click / what to do:**

1. Admin > Backup & Restore.
2. Press Create backup now.

**Expected result:** A new line named sasi-maligai-backup-YYYY-MM-DD-HHMMSS.db appears. The file is in the backups folder.

**If it fails / how to fix it:** Red message: check that the disk is not full.

![admin backup](images/12-admin-backup.png)

---

### STEP 2 — Know the different backup types

**What you are doing:** Understanding the list.

**Why you are doing it:** So you recognise what each file is.

**Where to click / what to do:**

1. Manual backup - made by you with the button. Never deleted by the website.
2. Automatic (daily) - the website makes one each day it runs. The newest 14 are kept.
3. Safety copy (before a restore / before an update / before removing demo items) - made automatically. The newest 10 of each kind are kept.

**Expected result:** You can tell which backup to choose.

---

### STEP 3 — Copy backups to a USB drive

**What you are doing:** Keeping a copy outside the computer.

**Why you are doing it:** A backup on the same computer does not protect you from a broken or stolen computer.

**Where to click / what to do:**

1. Plug in a USB drive.
2. Open the sasi-maligai folder.
3. Right-click the backups folder > Copy. Paste it on the USB drive.
4. Also copy the uploads folder (product pictures).
5. Do this at least once a week.

**Expected result:** The USB drive contains backups and uploads.

![usb copy backups](images/30-usb-copy-backups.png)

---

### STEP 4 — Download a backup to another place

**What you are doing:** Saving one backup through the browser.

**Why you are doing it:** Useful if you are using the admin page from a different computer.

**Where to click / what to do:**

1. Press Download next to a backup.

**Expected result:** The .db file is saved in your Downloads folder.

![admin backup](images/12-admin-backup.png)

---

### STEP 5 — Restore a backup

**What you are doing:** Going back to an earlier state.

**Why you are doing it:** To undo mistakes or recover after a computer problem.

**Where to click / what to do:**

1. Admin > Backup & Restore. Press Restore on the backup you want.
2. READ the box. It shows how many products and feedback messages the backup contains and how many you have now.
3. If wrong, press Cancel - nothing happens.
4. If right, press Yes, restore this backup.
5. Wait for the green message. Then press Go to login page and log in again.

**Expected result:** The old data is back. The message names the safety copy of your previous data (sasi-maligai-before-restore-....db). No restart is needed.

**If it fails / how to fix it:** 'This backup cannot be used...' - the file is damaged or is not a Sasi Maligai backup. NOTHING was changed. 'Restore failed' - your original data was put back automatically.

![admin restore confirm](images/13-admin-restore-confirm.png)

![backup restore flow](images/49-backup-restore-flow.png)

---

### STEP 6 — Restore from a backup on your USB drive

**What you are doing:** Using a backup that is not yet in the list.

**Why you are doing it:** For a new computer or after reinstalling.

**Where to click / what to do:**

1. Start the website (start.bat) and create the admin account if asked.
2. Copy the .db backup file from the USB drive into the project's backups folder (the file name must end in .db).
3. Admin > Backup & Restore. The file appears in the list - press Restore and confirm.
4. Also copy your uploads folder from the USB drive into the project's uploads folder so pictures show.

**Expected result:** Your shop data is back. Log in with the password that was valid when that backup was made.

**If it fails / how to fix it:** The file does not appear? Press F5, and check it is inside backups (not in a sub-folder) and ends with .db.

![usb copy backups](images/30-usb-copy-backups.png)

---

### STEP 7 — Undo a restore

**What you are doing:** Changing your mind.

**Why you are doing it:** A restore is itself reversible.

**Where to click / what to do:**

1. Admin > Backup & Restore.
2. Restore the file named sasi-maligai-before-restore-....db (the safety copy made just before).

**Expected result:** You are back where you were before the first restore.

---

## Manual copy while the website is stopped (extra safety)

1. Stop the website (stop.bat).
2. Copy the whole **data** folder, the **backups** folder and the **uploads** folder to the USB drive.
3. Start the website again.

Do not copy the data folder while the website is running (a half-written copy may result). Use **Create backup now** instead; it is safe at any time.

## Recommended routine

| When | What |
|---|---|
| Every day | Nothing - an automatic backup is made |
| Every week | Create backup now, copy **backups** and **uploads** to USB |
| Before big changes | Create backup now |


[Back to START HERE](01-START-HERE.md)
