@echo off
title Akash Automobile - Starting...
cd /d "%~dp0"

echo.
echo  ============================================
echo   AKASH AUTOMOBILE - Stock Management App
echo  ============================================
echo.

:: Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo Docker found:
docker --version
echo.

:: Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [INFO] Docker Desktop is not running. Attempting to start it...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo.
    echo Waiting for Docker to start (this may take 30-60 seconds)...
    :WAIT_DOCKER
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if errorlevel 1 goto WAIT_DOCKER
    echo Docker is ready!
    echo.
)

echo Docker is running.
echo.

echo [1/3] Building and starting all services...
echo       (First run may take 5-10 minutes to download images)
echo.

:: Try new-style "docker compose" first, fall back to "docker-compose"
docker compose version >nul 2>&1
if errorlevel 1 (
    echo Using docker-compose...
    docker-compose up --build -d
) else (
    echo Using docker compose...
    docker compose up --build -d
)

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services. See error above.
    pause
    exit /b 1
)

echo.
echo [2/3] Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo [3/3] Opening app in browser...
start http://localhost:3000

echo.
echo  ============================================
echo   App is running!
echo.
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo.
echo   Default login:
echo     Username : sumitkalaskar
echo     Password : sunilkalaskar
echo.
echo   To STOP the app, run STOP.bat
echo  ============================================
echo.
pause
