@echo off
REM ============================================================================
REM Infracentra Lab - Windows Setup Script
REM ============================================================================

echo.
echo ============================================================================
echo   Infracentra Lab - Windows Setup
echo ============================================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/5] Checking prerequisites...
echo.

REM Check if VMware is installed
if exist "C:\Program Files (x86)\VMware\VMware Workstation\vmware.exe" (
    echo ✓ VMware Workstation found
) else (
    echo ✗ VMware Workstation not found
    echo Please install VMware Workstation Pro first
    echo Download from: https://www.vmware.com/products/workstation-pro.html
    pause
    exit /b 1
)

REM Check if Docker is installed (optional, for later phases)
where docker >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Docker found
) else (
    echo ! Docker not found (will be needed for Phase 3)
    echo Download from: https://docs.docker.com/desktop/install/windows-install/
)

echo.
echo [2/5] Creating directory structure...
echo.

REM Create main directories
if not exist "C:\VMs" mkdir "C:\VMs"
if not exist "C:\VMs\InfracentraLab" mkdir "C:\VMs\InfracentraLab"
if not exist "C:\VMs\ISOs" mkdir "C:\VMs\ISOs"

echo ✓ Directories created:
echo   - C:\VMs\InfracentraLab
echo   - C:\VMs\ISOs

echo.
echo [3/5] Downloading ISOs...
echo.

REM Check if ISOs already exist
if exist "C:\VMs\ISOs\pfSense-CE-2.7.2-RELEASE-amd64.iso" (
    echo ✓ pfSense ISO already exists
) else (
    echo Downloading pfSense ISO...
    echo This may take a few minutes...
    
    REM Try to use PowerShell for download
    powershell -Command "& {$url='https://ny1.edgebsd.net/pfsense/downloads/pfSense-CE-2.7.2-RELEASE-amd64.iso.gz'; $output='C:\VMs\ISOs\pfSense-CE-2.7.2-RELEASE-amd64.iso.gz'; Invoke-WebRequest -Uri $url -OutFile $output}"
    
    if exist "C:\VMs\ISOs\pfSense-CE-2.7.2-RELEASE-amd64.iso.gz" (
        echo Extracting pfSense ISO...
        powershell -Command "Expand-Archive -Path 'C:\VMs\ISOs\pfSense-CE-2.7.2-RELEASE-amd64.iso.gz' -DestinationPath 'C:\VMs\ISOs' -Force"
        echo ✓ pfSense ISO downloaded and extracted
    ) else (
        echo ✗ Failed to download pfSense ISO
        echo Please download manually from: https://www.pfsense.org/download/
    )
)

if exist "C:\VMs\ISOs\ubuntu-22.04.3-live-server-amd64.iso" (
    echo ✓ Ubuntu ISO already exists
) else (
    echo.
    echo Downloading Ubuntu 22.04 ISO...
    echo This may take several minutes...
    
    powershell -Command "& {$url='https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso'; $output='C:\VMs\ISOs\ubuntu-22.04.3-live-server-amd64.iso'; Invoke-WebRequest -Uri $url -OutFile $output}"
    
    if exist "C:\VMs\ISOs\ubuntu-22.04.3-live-server-amd64.iso" (
        echo ✓ Ubuntu ISO downloaded
    ) else (
        echo ✗ Failed to download Ubuntu ISO
        echo Please download manually from: https://ubuntu.com/download/server
    )
)

echo.
echo [4/5] Configuring VMware networks...
echo.

echo Please configure the following networks in VMware:
echo.
echo   VMnet2 (SOC Network):
echo     - Subnet IP: 10.0.10.0
echo     - Subnet mask: 255.255.255.0
echo     - DHCP: 10.0.10.100 - 10.0.10.200
echo.
echo   VMnet3 (VICTIM Network):
echo     - Subnet IP: 10.0.20.0
echo     - Subnet mask: 255.255.255.0
echo     - DHCP: 10.0.20.100 - 10.0.20.200
echo.
echo   VMnet4 (ATTACK Network):
echo     - Subnet IP: 10.0.30.0
echo     - Subnet mask: 255.255.255.0
echo     - DHCP: 10.0.30.100 - 10.0.30.200
echo.
echo To configure:
echo   1. Open VMware Workstation
echo   2. Edit ^> Virtual Network Editor
echo   3. Click "Change Settings" (requires admin)
echo   4. Add networks VMnet2, VMnet3, VMnet4
echo   5. Configure as shown above
echo.

pause

echo.
echo [5/5] Setup complete!
echo.
echo ============================================================================
echo   Next steps:
echo ============================================================================
echo.
echo   1. Read the installation guides:
echo      - lab-guide\01-VMWARE-INSTALLATION.md
echo      - lab-guide\02-PFSENSE-VMWARE.md
echo      - lab-guide\03-SOC-SIEM-VMWARE.md
echo.
echo   2. Start with Phase 1: Install VMware Workstation
echo      (if not already installed)
echo.
echo   3. Configure VMware networks (VMnet2, VMnet3, VMnet4)
echo.
echo   4. Create pfSense VM and install pfSense
echo.
echo   5. Create soc-siem VM and install Wazuh + Zabbix
echo.
echo ============================================================================
echo.

pause
