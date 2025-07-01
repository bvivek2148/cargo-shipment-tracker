@echo off
echo 🚢 Cargo Shipment Tracker Setup
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install backend dependencies
echo Installing backend dependencies...
call npm install

REM Install frontend dependencies
echo Installing frontend dependencies...
cd cargo-shipment-tracker
call npm install
cd ..

echo ✅ Dependencies installed!

REM Check if .env files exist
if not exist .env (
    echo 📝 Creating backend .env file...
    copy .env.example .env
)

if not exist cargo-shipment-tracker\.env (
    echo 📝 Creating frontend .env file...
    copy cargo-shipment-tracker\.env.example cargo-shipment-tracker\.env
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the application:
echo 1. Start the backend server:
echo    npm start
echo.
echo 2. In a new terminal, start the frontend:
echo    cd cargo-shipment-tracker
echo    npm start
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
pause
