# 🛡️ Phase 4 : Installation de soc-soar VM (TheHive + Cortex + Shuffle + MISP + OpenVAS)

## 📋 Overview

**VM target** : soc-soar  
**Host** : M2 (Fast Kali Laptop - Best Performance)  
**IP** : 10.0.10.11  
**Network** : SOC (VMnet2)  
**RAM** : 8 GB  
**CPU** : 4 cores  
**Disk** : 120 GB  
**OS** : Ubuntu 22.04 LTS

**Services deployed** :
- ✅ TheHive (Case Management)
- ✅ Cortex (IOC Enrichment)
- ✅ Shuffle (SOAR)
- ✅ MISP (Threat Intelligence)
- ✅ OpenVAS (Vulnerability Scanner)

**Estimated time** : 3 hours

---

## 🎯 Objectives

1. ✅ Create soc-soar VM on VMware (M2)
2. ✅ Install Ubuntu 22.04 LTS
3. ✅ Run automatic installation script
4. ✅ Deploy TheHive + Cortex
5. ✅ Deploy Shuffle
6. ✅ Deploy MISP
7. ✅ Deploy OpenVAS
8. ✅ Verify and test all services
9. ✅ Access web interfaces

---

## 🖥️ Step 1 : Create soc-soar VM on VMware (M2)

### 1.1 Open VMware Workstation on M2

```powershell
# On M2 (Kali Laptop)
# Open VMware Workstation
```

### 1.2 Create New VM

1. **File → New Virtual Machine**
2. **Configuration** : Custom (advanced)
3. **Next**

### 1.3 VM Configuration

#### Hardware Compatibility
- **Compatibility** : Workstation 17.x
- **Next**

#### Guest OS Installation
- **Installer from** : ISO image file
- **ISO** : `ubuntu-22.04.3-live-server-amd64.iso`
- **Next**

#### Guest OS
- **Guest OS** : Linux
- **Version** : Ubuntu 64-bit
- **Next**

#### Virtual Machine Name
- **Name** : `soc-soar`
- **Location** : `C:\VMs\InfracentraLab\soc-soar`
- **Next**

#### Processors
- **Number of processors** : 1
- **Number of cores per processor** : 4
- **Next**

#### Memory
- **Memory** : 8192 MB (8 GB)
- **Next**

#### Network Type
- **Network Connection** : Host-only → VMnet2
- **Next**

#### I/O Controller Type
- **I/O Controller Type** : LSI Logic (recommended)
- **Next**

#### Virtual Disk Type
- **Virtual Disk Type** : SCSI (recommended)
- **Next**

#### Select a Disk
- **Disk** : Create a new virtual disk
- **Next**

#### Specify Disk Capacity
- **Maximum disk size** : 120 GB
- **Store virtual disk as a single file** : ✅ Check
- **Next**

#### Ready to Create
- ✅ Check "Power on this virtual machine after creation"
- **Finish**

---

## 🚀 Step 2 : Install Ubuntu 22.04 LTS

### 2.1 Installation

Follow the same steps as soc-siem, with these differences :

#### Network Configuration
- **Interface** : ens33 (or ens160)
- **IPv4** : Manual
- **Subnet** : `10.0.10.0/24`
- **Address** : `10.0.10.11`
- **Gateway** : `10.0.10.1`
- **Name servers** : `10.0.10.1,8.8.8.8`

#### Login
- **Username** : `soar`
- **Password** : `SoarPassword2027!`

---

## 🔧 Step 3 : Run Installation Script

### 3.1 Copy Files

```bash
# On M2 (Kali host)
# Copy files to soc-soar via SCP or VMware shared folder

scp -r lab-guide/scripts/soc-soar-setup.sh soar@10.0.10.11:/tmp/
scp -r lab-guide/thehive soar@10.0.10.11:/opt/
scp -r lab-guide/shuffle soar@10.0.10.11:/opt/
scp -r lab-guide/misp soar@10.0.10.11:/opt/
scp -r lab-guide/openvas soar@10.0.10.11:/opt/
```

### 3.2 Execute Script

```bash
# On soc-soar
sudo su -

cp /tmp/soc-soar-setup.sh /opt/
chmod +x /opt/soc-soar-setup.sh

cd /opt
./soc-soar-setup.sh
```

