@echo off
title OPD Saathi - Launching All 3 Connected Screens
echo ============================================================
echo   OPD Saathi - Launching 3 Connected Hackathon Programs
echo ============================================================
echo.
echo 1. Opening Patient Mobile App...
start http://localhost:5173/

timeout /t 1 /nobreak >nul

echo 2. Opening Staff Queue Desk Dashboard...
start http://localhost:5173/staff

timeout /t 1 /nobreak >nul

echo 3. Opening Waiting Hall TV Board...
start http://localhost:5173/board

echo.
echo All 3 programs are open in your browser tabs!
echo State syncs live across all 3 screens automatically.
echo ============================================================
pause
