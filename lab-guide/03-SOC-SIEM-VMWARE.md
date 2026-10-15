# 🛡️ Phase 3 : Installation de soc-siem VM (Wazuh + Zabbix) - VMware

## 📋 Vue d'ensemble

**VM cible** : soc-siem  
**Host** : M1 (VMware Workstation)  
**IP** : 10.0.10.10  
**Réseau** : SOC (VMnet2)  
**RAM** : 10 GB  
**CPU** : 4 cores  
**Disk** : 100 GB  
**OS** : Ubuntu 22.04 LTS

**Services déployés** :
- ✅ Wazuh Manager (SIEM/XDR)
- ✅ Wazuh Indexer (Elasticsearch)
- ✅ Wazuh Dashboard (Interface web)
- ✅ Zabbix Server (Monitoring)
- ✅ Zabbix Web (Interface web)
- ✅ Zabbix Agent (Monitoring du host)

**Temps estimé** : 2 heures

---

## 🖥️ Étape 1 : Créer la VM soc-siem sur VMware

### 1.1 Créer une nouvelle VM

1. **File → New Virtual Machine**
2. **Configuration** : Custom (advanced)
3. **Next**

### 1.2 Configuration

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
- **Name** : `soc-siem`
- **Location** : `C:\VMs\InfracentraLab\soc-siem` (Windows)
- **Next**

#### Processors
- **Number of processors** : 1
- **Number of cores per processor** : 4
- **Next**

#### Memory
- **Memory** : 10240 MB (10 GB)
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
- **Maximum disk size** : 100 GB
- **Store virtual disk as a single file** : ✅ Cocher
- **Next**

#### Specify Disk File
- **Disk file** : `soc-siem.vmdk`
- **Next**

#### Ready to Create
- ✅ Cocher "Power on this virtual machine after creation"
- **Finish**

---

## 🚀 Étape 2 : Installer Ubuntu 22.04 LTS

### 2.1 Installation

Suivre les mêmes étapes que pour Proxmox (voir `03-SOC-SIEM-INSTALLATION.md`), avec ces différences :

#### Configuration réseau
- **Interface** : ens33 (ou ens160 selon VMware)
- **IPv4** : Manual
- **Subnet** : `10.0.10.0/24`
- **Address** : `10.0.10.10`
- **Gateway** : `10.0.10.1`
- **Name servers** : `10.0.10.1,8.8.8.8`

#### Login
- **Username** : `soc`
- **Password** : `SocPassword2027!`

---

## 🔧 Étape 3 : Exécuter le script d'installation

### 3.1 Copier les fichiers

```bash
# Depuis votre machine hôte (M1)
# Copier les fichiers vers soc-siem via SCP ou partage de dossier VMware

# Option 1 : SCP
scp -r lab-guide/scripts/soc-siem-setup.sh soc@10.0.10.10:/tmp/
scp -r lab-guide/wazuh soc@10.0.10.10:/opt/
scp -r lab-guide/zabbix soc@10.0.10.10:/opt/

# Option 2 : Partage de dossier VMware
# VM → Settings → Options → Shared Folders
# Ajouter un dossier partagé
# Monter dans la VM : sudo mount -t fuse.vmware-vmblock .vmware-vmblock /mnt/hgfs
```

### 3.2 Exécuter le script

```bash
# Sur soc-siem
sudo su -

# Copier le script si nécessaire
cp /tmp/soc-siem-setup.sh /opt/
chmod +x /opt/soc-siem-setup.sh

# Exécuter
cd /opt
./soc-siem-setup.sh
```

---

## 🔐 Étape 4 : Générer les certificats SSL

```bash
# Sur soc-siem
cd /opt/wazuh
./generate-certs.sh
```

---

## 🐳 Étape 5 : Déployer Wazuh et Zabbix

```bash
# Déployer Wazuh
cd /opt/wazuh
docker-compose up -d

# Déployer Zabbix
cd /opt/zabbix
docker-compose up -d

# Vérifier
docker ps
```

---

## ✅ Étape 6 : Vérification

### 6.1 Accéder aux interfaces

```bash
# Wazuh Dashboard
https://10.0.10.10
# Login : admin / SecretPassword123!

# Zabbix Web
http://10.0.10.10:8080
# Login : Admin / zabbix
```

### 6.2 Tester depuis le host (M1)

```bash
# Sur M1 (Windows ou Linux)
ping 10.0.10.10
curl -k https://10.0.10.10
curl http://10.0.10.10:8080
```

---

## 🎉 Phase 3 Terminée !

soc-siem est maintenant opérationnel avec :
- ✅ Wazuh SIEM/XDR
- ✅ Zabbix Monitoring
- ✅ Certificats SSL configurés
- ✅ Prêt à recevoir les agents

**Prochaine étape** : Phase 4 - Installation de soc-soar VM

---

**Temps estimé** : 2 heures  
**Difficulté** : ⭐⭐⭐ (Avancé)  
**Statut** : ✅ Prêt pour la Phase 4

---

## 📊 Accès Rapide

| Service | URL | Login | Password |
|---------|-----|-------|----------|
| Wazuh Dashboard | https://10.0.10.10 | admin | SecretPassword123! |
| Wazuh API | https://10.0.10.10:55000 | wazuh-admin | SecretPassword123! |
| Zabbix Web | http://10.0.10.10:8080 | Admin | zabbix |
| SSH | ssh soc@10.0.10.10 | soc | SocPassword2027! |
