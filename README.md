# 🏠 Infracentra Home Lab - Complete Project

## 🎯 Project Overview

This is a complete cybersecurity home lab project for testing and deploying the **Infracentra** platform. The lab includes:

- ✅ **SIEM/XDR** (Wazuh)
- ✅ **Monitoring** (Zabbix)
- ✅ **Firewall/Router** (pfSense)
- ✅ **SOAR** (Shuffle) - Phase 4
- ✅ **Threat Intelligence** (MISP) - Phase 4
- ✅ **Case Management** (TheHive) - Phase 4
- ✅ **Vulnerability Scanner** (OpenVAS) - Phase 4
- ✅ And more...

---

## 🚀 Quick Start for Windows

### Option 1 : Use the Quick Start Script (Easiest)

1. **Double-click** on `START-WINDOWS.bat`
2. **Follow the prompts**
3. **Done!**

### Option 2 : Manual Setup

1. **Read the Windows guide** : `lab-guide\WINDOWS-INSTALLATION.md`
2. **Follow the steps** one by one
3. **Start with Phase 1** : `lab-guide\01-VMWARE-INSTALLATION.md`

---

## 📚 Documentation

### 📖 Main Guides

| File | Description |
|------|-------------|
| **`lab-guide\README-WINDOWS.md`** | Main guide for Windows users |
| **`lab-guide\WINDOWS-INSTALLATION.md`** | Detailed Windows installation steps |
| **`lab-guide\SUMMARY.md`** | Complete project summary |
| **`lab-guide\PROGRESSION.md`** | Track your progress |

### 🔧 Phase Guides

| Phase | File | Description | Time |
|-------|------|-------------|------|
| **1** | `01-VMWARE-INSTALLATION.md` | Install VMware Workstation | 1h |
| **2** | `02-PFSENSE-VMWARE.md` | Install pfSense firewall | 1h |
| **3** | `03-SOC-SIEM-VMWARE.md` | Install Wazuh + Zabbix | 2h |
| **4** | *TODO* | Install TheHive + Cortex + Shuffle + MISP | 3h |
| **5** | *TODO* | Install targets (DVWA, Metasploitable) | 1h |
| **6** | *TODO* | Configure Kali VM | 30min |
| **7** | *TODO* | Install Windows target | 1.5h |
| **8** | *TODO* | Configure backups | 30min |
| **9** | *TODO* | Integrate MISP | 2h |
| **10** | *TODO* | Full pipeline test | 1h |

**Total time** : ~14 hours

---

## 🗂️ Project Structure

```
infracentra-lab/
│
├── START-WINDOWS.bat              🚀 Quick start script for Windows
├── README.md                      📖 This file
│
├── lab-guide/                     📚 Documentation
│   ├── README-WINDOWS.md          Main guide (Windows)
│   ├── WINDOWS-INSTALLATION.md    Windows installation steps
│   ├── SUMMARY.md                 Complete summary
│   ├── PROGRESSION.md             Progress tracking
│   │
│   ├── 01-VMWARE-INSTALLATION.md  Phase 1
│   ├── 02-PFSENSE-VMWARE.md       Phase 2
│   ├── 03-SOC-SIEM-VMWARE.md      Phase 3
│   │
│   ├── scripts/                   🔧 Scripts
│   │   ├── setup-windows.bat      Windows setup
│   │   ├── start-lab.bat          Start lab (batch)
│   │   ├── start-lab.ps1          Start lab (PowerShell)
│   │   ├── stop-lab.ps1           Stop lab
│   │   └── soc-siem-setup.sh      Linux setup script
│   │
│   ├── wazuh/                     🛡️ Wazuh files
│   │   ├── docker-compose.yml     Deployment config
│   │   ├── generate-certs.sh      SSL certificates
│   │   └── config/                Configuration files
│   │
│   └── zabbix/                    📊 Zabbix files
│       ├── docker-compose.yml     Deployment config
│       └── config/                Configuration files
│
├── src/                           💻 Infracentra Platform (Frontend)
│   ├── pages/                     React pages
│   ├── components/                React components
│   └── data/                      Data files
│
├── backend/                       🔧 Infracentra Backend
│   ├── app/                       FastAPI application
│   └── requirements.txt           Python dependencies
│
└── frontend/                      🎨 Frontend Docker config
    └── Dockerfile                 Docker configuration
```

