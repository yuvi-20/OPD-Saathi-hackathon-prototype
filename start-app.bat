@echo off
title OPD Saathi Hospital Web App
echo ============================================================
echo   OPD Saathi - Smart Hospital Queue & Navigation
echo ============================================================
echo.
echo Opening 3 tabs in your default browser:
echo 1. Patient Kiosk: http://localhost:5173/
echo 2. Doctor Desk:   http://localhost:5173/staff
echo 3. TV Board:      http://localhost:5173/board
echo.

:: Launch all 3 tabs in your browser
start http://localhost:5173/
start http://localhost:5173/staff
start http://localhost:5173/board

:: Ensure Node and npm are in path and run Vite dev server
set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"
call npm.cmd run dev -- --host

pause
