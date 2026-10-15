# 🖥️ Phase 1 : Installation de VMware Workstation sur M1 (HP Laptop)

## 📋 Vue d'ensemble

**Machine cible** : HP Laptop (M1)  
**RAM** : 16 GB  
**OS Host** : Windows 10/11 ou Linux  
**Hyperviseur** : VMware Workstation Pro (gratuit pour usage personnel)  
**Rôle** : SOC Core (pfSense, soc-siem, win-target)  
**IP Host** : 192.168.1.10  
**Temps estimé** : 1 heure

---

## ⚠️ VMware vs Proxmox : Différences Clés

| Aspect | Proxmox VE | VMware Workstation |
|--------|-----------|-------------------|
| **Type** | Hyperviseur Type 1 (bare-metal) | Hyperviseur Type 2 (hosted) |
| **OS requis** | Non (remplace l'OS) | Oui (Windows/Linux en host) |
| **Performance** | Meilleure (accès direct hardware) | Légèrement réduite (overhead) |
| **Facilité** | Plus complexe | Plus simple |
| **Coût** | Gratuit (open-source) | Gratuit pour usage personnel (depuis mai 2024) |
| **Réseau** | Bridges natifs | VMnet (NAT, Host-only, Custom) |
| **Snapshot** | Oui | Oui |
| **Clones** | Oui | Oui |

**RECOMMANDATION** : VMware Workstation est plus simple pour un lab sur laptop.

---

## 📥 Étape 1 : Télécharger VMware Workstation

### 1.1 Options VMware

#### Option A : VMware Workstation Pro (RECOMMANDÉ)
- **Gratuit** pour usage personnel depuis mai 2024
- Fonctionnalités complètes
- Supporte jusqu'à 16 GB RAM par VM
- Snapshots, clones, équipes

#### Option B : VMware Workstation Player
- **Gratuit**
- Fonctionnalités limitées
- Pas de snapshots
- Moins flexible

### 1.2 Télécharger VMware Workstation Pro

```bash
# Aller sur le site officiel
https://www.vmware.com/products/workstation-pro.html

# Cliquer sur "Download Now" pour usage personnel
# Créer un compte Broadcom (requis depuis 2024)
# Télécharger la dernière version (17.x)
```

### 1.3 Obtenir une licence gratuite

```bash
# Depuis mai 2024, VMware Workstation Pro est gratuit pour usage personnel
# Pas besoin de clé de licence pour usage personnel
# Lors de l'installation, sélectionner "Use VMware Workstation 17 Player"
# ou "I want to license VMware Workstation 17 Pro" → "Personal Use License"
```

---

## 🔧 Étape 2 : Installer VMware Workstation

### 2.1 Sur Windows 10/11

1. **Lancer l'installateur**
   - Double-cliquer sur le fichier `.exe` téléchargé
   - Accepter les termes de licence

2. **Configuration de l'installation**
   - **Installation type** : Complete
   - **Enhanced Keyboard Driver** : ✅ Cocher (recommandé)
   - **Path** : C:\Program Files (x86)\VMware\VMware Workstation

3. **User Experience Settings**
   - ❌ Décocher "Help improve VMware Workstation"
   - ❌ Décocher "Check for product updates on startup"

4. **Installer**
   - Cliquer sur "Install"
   - Attendre la fin de l'installation

5. **Redémarrer** si demandé

### 2.2 Sur Linux (Ubuntu/Kali)

```bash
# Rendre le bundle exécutable
chmod +x VMware-Workstation-Full-*.bundle

# Installer les dépendances
sudo apt update
sudo apt install -y build-essential linux-headers-$(uname -r)

# Lancer l'installation
sudo ./VMware-Workstation-Full-*.bundle

# Suivre les instructions à l'écran
# Accepter les licences
# Installer les modules noyau
```

### 2.3 Configurer VMware

1. **Lancer VMware Workstation**
2. **Accepter les licences**
3. **Sélectionner "Personal Use"** (gratuit)
4. **Configurer les préférences** :
   - Edit → Preferences
   - **Memory** : "Fit all virtual machine memory into reserved host RAM"
   - **Display** : "Autodetect" ou "Accelerate 3D graphics"
   - **Updates** : Désactiver les mises à jour automatiques

---

## 🌐 Étape 3 : Configurer le Réseau VMware

### 3.1 Comprendre les réseaux VMware

VMware crée automatiquement plusieurs réseaux virtuels :

| Réseau | Type | Plage IP | Usage |
|--------|------|----------|-------|
| **VMnet0** | Bridged | 192.168.1.x | Accès au réseau physique |
| **VMnet1** | Host-only | 192.168.100.x | Communication host ↔ VMs |
| **VMnet8** | NAT | 192.168.136.x | Accès Internet via NAT |

### 3.2 Créer des réseaux personnalisés

Pour notre lab, nous avons besoin de 3 réseaux isolés :
- **SOC** (10.0.10.0/24)
- **VICTIM** (10.0.20.0/24)
- **ATTACK** (10.0.30.0/24)

#### Configuration via Virtual Network Editor

1. **Ouvrir Virtual Network Editor**
   - Edit → Virtual Network Editor
   - Cliquer sur "Change Settings" (admin rights)

2. **Créer VMnet2 (SOC Network)**
   - Cliquer sur "Add Network..."
   - Sélectionner **VMnet2**
   - Type : **Host-only**
   - Subnet IP : `10.0.10.0`
   - Subnet mask : `255.255.255.0`
   - ✅ Cocher "Use local DHCP service" (optionnel)
   - DHCP start : `10.0.10.100`
   - DHCP end : `10.0.10.200`
   - Cliquer sur "OK"

3. **Créer VMnet3 (VICTIM Network)**
   - Cliquer sur "Add Network..."
   - Sélectionner **VMnet3**
   - Type : **Host-only**
   - Subnet IP : `10.0.20.0`
   - Subnet mask : `255.255.255.0`
   - DHCP start : `10.0.20.100`
   - DHCP end : `10.0.20.200`
   - Cliquer sur "OK"

4. **Créer VMnet4 (ATTACK Network)**
   - Cliquer sur "Add Network..."
   - Sélectionner **VMnet4**
   - Type : **Host-only**
   - Subnet IP : `10.0.30.0`
   - Subnet mask : `255.255.255.0`
   - DHCP start : `10.0.30.100`
   - DHCP end : `10.0.30.200`
   - Cliquer sur "OK"

5. **Appliquer et fermer**

### 3.3 Configuration alternative via fichiers (Linux)

```bash
# Éditer le fichier de configuration
sudo nano /etc/vmware/netmap.conf

# Ajouter les lignes suivantes :
answer VNET_2_VIRTUAL_ADAPTER yes
answer VNET_2_HOSTONLY_SUBNET 10.0.10.0
answer VNET_2_HOSTONLY_MASK 255.255.255.0
answer VNET_2_HOSTONLY_DHCP yes
answer VNET_2_HOSTONLY_DHCP_START 10.0.10.100
answer VNET_2_HOSTONLY_DHCP_END 10.0.10.200

answer VNET_3_VIRTUAL_ADAPTER yes
answer VNET_3_HOSTONLY_SUBNET 10.0.20.0
answer VNET_3_HOSTONLY_MASK 255.255.255.0
answer VNET_3_HOSTONLY_DHCP yes
answer VNET_3_HOSTONLY_DHCP_START 10.0.20.100
answer VNET_3_HOSTONLY_DHCP_END 10.0.20.200

answer VNET_4_VIRTUAL_ADAPTER yes
answer VNET_4_HOSTONLY_SUBNET 10.0.30.0
answer VNET_4_HOSTONLY_MASK 255.255.255.0
answer VNET_4_HOSTONLY_DHCP yes
answer VNET_4_HOSTONLY_DHCP_START 10.0.30.100
answer VNET_4_HOSTONLY_DHCP_END 10.0.30.200

# Redémarrer les services VMware
sudo systemctl restart vmware
# ou
sudo /etc/init.d/vmware restart
```

---

## 📂 Étape 4 : Préparer le Stockage

### 4.1 Créer un répertoire pour les VMs

```bash
# Sur Windows
# Créer le dossier : C:\VMs\InfracentraLab\

# Sur Linux
mkdir -p ~/VMs/InfracentraLab/
cd ~/VMs/InfracentraLab/
```

### 4.2 Télécharger les ISOs nécessaires

```bash
# Créer un dossier pour les ISOs
mkdir -p ~/VMs/ISOs/
cd ~/VMs/ISOs/

# Télécharger pfSense
wget https://ny1.edgebsd.net/pfsense/downloads/pfSense-CE-2.7.2-RELEASE-amd64.iso.gz
gunzip pfSense-CE-2.7.2-RELEASE-amd64.iso.gz

# Télécharger Ubuntu 22.04 Server
wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso

# Télécharger Windows 10 (si vous avez la licence)
# Vous devez fournir votre propre ISO Windows 10

# Vérifier les ISOs
ls -lh ~/VMs/ISOs/
```

### 4.3 Vérifier l'espace disque

```bash
# Sur Windows
# Ouvrir l'explorateur → Clic droit sur C: → Propriétés

# Sur Linux
df -h ~

# Espace nécessaire :
# - pfSense VM : 20 GB
# - soc-siem VM : 100 GB
# - win-target VM : 60 GB
# - Total : ~180 GB minimum
```

---

## 🎯 Étape 5 : Créer la VM pfSense (Préparation)

### 5.1 Créer une nouvelle VM

1. **Ouvrir VMware Workstation**
2. **File → New Virtual Machine**
3. **Configuration type** : Custom (advanced)
4. **Next**

### 5.2 Configuration de la VM pfSense

#### Hardware Compatibility
- **Compatibility** : Workstation 17.x
- **Next**

#### Guest OS Installation
- **Installer from** : ISO image file
- **ISO** : `C:\VMs\ISOs\pfSense-CE-2.7.2-RELEASE-amd64.iso` (Windows)
  ou `/home/user/VMs/ISOs/pfSense-CE-2.7.2-RELEASE-amd64.iso` (Linux)
- **Next**

#### Guest OS
- **Guest OS** : Other
- **Version** : Other 64-bit
- **Next**

#### Virtual Machine Name
- **Name** : `pfSense`
- **Location** : `C:\VMs\InfracentraLab\pfSense` (Windows)
  ou `/home/user/VMs/InfracentraLab/pfSense` (Linux)
- **Next**

#### Processors
- **Number of processors** : 1
- **Number of cores per processor** : 2
- **Next**

#### Memory
- **Memory** : 1024 MB (1 GB)
- **Next**

#### Network Type
- **Network Connection** : Use host-only networking
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
- **Maximum disk size** : 20 GB
- **Store virtual disk as a single file** : ✅ Cocher
- **Next**

#### Specify Disk File
- **Disk file** : `pfSense.vmdk`
- **Next**

#### Ready to Create Virtual Machine
- ✅ Cocher "Power on this virtual machine after creation"
- **Finish**

### 5.3 Ajouter les interfaces réseau supplémentaires

La VM pfSense a besoin de 4 interfaces :
1. WAN (VMnet0 - Bridged)
2. SOC (VMnet2 - Host-only)
3. VICTIM (VMnet3 - Host-only)
4. ATTACK (VMnet4 - Host-only)

#### Ajouter les interfaces

1. **Éteindre la VM** (si démarrée)
2. **VM → Settings**
3. **Add → Network Adapter**
4. **Network connection** : Host-only → VMnet2
5. **Device status** : ✅ Connect at power on
6. **Finish**
7. **Répéter pour VMnet3 et VMnet4**

#### Configuration finale des interfaces

```
Network Adapter 1 : VMnet0 (Bridged) → WAN
Network Adapter 2 : VMnet2 (Host-only) → SOC
Network Adapter 3 : VMnet3 (Host-only) → VICTIM
Network Adapter 4 : VMnet4 (Host-only) → ATTACK
```

---

## ✅ Étape 6 : Vérification

### 6.1 Vérifier VMware

```bash
# Sur Windows
# Ouvrir VMware Workstation
# Vérifier que les réseaux virtuels sont configurés :
# Edit → Virtual Network Editor

# Sur Linux
vmware-networks --status
```

### 6.2 Vérifier les réseaux

```bash
# Sur Windows
ipconfig /all

# Sur Linux
ip addr show

# Vous devriez voir :
# vmnet1 : 192.168.100.1 (Host-only par défaut)
# vmnet2 : 10.0.10.1 (SOC)
# vmnet3 : 10.0.20.1 (VICTIM)
# vmnet4 : 10.0.30.1 (ATTACK)
```

### 6.3 Vérifier les ISOs

```bash
ls -lh ~/VMs/ISOs/
# Devrait afficher :
# pfSense-CE-2.7.2-RELEASE-amd64.iso
# ubuntu-22.04.3-live-server-amd64.iso
```

---

## 🐛 Dépannage

### Problème : VMware ne démarre pas sur Linux

```bash
# Vérifier les modules noyau
sudo vmware-modconfig --console --install-all

# Redémarrer les services
sudo systemctl restart vmware

# Vérifier les logs
sudo journalctl -u vmware -n 50
```

### Problème : Les réseaux VMnet n'apparaissent pas

```bash
# Sur Windows
# Ouvrir Virtual Network Editor en tant qu'administrateur
# Vérifier que les réseaux sont bien créés

# Sur Linux
sudo vmware-networks --start
sudo vmware-networks --status
```

### Problème : Impossible de créer une VM

```bash
# Vérifier l'espace disque
df -h

# Vérifier les permissions
ls -ld ~/VMs/

# Vérifier que VMware a les droits nécessaires
# Sur Windows : Lancer VMware en tant qu'administrateur
# Sur Linux : sudo vmware
```

### Problème : VT-x/AMD-V non activé

```bash
# Redémarrer le laptop
# Entrer dans le BIOS (F2, F10, ou Suppr au démarrage)
# Activer :
# - Intel VT-x ou AMD-V
# - Intel VT-d ou AMD-Vi
# Sauvegarder et redémarrer
```

---

## 📚 Ressources

- [VMware Workstation Documentation](https://docs.vmware.com/en/VMware-Workstation-Pro/)
- [VMware Networking Guide](https://docs.vmware.com/en/VMware-Workstation-Pro/17/com.vmware.ws.using.doc/GUID-289A19FF-3B12-42E6-89FA-E60C35A85B03.html)
- [VMware Community](https://communities.vmware.com/)

---

## ✅ Checklist de la Phase 1

- [ ] VMware Workstation Pro téléchargé
- [ ] VMware Workstation installé
- [ ] Licence personnelle activée (gratuite)
- [ ] Réseaux VMnet configurés (VMnet2, VMnet3, VMnet4)
- [ ] ISOs téléchargés (pfSense, Ubuntu)
- [ ] Répertoire de stockage créé
- [ ] Espace disque suffisant (~180 GB)
- [ ] VT-x/AMD-V activé dans le BIOS
- [ ] VM pfSense créée (prête pour Phase 2)

---

## 🎉 Phase 1 Terminée !

VMware Workstation est maintenant installé et configuré avec :
- ✅ 3 réseaux virtuels isolés (SOC, VICTIM, ATTACK)
- ✅ ISOs prêts pour l'installation
- ✅ VM pfSense créée (prête à être installée)

**Prochaine étape** : Phase 2 - Installation de pfSense

---

**Temps estimé** : 1 heure  
**Difficulté** : ⭐⭐ (Modéré)  
**Statut** : ✅ Prêt pour la Phase 2

---

## 📝 Notes Importantes

### Différences avec Proxmox

1. **Pas besoin d'adaptateur Ethernet USB** : VMware utilise les interfaces réseau de l'host
2. **Réseau plus simple** : VMnet au lieu de bridges physiques
3. **Performance légèrement réduite** : Overhead de l'hyperviseur Type 2
4. **Plus facile à gérer** : Interface graphique intuitive
5. **Snapshots facilités** : Un clic pour snapshotter une VM

### Avantages de VMware pour ce lab

- ✅ Installation rapide et simple
- ✅ Interface graphique conviviale
- ✅ Snapshots et clones faciles
- ✅ Pas besoin de matériel dédié
- ✅ Peut coexister avec d'autres applications
- ✅ Gratuit pour usage personnel

### Inconvénients

- ❌ Performance légèrement inférieure à Proxmox
- ❌ Nécessite un OS host (Windows/Linux)
- ❌ Moins adapté pour la production
- ❌ Ressources partagées avec l'host

**CONCLUSION** : VMware est parfait pour un lab de test et de développement sur laptop !
