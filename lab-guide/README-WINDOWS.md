# 🏠 Infracentra Home Lab - Windows Setup Guide

## 📋 Overview

This guide helps you set up the Infracentra home lab on **Windows**.

**Hardware Requirements**:
- **M1** (HP Laptop, 16GB) : VMware Workstation + pfSense + soc-siem + win-target
- **M2** (Laptop, 16GB) : Kali Linux + soc-soar + targets
- **M3** (Intel NUC, 4GB) : Backup repository (restic)

**Networks**:
- **SOC** (10.0.10.0/24) : Defense tools (Wazuh, Zabbix, TheHive, etc.)
- **VICTIM** (10.0.20.0/24) : Vulnerable targets
- **ATTACK** (10.0.30.0/24) : Kali Linux (attacker)

---

## 🚀 Quick Start for Windows

### Prerequisites
- ✅ Windows 10/11 (64-bit)
- ✅ VMware Workstation Pro (free for personal use)
- ✅ Internet connection
- ✅ ~14 hours of time
- ✅ ~200 GB free disk space

### Installation in 10 Phases

| Phase | Machine | Task | Time | Status |
|-------|---------|------|------|--------|
| 1 | M1 | Install VMware Workstation | 1h | ✅ Ready |
| 2 | M1 | Install pfSense | 1h | ✅ Ready |
| 3 | M1 | Install soc-siem (Wazuh + Zabbix) | 2h | ✅ Ready |
| 4 | M2 | Install soc-soar (TheHive + Cortex + Shuffle + MISP) | 3h | ⏳ TODO |
| 5 | M2 | Install targets (DVWA + Metasploitable) | 1h | ⏳ TODO |
| 6 | M2 | Configure Kali VM | 30min | ⏳ TODO |
| 7 | M1 | Install win-target (Windows + Sysmon) | 1.5h | ⏳ TODO |
| 8 | M3 | Configure restic backup | 30min | ⏳ TODO |
| 9 | All | Integrate MISP with all tools | 2h | ⏳ TODO |
| 10 | All | Full pipeline test | 1h | ⏳ TODO |

**Total estimated time**: ~14 hours

---

## 📚 Documentation by Phase

### ✅ Phase 1 : VMware Workstation Installation
**File** : `01-VMWARE-INSTALLATION.md`

**Content**:
- Download VMware Workstation Pro (free)
- Step-by-step installation
- Configure VMnet networks (VMnet2, VMnet3, VMnet4)
- Prepare ISOs
- Create pfSense VM

**Result**: VMware Workstation operational on M1 with 3 isolated networks

---

### ✅ Phase 2 : pfSense Installation
**File** : `02-PFSENSE-VMWARE.md`

**Content**:
- Create pfSense VM on VMware
- Install pfSense CE 2.7.2
- Configure 4 interfaces (WAN + SOC + VICTIM + ATTACK)
- Firewall rules for segmentation
- NAT and DHCP configuration

**Result**: pfSense operational with complete network segmentation

---

### ✅ Phase 3 : soc-siem Installation
**File** : `03-SOC-SIEM-VMWARE.md`

**Content**:
- Create soc-siem VM (Ubuntu 22.04)
- Automatic installation script
- SSL certificate generation
- Deploy Wazuh (Manager + Indexer + Dashboard)
- Deploy Zabbix (Server + Web + Agent)

**Files provided**:
- `scripts/soc-siem-setup.sh` - Ubuntu installation script
- `wazuh/docker-compose.yml` - Wazuh deployment
- `wazuh/config/wazuh_cluster/wazuh_manager.conf` - Wazuh configuration
- `wazuh/generate-certs.sh` - SSL certificate generation
- `zabbix/docker-compose.yml` - Zabbix deployment

**Result**: Wazuh and Zabbix operational on soc-siem

---

## 🗂️ File Structure

```
lab-guide/
├── README-WINDOWS.md                ✅ This file
├── PROGRESSION.md                   ✅ Progress tracking
├── SUMMARY.md                       ✅ Complete summary
│
├── 01-VMWARE-INSTALLATION.md        ✅ Phase 1 (VMware)
├── 02-PFSENSE-VMWARE.md             ✅ Phase 2 (pfSense on VMware)
├── 03-SOC-SIEM-VMWARE.md            ✅ Phase 3 (soc-siem on VMware)
│
├── scripts/
│   ├── soc-siem-setup.sh            ✅ soc-siem installation script
│   ├── setup-windows.bat            ✅ Windows setup script
│   └── start-lab.bat                ✅ Start lab script
│
├── wazuh/
│   ├── docker-compose.yml           ✅ Wazuh deployment
│   ├── generate-certs.sh            ✅ SSL certificate generation
│   └── config/
│       ├── wazuh_cluster/
│       │   └── wazuh_manager.conf   ✅ Wazuh Manager configuration
│       └── wazuh_dashboard/
│           └── wazuh.yml            ✅ Wazuh Dashboard configuration
│
└── zabbix/
    ├── docker-compose.yml           ✅ Zabbix deployment
    └── config/
        └── zabbix_server.conf       ✅ Zabbix Server configuration
```

---

## 🔑 Default Credentials

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **VMware** | Local application | — | — |
| **pfSense** | https://192.168.1.X | admin | PfsenseAdmin2027! |
| **soc-siem** (SSH) | ssh soc@10.0.10.10 | soc | SocPassword2027! |
| **Wazuh Dashboard** | https://10.0.10.10 | admin | SecretPassword123! |
| **Wazuh API** | https://10.0.10.10:55000 | wazuh-admin | SecretPassword123! |
| **Zabbix Web** | http://10.0.10.10:8080 | Admin | zabbix |

