@echo off
setlocal
title Stop Sasi Maligai Website
cd /d "%~dp0"

echo Stopping the Sasi Maligai website...
echo.
if not exist "data\server.pid" goto :notrunning
set /p SPID=<"data\server.pid"
tasklist /FI "PID eq %SPID%" /FI "IMAGENAME eq node.exe" 2>nul | find "node.exe" >nul
if errorlevel 1 goto :stale
taskkill /PID %SPID% /F >nul 2>&1
del "data\server.pid" >nul 2>&1
echo The website has been stopped. Your data is safe.
goto :end

:stale
del "data\server.pid" >nul 2>&1
:notrunning
echo The website was not running.

:end
echo.
pause
