@echo off
title Akash Automobile - Stopping...
cd /d "%~dp0"

echo.
echo  ============================================
echo   AKASH AUTOMOBILE - Stopping Services
echo  ============================================
echo.

docker compose stop

if errorlevel 1 (
    echo [ERROR] Failed to stop services.
    pause
    exit /b 1
)

echo.
echo.
echo All services stopped. Your data is safe.
echo Run START.bat to start again.
echo  ============================================
echo.
pause
