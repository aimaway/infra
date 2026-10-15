# 🪟 Windows Installation Guide - Infracentra Lab

## 📋 Overview

This guide explains how to extract and set up the Infracentra lab project on **Windows**.

---

## 🚀 Quick Start

### Step 1 : Extract the Project

#### Option A : Using Windows Explorer (Recommended)

1. **Locate the ZIP file**
   - Find the downloaded project ZIP file
   - Example : `infracentra-lab.zip`

2. **Extract the archive**
   - Right-click on the ZIP file
   - Select **"Extract All..."** or **"Extract Here"**
   - Choose a destination folder, for example : `C:\Projects\InfracentraLab`
   - Click **"Extract"**

3. **Verify extraction**
   - Open the extracted folder
   - You should see :
     ```
     C:\Projects\InfracentraLab\
     ├── lab-guide\
     ├── src\
     ├── backend\
     ├── frontend\
     ├── docker-compose.yml
     ├── README.md
     └── ...
     ```

#### Option B : Using PowerShell

```powershell
# Open PowerShell as Administrator
# Navigate to the download folder
cd $env:USERPROFILE\Downloads

# Extract the ZIP file
Expand-Archive -Path "infracentra-lab.zip" -DestinationPath "C:\Projects\InfracentraLab" -Force

# Verify extraction
Get-ChildItem "C:\Projects\InfracentraLab"
```

#### Option C : Using 7-Zip (Free, Recommended for Large Files)

1. **Download 7-Zip** from https://www.7-zip.org/
2. **Right-click** on the ZIP file
3. **Select 7-Zip → Extract to "infracentra-lab\"**
4. **Wait** for extraction to complete

---

### Step 2 : Install Prerequisites

#### 2.1 Install VMware Workstation Pro

1. **Download VMware Workstation Pro**
   - Go to https://www.vmware.com/products/workstation-pro.html
   - Click **"Download Now"** for personal use
   - Create a Broadcom account (free)

2. **Install VMware**
   - Run the downloaded installer
   - Accept the license agreement
   - Choose **"Personal Use"** (free)
   - Complete the installation

3. **Verify installation**
   - Open VMware Workstation
   - You should see the main interface

#### 2.2 Install Required Tools

##### Git (for version control)
```powershell
# Download from https://git-scm.com/download/win
# Or use winget
winget install Git.Git
```

##### Docker Desktop (for Phase 3+)
```powershell
# Download from https://docs.docker.com/desktop/install/windows-install/
# Or use winget
winget install Docker.DockerDesktop

# After installation, restart your computer
# Open Docker Desktop to start the service
```

##### WSL2 (Windows Subsystem for Linux - Optional but Recommended)
```powershell
# Open PowerShell as Administrator
wsl --install

# Restart your computer
# This installs Ubuntu by default
```

---

### Step 3 : Configure VMware Networks

1. **Open VMware Workstation**

2. **Open Virtual Network Editor**
   - Edit → Virtual Network Editor
   - Click **"Change Settings"** (requires admin rights)

3. **Create VMnet2 (SOC Network)**
   - Click **"Add Network..."**
   - Select **VMnet2**
   - Type : **Host-only**
   - Subnet IP : `10.0.10.0`
   - Subnet mask : `255.255.255.0`
   - ✅ Check "Use local DHCP service"
   - DHCP start : `10.0.10.100`
   - DHCP end : `10.0.10.200`
   - Click **"OK"**

4. **Create VMnet3 (VICTIM Network)**
   - Click **"Add Network..."**
   - Select **VMnet3**
   - Type : **Host-only**
   - Subnet IP : `10.0.20.0`
   - Subnet mask : `255.255.255.0`
   - DHCP start : `10.0.20.100`
   - DHCP end : `10.0.20.200`
   - Click **"OK"**

5. **Create VMnet4 (ATTACK Network)**
   - Click **"Add Network..."**
   - Select **VMnet4**
   - Type : **Host-only**
   - Subnet IP : `10.0.30.0`
   - Subnet mask : `255.255.255.0`
   - DHCP start : `10.0.30.100`
   - DHCP end : `10.0.30.200`
   - Click **"OK"**

6. **Apply and close**

---

### Step 4 : Download ISOs

#### 4.1 Using PowerShell (Automated)

