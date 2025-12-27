@echo off
echo Starting GearGuard Maintenance System...
echo.

cd /d "%~dp0backendd"

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Seeding database with initial data...
node seed.js
echo.

echo Starting backend server...
echo Backend will run on http://localhost:5000
echo Frontend should be served from frontendd folder
echo.
echo Press Ctrl+C to stop the server
echo.

npm start