---

## 🎯 What You'll Build

### Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR WINDOWS LAPTOP (M1)                       │
│                         VMware Workstation                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   pfSense    │  │   soc-siem   │  │  win-target  │          │
│  │   Firewall   │  │  Wazuh+Zabbix│  │   Windows    │          │
│  │   10.0.x.1   │  │  10.0.10.10  │  │  10.0.20.10  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  Networks:                                                        │
│  • SOC (10.0.10.0/24) - Defense tools                            │
│  • VICTIM (10.0.20.0/24) - Targets                               │
│  • ATTACK (10.0.30.0/24) - Kali attacker                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Services Deployed

#### Phase 1-3 (Ready Now)
- ✅ **pfSense** - Firewall/Router with 3 isolated networks
- ✅ **Wazuh** - SIEM/XDR for threat detection
- ✅ **Zabbix** - System monitoring

#### Phase 4-10 (Documentation to Create)
- ⏳ **TheHive** - Incident response case management
- ⏳ **Cortex** - IOC enrichment and analysis
- ⏳ **Shuffle** - SOAR automation platform
- ⏳ **MISP** - Threat intelligence sharing
- ⏳ **OpenVAS** - Vulnerability scanning
- ⏳ **DVWA** - Vulnerable web app for testing
- ⏳ **Metasploitable** - Vulnerable system for testing
- ⏳ **Kali Linux** - Penetration testing platform
- ⏳ **Windows Target** - Windows system with Sysmon

---

## 🔑 Access Information

### After Installation

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **pfSense** | https://10.0.10.1 | admin | PfsenseAdmin2027! |
| **Wazuh Dashboard** | https://10.0.10.10 | admin | SecretPassword123! |
| **Wazuh API** | https://10.0.10.10:55000 | wazuh-admin | SecretPassword123! |
| **Zabbix Web** | http://10.0.10.10:8080 | Admin | zabbix |
| **soc-siem SSH** | ssh soc@10.0.10.10 | soc | SocPassword2027! |

### Network Access

From your Windows host (M1):
```powershell
# Test connectivity
ping 10.0.10.1    # pfSense
ping 10.0.10.10   # soc-siem

# Access web interfaces
Start-Process "https://10.0.10.1"      # pfSense
Start-Process "https://10.0.10.10"     # Wazuh
Start-Process "http://10.0.10.10:8080" # Zabbix
```

---

## 🛠️ Useful Commands

### Windows (PowerShell)

```powershell
# Start the lab
.\lab-guide\scripts\start-lab.ps1

# Stop the lab
.\lab-guide\scripts\stop-lab.ps1

# Test connectivity
Test-Connection 10.0.10.10
Test-NetConnection 10.0.10.10 -Port 443

# SSH to soc-siem
ssh soc@10.0.10.10
```

### Linux (soc-siem VM)

