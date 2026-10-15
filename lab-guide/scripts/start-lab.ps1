# Infracentra Lab - Start Script for Windows
# Run this script to start all lab services

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Infracentra Lab - Starting Services" -ForegroundColor Cyan
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

Write-Host "[1/3] Starting VMware services..." -ForegroundColor Yellow
Get-Service vmware* | Where-Object {$_.Status -eq 'Stopped'} | Start-Service
Write-Host "✓ VMware services started" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Checking VM status..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please ensure the following VMs are powered on in VMware:" -ForegroundColor Cyan
Write-Host "  - pfSense (10.0.10.1)" -ForegroundColor White
Write-Host "  - soc-siem (10.0.10.10)" -ForegroundColor White
Write-Host ""
Write-Host "To start VMs:" -ForegroundColor Yellow
Write-Host "  1. Open VMware Workstation" -ForegroundColor White
Write-Host "  2. Select each VM" -ForegroundColor White
Write-Host "  3. Click 'Power on this virtual machine'" -ForegroundColor White
Write-Host ""

Write-Host "[3/3] Testing connectivity..." -ForegroundColor Yellow
Write-Host ""

# Test pfSense
$pfSense = Test-Connection -ComputerName "10.0.10.1" -Count 1 -Quiet -ErrorAction SilentlyContinue
if ($pfSense) {
    Write-Host "✓ pfSense accessible at 10.0.10.1" -ForegroundColor Green
} else {
    Write-Host "✗ pfSense not accessible at 10.0.10.1" -ForegroundColor Red
    Write-Host "  Make sure the VM is powered on and network is configured" -ForegroundColor Yellow
}

# Test soc-siem
$socSiem = Test-Connection -ComputerName "10.0.10.10" -Count 1 -Quiet -ErrorAction SilentlyContinue
if ($socSiem) {
    Write-Host "✓ soc-siem accessible at 10.0.10.10" -ForegroundColor Green
} else {
    Write-Host "✗ soc-siem not accessible at 10.0.10.10" -ForegroundColor Red
    Write-Host "  Make sure the VM is powered on and network is configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Service URLs" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "pfSense Web UI:     https://10.0.10.1" -ForegroundColor White
Write-Host "Wazuh Dashboard:    https://10.0.10.10" -ForegroundColor White
Write-Host "Zabbix Web:         http://10.0.10.10:8080" -ForegroundColor White
Write-Host ""
Write-Host "Default credentials:" -ForegroundColor Yellow
Write-Host "  pfSense: admin / PfsenseAdmin2027!" -ForegroundColor White
Write-Host "  Wazuh:   admin / SecretPassword123!" -ForegroundColor White
Write-Host "  Zabbix:  Admin / zabbix" -ForegroundColor White
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

pause
