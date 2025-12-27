@echo off
echo Starting GearGuard Application...
echo.

echo Starting MongoDB...
start "MongoDB" mongod --dbpath "C:\data\db"
timeout /t 3 /nobreak > nul

echo Starting Backend Server...
cd backendd
start "Backend" cmd /k "npm start"
timeout /t 2 /nobreak > nul

echo Backend started on http://localhost:5000
echo Frontend available at: frontendd/index.html
echo.
echo Press any key to exit...
pause > nul