```bash
# Start all services
siem-start

# Stop all services
siem-stop

# Restart all services
siem-restart

# View logs
siem-logs

# Check Docker
docker ps
docker-compose ps
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Cannot Extract ZIP File
**Solution** : Use 7-Zip or run PowerShell as Administrator
```powershell
Expand-Archive -Path "infracentra-lab.zip" -DestinationPath "C:\Projects\" -Force
```

#### 2. VMware Won't Start
**Solution** : Disable Hyper-V
```powershell
bcdedit /set hypervisorlaunchtype off
# Restart computer
```

#### 3. VMnet Networks Don't Appear
**Solution** : Reset VMware network configuration
```powershell
cd "C:\Program Files (x86)\VMware\VMware Workstation"
.\vmnetcfg.exe /reset
```

#### 4. Cannot Ping VMs
**Solution** : Check Windows Firewall
```powershell
New-NetFirewallRule -DisplayName "Allow ICMPv4" -Direction Inbound -Protocol ICMPv4 -Action Allow
```

**Detailed troubleshooting** : See `lab-guide\WINDOWS-INSTALLATION.md`

---

## 📋 Prerequisites

### Hardware
- ✅ Windows 10/11 (64-bit)
- ✅ 16 GB RAM minimum (32 GB recommended)
- ✅ 200 GB free disk space
- ✅ VT-x/AMD-V enabled in BIOS

### Software
- ✅ VMware Workstation Pro (free for personal use)
- ✅ Administrator rights
- ✅ Internet connection

### Optional
- ⭕ Docker Desktop (for Phase 3+)
- ⭕ Git (for version control)
- ⭕ WSL2 (for Linux commands on Windows)

---

## 🎓 Learning Path

### Beginner
1. Read `WINDOWS-INSTALLATION.md`
2. Complete Phase 1 (VMware installation)
3. Complete Phase 2 (pfSense)
4. Complete Phase 3 (soc-siem)
5. Test connectivity between VMs

### Intermediate
6. Complete Phase 4 (soc-soar)
7. Complete Phase 5 (targets)
8. Complete Phase 6 (Kali)
9. Practice attacks and detection

### Advanced
10. Complete Phase 7-10
11. Integrate all tools
12. Build custom playbooks
13. Create detection rules
14. Test real-world scenarios

---

## 📞 Support

### Documentation
- **Main guide** : `lab-guide\README-WINDOWS.md`
- **Windows setup** : `lab-guide\WINDOWS-INSTALLATION.md`
- **Summary** : `lab-guide\SUMMARY.md`
- **Progress** : `lab-guide\PROGRESSION.md`

### Official Resources
- [VMware Documentation](https://docs.vmware.com/en/VMware-Workstation-Pro/)
- [pfSense Documentation](https://docs.netgate.com/pfsense/en/latest/)
- [Wazuh Documentation](https://documentation.wazuh.com/)
- [Zabbix Documentation](https://www.zabbix.com/documentation/current/)

### Community
- [VMware Community](https://communities.vmware.com/)
- [pfSense Forum](https://forum.netgate.com/)
- [Wazuh Slack](https://wazuh.com/community/join-us-on-slack/)

---

## ✅ Success Criteria

Your lab is complete when:

- [x] All VMs can ping each other
- [x] pfSense routes traffic between networks
- [x] Wazuh shows all agents connected
- [x] Zabbix monitors all hosts
- [x] TheHive, Cortex, Shuffle, MISP accessible
- [x] MISP has threat feeds synced
- [x] Cortex can query MISP
- [x] Shuffle executes playbooks on alerts
- [x] TheHive creates cases automatically
- [x] Kali can attack targets
- [x] Full pipeline works end-to-end
- [x] Backups configured
- [x] You can investigate cases with full context

---

## 🎉 Next Steps

### Option 1 : Start Installation
```powershell
# Run the quick start script
.\START-WINDOWS.bat
```

### Option 2 : Read Documentation
```powershell
# Open the main guide
start lab-guide\README-WINDOWS.md
```

### Option 3 : Continue Documentation
Ask me to create the next phases (4-10).

---

## 📊 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Documentation** | ✅ Complete | Phases 1-3 documented |
| **Scripts** | ✅ Complete | Windows + Linux scripts |
| **Wazuh Config** | ✅ Complete | Docker + certs + config |
| **Zabbix Config** | ✅ Complete | Docker + config |
| **Phase 1-3** | ✅ Ready | Guides complete |
| **Phase 4-10** | ⏳ TODO | Documentation needed |

---

## 🎯 Summary

**What you have** :
- ✅ Complete documentation for Phases 1-3
- ✅ Windows-compatible scripts and guides
- ✅ All configuration files for Wazuh and Zabbix
- ✅ Ready-to-deploy lab architecture

**What you need to do** :
1. Extract the project on Windows
2. Run `START-WINDOWS.bat`
3. Follow the guides phase by phase
4. Ask for Phase 4-10 documentation when ready

**Time to complete** : ~14 hours total

---

## 🚀 Ready to Start?

```powershell
# Just run this:
.\START-WINDOWS.bat
```

**Good luck with your lab!** 🎉

---

**Last updated** : 2027-01-15  
**Version** : 1.0.0 (Windows Compatible)  
**Status** : ✅ Ready for Windows deployment