```powershell
# Create ISOs directory
New-Item -ItemType Directory -Path "C:\VMs\ISOs" -Force

# Download pfSense ISO
$url = "https://ny1.edgebsd.net/pfsense/downloads/pfSense-CE-2.7.2-RELEASE-amd64.iso.gz"
$output = "C:\VMs\ISOs\pfSense-CE-2.7.2-RELEASE-amd64.iso.gz"
Write-Host "Downloading pfSense ISO..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $output

# Extract the ISO
Write-Host "Extracting pfSense ISO..." -ForegroundColor Cyan
Expand-Archive -Path $output -DestinationPath "C:\VMs\ISOs" -Force

# Download Ubuntu ISO
$url = "https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso"
$output = "C:\VMs\ISOs\ubuntu-22.04.3-live-server-amd64.iso"
Write-Host "Downloading Ubuntu ISO..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "✓ ISOs downloaded successfully" -ForegroundColor Green
```

#### 4.2 Manual Download (If Automated Fails)

1. **pfSense**
   - Go to https://www.pfsense.org/download/
   - Download **pfSense CE 2.7.2 AMD64**
   - Extract if compressed (.gz)
   - Save to `C:\VMs\ISOs\`

2. **Ubuntu 22.04 LTS**
   - Go to https://ubuntu.com/download/server
   - Download **Ubuntu Server 22.04.3 LTS**
   - Save to `C:\VMs\ISOs\`

---

### Step 5 : Run Setup Script

#### Option A : Using Batch File (Easiest)

1. **Open File Explorer**
2. **Navigate to** : `C:\Projects\InfracentraLab\lab-guide\scripts\`
3. **Right-click** on `setup-windows.bat`
4. **Select "Run as administrator"**
5. **Follow the prompts**

#### Option B : Using PowerShell

```powershell
# Open PowerShell as Administrator
# Navigate to the scripts directory
cd "C:\Projects\InfracentraLab\lab-guide\scripts"

# Run the setup script
.\setup-windows.bat
```

---

### Step 6 : Start the Lab

#### Using Batch File

1. **Navigate to** : `C:\Projects\InfracentraLab\lab-guide\scripts\`
2. **Double-click** on `start-lab.bat`
3. **Follow the prompts**

#### Using PowerShell

```powershell
# Open PowerShell as Administrator
cd "C:\Projects\InfracentraLab\lab-guide\scripts"
.\start-lab.ps1
```

---

## 🐛 Troubleshooting Windows Issues

### Problem : Cannot Extract ZIP File

**Solution 1 : Use 7-Zip**
```powershell
# Install 7-Zip
winget install 7zip.7zip

# Extract with 7-Zip
& "C:\Program Files\7-Zip\7z.exe" x "infracentra-lab.zip" -o"C:\Projects\InfracentraLab"
```

**Solution 2 : Use PowerShell**
```powershell
# Try with PowerShell
Expand-Archive -Path "infracentra-lab.zip" -DestinationPath "C:\Projects\InfracentraLab" -Force
```

**Solution 3 : Check File Integrity**
```powershell
# Check if file is corrupted
Get-Item "infracentra-lab.zip" | Select-Object Length, LastWriteTime
# If size is 0 or very small, re-download the file
```

---

### Problem : "Access Denied" When Extracting

**Solution : Run as Administrator**
1. Right-click on the ZIP file
2. Select **"Extract All..."**
3. When prompted for location, click **"Browse"**
4. Choose a location like `C:\Projects\`
5. Click **"Extract"**

Or use PowerShell as Administrator:
```powershell
# Open PowerShell as Administrator
Expand-Archive -Path "infracentra-lab.zip" -DestinationPath "C:\Projects\InfracentraLab" -Force
```

---

### Problem : VMware Won't Start

**Solution 1 : Disable Hyper-V**
```powershell
# Open PowerShell as Administrator
bcdedit /set hypervisorlaunchtype off

# Restart your computer
Restart-Computer
```

Or manually:
1. Control Panel → Programs → Turn Windows features on or off
2. Uncheck **"Hyper-V"**
3. Uncheck **"Virtual Machine Platform"**
4. Uncheck **"Windows Hypervisor Platform"**
5. Click **"OK"**
6. Restart your computer

**Solution 2 : Check VMware Services**
```powershell
# Check VMware services
Get-Service vmware*

# Start VMware services
Start-Service vmware
Start-Service "VMware NAT Service"
Start-Service "VMware DHCP Service"
```

---

### Problem : VMnet Networks Don't Appear

**Solution : Reset VMware Network Configuration**
```powershell
# Open PowerShell as Administrator
cd "C:\Program Files (x86)\VMware\VMware Workstation"

# Reset network configuration
.\vmnetcfg.exe /reset

