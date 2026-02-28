@echo off
:: This script must be run as Administrator (right-click → Run as administrator)
title Akash Automobile - Hostname Setup

echo.
echo  ============================================
echo   Setting up custom hostname
echo   akash-automobile → localhost
echo  ============================================
echo.

:: Check for admin privilege
net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Please right-click this file and choose "Run as administrator"
    pause
    exit /b 1
)

:: Check if entry already exists
findstr /i "akash-automobile" C:\Windows\System32\drivers\etc\hosts >nul 2>&1
if not errorlevel 1 (
    echo Hostname already set up. Nothing to do.
    echo.
    echo You can now access the app at: http://akash-automobile:3000
    pause
    exit /b 0
)

:: Add entry to hosts file
echo 127.0.0.1    akash-automobile >> C:\Windows\System32\drivers\etc\hosts

echo Done! Hostname configured successfully.
echo.
echo You can now access the app at: http://akash-automobile:3000
echo.
echo Run this script only once per machine.
echo  ============================================
echo.
pause
