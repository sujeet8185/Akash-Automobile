@echo off
title Akash Automobile
cd /d "%~dp0"

echo.
echo  ============================================
echo   AKASH AUTOMOBILE - Stock Management App
echo  ============================================
echo.

echo Checking Docker...
docker --version
if errorlevel 1 (
    echo.
    echo [ERROR] Docker not found. Please install Docker Desktop.
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo.
echo Checking Docker engine is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Docker Desktop is not running.
    echo Please start Docker Desktop, wait for it to fully load, then run START.bat again.
    echo.
    pause
    exit /b 1
)

echo Docker engine is ready.
echo.
echo Starting all services...
echo (First run takes 5-10 minutes to download images)
echo.

docker compose up --build -d

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services. See error above.
    pause
    exit /b 1
)

echo.
echo Waiting 30 seconds for services to initialize...
timeout /t 30 /nobreak

echo.
echo Opening app in browser...
start http://localhost:3000

echo.
echo  ============================================
echo   App is running!
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo.
echo   Login: sumitkalaskar / sunilkalaskar
echo.
echo   Run STOP.bat to stop the app.
echo  ============================================
echo.
pause
