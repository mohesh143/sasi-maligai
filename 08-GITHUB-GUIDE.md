# 08 — GITHUB GUIDE (from zero)

**What is GitHub?** A free website that keeps an online copy of your project's *program files* and every earlier version. It is a safe place for the program. It is **not** where your shop runs, and it must **never** hold your shop data or secrets.

**What is Git?** A free program on your computer that sends your project to GitHub.

You will do these in order. Total time: about 30 minutes the first time.

> Prefer pictures? Open **GITHUB-GUIDE.html** in your browser.

### STEP 1 — Create a GitHub account

**What you are doing:** Making a free account on GitHub.

**Why you are doing it:** GitHub is a website that stores a copy of your project online, like a safe cupboard for your code. It also keeps every earlier version. It does NOT run your shop website.

**Where to click / what to do:**

1. Open github.com in your browser.
2. Click Sign up.
3. Type your email, a password and a username. Remember the username.
4. GitHub emails you a code - type it in.
5. Choose the Free plan.

**Expected result:** You are logged in to GitHub and see your dashboard.

**If it fails / how to fix it:** If the code email does not arrive, look in the Spam folder, or press 'Resend'.

![github signup](images/40-github-signup.png)

---

### STEP 2 — Create an empty repository

**What you are doing:** Making the online folder (called a repository) that will hold the project.

**Why you are doing it:** This is where the project will be uploaded.

**Where to click / what to do:**

1. On GitHub click the + at the top right, then New repository.
2. Repository name: type  sasi-maligai
3. Choose Private (only you can see it).
4. Do NOT tick 'Add a README', 'Add .gitignore' or 'license' - leave them empty.
5. Click Create repository.

**Expected result:** You see a page called 'Quick setup' with an address that ends in .git.

**If it fails / how to fix it:** If GitHub says the name already exists, use  sasi-maligai-shop  and use that name in the commands later.

![github new repo button](images/41-github-new-repo-button.png)

![github create repository form](images/42-github-create-repository-form.png)

![github empty repo url](images/43-github-empty-repo-url.png)

---

### STEP 3 — Install Git

**What you are doing:** Installing the free program Git on your computer.

**Why you are doing it:** Git is the tool that sends your project to GitHub. Without it the commands below do not work.

**Where to click / what to do:**

1. Open git-scm.com/download/win.
2. Download and open the installer.
3. Click Next on every screen (default choices are fine), then Install, then Finish.
4. Close any open black windows - you must open a new one after installing.

**Expected result:** Git is installed.

**If it fails / how to fix it:** If the installer asks for an administrator password, ask your IT person.

![git download](images/31-git-download.png)

---

### STEP 4 — Check that Git works

**What you are doing:** Asking Windows if Git is available.

**Why you are doing it:** Confirms the installation before you continue.

**Where to click / what to do:**

1. Click Start, type cmd, press Enter (a NEW black window).
2. Type the command and press Enter.

**What to type (exact command):**

```
git --version
```

**Expected result:** A line like  git version 2.47.0.windows.1  appears (your number will differ).

**If it fails / how to fix it:** 'git is not recognized' - you did not open a NEW black window after installing, or the installation failed. Close all black windows, open a new one, try again; if it still fails restart the computer.

![git version cmd](images/32-git-version-cmd.png)

---

### STEP 5 — Open the Command Prompt inside your project folder

**What you are doing:** Opening a black window that is already 'standing' in the project folder.

**Why you are doing it:** Git commands act on the folder where the black window is. In the wrong folder they do nothing useful.

**Where to click / what to do:**

1. Open File Explorer and open the sasi-maligai folder (the one containing start.bat).
2. Click once in the address bar at the top (the box showing the folder path).
3. Type  cmd  and press Enter.

**Expected result:** A black window opens and the line before the cursor ends with \sasi-maligai>

**If it fails / how to fix it:** If the line ends with something else (for example C:\Users\YourName>) you are in the wrong folder. Close the window and repeat. Or type: cd Desktop\sasi-maligai

![open cmd in folder](images/24-open-cmd-in-folder.png)

---

### STEP 6 — Tell Git who you are (only once)

**What you are doing:** Giving Git your name and email.

**Why you are doing it:** Git stamps every saved snapshot with this. It is not a login and it is not sent anywhere secret.

**Where to click / what to do:**

1. Type each command, replacing the text inside the quotation marks with your own name and email, and press Enter after each.

**What to type (exact command):**

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**Expected result:** No message appears. That is normal.

---