The script will :
1. ✅ Update system
2. ✅ Install essential packages
3. ✅ Configure network (10.0.10.11)
4. ✅ Install Docker and Docker Compose
5. ✅ Configure firewall (UFW)
6. ✅ Create data directories
7. ✅ Configure environment variables
8. ✅ Create Docker network
9. ✅ Configure swap (4GB)
10. ✅ Create management scripts

**Duration** : ~10-15 minutes

---

## 🐝 Step 4 : Deploy TheHive + Cortex

### 4.1 Copy docker-compose.yml

```bash
# On soc-soar
cd /opt/thehive

# docker-compose.yml should be in /opt/thehive
```

### 4.2 Start TheHive + Cortex

```bash
# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4.3 Wait for TheHive to be ready

```bash
# Check that all services are healthy
docker-compose ps

# Should display :
# thehive-cassandra    running (healthy)
# thehive-elasticsearch  running (healthy)
# thehive              running (healthy)
# cortex               running (healthy)
```

**Duration** : ~5-10 minutes for first startup

### 4.4 Access TheHive

```bash
# Open browser
http://10.0.10.11:9000

# Login
Username : admin@thehive.local
Password : secret
```

### 4.5 Access Cortex

```bash
# Open browser
http://10.0.10.11:9001

# Login
Username : admin@cortex.local
Password : secret
```

---

## 🔀 Step 5 : Deploy Shuffle

### 5.1 Copy docker-compose.yml

```bash
# On soc-soar
cd /opt/shuffle
```

### 5.2 Start Shuffle

```bash
# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5.3 Access Shuffle

```bash
# Open browser
http://10.0.10.11:3001

# First login - create admin account
Username : admin
Password : YourSecurePassword123!
```

---

## 🎯 Step 6 : Deploy MISP

### 6.1 Copy docker-compose.yml

```bash
# On soc-soar
cd /opt/misp
```

### 6.2 Start MISP

```bash
# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Duration** : ~10-15 minutes for first startup (MISP is heavy)

### 6.3 Access MISP

```bash
# Open browser
https://10.0.10.11:8443

# Accept self-signed certificate

# Login
Username : admin@lab.local
Password : ChangeMe123!
```

### 6.4 Generate MISP API Keys

```bash
# Via MISP web interface
1. Login as admin
2. Go to "Administration" → "List users"
3. Click on your user
4. Click "Reset auth key"
5. Copy the new key

# Create separate keys for each tool :
# - Wazuh key
# - Cortex key
# - Shuffle key
# - TheHive key
```

---

## 🔍 Step 7 : Deploy OpenVAS

### 7.1 Copy docker-compose.yml

```bash
# On soc-soar
cd /opt/openvas
```

### 7.2 Start OpenVAS

```bash
# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Duration** : ~15-20 minutes (OpenVAS needs to download feeds)

### 7.3 Access OpenVAS

```bash
# Open browser
https://10.0.10.11:443

# Login
Username : admin
Password : (set during installation)
```

---

## ✅ Step 8 : Verification and Tests

### 8.1 Check TheHive

```bash
# Check API
curl http://10.0.10.11:9001/api/v1/query

# Check via web interface
# Create a test case
```

### 8.2 Check Cortex

```bash
# Check API
curl http://10.0.10.11:9001/api/v1/status

# Check via web interface
# Run a test analyzer
```

### 8.3 Check Shuffle

```bash
# Check API
curl http://10.0.10.11:3001/api/v1/health

# Check via web interface
# Create a test workflow
```

### 8.4 Check MISP

```bash
# Check API
curl -k -H "Authorization: YOUR_API_KEY" https://10.0.10.11:8443/events/index

# Check via web interface
# Sync threat feeds
```

### 8.5 Check OpenVAS

```bash
# Check API
curl -k https://10.0.10.11:9390

# Check via web interface
# Run a test scan
```

### 8.6 Test Network Connectivity

```bash
# From soc-soar, test connectivity to other networks
ping -c 3 10.0.10.1   # pfSense LAN
ping -c 3 10.0.10.10  # soc-siem
ping -c 3 10.0.20.1   # pfSense VICTIM
ping -c 3 10.0.30.1   # pfSense ATTACK

# Test Internet access
ping -c 3 8.8.8.8
```

---

## 🎯 Step 9 : Initial Configuration

### 9.1 TheHive Configuration

#### Add Cortex as analyzer
```bash
# Via TheHive web interface
1. Administration → Configuration
2. Add Cortex server
3. URL : http://cortex:9001
4. API Key : (get from Cortex)
```

