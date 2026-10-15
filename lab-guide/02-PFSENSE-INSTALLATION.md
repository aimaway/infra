# 🛡️ Phase 2 : Installation et Configuration de pfSense

## 📋 Vue d'ensemble

**VM cible** : pfSense  
**Host** : M1 (Proxmox)  
**RAM** : 1 GB  
**CPU** : 2 cores  
**Disk** : 20 GB  
**IPs** :
- WAN : DHCP (192.168.1.x)
- LAN : 10.0.10.1 (SOC network gateway)
- VICTIM : 10.0.20.1
- ATTACK : 10.0.30.1

**Rôle** : Router/Firewall pour segmentation réseau  
**Temps estimé** : 1 heure

---

## 🎯 Objectifs

1. ✅ Créer la VM pfSense sur Proxmox
2. ✅ Configurer 4 interfaces réseau (WAN + 3 LAN)
3. ✅ Installer pfSense CE 2.7.2
4. ✅ Configurer les interfaces et le DHCP
5. ✅ Créer les règles de firewall
6. ✅ Tester la connectivité entre réseaux

---

## 🖥️ Étape 1 : Créer la VM pfSense sur Proxmox

### 1.1 Accéder à l'interface Proxmox

```bash
# Ouvrir le navigateur
https://192.168.1.10:8006

# Login
Username : root
Password : ProxmoxAdmin2027!
```

### 1.2 Créer la VM

1. Cliquer sur **"Create VM"** (bouton en haut à droite)

#### Onglet General
- **Name** : `pfSense`
- **VM ID** : `100` (ou automatique)
- **Resource Pool** : Laisser vide
- **Start at boot** : ✅ Cocher
- **Qemu Agent** : ❌ Décocher (pfSense ne le supporte pas)

#### Onglet OS
- **ISO image** : Sélectionner `pfSense-CE-2.7.2-RELEASE-amd64.iso`
- **Type** : Other
- **Version** : Laisser par défaut

#### Onglet System
- **Graphic card** : Default
- **Machine** : q35 (pour UEFI)
- **BIOS** : OVMF (UEFI)
- **SCSI Controller** : VirtIO SCSI Single
- **OS Type** : Other
- **Qemu Agent** : ❌ Décocher

#### Onglet Disks
- **Bus/Device** : SCSI
- **Storage** : local-lvm (ou local)
- **Disk size** : `20` GB
- **Cache** : Default
- **Discard** : ✅ Cocher (si SSD)

#### Onglet CPU
- **Sockets** : `1`
- **Cores** : `2`
- **CPU type** : host (pour meilleures performances)

#### Onglet Memory
- **Memory** : `1024` MB (1 GB)
- **Ballooning** : ❌ Décocher

#### Onglet Network
- **Bridge** : `vmbr0` (pour WAN - réseau physique)
- **Model** : VirtIO
- **Firewall** : ❌ Décocher
- **VLAN tag** : Laisser vide

#### Onglet Confirm
- Vérifier toutes les informations
- ✅ Cocher **"Start after created"**
- Cliquer sur **"Finish"**

### 1.3 Ajouter les interfaces réseau supplémentaires

La VM a besoin de 4 interfaces :
1. WAN (vmbr0) - déjà configuré
2. SOC LAN (vmbr1)
3. VICTIM LAN (vmbr2)
4. ATTACK LAN (vmbr3)

```bash
# Via l'interface Proxmox :
# Sélectionner la VM pfSense (ID 100)
# Aller dans "Hardware"
# Cliquer sur "Add" → "Network Device"
```

#### Ajouter interface SOC (vmbr1)
- **Bridge** : `vmbr1`
- **Model** : VirtIO
- **Firewall** : ❌ Décocher
- Cliquer sur **"Add"**

#### Ajouter interface VICTIM (vmbr2)
- **Bridge** : `vmbr2`
- **Model** : VirtIO
- **Firewall** : ❌ Décocher
- Cliquer sur **"Add"**

#### Ajouter interface ATTACK (vmbr3)
- **Bridge** : `vmbr3`
- **Model** : VirtIO
- **Firewall** : ❌ Décocher
- Cliquer sur **"Add"**

