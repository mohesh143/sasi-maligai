# 10 — TROUBLESHOOTING

Find your problem. Each one is written as:

**PROBLEM → WHY IT HAPPENS → HOW TO CHECK → FIX → EXPECTED RESULT**

![port in use](images/28-port-in-use.png)

Still stuck? Copy the red lines from the black window and ask for help. **Never send your passwords.**

---

## PROBLEM 1. Node.js is not installed ('Node.js is not installed on this computer')

↓

**WHY IT HAPPENS:** start.bat cannot find the program that runs the website.

↓

**HOW TO CHECK:** Click Start, type cmd, press Enter, type: node --version

↓

**FIX:** Install Node.js (LTS) from nodejs.org (see 02-INSTALLATION.md) and restart the computer. If the laptop does not allow installing programs, ask the person who manages it. Advanced fallback: on nodejs.org choose 'Windows Binary (.zip)', unzip it and copy the file node.exe into the sasi-maligai folder (next to start.bat); start.bat will use it. (This fallback needs your Windows test.)

↓

**EXPECTED RESULT:** node --version shows v22.16 or higher; start.bat starts the website.

---

## PROBLEM 2. 'npm is not recognized'

↓

**WHY IT HAPPENS:** npm comes with Node.js. But this project does not need npm at all.

↓

**HOW TO CHECK:** Are you following an old guide? Check the command you typed.

↓

**FIX:** Do not use npm. Start the website with start.bat. (If you want to run the self-test, Node.js must be installed first, then type: npm test.)

↓

**EXPECTED RESULT:** The website starts without npm.

---

## PROBLEM 3. 'git is not recognized'

↓

**WHY IT HAPPENS:** Git is not installed, or the black window was opened before installing it.

↓

**HOW TO CHECK:** Type: git --version

↓

**FIX:** Install Git (08-GITHUB-GUIDE.md), close ALL black windows, open a NEW one. Restart the computer if needed.

↓

**EXPECTED RESULT:** git --version shows a version.

---

## PROBLEM 4. 'Port 3000 is already in use'

↓

**WHY IT HAPPENS:** The website is already running in another black window, or another program uses port 3000.

↓

**HOW TO CHECK:** Look for another black window titled 'Sasi Maligai Website'. Or double-click stop.bat.

↓

**FIX:** Close the other black window or run stop.bat, then start.bat. If another program uses the port: create the .env file (see 04-WEBSITE-GUIDE.md) and add the line PORT=3001, then open http://localhost:3001

↓

**EXPECTED RESULT:** The black window says 'Sasi Maligai website is running!'.

---

## PROBLEM 5. The website does not open ('This site can't be reached')

↓

**WHY IT HAPPENS:** The black window is closed, or the address is wrong.

↓

**HOW TO CHECK:** Is the black window open and does it say 'running'? Is the address exactly http://localhost:3000 ?

↓

**FIX:** Start it with start.bat. Type the address again. If you changed PORT in .env, use that number.

↓

**EXPECTED RESULT:** The home page appears.

---

## PROBLEM 6. Database error / 'The database could not be opened'

↓

**WHY IT HAPPENS:** The database file is damaged or locked, for example by a power cut while another program held it.

↓

**HOW TO CHECK:** Read the message in the black window. The message says 'Your data files were NOT changed'.

↓

**FIX:** Close all black windows, restart the computer, start.bat again. If it still fails: do NOT delete data\sasi-maligai.db. Copy the whole data folder to the USB drive, then rename the data folder to data-old, start the website (it creates a fresh one), create the admin account, and use Backup & Restore with your latest backup.

↓

**EXPECTED RESULT:** The website starts and your restored data appears.

---

## PROBLEM 7. Admin login does not work / forgot the password

↓

**WHY IT HAPPENS:** Wrong password, 5 wrong tries (5-minute wait), or the account was made by the older version of the website.

↓

**HOW TO CHECK:** Read the red message on the login page.

↓

**FIX:** Wait 5 minutes if it says too many attempts. To set a new password: close the website (stop.bat), double-click reset-admin-password.bat, type the username, the new password, and the new password again. Then start.bat and log in.

↓

**EXPECTED RESULT:** 'Done. You can now log in...' and the login works. Your products and data are unchanged.

---

## PROBLEM 8. A product picture does not upload

↓

**WHY IT HAPPENS:** The file is not JPG/PNG/WEBP (for example HEIC or PDF), is over 2 MB, or the browser is very old.

