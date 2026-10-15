# 🖥️ Phase 1 : Installation de Proxmox VE 8.x sur M1 (HP Laptop)

## 📋 Vue d'ensemble

**Machine cible** : HP Laptop (M1)  
**RAM** : 16 GB  
**OS** : Proxmox VE 8.x  
**Rôle** : SOC Core (pfSense, soc-siem, win-target)  
**IP** : 192.168.1.10  
**Temps estimé** : 1 heure

---

## ⚠️ Prérequis

### Matériel
- ✅ HP Laptop avec 16GB RAM
- ✅ Clé USB 8GB+ (pour l'installation)
- ✅ **Adaptateur Ethernet USB** (RECOMMANDÉ - voir note Wi-Fi ci-dessous)
- ✅ Connexion Internet pour télécharger l'ISO
- ✅ Accès au BIOS/UEFI du laptop

### Logiciel
- ✅ ISO Proxmox VE 8.x (téléchargement ci-dessous)
- ✅ Rufus ou Etcher pour créer la clé USB bootable
- ✅ Terminal SSH (pour accès distant après installation)

### ⚠️ Note importante sur le Wi-Fi

**Proxmox VE n'a PAS de support Wi-Fi natif.** Vous avez 3 options :

#### Option 1 : Adaptateur Ethernet USB (RECOMMANDÉ)
- **Avantage** : Stable, supporté nativement, performances maximales
- **Coût** : ~15-20€ pour un adaptateur USB-Ethernet
- **Configuration** : Plug & play, aucune configuration spéciale

#### Option 2 : Bridge Wi-Fi (COMPLEXE)
- **Avantage** : Pas besoin d'adaptateur supplémentaire
- **Inconvénient** : Configuration complexe, moins stable, performances réduites
- **Configuration** : Scripts personnalisés, bridge virtuel

#### Option 3 : Connexion Ethernet directe
- **Avantage** : Simple, stable
- **Inconvénient** : Nécessite un port Ethernet libre sur le router
- **Configuration** : Standard

**RECOMMANDATION** : Utilisez un **adaptateur Ethernet USB** pour la connexion principale. C'est la solution la plus fiable pour un lab de production.

---

## 📥 Étape 1 : Télécharger Proxmox VE 8.x

### 1.1 Télécharger l'ISO

```bash
# Sur votre machine actuelle (Kali ou autre)
cd ~/Downloads

# Télécharger Proxmox VE 8.2 (dernière version stable)
wget https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso/proxmox-ve_8.2-2.iso

# Vérifier l'intégrité (optionnel mais recommandé)
wget https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso/SHA256SUMS
sha256sum -c SHA256SUMS --ignore-missing
```

### 1.2 Vérifier le téléchargement

```bash
ls -lh proxmox-ve_8.2-2.iso
# Devrait afficher ~1.2GB

sha256sum proxmox-ve_8.2-2.iso
# Comparer avec le checksum officiel
```

---

## 🔧 Étape 2 : Créer la clé USB bootable

### 2.1 Sur Linux (Kali)

```bash
# Identifier la clé USB
lsblk

# Supposons que la clé USB est /dev/sdb (ATTENTION : vérifiez !)
# ⚠️ NE VOUS TROMPEZ PAS DE DISQUE !

# Créer la clé USB bootable
sudo dd bs=4M if=proxmox-ve_8.2-2.iso of=/dev/sdb conv=fdatasync status=progress

# Synchroniser
sync
```

### 2.2 Sur Windows (avec Rufus)

1. Télécharger Rufus : https://rufus.akeo.ie/
2. Insérer la clé USB
3. Lancer Rufus
4. Sélectionner :
   - **Périphérique** : Votre clé USB
   - **Type de démarrage** : Image disque (sélectionner l'ISO Proxmox)
   - **Schéma de partition** : GPT (pour UEFI) ou MBR (pour BIOS legacy)
   - **Système de fichiers** : FAT32
5. Cliquer sur "DÉMARRER"
6. Confirmer l'effacement

### 2.3 Sur macOS (avec Etcher)

1. Télécharger Etcher : https://www.balena.io/etcher/
2. Insérer la clé USB
3. Lancer Etcher
4. Sélectionner l'ISO Proxmox
5. Sélectionner la clé USB
6. Cliquer sur "Flash!"

---

## 🚀 Étape 3 : Installer Proxmox VE

### 3.1 Préparer le HP Laptop

1. **Éteindre complètement** le laptop
2. **Insérer la clé USB** bootable
3. **Insérer l'adaptateur Ethernet USB** (si utilisé)
4. **Connecter l'Ethernet** au router (192.168.1.x)

### 3.2 Accéder au BIOS/UEFI

1. Allumer le laptop
2. Appuyer immédiatement sur la touche BIOS (souvent F2, F10, F12, ou Suppr)
3. Pour HP : souvent **F10** ou **Echap** puis **F10**

### 3.3 Configurer le BIOS/UEFI

Dans le BIOS, configurer :

#### Sécurité
- **Secure Boot** : ❌ **DÉSACTIVER** (IMPORTANT !)
- **TPM** : Peut rester activé

#### Boot
- **Boot Mode** : UEFI (recommandé) ou Legacy
- **Boot Order** : USB en premier

#### Virtualisation
- **Intel VT-x** ou **AMD-V** : ✅ **ACTIVER**
- **Intel VT-d** ou **AMD-Vi** : ✅ **ACTIVER** (pour passthrough)

#### Sauvegarder et quitter
- Appuyer sur **F10** pour sauvegarder
- Confirmer le redémarrage

### 3.4 Démarrer l'installation

1. Le laptop démarre sur la clé USB
2. Menu Proxmox VE s'affiche
3. Sélectionner **"Install Proxmox Virtual Environment (Graphical)"**
4. Appuyer sur **Entrée**

### 3.5 Assistant d'installation

#### Écran 1 : License Agreement
- Lire les termes
- Cocher **"I agree"**
- Cliquer sur **"Next"**

#### Écran 2 : Target Harddisk
- **Target harddisk** : Sélectionner le disque principal du laptop
- **Filesystem** : 
  - **ext4** (recommandé pour la simplicité)
  - ou **zfs** (pour les snapshots avancés)
- **Advanced** :
  - **ashift** : 12 (pour SSD) ou 0 (pour HDD)
  - **compress** : Oui (si ZFS)
  - **copies** : 1
  - **checksum** : Oui (si ZFS)
  - **dedup** : Non (sauf si beaucoup de RAM)
  - **hdsize** : Laisser par défaut (utilise tout le disque)
- Cliquer sur **"Next"**

#### Écran 3 : Location and Time Zone
- **Country** : France (ou votre pays)
- **Time zone** : Europe/Paris (ou votre fuseau)
- **Keyboard layout** : French (ou votre langue)
- Cliquer sur **"Next"**

#### Écran 4 : Administration Password
- **Password** : Choisir un mot de passe fort (ex: `ProxmoxAdmin2027!`)
- **Confirm password** : Répéter le mot de passe
- **Email address** : Votre email (pour les notifications)
- ⚠️ **NOTEZ CE MOT DE PASSE** !
- Cliquer sur **"Next"**

#### Écran 5 : Management Interface
- **Management Interface** : Sélectionner l'interface réseau
  - Si Ethernet USB : probablement `enx<MAC>` ou `eth0`
  - Si Ethernet intégré : `eth0` ou `enpXs0`
- **Hostname (FQDN)** : `m1.lab.local` (ou `proxmox.lab.local`)
- **IP Address** : `192.168.1.10`
- **Netmask** : `255.255.255.0` (ou `/24`)
- **Gateway** : `192.168.1.1`
- **DNS Server** : `192.168.1.1` (ou `8.8.8.8`)
- Cliquer sur **"Next"**

#### Écran 6 : Confirmation
- Vérifier toutes les informations
- Cliquer sur **"Install"**

### 3.6 Installation en cours

- L'installation prend ~5-10 minutes
- Le système va :
  1. Partitionner le disque
  2. Installer les paquets de base
  3. Configurer le réseau
  4. Installer le bootloader
- **Ne pas éteindre** le laptop pendant l'installation !

### 3.7 Fin de l'installation

1. Message **"Installation complete"**
2. Retirer la clé USB
3. Cliquer sur **"Reboot"**
4. Le laptop redémarre sur Proxmox VE

---

## 🌐 Étape 4 : Configuration Réseau (CRITIQUE)

### 4.1 Problème du Wi-Fi sur Proxmox

**Proxmox VE ne supporte PAS nativement le Wi-Fi pour le management.**

Vous devez utiliser **Ethernet** pour l'interface de management.

### 4.2 Option A : Adaptateur Ethernet USB (RECOMMANDÉ)

Si vous utilisez un adaptateur Ethernet USB :

```bash
# Se connecter en local sur le laptop (clavier/écran)
# Login : root
# Password : ProxmoxAdmin2027! (celui défini à l'installation)

# Vérifier que l'adaptateur est détecté
ip link show

# Vous devriez voir quelque chose comme :
# 1: lo: <LOOPBACK,UP,LOWER_UP> ...
# 2: enp0s20f0u1: <BROADCAST,MULTICAST,UP,LOWER_UP> ...  ← Adaptateur USB
# ou
# 2: enx<MAC>: <BROADCAST,MULTICAST,UP,LOWER_UP> ...    ← Adaptateur USB

# Noter le nom de l'interface (ex: enp0s20f0u1 ou enx...)
```

#### Configurer /etc/network/interfaces

```bash
nano /etc/network/interfaces
```

Contenu :

```bash
auto lo
iface lo inet loopback

# Interface Ethernet USB (management)
auto enp0s20f0u1
iface enp0s20f0u1 inet manual

# Bridge pour le réseau physique
auto vmbr0
iface vmbr0 inet static
    address 192.168.1.10/24
    gateway 192.168.1.1
    bridge-ports enp0s20f0u1
    bridge-stp off
    bridge-fd 0
    dns-nameservers 192.168.1.1 8.8.8.8

# Note : Remplacez 'enp0s20f0u1' par le nom de VOTRE interface
```

Appliquer :

```bash
# Redémarrer le réseau
systemctl restart networking

# Ou rebooter
reboot
```

### 4.3 Option B : Configuration Wi-Fi (AVANCÉ - NON RECOMMANDÉ)

**ATTENTION** : Cette méthode est complexe et moins stable.

Si vous devez ABSOLUMENT utiliser le Wi-Fi :

```bash
# Installer les paquets Wi-Fi
apt update
apt install wpasupplicant wireless-tools

# Identifier l'interface Wi-Fi
iwconfig
# Noter le nom (ex: wlp2s0)

# Éditer /etc/network/interfaces
nano /etc/network/interfaces
```

Ajouter :

```bash
# Interface Wi-Fi (NON RECOMMANDÉ pour la production)
auto wlp2s0
iface wlp2s0 inet manual
    wpa-ssid YOUR_WIFI_SSID
    wpa-psk YOUR_WIFI_PASSWORD

# Bridge Wi-Fi (expérimental)
auto vmbr0
iface vmbr0 inet static
    address 192.168.1.10/24
    gateway 192.168.1.1
    bridge-ports wlp2s0
    bridge-stp off
    bridge-fd 0
    dns-nameservers 192.168.1.1
```

**PROBLÈMES POTENTIELS** :
- ❌ Wi-Fi peut se déconnecter
- ❌ Performances réduites
- ❌ Pas supporté officiellement par Proxmox
- ❌ Difficulté à dépanner

**RECOMMANDATION** : Utilisez un adaptateur Ethernet USB à la place.

### 4.4 Option C : Configuration Hybride (Ethernet + Wi-Fi)

Si vous voulez Ethernet pour le management et Wi-Fi pour l'accès Internet :

```bash
nano /etc/network/interfaces
```

Contenu :

```bash
auto lo
iface lo inet loopback

# Ethernet pour management (vmbr0)
auto enp0s20f0u1
iface enp0s20f0u1 inet manual

auto vmbr0
iface vmbr0 inet static
    address 192.168.1.10/24
    gateway 192.168.1.1
    bridge-ports enp0s20f0u1
    bridge-stp off
    bridge-fd 0
    dns-nameservers 192.168.1.1 8.8.8.8

# Wi-Fi pour Internet seulement (optionnel)
auto wlp2s0
iface wlp2s0 inet dhcp
    wpa-ssid YOUR_WIFI_SSID
    wpa-psk YOUR_WIFI_PASSWORD
```

---

## 🔍 Étape 5 : Vérification Post-Installation

### 5.1 Vérifier le réseau

```bash
# Vérifier l'IP
ip addr show vmbr0

# Devrait afficher :
# inet 192.168.1.10/24 scope global vmbr0

# Tester la connectivité
ping -c 4 192.168.1.1
ping -c 4 8.8.8.8

# Vérifier le DNS
nslookup proxmox.com
```

### 5.2 Accéder à l'interface web

Depuis une autre machine sur le réseau :

```bash
# Ouvrir un navigateur
https://192.168.1.10:8006

# Accepter le certificat auto-signé
# Login : root
# Password : ProxmoxAdmin2027!
```

### 5.3 Vérifier le statut des services

```bash
# Vérifier pveproxy (interface web)
systemctl status pveproxy

# Vérifier pvedaemon (API)
systemctl status pvedaemon

# Vérifier pvestatd (statistiques)
systemctl status pvestatd

# Tous doivent être "active (running)"
```

### 5.4 Mettre à jour Proxmox

```bash
# Mettre à jour les paquets
apt update
apt dist-upgrade -y

# Redémarrer si nécessaire
reboot
```

### 5.5 Configurer le dépôt Enterprise (optionnel)

Si vous avez une subscription Proxmox :

```bash
# Désactiver le dépôt no-subscription
mv /etc/apt/sources.list.d/pve-enterprise.list /etc/apt/sources.list.d/pve-enterprise.list.disabled

# Activer le dépôt no-subscription (gratuit)
cat > /etc/apt/sources.list.d/pve-no-subscription.list << 'EOF'
deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription
EOF

# Mettre à jour
apt update
```

---

## 🎯 Étape 6 : Préparation pour la Phase 2

### 6.1 Créer les bridges internes

Pour les réseaux internes (SOC, VICTIM, ATTACK) :

```bash
nano /etc/network/interfaces
```

Ajouter à la fin :

```bash
# Bridge pour réseau SOC (10.0.10.0/24)
auto vmbr1
iface vmbr1 inet manual
    bridge-ports none
    bridge-stp off
    bridge-fd 0

# Bridge pour réseau VICTIM (10.0.20.0/24)
auto vmbr2
iface vmbr2 inet manual
    bridge-ports none
    bridge-stp off
    bridge-fd 0

# Bridge pour réseau ATTACK (10.0.30.0/24)
auto vmbr3
iface vmbr3 inet manual
    bridge-ports none
    bridge-stp off
    bridge-fd 0
```

Appliquer :

```bash
systemctl restart networking
```

### 6.2 Vérifier les bridges

```bash
# Lister les bridges
brctl show

# Devrait afficher :
# bridge name     bridge id               STP enabled     interfaces
# vmbr0           8000.000000000000       no              enp0s20f0u1
# vmbr1           8000.000000000000       no
# vmbr2           8000.000000000000       no
# vmbr3           8000.000000000000       no
```

### 6.3 Télécharger les ISOs nécessaires

Sur Proxmox, télécharger les ISOs pour les VMs :

```bash
# Créer le répertoire pour les ISOs
mkdir -p /var/lib/vz/template/iso

# Télécharger Ubuntu 22.04 Server
cd /var/lib/vz/template/iso
wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso

# Télécharger pfSense
wget https://nyi.edgebsd.net/pfsense/downloads/pfSense-CE-2.7.2-RELEASE-amd64.iso.gz
gunzip pfSense-CE-2.7.2-RELEASE-amd64.iso.gz

# Télécharger Windows 10 (si vous avez la licence)
# Vous devez fournir votre propre ISO Windows 10

# Vérifier les ISOs
ls -lh /var/lib/vz/template/iso/
```

### 6.4 Configurer le stockage

```bash
# Vérifier l'espace disque
df -h

# Devrait afficher ~500GB+ de libre (selon votre disque)
```

### 6.5 Créer un utilisateur administrateur (optionnel)

Pour ne pas utiliser root :

```bash
# Via l'interface web :
# Permissions → Add → User
# Username : admin
# Realm : Proxmox VE authentication server
# Password : AdminPassword2027!
# Add to group : Administrators
```

---

## ✅ Checklist de la Phase 1

- [ ] Proxmox VE 8.x installé
- [ ] Interface de management configurée (192.168.1.10)
- [ ] Accès web fonctionnel (https://192.168.1.10:8006)
- [ ] Réseau testé (ping vers gateway et Internet)
- [ ] Bridges internes créés (vmbr1, vmbr2, vmbr3)
- [ ] ISOs téléchargés (Ubuntu, pfSense)
- [ ] Système mis à jour
- [ ] Mot de passe root noté en lieu sûr

---

## 🐛 Dépannage

### Problème : Impossible d'accéder à l'interface web

```bash
# Vérifier que pveproxy tourne
systemctl status pveproxy

# Vérifier le port 8006
ss -tlnp | grep 8006

# Vérifier le firewall
iptables -L -n

# Redémarrer pveproxy
systemctl restart pveproxy
```

### Problème : Pas de connectivité réseau

```bash
# Vérifier l'interface
ip addr show

# Vérifier la configuration
cat /etc/network/interfaces

# Tester en DHCP (si nécessaire)
nano /etc/network/interfaces
# Changer "static" en "dhcp" pour vmbr0

# Redémarrer le réseau
systemctl restart networking
```

### Problème : Wi-Fi ne fonctionne pas

**Solution** : Utilisez un adaptateur Ethernet USB. Le Wi-Fi n'est pas supporté de manière fiable sur Proxmox.

### Problème : Les VMs ne peuvent pas communiquer

```bash
# Vérifier les bridges
brctl show

# Vérifier que les bridges sont UP
ip link show vmbr1
ip link show vmbr2
ip link show vmbr3

# Si DOWN, les activer
ip link set vmbr1 up
ip link set vmbr2 up
ip link set vmbr3 up
```

---

## 📚 Ressources

- [Documentation Proxmox VE](https://pve.proxmox.com/pve-docs/)
- [Installation Guide](https://pve.proxmox.com/wiki/Installation)
- [Network Configuration](https://pve.proxmox.com/wiki/Network_Configuration)
- [Wi-Fi on Proxmox](https://forum.proxmox.com/threads/wifi-support.59358/) (non officiel)

---

## 🎉 Phase 1 Terminée !

Votre HP Laptop est maintenant un hyperviseur Proxmox VE prêt à héberger :
- ✅ pfSense VM (Phase 2)
- ✅ soc-siem VM (Phase 3)
- ✅ win-target VM (Phase 7)

**Prochaine étape** : Phase 2 - Installation de pfSense

---

**Temps estimé** : 1 heure  
**Difficulté** : ⭐⭐ (Modéré)  
**Statut** : ✅ Prêt pour la Phase 2
