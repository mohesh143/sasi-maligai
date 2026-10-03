# 09 — UPDATE GUIDE

How to put a newer version of the website on your computer **without losing any shop data**.

The golden rule: **never replace the `data`, `backups` or `uploads` folders, or your `.env` file.**

### STEP 1 — Make a backup first

**What you are doing:** Saving your data before touching anything.

**Why you are doing it:** Updating is safe, but a backup is free insurance.

**Where to click / what to do:**

1. Admin > Backup & Restore > Create backup now.
2. Copy the backups folder to a USB drive.

**Expected result:** A fresh backup exists on the computer and on the USB drive.

![admin backup](images/12-admin-backup.png)

---

### STEP 2 — Stop the website

**What you are doing:** Switching it off.

**Why you are doing it:** Files cannot be replaced safely while it runs.

**Where to click / what to do:**

1. Double-click stop.bat (or close the black window).

**Expected result:** The black window is gone.

![stop bat](images/27-stop-bat.png)

---

### STEP 3 — Replace only the program files

**What you are doing:** Copying the new version over the old one.

**Why you are doing it:** Your shop data lives in separate folders that must NOT be replaced.

**Where to click / what to do:**

1. Unzip the new version into a temporary folder.
2. Copy these from the new version into your sasi-maligai folder, choosing Replace: client, server, documentation, start.bat, stop.bat, reset-admin-password.bat, package.json, README.md, .gitignore, .gitattributes, .env.example.
3. NEVER replace or delete: data, backups, uploads, and your .env file (if you made one).

**Expected result:** Your data, backups and pictures folders are untouched.

**If it fails / how to fix it:** If you replaced the data folder by mistake, restore your latest backup.

![folder structure](images/21-folder-structure.png)

---

### STEP 4 — Start the website and check

**What you are doing:** Letting the safe database upgrade run.

**Why you are doing it:** If the new version needs new tables, it adds them without touching your data and saves a 'before-update' backup first.

**Where to click / what to do:**

1. Double-click start.bat.
2. Read the black window: lines like '[database] Applied update 3' are normal.
3. Open the website and the admin panel. Check your products and settings.

**Expected result:** Everything is as before, plus the new features.

**If it fails / how to fix it:** Something wrong? Stop the website, copy the backup into backups and use Restore.

![start bat running](images/25-start-bat-running.png)

---

### STEP 5 — Update with GitHub instead (if you cloned the project)

**What you are doing:** Using Git to get the new program files.

**Why you are doing it:** It replaces program files only; ignored folders (data, backups, uploads) are left alone.

**Where to click / what to do:**

1. Stop the website.
2. Open a black window in the project folder.
3. Type the command below and press Enter.
4. Start the website again.

**What to type (exact command):**

```
git pull
```

**Expected result:** Lines listing changed files, then 'Already up to date' next time.

**If it fails / how to fix it:** 'Your local changes would be overwritten' - ask for help, or commit your changes first (git add . and git commit).

![git clone](images/38-git-clone.png)

---


[Back to START HERE](01-START-HERE.md)