↓

**HOW TO CHECK:** Read the red message in the product box.

↓

**FIX:** Use a normal JPG or PNG photo. Phone photos are normally shrunk automatically. Or open the photo in Paint and Save as JPEG.

↓

**EXPECTED RESULT:** The product shows the picture.

---

## PROBLEM 9. Backup does not work

↓

**WHY IT HAPPENS:** The disk is full, or the backups folder is read-only/blocked by a security program.

↓

**HOW TO CHECK:** Read the red message. Check free space in File Explorer (This PC).

↓

**FIX:** Free some space (delete old Downloads). Check that the backups folder exists in the project folder. Try again.

↓

**EXPECTED RESULT:** A new file appears in the Backups list.

---

## PROBLEM 10. Restore does not work

↓

**WHY IT HAPPENS:** The file is not a Sasi Maligai backup, is damaged, or a security program locks it.

↓

**HOW TO CHECK:** Read the message in the restore box; it says why.

↓

**FIX:** Choose another backup. Your current data is never touched when a restore is refused. If it says 'Restore failed', your original data was put back automatically - read the black window for details.

↓

**EXPECTED RESULT:** The restore box ends with a green message.

---

## PROBLEM 11. GitHub push rejected

↓

**WHY IT HAPPENS:** GitHub already has files (for example a README) that you do not have, or you are not signed in.

↓

**HOW TO CHECK:** Read the black window: 'rejected' / 'fetch first', or 'Authentication failed'.

↓

**FIX:** Rejected: git pull origin main --allow-unrelated-histories --no-edit and then git push. Authentication: run git push again and use the sign-in window; check the address with: git remote -v

↓

**EXPECTED RESULT:** git push shows main -> main.

---

## PROBLEM 12. Wrong folder ('not a git repository' or commands do nothing)

↓

**WHY IT HAPPENS:** The black window is not inside the project folder.

↓

**HOW TO CHECK:** Type: dir . Do you see start.bat in the list?

↓

**FIX:** Close the window. Open the project folder in File Explorer, click the address bar, type cmd, press Enter (see 08-GITHUB-GUIDE.md).

↓

**EXPECTED RESULT:** dir shows start.bat.

---

## PROBLEM 13. The black window closes immediately

↓

**WHY IT HAPPENS:** An error appeared and the window closed before you could read it. (start.bat normally waits with 'Press any key'.)

↓

**HOW TO CHECK:** Open the Command Prompt in the project folder (type cmd in the address bar) and type: start.bat

↓

**FIX:** Read the message, then use this list. The usual causes are problems 1, 4 and 6.

↓

**EXPECTED RESULT:** You can read the message.

---

## PROBLEM 14. The website shows a blank page or no products

↓

**WHY IT HAPPENS:** The page cannot reach the server (black window closed) or JavaScript is blocked in the browser.

↓

**HOW TO CHECK:** Is the black window open? Press Ctrl+F5 to refresh. Try another browser (Chrome/Edge).

↓

**FIX:** Start the website; refresh with Ctrl+F5. If products are really gone, check Admin > Products first, then restore the latest backup (07-BACKUP-RESTORE.md).

↓

**EXPECTED RESULT:** Products appear.

---

## PROBLEM 15. 'Windows protected your PC' when opening start.bat

↓

**WHY IT HAPPENS:** Windows is cautious about files downloaded from the internet.

↓

**HOW TO CHECK:** A blue box appears.

↓

**FIX:** Click More info, then Run anyway. Or right-click the ZIP file > Properties > tick Unblock > OK, then extract again.

↓

**EXPECTED RESULT:** start.bat runs.

---

## PROBLEM 16. 'This website needs Node.js version 22.16 or newer'

↓

**WHY IT HAPPENS:** Your Node.js is older.

↓

**HOW TO CHECK:** node --version

↓

**FIX:** Install the newest LTS from nodejs.org over the old one and restart.

↓

**EXPECTED RESULT:** start.bat runs.

---

## PROBLEM 17. Phones cannot open the website

↓

**WHY IT HAPPENS:** By default only this computer can open it.

↓

**HOW TO CHECK:** Try http://localhost:3000 on the laptop first.

↓

**FIX:** See 'Showing the website to phones on your Wi-Fi' in 04-WEBSITE-GUIDE.md.

↓

**EXPECTED RESULT:** The phone shows the website.

---


[Back to START HERE](01-START-HERE.md)
