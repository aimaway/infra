@echo off
REM Infracentra Lab - Start Script Wrapper
REM This batch file runs the PowerShell start script

echo.
echo ============================================================================
echo   Infracentra Lab - Starting
echo ============================================================================
echo.

REM Check if PowerShell script exists
if not exist "%~dp0start-lab.ps1" (
    echo ERROR: start-lab.ps1 not found
    echo Please make sure you're running this from the scripts directory
    pause
    exit /b 1
)

REM Run PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-lab.ps1"