### STEP 7 — git init - start tracking the project

**What you are doing:** Creating a hidden .git folder where Git remembers your project's history.

**Why you are doing it:** This turns the normal folder into a Git project.

**Where to click / what to do:**

1. Type the command and press Enter.

**What to type (exact command):**

```
git init
```

**Expected result:** Initialized empty Git repository in ...\sasi-maligai\.git/

**If it fails / how to fix it:** 'Reinitialized existing Git repository' is also fine.

![git init](images/33-git-init.png)

---

### STEP 8 — git add - choose the files to include

**What you are doing:** Telling Git to include every file EXCEPT those blocked by the .gitignore file.

**Why you are doing it:** The .gitignore file protects your secrets: .env, your database, backups, pictures and node_modules are skipped automatically.

**Where to click / what to do:**

1. Type the command (note the dot after add) and press Enter.

**What to type (exact command):**

```
git add .
```

**Expected result:** No message. That is normal.

**If it fails / how to fix it:** If you see 'fatal: not a git repository', you skipped git init or you are in the wrong folder.

![git add commit](images/34-git-add-commit.png)

---

### STEP 9 — Check the protection before uploading (important)

**What you are doing:** Looking at what Git will send, and confirming secrets are NOT included.

**Why you are doing it:** Once something private is on GitHub it is hard to remove. A 10-second check avoids that.

**Where to click / what to do:**

1. Type the first command. Read the list. It must NOT show .env, anything ending in .db, or node_modules.
2. Type the second command. You should see a line mentioning .gitignore - that means .env is protected.
3. (If you have no .env file, the second command prints nothing. That is fine.)

**What to type (exact command):**

```
git status
git check-ignore -v .env data/sasi-maligai.db
```

**Expected result:** No .env and no .db files in the list.

**If it fails / how to fix it:** If a private file is listed, STOP. Do not commit. Ask for help and send the output of git status.

![git status clean](images/36-git-status-clean.png)

![private files never upload](images/47-private-files-never-upload.png)

---

### STEP 10 — git commit - save a snapshot

**What you are doing:** Saving a labelled snapshot of the project on YOUR computer.

**Why you are doing it:** A commit is like pressing 'Save' with a note about what changed.

**Where to click / what to do:**

1. Type the command and press Enter. The text in quotes is your note - you can change it.

**What to type (exact command):**

```
git commit -m "First version of Sasi Maligai website"
```

**Expected result:** Lines such as  [main (root-commit) c5392e1] First version...  and 'files changed'.

**If it fails / how to fix it:** 'Please tell me who you are' - do the 'Tell Git who you are' step first, then repeat.

![git add commit](images/34-git-add-commit.png)

---

### STEP 11 — git branch - name the main line

**What you are doing:** Making sure the main line of your project is called main.

**Why you are doing it:** GitHub expects the name main.

**Where to click / what to do:**

1. Type the command and press Enter.

**What to type (exact command):**

```
git branch -M main
```

**Expected result:** No message.

---

### STEP 12 — git remote - connect to your GitHub repository

**What you are doing:** Telling Git the online address of your repository.

**Why you are doing it:** Git needs to know where to send the project.

**Where to click / what to do:**

1. Go back to your GitHub 'Quick setup' page and click the copy button next to the address that ends in .git.
2. In the black window type the command below, but replace the address with YOUR address (right-click pastes in the black window).

**What to type (exact command):**

```
git remote add origin https://github.com/YOUR-NAME/sasi-maligai.git
```

**Expected result:** No message.

**If it fails / how to fix it:** 'remote origin already exists' - run  git remote set-url origin https://github.com/YOUR-NAME/sasi-maligai.git  with your address.

![github empty repo url](images/43-github-empty-repo-url.png)

![git branch remote push](images/35-git-branch-remote-push.png)

---

### STEP 13 — git push - upload to GitHub

**What you are doing:** Sending the project to GitHub.

**Why you are doing it:** This is the actual upload.

**Where to click / what to do:**

1. Type the command and press Enter.
2. The first time, a small window asks you to sign in. Choose Sign in with your browser, log in to GitHub and press Authorize.
3. Wait until the black window shows the prompt again.

**What to type (exact command):**

```
git push -u origin main
```

**Expected result:** Lines ending with  * [new branch]  main -> main  and  branch 'main' set up to track 'origin/main'.

**If it fails / how to fix it:** 'rejected' / 'fetch first' - the repository was created with a README. Run: git pull origin main --allow-unrelated-histories --no-edit   then   git push. 'Authentication failed' - sign in again (the small window) or check you used YOUR username in the address.

