# 🛡️ Phase 2 : Installation et Configuration de pfSense (VMware)

## 📋 Vue d'overview

**VM cible** : pfSense  
**Host** : M1 (VMware Workstation)  
**RAM** : 1 GB  
**CPU** : 2 cores  
**Disk** : 20 GB  
**IPs** :
- WAN : DHCP (192.168.1.x) via VMnet0
- LAN : 10.0.10.1 (SOC network) via VMnet2
- VICTIM : 10.0.20.1 via VMnet3
- ATTACK : 10.0.30.1 via VMnet4

**Rôle** : Router/Firewall pour segmentation réseau  
**Temps estimé** : 1 heure

---

## 🎯 Différences avec Proxmox

| Aspect | Proxmox | VMware |
|--------|---------|--------|
| **Réseaux** | vmbr0, vmbr1, vmbr2, vmbr3 | VMnet0, VMnet2, VMnet3, VMnet4 |
| **Interface** | Web UI Proxmox | VMware Workstation GUI |
| **Snapshots** | Oui | Oui |
| **Performance** | Native | Légèrement réduite |

---

## 🖥️ Étape 1 : Créer la VM pfSense sur VMware

### 1.1 Ouvrir VMware Workstation

```bash
# Lancer VMware Workstation
# File → Open → Sélectionner le dossier de la VM pfSense
# Ou créer une nouvelle VM si pas encore fait
```

### 1.2 Vérifier la configuration de la VM

La VM pfSense doit avoir :
- ✅ 1 GB RAM
- ✅ 2 CPU cores
- ✅ 20 GB disk
- ✅ 4 interfaces réseau :
  - Network Adapter 1 : VMnet0 (Bridged) → WAN
  - Network Adapter 2 : VMnet2 (Host-only) → SOC
  - Network Adapter 3 : VMnet3 (Host-only) → VICTIM
  - Network Adapter 4 : VMnet4 (Host-only) → ATTACK

### 1.3 Démarrer la VM

1. Sélectionner la VM pfSense
2. Cliquer sur **"Power on this virtual machine"**
3. La VM démarre sur l'ISO pfSense

---

## 🚀 Étape 2 : Installer pfSense

### 2.1 Assistant d'installation

#### Écran 1 : Welcome
- Sélectionner **"Install"**
- Appuyer sur **Entrée**

#### Écran 2 : Keymap
- Sélectionner votre layout clavier
- Appuyer sur **Entrée**

#### Écran 3 : Hostname
- **Hostname** : `pfsense`
- Appuyer sur **Entrée**

#### Écran 4 : Domain
- **Domain** : `lab.local`
- Appuyer sur **Entrée**

#### Écran 5 : Network Interface Assignment

pfSense détecte 4 interfaces (em0, em1, em2, em3) :

```
WAN (Internet facing) : em0  (VMnet0 - Bridged)
LAN (Internal network) : em1  (VMnet2 - SOC)

Do you want to configure VLANs now? (y/n) : n
```

#### Écran 6 : WAN Interface
- **WAN Interface** : `em0`
- Appuyer sur **Entrée**

#### Écran 7 : LAN Interface
- **LAN Interface** : `em1`
- Appuyer sur **Entrée**

#### Écran 8 : Confirmation
- Sélectionner **"Yes"**
- Appuyer sur **Entrée**

#### Écran 9 : Setup Networking
- **WAN : DHCP** : ✅ Yes
- **LAN IP** : `10.0.10.1`
- **Subnet mask** : `24`
- **DHCP** : ✅ Yes
- **DHCP start** : `10.0.10.100`
- **DHCP end** : `10.0.10.200`

#### Écran 10 : Set Password
- **Password** : `PfsenseAdmin2027!`
- **Confirm** : `PfsenseAdmin2027!`

#### Écran 11 : Shell
- Sélectionner **"No"**

#### Écran 12 : Reload
- Le système redémarre

### 2.2 Retirer l'ISO

```bash
# Dans VMware :
# VM → Settings → CD/DVD
# Sélectionner "Use physical drive" ou "Disconnect"
# OK
```

---

## 🔧 Étape 3 : Configurer les interfaces OPT1 et OPT2

### 3.1 Accéder à la console pfSense

```bash
# Dans VMware, la console s'ouvre automatiquement
# Login : admin
# Password : PfsenseAdmin2027!
```

### 3.2 Assigner les interfaces

```
Please select an option : 1  (Assign Interfaces)

Available interfaces :
em0 - WAN (already assigned)
em1 - LAN (already assigned)
em2 - available
em3 - available

Do you want to assign OPT1 interface? (y/n) : y
Select interface for OPT1 (em2 or em3) : em2

Do you want to assign OPT2 interface? (y/n) : y
Select interface for OPT2 (em3) : em3

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
```