#### Configure MISP connector
```bash
# Via TheHive web interface
1. Administration → Configuration
2. Add MISP server
3. URL : https://misp:8443
4. API Key : (get from MISP)
```

### 9.2 Cortex Configuration

#### Add MISP analyzer
```bash
# Via Cortex web interface
1. Organization → Analyzers
2. Enable MISP analyzer
3. Configure MISP URL and API key
```

#### Add VirusTotal analyzer
```bash
# Via Cortex web interface
1. Organization → Analyzers
2. Enable VirusTotal analyzer
3. Configure VirusTotal API key
```

### 9.3 Shuffle Configuration

#### Create webhook for Wazuh
```bash
# Via Shuffle web interface
1. Apps → Webhooks
2. Create new webhook
3. Name : wazuh-hook
4. Copy webhook URL
5. Configure Wazuh to send alerts to this URL
```

#### Import MISP app
```bash
# Via Shuffle web interface
1. Apps → Get Apps
2. Search for MISP
3. Install MISP app
4. Configure MISP URL and API key
```

### 9.4 MISP Configuration

#### Sync threat feeds
```bash
# Via MISP web interface
1. Sync Actions → Feed Settings
2. Enable OSINT feeds
3. Click "Fetch and store all feed data"
```

#### Configure sharing
```bash
# Via MISP web interface
1. Administration → Server Settings
2. Configure sharing settings
3. Enable API access
```

---

## 🐛 Troubleshooting

### Problem : TheHive doesn't start

```bash
# Check logs
docker logs thehive

# Common issue : Elasticsearch not ready
# Wait for Elasticsearch to be healthy
docker-compose restart thehive-elasticsearch
sleep 60
docker-compose restart thehive
```

### Problem : Cortex can't connect to TheHive

```bash
# Check network
docker network ls
docker network inspect thehive_default

# Restart services
docker-compose restart cortex thehive
```

### Problem : MISP takes too long to start

```bash
# MISP is heavy, be patient
# Check logs
docker logs misp

# If stuck, increase resources
# Edit VM settings : 8GB RAM, 4 CPU cores
```

### Problem : OpenVAS feeds not downloading

```bash
# Check logs
docker logs openvas-scanner

# Manually trigger feed update
docker exec -it openvas-scanner greenbone-nvt-sync
```

---

## 📚 Resources

- [TheHive Documentation](https://docs.strangebee.com/)
- [Cortex Documentation](https://docs.strangebee.com/cortex/)
- [Shuffle Documentation](https://shuffler.io/docs)
- [MISP Documentation](https://www.circl.lu/doc/misp/)
- [OpenVAS Documentation](https://www.openvas.org/)

---

## ✅ Phase 4 Checklist

- [ ] soc-soar VM created on VMware (M2)
- [ ] Ubuntu 22.04 LTS installed
- [ ] Network configured (10.0.10.11)
- [ ] Docker and Docker Compose installed
- [ ] TheHive deployed and accessible
- [ ] Cortex deployed and accessible
- [ ] Shuffle deployed and accessible
- [ ] MISP deployed and accessible
- [ ] OpenVAS deployed and accessible
- [ ] Network connectivity tested
- [ ] Initial configuration completed

---

## 🎉 Phase 4 Complete!

soc-soar is now operational with :
- ✅ TheHive for case management
- ✅ Cortex for IOC enrichment
- ✅ Shuffle for SOAR automation
- ✅ MISP for threat intelligence
- ✅ OpenVAS for vulnerability scanning

**Next step** : Phase 5 - targets Installation

---

**Estimated time** : 3 hours  
**Difficulty** : ⭐⭐⭐⭐ (Advanced)  
**Status** : ✅ Ready for Phase 5

---

## 📊 Quick Access

| Service | URL | Login | Password |
|---------|-----|-------|----------|
| TheHive | http://10.0.10.11:9000 | admin@thehive.local | secret |
| Cortex | http://10.0.10.11:9001 | admin@cortex.local | secret |
| Shuffle | http://10.0.10.11:3001 | admin | YourSecurePassword123! |
| MISP | https://10.0.10.11:8443 | admin@lab.local | ChangeMe123! |
| OpenVAS | https://10.0.10.11:443 | admin | (set during install) |
| SSH | ssh soar@10.0.10.11 | soar | SoarPassword2027! |
