@echo off
REM QueueCare Combined E2E Testing - Quick Start Script (Windows)
REM This script automates the setup and execution of the unified system test

echo.
echo ========================================
echo QueueCare Combined E2E System Testing
echo ========================================
echo.

REM Check if Artillery is installed
echo [1/5] Checking for Artillery...
WHERE npx >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found. Please install Node.js 22+
    pause
    exit /b 1
)

npx artillery --version >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [*] Installing Artillery and Playwright plugin...
    call npm install --save-dev artillery artillery-plugin-playwright
    call npx playwright install chromium
) ELSE (
    echo [✓] Artillery is installed
)

REM Check if servers are running
echo.
echo [2/5] Checking for running servers...
netstat -ano | findstr ":5000" >nul
IF %ERRORLEVEL% EQU 0 (
    echo [✓] Backend (port 5000) is running
) ELSE (
    echo [!] Backend (port 5000) is NOT running
    echo    Start it with: cd backend ^&^& npm run dev
)

netstat -ano | findstr ":3000" >nul
IF %ERRORLEVEL% EQU 0 (
    echo [✓] Frontend (port 3000) is running
) ELSE (
    echo [!] Frontend (port 3000) is NOT running
    echo    Start it with: cd frontend ^&^& npm run dev
)

echo.
echo [3/5] Verifying test configuration...
IF NOT EXIST "combined-artillery.yml" (
    echo ERROR: combined-artillery.yml not found
    pause
    exit /b 1
)
IF NOT EXIST "combined-flow.js" (
    echo ERROR: combined-flow.js not found
    pause
    exit /b 1
)
echo [✓] Test files are in place

REM Run the test
echo.
echo [4/5] Starting combined E2E test...
echo    This will take approximately 6 minutes
echo    Phases: 60s ramp-up ^| 120s ramp-up ^| 120s sustained ^| 60s cool-down
echo.

call npx artillery run combined-artillery.yml --output combined-report.json

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo [5/5] Test completed successfully!
    echo.
    echo [*] Generating HTML report...
    call npx artillery report combined-report.json
    echo.
    echo ========================================
    echo Test Results
    echo ========================================
    echo JSON Report: combined-report.json
    echo HTML Report: combined-report.html (opening in browser...)
    echo.
    echo View full documentation: COMBINED_TESTING_GUIDE.md
    echo.
) ELSE (
    echo.
    echo ERROR: Test execution failed
    echo Check the error output above for details
    pause
    exit /b 1
)