---

## 🌐 IP Addresses

### Physical Network (192.168.1.0/24)
- **M1** (VMware host) : 192.168.1.10
- **M2** (Kali host) : 192.168.1.20
- **M3** (Backup) : 192.168.1.30
- **pfSense WAN** : DHCP (192.168.1.x) via VMnet0

### SOC Network (10.0.10.0/24) - VMnet2
- **pfSense LAN** : 10.0.10.1
- **soc-siem** : 10.0.10.10
- **soc-soar** : 10.0.10.11

### VICTIM Network (10.0.20.0/24) - VMnet3
- **pfSense VICTIM** : 10.0.20.1
- **win-target** : 10.0.20.10
- **linux-target** : 10.0.20.11
- **DVWA** : 10.0.20.12
- **Metasploitable** : 10.0.20.13

### ATTACK Network (10.0.30.0/24) - VMnet4
- **pfSense ATTACK** : 10.0.30.1
- **Kali VM** : 10.0.30.10

---

## 📊 Service Ports

| Service | Port | Protocol | URL |
|---------|------|----------|-----|
| pfSense Web UI | 443 | HTTPS | https://10.0.10.1 |
| Wazuh Dashboard | 443 | HTTPS | https://10.0.10.10 |
| Wazuh Agent | 1514 | TCP/UDP | — |
| Wazuh API | 55000 | HTTPS | https://10.0.10.10:55000 |
| Zabbix Web | 8080 | HTTP | http://10.0.10.10:8080 |
| Zabbix Server | 10051 | TCP | — |
| TheHive | 9000 | HTTP | http://10.0.10.11:9000 |
| Cortex | 9001 | HTTP | http://10.0.10.11:9001 |
| Shuffle | 3001 | HTTP | http://10.0.10.11:3001 |
| MISP | 8443 | HTTPS | https://10.0.10.11:8443 |
| OpenVAS | 443 | HTTPS | https://10.0.10.11:443 |
| DVWA | 80 | HTTP | http://10.0.20.12 |
| Metasploitable | 8080 | HTTP | http://10.0.20.13:8080 |

---

## 🎯 Next Steps

### Immediate
1. ✅ **Phase 1 complete** : VMware installed
2. ✅ **Phase 2 complete** : pfSense configured
3. ✅ **Phase 3 complete** : soc-siem deployed
4. ⏳ **Phase 4** : Install soc-soar (TheHive + Cortex + Shuffle + MISP)

### Short term
5. ⏳ **Phase 5** : Install targets
6. ⏳ **Phase 6** : Configure Kali
7. ⏳ **Phase 7** : Install win-target

### Long term
8. ⏳ **Phase 8** : Configure backups
9. ⏳ **Phase 9** : Integrate MISP with all tools
10. ⏳ **Phase 10** : Test complete pipeline

---

## 🐛 Troubleshooting

### Problem : Cannot access a VM

```powershell
# Check that the VM is started
# In VMware: VM → Power → Power On

# Test connectivity
ping 10.0.10.10  # From host

# Check firewall
# On pfSense: Firewall → Rules
```

### Problem : VMware won't start

```powershell
# Check that Hyper-V is disabled
# Control Panel → Programs → Turn Windows features on or off
# Uncheck "Hyper-V"
# Restart

# Check VMware services
Get-Service vmware*
Restart-Service vmware
```

### Problem : VMnet networks don't appear

```powershell
# Open Virtual Network Editor as administrator
# Check that networks are created

# Or run:
"C:\Program Files (x86)\VMware\VMware Workstation\vmnetcfg.exe"
```

### Problem : Docker won't start

```powershell
# Check status
docker ps

# Restart
docker-compose restart

# Check logs
docker-compose logs
```

---

## 📚 Resources

### Official Documentation
- [VMware Workstation](https://docs.vmware.com/en/VMware-Workstation-Pro/)
- [pfSense](https://docs.netgate.com/pfsense/en/latest/)
- [Wazuh](https://documentation.wazuh.com/)
- [Zabbix](https://www.zabbix.com/documentation/current/)

### Community
- [VMware Community](https://communities.vmware.com/)
- [pfSense Forum](https://forum.netgate.com/)
- [Wazuh Google Groups](https://groups.google.com/g/wazuh)
- [Zabbix Forum](https://www.zabbix.com/forum/)

---

## ✅ Success Criteria

Your lab is complete when:

- [x] All 3 machines can ping each other (192.168.1.x)
- [x] pfSense routes traffic between SOC, VICTIM, ATTACK
- [x] Wazuh Dashboard shows all agents connected
- [x] Zabbix shows all hosts monitored
- [x] TheHive, Cortex, Shuffle, MISP accessible via browser
- [x] MISP has threat feeds synced
- [x] Cortex can query MISP for IOCs
- [x] Shuffle playbook executes on Wazuh alert
- [x] TheHive auto-creates cases from Shuffle
- [x] Kali can scan and exploit targets
- [x] Full pipeline: Attack → Detect → Enrich → Case works
- [x] restic backs up all VMs to M3
- [x] You can investigate a case in TheHive with full MISP context

---

## 🎉 Progress

**Phases completed** : 3/10 (30%)  
**Next phase** : Phase 4 - soc-soar Installation  
**Estimated time remaining** : ~11 hours

---

**Last updated** : 2027-01-15  
**Version** : 1.0.0 (VMware Windows Edition)  
**Status** : ✅ Phases 1-3 complete, ready for Phase 4
