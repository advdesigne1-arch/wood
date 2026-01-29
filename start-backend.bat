@echo off
REM Start BOUALEM BOIS Backend (Windows)

echo.
echo 🚀 Starting BOUALEM BOIS Backend...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed.
    echo Please download it from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Navigate to backend
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Start the server
echo 🎯 Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

call npm start
pause