### 3.5 Renommer les interfaces

```
Please select an option : 2  (Set interface(s) IP address)
Please select an option : 9  (Rename interfaces)

Enter new name for OPT1 : VICTIM
Enter new name for OPT2 : ATTACK
```

---

## 🌐 Étape 4 : Accéder à l'interface web pfSense

### 4.1 Obtenir l'IP WAN

```bash
# Dans la console pfSense, noter l'IP WAN
# Exemple : WAN -> 192.168.1.15 (via VMnet0 Bridged)
```

### 4.2 Accéder via le navigateur

```bash
# Depuis le host (M1)
http://192.168.1.15

# Login : admin
# Password : PfsenseAdmin2027!
```

### 4.3 Configuration initiale

#### Écran 1 : General Setup
- **Hostname** : `pfsense`
- **Domain** : `lab.local`
- **DNS Server** : `127.0.0.1`
- Cliquer sur **"Save"**

#### Écran 2 : Time Server
- **Timezone** : `Europe/Paris`
- Cliquer sur **"Save"**

#### Écran 3-5 : Suivre les instructions

---

## 🔥 Étape 5 : Configurer les règles de firewall

### 5.1 Règles pour LAN (SOC - 10.0.10.0/24)

```
Firewall → Rules → LAN

# Règle 1 : Allow LAN to any
Action : Pass
Interface : LAN
Protocol : any
Source : LAN net
Destination : any
Description : Allow SOC to any

# Règle 2 : Allow LAN to VICTIM
Action : Pass
Source : LAN net
Destination : 10.0.20.0/24
Description : Allow SOC to VICTIM

# Règle 3 : Allow LAN to ATTACK
Action : Pass
Source : LAN net
Destination : 10.0.30.0/24
Description : Allow SOC to ATTACK
```

### 5.2 Règles pour VICTIM (10.0.20.0/24)

```
Firewall → Rules → VICTIM

# Règle 1 : Allow VICTIM to SOC (Wazuh, Zabbix)
Action : Pass
Protocol : TCP/UDP
Source : VICTIM net
Destination : 10.0.10.10
Destination port : 1514, 10051
Description : Allow VICTIM to SOC tools

# Règle 2 : Block VICTIM to ATTACK
Action : Block
Source : VICTIM net
Destination : ATTACK net
Description : Block VICTIM from counter-attacking

# Règle 3 : Allow VICTIM to WAN
Action : Pass
Source : VICTIM net
Destination : any
Description : Allow VICTIM to Internet
```

### 5.3 Règles pour ATTACK (10.0.30.0/24)

```
Firewall → Rules → ATTACK

# Règle 1 : Allow ATTACK to VICTIM
Action : Pass
Source : ATTACK net
Destination : VICTIM net
Description : Allow Kali to attack targets

# Règle 2 : Block ATTACK to SOC
Action : Block
Source : ATTACK net
Destination : 10.0.10.0/24
Description : Block attacker from tampering with SOC

# Règle 3 : Allow ATTACK to WAN
Action : Pass
Source : ATTACK net
Destination : any
Description : Allow Kali to Internet
```

### 5.4 Appliquer les règles

```bash
# Cliquer sur "Apply Changes"
```

---

## 🧪 Étape 6 : Tester la connectivité

### 6.1 Depuis le host (M1)

```bash
# Tester l'accès aux interfaces pfSense
ping 10.0.10.1   # SOC
ping 10.0.20.1   # VICTIM
ping 10.0.30.1   # ATTACK

# Tester l'accès Internet via pfSense
ping 8.8.8.8
```

### 6.2 Créer une VM de test

```bash
# Créer une VM Ubuntu temporaire sur VMnet2 (SOC)
# IP : 10.0.10.100
# Gateway : 10.0.10.1

# Tester la connectivité
ping 10.0.10.1      # pfSense LAN
ping 10.0.20.1      # pfSense VICTIM
ping 10.0.30.1      # pfSense ATTACK
ping 8.8.8.8        # Internet
```

---

## ✅ Checklist de la Phase 2

- [ ] VM pfSense créée sur VMware
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

## 🎉 Phase 2 Terminée !

pfSense est maintenant configuré avec :
- ✅ 4 interfaces réseau (WAN + 3 LAN)
- ✅ Segmentation en 3 réseaux isolés
- ✅ Règles de firewall pour isolation
- ✅ NAT pour accès Internet
- ✅ DHCP pour attribution automatique

**Prochaine étape** : Phase 3 - Installation de soc-siem VM

---

**Temps estimé** : 1 heure  
**Difficulté** : ⭐⭐⭐ (Avancé)  
**Statut** : ✅ Prêt pour la Phase 3
