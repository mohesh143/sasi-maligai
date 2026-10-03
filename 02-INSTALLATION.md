# 02 — INSTALLATION

You need to do this **only once**. It takes about 10 minutes.

> **Good news:** this project needs **only Node.js**. You do **not** run `npm install`, and nothing else is downloaded.
> Node.js must be **version 22.16 or newer** (the current "LTS" download is fine).

### STEP 1 — Check whether Node.js is already installed

**What you are doing:** Asking Windows if the program called Node.js is on this computer. Node.js is the engine that runs the website.

**Why you are doing it:** If it is already installed (version 22.16 or higher) you can skip the download.

**Where to click / what to do:**

1. Click the Windows Start button (bottom-left).
2. Type: cmd
3. Press Enter. A black window opens - this is the Command Prompt.
4. Type the command below and press Enter.

**What to type (exact command):**

```
node --version
```

**Expected result:** A number such as v24.11.0 appears. If the first number is 22.16 or higher, skip to STEP 3.

**If it fails / how to fix it:** If you see 'node is not recognized...' it is simply not installed yet - continue with STEP 2. If the number is lower than 22.16, do STEP 2 too (it upgrades).

![node version cmd](images/23-node-version-cmd.png)

---

### STEP 2 — Install Node.js (free)

**What you are doing:** Downloading and installing Node.js from its official website.

**Why you are doing it:** The website needs Node.js to run. It is free and safe. You do NOT need to run 'npm install' for this project - nothing else must be downloaded.

**Where to click / what to do:**

1. Open your browser and go to nodejs.org
2. Click the big green button that says LTS (Long Term Support).
3. Open the downloaded file (it ends with .msi).
4. Click Next on every screen. Keep all the default choices. Click Install, then Finish.
5. Restart the computer (this lets Windows notice the new program).

**Expected result:** After restarting, repeat STEP 1: `node --version` now shows a number.

**If it fails / how to fix it:** If the installer says you need an administrator password, or the computer blocks installing programs (common on government laptops), ask the person who manages the laptop to install it. See 10-TROUBLESHOOTING.md, problem 1 for an advanced fallback.

![node download](images/22-node-download.png)

---

### STEP 3 — Unzip the project to your Desktop

**What you are doing:** Extracting the ZIP file so that Windows can use the files inside.

**Why you are doing it:** You cannot run a website from inside a ZIP file - it must be unzipped into a normal folder.

**Where to click / what to do:**

1. Find the file Sasi-Maligai-Final.zip (probably in Downloads).
2. Right-click it and choose Extract All...
3. Choose the Desktop as the destination, then press Extract.
4. Open the new folder. Inside you must see start.bat, a folder called client and a folder called server.

**Expected result:** You can see start.bat directly inside the folder you opened.

**If it fails / how to fix it:** If you only see ANOTHER folder (for example sasi-maligai inside sasi-maligai), open that inner folder - it is the real one.

![open folder](images/20-open-folder.png)

---


[Back to START HERE](01-START-HERE.md)