![github sign in popup](images/44-github-sign-in-popup.png)

![git branch remote push](images/35-git-branch-remote-push.png)

![git push rejected](images/39-git-push-rejected.png)

---

### STEP 14 — Verify on GitHub

**What you are doing:** Looking at the repository online.

**Why you are doing it:** Proof that the upload worked and nothing private is there.

**Where to click / what to do:**

1. Open github.com/YOUR-NAME/sasi-maligai in the browser and press F5.
2. Check the file list: you must see client, server, documentation, start.bat, README.md ...
3. You must NOT see a file named .env or any .db file.

**Expected result:** Your files are listed and README.md is shown below them.

**If it fails / how to fix it:** Empty repository? The push did not finish - repeat the push step and read the black window.

![github after push](images/45-github-after-push.png)

---

### STEP 15 — Upload future changes (the 3-command routine)

**What you are doing:** Sending later changes to GitHub.

**Why you are doing it:** After you change something (for example a page), GitHub should get the new version.

**Where to click / what to do:**

1. Open a black window in the project folder (see the 'Open the Command Prompt' step).
2. Type the three commands one by one, pressing Enter after each.

**What to type (exact command):**

```
git add .
git commit -m "Describe what you changed"
git push
```

**Expected result:** The push shows  main -> main.

**If it fails / how to fix it:** 'nothing to commit' - you changed nothing since the last upload.

![git update](images/37-git-update.png)

![github flow diagram](images/48-github-flow-diagram.png)

---

### STEP 16 — Download the project again (new computer or after a problem)

**What you are doing:** Getting your project back from GitHub.

**Why you are doing it:** If the computer breaks, GitHub still has your program files.

**Where to click / what to do:**

1. Easiest: on your repository page click the green Code button, then Download ZIP. Extract it as in the Installation guide.
2. Or, with Git: open a black window on the Desktop and use the clone command below.

**What to type (exact command):**

```
git clone https://github.com/YOUR-NAME/sasi-maligai.git
```

**Expected result:** A folder called sasi-maligai appears. Double-click start.bat inside.

**If it fails / how to fix it:** Remember: GitHub does NOT contain your shop data (products, feedback, pictures, backups). Bring those from your USB backup: copy the .db backup into the new folder's backups folder, start the website, create the admin account, then use Backup & Restore.

![github download zip](images/46-github-download-zip.png)

![git clone](images/38-git-clone.png)

---

### STEP 17 — Protect your private files

**What you are doing:** Understanding what must never be uploaded.

**Why you are doing it:** A public or leaked database would expose customer names and feedback.

**Where to click / what to do:**

1. Keep the repository Private.
2. Never rename or delete the .gitignore file.
3. Never use  git add -f  (it forces ignored files in).
4. Never type your admin password, or your GitHub password, inside project files.
5. If you ever uploaded a private file by mistake: make the repository Private immediately, change your admin password, and ask for help to remove it from history.

**Expected result:** Your secrets stay on your computer.

![private files never upload](images/47-private-files-never-upload.png)

---

## What each command means (in simple words)

| Command | Meaning |
|---|---|
| `git --version` | Shows which version of Git is installed. Used only to check that Git works. |
| `git config --global user.name / user.email` | Tells Git your name and email for the labels on your snapshots. Only once. |
| `git init` | Turns this folder into a Git project (creates the hidden .git folder). |
| `git add .` | Picks all changed files for the next snapshot. The dot means 'everything here'. Files listed in .gitignore are skipped. |
| `git status` | Shows what has changed and what is waiting to be saved. Safe to run any time. |
| `git commit -m "note"` | Saves the snapshot on your own computer, with your note. |
| `git branch -M main` | Names the main line of the project 'main'. |
| `git remote add origin ADDRESS` | Saves the GitHub address under the nickname 'origin'. |
| `git push -u origin main` | Sends your snapshots to GitHub. -u remembers the connection, so later you only type git push. |
| `git push` | Sends new snapshots to GitHub (after the first time). |
| `git clone ADDRESS` | Downloads a full copy of the project from GitHub. |

## Everything in one place (copy later, one line at a time)

```
git init
git config user.name "Your Name"
git config user.email "you@example.com"
git add .
git status
git commit -m "First version of Sasi Maligai website"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/sasi-maligai.git
git push -u origin main
```

Replace `YOUR-NAME` with your GitHub username. Press **Enter** after each line.


[Back to START HERE](01-START-HERE.md)