### 1.4 Vérifier la configuration

La VM pfSense doit avoir :
- ✅ 4 interfaces réseau (net0, net1, net2, net3)
- ✅ 1 GB RAM
- ✅ 2 CPU cores
- ✅ 20 GB disk
- ✅ ISO pfSense monté

---

## 🚀 Étape 2 : Installer pfSense

### 2.1 Démarrer l'installation

1. La VM démarre automatiquement (ou cliquer sur **"Console"**)
2. Le menu pfSense s'affiche
3. Sélectionner **"Install"** et appuyer sur **Entrée**

### 2.2 Assistant d'installation

#### Écran 1 : Welcome
- Appuyer sur **Entrée** ou **A** pour Accept

#### Écran 2 : Keymap
- Sélectionner votre layout clavier (ex: French)
- Appuyer sur **Entrée**

#### Écran 3 : Hostname
- **Hostname** : `pfsense`
- Appuyer sur **Entrée**

#### Écran 4 : Domain
- **Domain** : `lab.local`
- Appuyer sur **Entrée**

#### Écran 5 : Network Interface Assignment
pfSense va détecter les 4 interfaces. Il demande de les assigner :

```
WAN (Internet facing) : vtnet0  (vmbr0 - réseau physique)
LAN (Internal network) : vtnet1  (vmbr1 - SOC network)

Do you want to configure VLANs now? (y/n) : n
```

**IMPORTANT** : pfSense ne configure que WAN et LAN à l'installation. Les interfaces OPT1 et OPT2 seront configurées après.

#### Écran 6 : WAN Interface
- **WAN Interface** : `vtnet0`
- Appuyer sur **Entrée**

#### Écran 7 : LAN Interface
- **LAN Interface** : `vtnet1`
- Appuyer sur **Entrée**

#### Écran 8 : Confirmation
- Vérifier les interfaces
- Sélectionner **"Yes"**
- Appuyer sur **Entrée**

