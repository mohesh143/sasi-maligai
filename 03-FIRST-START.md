# 03 — FIRST START

You will start the website, open it, and create your admin account.

### STEP 1 — Start the website

**What you are doing:** Double-clicking start.bat. It checks that Node.js is installed and then starts the website.

**Why you are doing it:** start.bat does everything for you, so you never type commands to run the shop website.

**Where to click / what to do:**

1. Open the sasi-maligai folder.
2. Double-click start.bat.
3. If a blue 'Windows protected your PC' box appears, click More info, then Run anyway (it is your own file).

**Expected result:** A black window opens and shows 'Sasi Maligai website is running!' and your browser opens by itself.

**If it fails / how to fix it:** If the black window closes at once, or shows a message about Node.js, see 10-TROUBLESHOOTING.md (problems 1, 4, 13).

![start bat running](images/25-start-bat-running.png)

---

### STEP 2 — Understand the black window

**What you are doing:** Reading what the black Command Prompt window is telling you.

**Why you are doing it:** That window IS the website server. If you close it, the website stops. Many beginners close it by accident.

**Where to click / what to do:**

1. Lines starting with [database] are normal start-up messages.
2. 'Website : http://localhost:3000' is the address of the customer website.
3. 'Admin : http://localhost:3000/admin/login.html' is the address of your admin panel.
4. Leave the window open (you may minimise it with the _ button).

**Expected result:** The window stays open, with no red error messages.

**If it fails / how to fix it:** A message such as 'Port 3000 is already in use' means the website is already running (see STEP 7 and problem 4).

![port in use](images/28-port-in-use.png)

---

### STEP 3 — Open the website in your browser

**What you are doing:** Looking at the customer website.

**Why you are doing it:** This confirms everything works.

**Where to click / what to do:**

1. Your browser should have opened by itself. If not, open Chrome or Edge.
2. Click the address bar at the top, type the address below and press Enter.

**What to type (exact command):**

```
http://localhost:3000
```

**Expected result:** The Sasi Maligai home page appears with category tiles and sample products.

**If it fails / how to fix it:** If you see 'This site can't be reached', the black window is closed - do STEP 1 again.

![browser localhost](images/26-browser-localhost.png)

---

### STEP 4 — Create your admin account (first time only)

**What you are doing:** Choosing the username and password that protect your admin panel.

**Why you are doing it:** Only you should be able to change prices and products. There is NO default password - you choose your own.

**Where to click / what to do:**

1. In the browser address bar type the admin address below and press Enter.
2. You see 'Create your admin account'.
3. Type a username (letters and numbers, for example: owner).
4. Type a strong password of at least 8 characters, then type it again.
5. Press Create account.
6. WRITE THE PASSWORD ON PAPER and keep it somewhere safe.

**What to type (exact command):**

```
http://localhost:3000/admin/login.html
```

**Expected result:** You land on the Dashboard.

**If it fails / how to fix it:** 'The two passwords are not the same' - type them again carefully. 'The admin account can only be created from the shop computer' - you must do this step on the computer that runs the website, not on a phone.

![admin first setup](images/04-admin-first-setup.png)

![admin dashboard](images/06-admin-dashboard.png)

---

### STEP 5 — Log in again later

**What you are doing:** Using your username and password on later days.

**Why you are doing it:** The login lasts 8 hours of inactivity; restarting the website also logs you out. This is normal and safe.

**Where to click / what to do:**

1. Go to the admin address (below).
2. Type your username and password.
3. Press Log in.

**What to type (exact command):**

```
http://localhost:3000/admin/login.html
```

**Expected result:** The Dashboard appears.

**If it fails / how to fix it:** After 5 wrong passwords the login waits 5 minutes. If you forgot the password, double-click reset-admin-password.bat (see 10-TROUBLESHOOTING.md, problem 7).

![admin login](images/05-admin-login.png)

---

### STEP 6 — Stop the website

**What you are doing:** Switching the website off properly.

**Why you are doing it:** Stopping lets the computer rest. Your shop data stays safe on disk.

**Where to click / what to do:**

1. Easiest: click the X of the black window.
2. Or: double-click stop.bat in the project folder.
3. Or: click inside the black window and press CTRL+C.

**Expected result:** The website no longer opens in the browser. Your data is not lost.

**If it fails / how to fix it:** If stop.bat says 'The website was not running' it is already stopped.

![stop bat](images/27-stop-bat.png)

---

### STEP 7 — Start it again later

**What you are doing:** Starting the website on another day or after restarting Windows.

**Why you are doing it:** The website does not start by itself. Your products, pictures, settings, feedback and admin login are all still there.

**Where to click / what to do:**

1. Double-click start.bat again.
2. Open http://localhost:3000

**Expected result:** Everything you added earlier is still there. The website NEVER resets the database when it starts.

**If it fails / how to fix it:** If something looks empty, do not panic: open Admin > Backup & Restore and restore your latest backup (07-BACKUP-RESTORE.md).

---

## What the black window means (summary)

* It is called the **Command Prompt**. Here it is the **running website**.
* **Open = website on. Closed = website off.**
* Red or `error` lines mean something is wrong. See [10-TROUBLESHOOTING.md](10-TROUBLESHOOTING.md).

## Addresses to remember

| What | Address |
|---|---|
| Customer website | http://localhost:3000 |
| Admin login | http://localhost:3000/admin/login.html |

`localhost` means "this same computer".


[Back to START HERE](01-START-HERE.md)
