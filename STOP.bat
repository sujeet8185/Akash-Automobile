@echo off
title Akash Automobile - Stopping...
cd /d "%~dp0"

echo.
echo  ============================================
echo   AKASH AUTOMOBILE - Stopping Services
echo  ============================================
echo.

docker-compose down

if errorlevel 1 (
    echo [ERROR] Failed to stop services.
    pause
    exit /b 1
)

echo.
echo All services stopped.
echo  ============================================
echo.
pause