#### Écran 9 : Setup Networking
- **WAN : DHCP** : ✅ Yes (pour obtenir IP du router 192.168.1.1)
- **LAN IP** : `10.0.10.1`
- **Subnet mask** : `24` (255.255.255.0)
- **Gateway** : Laisser vide (LAN n'a pas de gateway)
- **DHCP** : ✅ Yes
- **DHCP start** : `10.0.10.100`
- **DHCP end** : `10.0.10.200`

#### Écran 10 : Set Password
- **Password** : `PfsenseAdmin2027!`
- **Confirm** : `PfsenseAdmin2027!`

#### Écran 11 : Shell
- Sélectionner **"No"** (ne pas entrer dans le shell)
- Appuyer sur **Entrée**

#### Écran 12 : Reload
- L'installation se termine
- Le système redémarre

### 2.3 Retirer l'ISO

Après le redémarrage :

```bash
# Via l'interface Proxmox :
# Sélectionner la VM pfSense
# Aller dans "Hardware" → "CD/DVD Drive"
# Sélectionner "Do not use any media"
# Cliquer sur "OK"

# Redémarrer la VM
# "Reboot" → "Confirm"
```

---

## 🔧 Étape 3 : Configurer les interfaces OPT1 et OPT2

### 3.1 Accéder à la console pfSense

```bash
# Via l'interface Proxmox :
# Sélectionner la VM pfSense
# Cliquer sur "Console"

# Login : admin
# Password : PfsenseAdmin2027!
```

### 3.2 Assigner les interfaces

Dans le menu pfSense :

```
Please select an option : 1  (Assign Interfaces)

Available interfaces :
vtnet0 - WAN (already assigned)
vtnet1 - LAN (already assigned)
vtnet2 - available
vtnet3 - available

Do you want to assign OPT1 interface? (y/n) : y
Select interface for OPT1 (vtnet2 or vtnet3) : vtnet2

Do you want to assign OPT2 interface? (y/n) : y
Select interface for OPT2 (vtnet3) : vtnet3

Do you want to assign OPT3 interface? (y/n) : n
```

### 3.3 Configurer OPT1 (VICTIM network)

```
Please select an option : 2  (Set interface(s) IP address)

Which interface do you want to configure?
1) LAN
2) OPT1
3) OPT2
Enter your choice : 2

Set IP address for OPT1 : 10.0.20.1
Subnet mask for OPT1 : 24
Do you want to enable DHCP server on OPT1? (y/n) : y
DHCP start address : 10.0.20.100
DHCP end address : 10.0.20.200
Do you want to revert to HTTP as the webConfigurator protocol? (y/n) : n
```

### 3.4 Configurer OPT2 (ATTACK network)

```
Which interface do you want to configure?
1) LAN
2) OPT1
3) OPT2
Enter your choice : 3

Set IP address for OPT2 : 10.0.30.1
Subnet mask for OPT2 : 24
Do you want to enable DHCP server on OPT2? (y/n) : y
DHCP start address : 10.0.30.100
DHCP end address : 10.0.30.200
Do you want to revert to HTTP as the webConfigurator protocol? (y/n) : n
```

### 3.5 Renommer les interfaces (optionnel mais recommandé)

```
Please select an option : 2  (Set interface(s) IP address)
Please select an option : 9  (Rename interfaces)

Current interface names :
LAN = LAN
OPT1 = OPT1
OPT2 = OPT2

Enter new name for OPT1 (or leave blank to keep current) : VICTIM
Enter new name for OPT2 (or leave blank to keep current) : ATTACK
```

---

## 🌐 Étape 4 : Accéder à l'interface web pfSense

### 4.1 Obtenir l'IP WAN

```bash
# Dans la console pfSense, noter l'IP WAN affichée
# Exemple : WAN -> 192.168.1.15 (attribué par DHCP du router)
```

### 4.2 Accéder via le navigateur

```bash
# Depuis une machine sur le réseau 192.168.1.0/24
http://192.168.1.15

# Login : admin
# Password : PfsenseAdmin2027!
```

### 4.3 Configuration initiale via l'interface web

#### Écran 1 : General Setup
- **Hostname** : `pfsense`
- **Domain** : `lab.local`
- **DNS Server Behavior** : Use local DNS (127.0.0.1)
- Cliquer sur **"Save"**

#### Écran 2 : Time Server
- **Time server hostname** : `pool.ntp.org`
- **Timezone** : `Europe/Paris` (ou votre timezone)
- Cliquer sur **"Save"**

#### Écran 3 : WAN Interface
- **IPv4 Configuration Type** : DHCP
- Cliquer sur **"Save"**

#### Écran 4 : LAN Interface
- **IPv4 Configuration Type** : Static IPv4
- **IPv4 address** : `10.0.10.1`
- **Subnet mask** : `24`
- Cliquer sur **"Save"**

#### Écran 5 : Reload
- Cliquer sur **"Reload"** pour appliquer

---

## 🔥 Étape 5 : Configurer les règles de firewall

### 5.1 Accéder à Firewall Rules

```bash
# Via l'interface web :
# Firewall → Rules
```

### 5.2 Règles pour LAN (SOC network - 10.0.10.0/24)

#### Règle 1 : Allow LAN to any
- **Action** : Pass
- **Interface** : LAN
- **Protocol** : any
- **Source** : LAN net
- **Destination** : any
- **Description** : `Allow SOC to any`
- Cliquer sur **"Save"**

#### Règle 2 : Allow LAN to VICTIM
- **Action** : Pass
- **Interface** : LAN
- **Protocol** : any
- **Source** : LAN net
- **Destination** : VICTIM net (10.0.20.0/24)
- **Description** : `Allow SOC to VICTIM`
- Cliquer sur **"Save"**

#### Règle 3 : Allow LAN to ATTACK
- **Action** : Pass
- **Interface** : LAN
- **Protocol** : any
- **Source** : LAN net
- **Destination** : ATTACK net (10.0.30.0/24)
- **Description** : `Allow SOC to ATTACK`
- Cliquer sur **"Save"**

### 5.3 Règles pour VICTIM (10.0.20.0/24)

#### Règle 1 : Allow VICTIM to SOC (Wazuh, Zabbix)
- **Action** : Pass
- **Interface** : VICTIM
- **Protocol** : TCP/UDP
- **Source** : VICTIM net
- **Destination** : 10.0.10.10 (soc-siem)
- **Destination port range** : 1514, 10051 (Wazuh, Zabbix)
- **Description** : `Allow VICTIM to SOC tools`
- Cliquer sur **"Save"**

#### Règle 2 : Block VICTIM to ATTACK
- **Action** : Block
- **Interface** : VICTIM
- **Protocol** : any
- **Source** : VICTIM net
- **Destination** : ATTACK net
- **Description** : `Block VICTIM from counter-attacking`
- Cliquer sur **"Save"**

#### Règle 3 : Allow VICTIM to WAN (pour updates)
- **Action** : Pass
- **Interface** : VICTIM
- **Protocol** : any
- **Source** : VICTIM net
- **Destination** : any
- **Description** : `Allow VICTIM to Internet`
- Cliquer sur **"Save"**

### 5.4 Règles pour ATTACK (10.0.30.0/24)

#### Règle 1 : Allow ATTACK to VICTIM
- **Action** : Pass
- **Interface** : ATTACK
- **Protocol** : any
- **Source** : ATTACK net
- **Destination** : VICTIM net
- **Description** : `Allow Kali to attack targets`
- Cliquer sur **"Save"**

#### Règle 2 : Block ATTACK to SOC
- **Action** : Block
- **Interface** : ATTACK
- **Protocol** : any
- **Source** : ATTACK net
- **Destination** : SOC net (10.0.10.0/24)
- **Description** : `Block attacker from tampering with SOC`
- Cliquer sur **"Save"**

#### Règle 3 : Allow ATTACK to WAN (pour outils)
- **Action** : Pass
- **Interface** : ATTACK
- **Protocol** : any
- **Source** : ATTACK net
- **Destination** : any
- **Description** : `Allow Kali to Internet`
- Cliquer sur **"Save"**

### 5.5 Appliquer les règles

```bash
# Cliquer sur "Apply Changes" en haut de la page
```

---

## 🧪 Étape 6 : Tester la connectivité

### 6.1 Test depuis une VM sur le réseau SOC

```bash
# Créer une VM temporaire sur vmbr1 (SOC)
# IP : 10.0.10.100
# Gateway : 10.0.10.1

# Tester la connectivité
ping 10.0.10.1      # pfSense LAN
ping 10.0.20.1      # pfSense VICTIM
ping 10.0.30.1      # pfSense ATTACK
ping 8.8.8.8        # Internet via WAN
```

### 6.2 Test depuis une VM sur le réseau VICTIM

```bash
# Créer une VM temporaire sur vmbr2 (VICTIM)
# IP : 10.0.20.100
# Gateway : 10.0.20.1

# Tester la connectivité
ping 10.0.20.1      # pfSense VICTIM
ping 10.0.10.10     # SOC (soc-siem)
ping 8.8.8.8        # Internet

# Tester qu'on ne peut PAS atteindre ATTACK
ping 10.0.30.1      # Devrait échouer (blocké par firewall)
```

### 6.3 Test depuis une VM sur le réseau ATTACK

```bash
# Créer une VM temporaire sur vmbr3 (ATTACK)
# IP : 10.0.30.100
# Gateway : 10.0.30.1

# Tester la connectivité
ping 10.0.30.1      # pfSense ATTACK
ping 10.0.20.10     # VICTIM (devrait fonctionner)
ping 8.8.8.8        # Internet

# Tester qu'on ne peut PAS atteindre SOC
ping 10.0.10.10     # Devrait échouer (blocké par firewall)
```

---

## 📊 Étape 7 : Configurer le DHCP

### 7.1 DHCP pour SOC (LAN)

```bash
# Via l'interface web :
# Services → DHCP Server → LAN

# Range : 10.0.10.100 - 10.0.10.200
# Gateway : 10.0.10.1
# DNS servers : 10.0.10.10 (soc-siem), 8.8.8.8

# Cliquer sur "Save"
```

### 7.2 DHCP pour VICTIM

```bash
# Services → DHCP Server → VICTIM

# Range : 10.0.20.100 - 10.0.20.200
# Gateway : 10.0.20.1
# DNS servers : 10.0.10.10, 8.8.8.8

# Cliquer sur "Save"
```

### 7.3 DHCP pour ATTACK

```bash
# Services → DHCP Server → ATTACK

# Range : 10.0.30.100 - 10.0.30.200
# Gateway : 10.0.30.1
# DNS servers : 8.8.8.8

# Cliquer sur "Save"
```

---

## 🔒 Étape 8 : Configuration NAT

### 8.1 Outbound NAT

```bash
# Firewall → NAT → Outbound

# Mode : Hybrid Outbound NAT
# Cliquer sur "Save"

# Ajouter une règle pour chaque réseau :

# Règle 1 : SOC → WAN
# Interface : WAN
# Source : 10.0.10.0/24
# Translation : Interface address
# Description : NAT SOC to WAN

# Règle 2 : VICTIM → WAN
# Interface : WAN
# Source : 10.0.20.0/24
# Translation : Interface address
# Description : NAT VICTIM to WAN

# Règle 3 : ATTACK → WAN
# Interface : WAN
# Source : 10.0.30.0/24
# Translation : Interface address
# Description : NAT ATTACK to WAN

# Cliquer sur "Apply Changes"
```

---

## ✅ Checklist de la Phase 2

- [ ] VM pfSense créée sur Proxmox
- [ ] 4 interfaces réseau configurées (WAN, LAN, VICTIM, ATTACK)
- [ ] pfSense installé et démarré
- [ ] Interfaces OPT1 et OPT2 assignées
- [ ] IPs configurées (10.0.10.1, 10.0.20.1, 10.0.30.1)
- [ ] DHCP activé sur les 3 réseaux
- [ ] Règles de firewall configurées
- [ ] NAT outbound configuré
- [ ] Connectivité testée entre réseaux
- [ ] Accès web fonctionnel

---

## 🐛 Dépannage

### Problème : Impossible d'accéder à l'interface web

```bash
# Vérifier que l'IP WAN est correcte
# Dans la console pfSense, option 2 (Set interface IP)
# Vérifier WAN

# Vérifier les règles de firewall
# Firewall → Rules → WAN
# Assurez-vous qu'il y a une règle "Allow" pour votre IP source
```

### Problème : Les VMs ne peuvent pas communiquer entre réseaux

```bash
# Vérifier les règles de firewall
# Firewall → Rules → [Interface]
# Assurez-vous que les règles "Pass" sont présentes

# Vérifier le NAT
# Firewall → NAT → Outbound
# Assurez-vous que le NAT est configuré pour tous les réseaux
```

### Problème : Pas d'accès Internet depuis les VMs

```bash
# Vérifier que WAN a une IP (DHCP)
# Dans la console pfSense, option 2
# WAN devrait avoir une IP 192.168.1.x

# Vérifier le NAT outbound
# Firewall → NAT → Outbound
# Assurez-vous que les règles NAT sont présentes

# Vérifier le DNS
# System → General Setup
# DNS servers : 8.8.8.8 ou 1.1.1.1
```

---

## 📚 Ressources

- [pfSense Documentation](https://docs.netgate.com/pfsense/en/latest/)
- [pfSense Book](https://docs.netgate.com/pfsense/en/latest/book/)
- [Firewall Rules](https://docs.netgate.com/pfsense/en/latest/firewall/rules.html)
- [NAT Configuration](https://docs.netgate.com/pfsense/en/latest/nat/outbound.html)

---

## 🎉 Phase 2 Terminée !

pfSense est maintenant configuré avec :
- ✅ 4 interfaces réseau (WAN + 3 LAN)
- ✅ Segmentation en 3 réseaux isolés (SOC, VICTIM, ATTACK)
- ✅ Règles de firewall pour isolation et contrôle
- ✅ NAT pour accès Internet
- ✅ DHCP pour attribution automatique des IPs

**Prochaine étape** : Phase 3 - Installation de soc-siem VM (Wazuh + Zabbix)

---

**Temps estimé** : 1 heure  
**Difficulté** : ⭐⭐⭐ (Avancé)  
**Statut** : ✅ Prêt pour la Phase 3
