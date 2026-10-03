@echo off
setlocal
title Sasi Maligai Website - keep this window open
cd /d "%~dp0"

echo ==================================================
echo   Sasi Maligai website
echo ==================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto :nonode

node -e "var v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=16)?0:1)"
if errorlevel 1 goto :oldnode

if not exist "data\server.pid" goto :launch
set /p OLDPID=<"data\server.pid"
tasklist /FI "PID eq %OLDPID%" /FI "IMAGENAME eq node.exe" 2>nul | find "node.exe" >nul
if errorlevel 1 goto :launch
echo The website is ALREADY running in another black window.
echo Open your browser and go to:  http://localhost:3000
echo To stop it, run stop.bat
echo.
pause
exit /b 0

:launch
echo Starting the website... your browser will open by itself.
echo Keep this black window OPEN while the website is in use.
echo.
node --disable-warning=ExperimentalWarning server\server.js
echo.
echo ==================================================
echo   The website has stopped.
echo   If you did not expect this, read the lines above.
echo   Double-click start.bat to start it again.
echo ==================================================
pause
exit /b 0

:nonode
echo Node.js is not installed on this computer.
echo.
echo   1. Open https://nodejs.org in your browser
echo   2. Download the LTS version and install it, click Next each time
echo   3. Restart the computer, then double-click start.bat again
echo.
pause
exit /b 1

:oldnode
echo Your Node.js is too old. This website needs version 22.16 or newer.
echo Install the newest LTS version from https://nodejs.org and try again.
echo.
pause
exit /b 1
