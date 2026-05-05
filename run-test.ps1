#!/usr/bin/env pwsh
<#
.SYNOPSIS
    QueueCare Combined E2E Testing - Quick Start Script (PowerShell)

.DESCRIPTION
    This script automates the setup and execution of the unified Artillery + Playwright 
    system test for QueueCare (frontend + backend + database).

.EXAMPLE
    ./run-test.ps1
    ./run-test.ps1 -CloudRecord  # Run with Artillery Cloud recording
#>

param(
    [switch]$CloudRecord,
    [string]$ApiKey
)

# Colors for output
$colors = @{
    Success = 'Green'
    Error = 'Red'
    Warning = 'Yellow'
    Info = 'Cyan'
}

function Write-Status {
    param(
        [string]$Message,
        [string]$Status = 'Info'
    )
    
    $icon = @{
        'Success' = '[✓]'
        'Error' = '[✗]'
        'Warning' = '[!]'
        'Info' = '[*]'
    }
    
    Write-Host "$($icon[$Status]) $Message" -ForegroundColor $colors[$Status]
}

Clear-Host
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QueueCare Combined E2E System Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js and npm
Write-Status "Checking for Node.js..." -Status Info

try {
    $nodeVersion = & node --version 2>$null
    Write-Status "Node.js $nodeVersion found" -Status Success
} catch {
    Write-Status "Node.js not found. Please install Node.js 22+ from https://nodejs.org/" -Status Error
    exit 1
}

# Step 2: Check/Install Artillery
Write-Status "Checking for Artillery..." -Status Info

$artilleryCheck = & npm list -g artillery 2>$null | Select-String "artillery"
if ($null -eq $artilleryCheck) {
    Write-Status "Installing Artillery and Playwright plugin..." -Status Warning
    & npm install --save-dev artillery artillery-plugin-playwright 2>&1 | Out-Null
    & npx playwright install chromium 2>&1 | Out-Null
    Write-Status "Artillery installed" -Status Success
} else {
    Write-Status "Artillery is installed" -Status Success
}

# Step 3: Check for running servers
Write-Host ""
Write-Status "Checking for running servers..." -Status Info

$backend = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Status "Backend (port 5000) is running" -Status Success
} else {
    Write-Status "Backend (port 5000) is NOT running - start with: cd backend && npm run dev" -Status Warning
}

$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontend) {
    Write-Status "Frontend (port 3000) is running" -Status Success
} else {
    Write-Status "Frontend (port 3000) is NOT running - start with: cd frontend && npm run dev" -Status Warning
}

# Step 4: Verify test files
Write-Host ""
Write-Status "Verifying test configuration..." -Status Info

$files = @('combined-artillery.yml', 'combined-flow.js')
$allFound = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Status "$file found" -Status Success
    } else {
        Write-Status "$file NOT FOUND" -Status Error
        $allFound = $false
    }
}

if (-not $allFound) {
    exit 1
}

# Step 5: Run the test
Write-Host ""
Write-Status "Starting combined E2E test..." -Status Info
Write-Host "  This will take approximately 6 minutes" -ForegroundColor Gray
Write-Host "  Phases: 60s ramp-up | 120s ramp-up | 120s sustained | 60s cool-down" -ForegroundColor Gray
Write-Host ""

$testCmd = "npx artillery run combined-artillery.yml --output combined-report.json"

if ($CloudRecord) {
    if ([string]::IsNullOrEmpty($ApiKey)) {
        $ApiKey = $env:ARTILLERY_API_KEY
    }
    
    if ([string]::IsNullOrEmpty($ApiKey)) {
        Write-Status "Cloud recording enabled but API key not found" -Status Warning
        Write-Host "Set your API key with: `$env:ARTILLERY_API_KEY = 'your-key-here'" -ForegroundColor Yellow
        Write-Host "Or pass it as: ./run-test.ps1 -CloudRecord -ApiKey 'your-key-here'" -ForegroundColor Yellow
        $response = Read-Host "Continue without cloud recording? (y/n)"
        if ($response -ne 'y') {
            exit 0
        }
    } else {
        $testCmd += " --record --key $ApiKey"
        Write-Status "Cloud recording enabled" -Status Success
    }
}

Invoke-Expression $testCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Status "Test completed successfully!" -Status Success
    Write-Host ""
    
    Write-Status "Generating HTML report..." -Status Info
    & npx artillery report combined-report.json 2>$null
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Test Results" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "JSON Report: combined-report.json" -ForegroundColor Gray
    Write-Host "HTML Report: combined-report.html" -ForegroundColor Gray
    Write-Host ""
    Write-Host "View full documentation: COMBINED_TESTING_GUIDE.md" -ForegroundColor Gray
    Write-Host ""
    
    # Open report in browser
    if (Test-Path "combined-report.html") {
        Write-Status "Opening HTML report in browser..." -Status Info
        Start-Process "combined-report.html"
    }
} else {
    Write-Host ""
    Write-Status "Test execution failed" -Status Error
    Write-Host "Check the error output above for details" -ForegroundColor Yellow
    exit 1
}
