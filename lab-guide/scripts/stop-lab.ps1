# Infracentra Lab - Stop Script for Windows
# Run this script to stop all lab services

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Infracentra Lab - Stopping Services" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "[1/2] Stopping VMware VMs..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please shut down the following VMs in VMware:" -ForegroundColor Cyan
Write-Host "  - win-target (if running)" -ForegroundColor White
Write-Host "  - soc-siem" -ForegroundColor White
Write-Host "  - pfSense" -ForegroundColor White
Write-Host ""
Write-Host "To stop VMs:" -ForegroundColor Yellow
Write-Host "  1. Open VMware Workstation" -ForegroundColor White
Write-Host "  2. Select each VM" -ForegroundColor White
Write-Host "  3. VM → Power → Shut Down Guest" -ForegroundColor White
Write-Host ""

Write-Host "[2/2] Stopping VMware services..." -ForegroundColor Yellow
Get-Service vmware* | Where-Object {$_.Status -eq 'Running'} | Stop-Service -Force
Write-Host "✓ VMware services stopped" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Lab Stopped" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the lab again, run: .\start-lab.ps1" -ForegroundColor Yellow
Write-Host ""

pause
