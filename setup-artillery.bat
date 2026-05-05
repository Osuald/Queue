@echo off
REM Artillery Setup Script for QueueCare (Windows)

echo =========================================
echo Artillery Stress Testing Setup
echo =========================================

REM Check if Artillery is installed globally
artillery --version >nul 2>&1
if errorlevel 1 (
    echo Artillery not found globally. Installing...
    call npm install -g artillery
) else (
    echo [OK] Artillery is already installed
)

REM Add to devDependencies if not present
findstr /M "artillery" package.json >nul 2>&1
if errorlevel 1 (
    echo Adding Artillery to devDependencies...
    call npm install --save-dev artillery
) else (
    echo [OK] Artillery is already in package.json
)

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo To run stress tests:
echo.
echo 1. Start the backend server (Terminal 1):
echo    cd backend ^&^& npm run dev
echo.
echo 2. Start the frontend server (Terminal 2):
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Run stress tests from project root (Terminal 3):
echo.
echo    API stress test:
echo    artillery run artillery-api.yml
echo.
echo    Frontend stress test:
echo    artillery run artillery-frontend.yml
echo.
echo 4. View detailed HTML reports:
echo    artillery run artillery-api.yml --output api-report.json
echo    artillery report api-report.json
echo.
echo For more details, see ARTILLERY_GUIDE.md
echo.
pause