# Or manually configure
.\vmnetcfg.exe
```

---

### Problem : Cannot Ping VMs from Host

**Solution 1 : Check Windows Firewall**
```powershell
# Allow ICMP (ping) through Windows Firewall
New-NetFirewallRule -DisplayName "Allow ICMPv4" -Direction Inbound -Protocol ICMPv4 -Action Allow
```

**Solution 2 : Check VMware Network Adapters**
1. Open Network Connections (ncpa.cpl)
2. You should see :
   - VMware Network Adapter VMnet1
   - VMware Network Adapter VMnet2
   - VMware Network Adapter VMnet3
   - VMware Network Adapter VMnet4
3. If missing, restart VMware services

**Solution 3 : Disable Windows Firewall Temporarily (Testing Only)**
```powershell
# Disable firewall (NOT RECOMMENDED FOR PRODUCTION)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable after testing
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

---

### Problem : Docker Won't Start

**Solution 1 : Enable WSL2**
```powershell
# Open PowerShell as Administrator
wsl --install

# Restart your computer
Restart-Computer
```

**Solution 2 : Enable Hyper-V (if using Hyper-V backend)**
```powershell
# Open PowerShell as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Restart your computer
Restart-Computer
```

**Solution 3 : Check Docker Desktop Settings**
1. Open Docker Desktop
2. Go to Settings → General
3. Ensure **"Use the WSL 2 based engine"** is checked
4. Click **"Apply & Restart"**

---

### Problem : PowerShell Scripts Won't Run

**Solution : Change Execution Policy**
```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify
Get-ExecutionPolicy
# Should show: RemoteSigned
```

Or run scripts with bypass:
```powershell
powershell.exe -ExecutionPolicy Bypass -File ".\start-lab.ps1"
```

---

## 📝 Windows-Specific Tips

### Tip 1 : Use Windows Terminal

Install Windows Terminal for a better PowerShell experience:
```powershell
winget install Microsoft.WindowsTerminal
```

### Tip 2 : Create Desktop Shortcuts

Create shortcuts for easy access:

1. **Right-click on Desktop → New → Shortcut**
2. **Location** : `powershell.exe -ExecutionPolicy Bypass -File "C:\Projects\InfracentraLab\lab-guide\scripts\start-lab.ps1"`
3. **Name** : `Start Infracentra Lab`
4. **Repeat** for stop script

### Tip 3 : Use WSL2 for Linux Commands

If you need Linux commands on Windows:
```powershell
# Install WSL2
wsl --install

# Access WSL
wsl

# Now you can run Linux commands
cd /mnt/c/Projects/InfracentraLab
ls -la
```

### Tip 4 : Backup Your Configuration

```powershell
# Backup VMware configuration
Copy-Item -Path "C:\ProgramData\VMware\vmnetdhcp.conf" -Destination "C:\Backup\"
Copy-Item -Path "C:\ProgramData\VMware\vmnetcfg.conf" -Destination "C:\Backup\"

# Backup VM configurations
Get-ChildItem "C:\VMs\InfracentraLab" -Recurse -Filter "*.vmx" | 
    Copy-Item -Destination "C:\Backup\VMs\"
```

---

## ✅ Windows Installation Checklist

### Before Starting
- [ ] Windows 10/11 (64-bit) installed
- [ ] Administrator rights available
- [ ] At least 200 GB free disk space
- [ ] VT-x/AMD-V enabled in BIOS
- [ ] Hyper-V disabled (for VMware)

### Extraction
- [ ] ZIP file downloaded
- [ ] File extracted to `C:\Projects\InfracentraLab`
- [ ] All files present (check file count)

### Prerequisites
- [ ] VMware Workstation Pro installed
- [ ] Git installed (optional)
- [ ] Docker Desktop installed (for Phase 3+)
- [ ] WSL2 installed (optional but recommended)

### Configuration
- [ ] VMnet2 configured (SOC : 10.0.10.0/24)
- [ ] VMnet3 configured (VICTIM : 10.0.20.0/24)
- [ ] VMnet4 configured (ATTACK : 10.0.30.0/24)
- [ ] ISOs downloaded (pfSense, Ubuntu)

### Ready to Start
- [ ] Setup script run successfully
- [ ] VMware networks visible
- [ ] Ready to create first VM (pfSense)

---

## 🎉 You're Ready!

Your Windows environment is now ready for the Infracentra lab!

### Next Steps

1. **Read the main guide** : `README-WINDOWS.md`
2. **Start with Phase 1** : `01-VMWARE-INSTALLATION.md`
3. **Follow the steps** one by one
4. **Ask for help** if you get stuck

---

## 📞 Support

### Documentation
- Main guide : `README-WINDOWS.md`
- Summary : `SUMMARY.md`
- Progress : `PROGRESSION.md`

### Common Issues
- Check the troubleshooting section above
- Review VMware documentation
- Check the lab guides for specific phases

---

**Last updated** : 2027-01-15  
**Version** : 1.0.0 (Windows Edition)  
**Status** : ✅ Ready for Windows deployment
