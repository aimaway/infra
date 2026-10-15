# 🛡️ Phase 3 : Installation de soc-siem VM (Wazuh + Zabbix)

## 📋 Vue d'ensemble

**VM cible** : soc-siem  
**Host** : M1 (Proxmox)  
**IP** : 10.0.10.10  
**Réseau** : SOC (vmbr1)  
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

## 🎯 Objectifs

1. ✅ Créer la VM soc-siem sur Proxmox
2. ✅ Installer Ubuntu 22.04 LTS
3. ✅ Exécuter le script d'installation automatique
4. ✅ Générer les certificats SSL pour Wazuh
5. ✅ Déployer Wazuh avec Docker Compose
6. ✅ Déployer Zabbix avec Docker Compose
7. ✅ Vérifier et tester tous les services
8. ✅ Accéder aux interfaces web

---

## 🖥️ Étape 1 : Créer la VM soc-siem sur Proxmox

### 1.1 Accéder à l'interface Proxmox

```bash
# Ouvrir le navigateur
https://192.168.1.10:8006

# Login
Username : root
Password : ProxmoxAdmin2027!
```

### 1.2 Télécharger l'ISO Ubuntu 22.04

Si ce n'est pas déjà fait :

```bash
# Sur Proxmox, via SSH ou console
cd /var/lib/vz/template/iso

# Télécharger Ubuntu 22.04 LTS
wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso

# Vérifier
ls -lh ubuntu-22.04.3-live-server-amd64.iso
```

### 1.3 Créer la VM

1. Cliquer sur **"Create VM"**

#### Onglet General
- **Name** : `soc-siem`
- **VM ID** : `101`
- **Start at boot** : ✅ Cocher
- **Qemu Agent** : ✅ Cocher (Ubuntu le supporte)

#### Onglet OS
- **ISO image** : Sélectionner `ubuntu-22.04.3-live-server-amd64.iso`
- **Type** : Linux
- **Version** : 5.x - 2.6 Kernel

#### Onglet System
- **Graphic card** : Default
- **Machine** : q35
- **BIOS** : OVMF (UEFI)
- **SCSI Controller** : VirtIO SCSI Single
- **Qemu Agent** : ✅ Cocher

#### Onglet Disks
- **Bus/Device** : SCSI
- **Storage** : local-lvm
- **Disk size** : `100` GB
- **Cache** : Write back
- **Discard** : ✅ Cocher
- **SSD emulation** : ✅ Cocher (si SSD)

#### Onglet CPU
- **Sockets** : `1`
- **Cores** : `4`
- **CPU type** : host

#### Onglet Memory
- **Memory** : `10240` MB (10 GB)
- **Ballooning** : ❌ Décocher

#### Onglet Network
- **Bridge** : `vmbr1` (SOC network)
- **Model** : VirtIO
- **Firewall** : ❌ Décocher

#### Onglet Confirm
- ✅ Cocher **"Start after created"**
- Cliquer sur **"Finish"**

---

## 🚀 Étape 2 : Installer Ubuntu 22.04 LTS

### 2.1 Démarrer l'installation

1. La VM démarre automatiquement
2. Cliquer sur **"Console"** dans Proxmox
3. Sélectionner **"Try or Install Ubuntu Server"**
4. Appuyer sur **Entrée**

### 2.2 Assistant d'installation

#### Écran 1 : Language
- Sélectionner **"English"** (ou French)
- Appuyer sur **Entrée**

#### Écran 2 : Keyboard Configuration
- **Layout** : French (ou votre langue)
- **Variant** : French
- Appuyer sur **Entrée**

#### Écran 3 : Installation Type
- Sélectionner **"Ubuntu Server"**
- Appuyer sur **Entrée**

#### Écran 4 : Network Connections
- L'interface eth0 devrait obtenir une IP via DHCP
- **IMPORTANT** : Configurer l'IP statique :
  - Sélectionner **eth0**
  - **Edit IPv4** :
    - **Manual**
    - **Subnet** : `10.0.10.0/24`
    - **Address** : `10.0.10.10`
    - **Gateway** : `10.0.10.1`
    - **Name servers** : `10.0.10.1,8.8.8.8`
  - Appuyer sur **Entrée**

#### Écran 5 : Configure Proxy
- Laisser vide
- Appuyer sur **Entrée**

#### Écran 6 : Configure Ubuntu Archive Mirror
- Laisser par défaut
- Appuyer sur **Entrée**

#### Écran 7 : Storage Configuration
- Sélectionner **"Use an entire disk"**
- Sélectionner le disque de 100GB
- ✅ Cocher **"Set up this disk as LVM group"**
- Appuyer sur **Entrée**

#### Écran 8 : Storage Layout
- Sélectionner **"Use LVM group"**
- Appuyer sur **Entrée**

#### Écran 9 : Profile Setup
- **Your name** : `SOC Admin`
- **Your server's name** : `soc-siem`
- **Pick a username** : `soc`
- **Choose a password** : `SocPassword2027!`
- **Confirm password** : `SocPassword2027!`
- ⚠️ **NOTEZ CE MOT DE PASSE** !
- Appuyer sur **Entrée**

#### Écran 10 : SSH Setup
- ✅ Cocher **"Install OpenSSH server"**
- **Import SSH identity** : No
- Appuyer sur **Entrée**

#### Écran 11 : Featured Server Snaps
- Ne rien sélectionner
- Appuyer sur **Entrée**

#### Écran 12 : Installation
- L'installation commence
- Attendre la fin (~5-10 minutes)

#### Écran 13 : Installation Complete
- Appuyer sur **"Reboot Now"**
- Retirer l'ISO (Proxmox le fait automatiquement)

### 2.3 Premier démarrage

1. La VM redémarre
2. Se connecter avec :
   - **Login** : `soc`
   - **Password** : `SocPassword2027!`

---

## 📥 Étape 3 : Copier les fichiers d'installation

### 3.1 Transférer les fichiers depuis votre machine

```bash
# Sur votre machine Kali (M2)
# Copier les fichiers vers soc-siem

scp -r lab-guide/scripts/soc-siem-setup.sh soc@10.0.10.10:/tmp/
scp -r lab-guide/wazuh soc@10.0.10.10:/opt/
scp -r lab-guide/zabbix soc@10.0.10.10:/opt/
```

### 3.2 Ou télécharger directement sur soc-siem

```bash
# Sur soc-siem
sudo su -

# Installer git
apt update
apt install -y git

# Cloner le repository (si disponible)
# cd /opt
# git clone <votre-repo>
```

---

## 🔧 Étape 4 : Exécuter le script d'installation

### 4.1 Rendre le script exécutable

```bash
# Sur soc-siem
sudo su -

# Copier le script si nécessaire
cp /tmp/soc-siem-setup.sh /opt/
chmod +x /opt/soc-siem-setup.sh
```

### 4.2 Exécuter le script

```bash
cd /opt
./soc-siem-setup.sh
```

Le script va :
1. ✅ Mettre à jour le système
2. ✅ Installer les paquets essentiels
3. ✅ Configurer le réseau (10.0.10.10)
4. ✅ Installer Docker et Docker Compose
5. ✅ Configurer le firewall (UFW)
6. ✅ Créer les répertoires de données
7. ✅ Configurer les variables d'environnement
8. ✅ Créer le réseau Docker
9. ✅ Configurer le swap (4GB)
10. ✅ Créer les scripts de gestion

**Durée** : ~10-15 minutes

### 4.3 Vérifier l'installation

```bash
# Vérifier Docker
docker --version
docker ps

# Vérifier le réseau
ip addr show eth0
ping -c 3 10.0.10.1

# Vérifier les répertoires
ls -la /opt/wazuh*
ls -la /opt/zabbix*

# Vérifier les scripts
which siem-start
which siem-stop
```

---

## 🔐 Étape 5 : Générer les certificats SSL pour Wazuh

### 5.1 Copier le script de génération

```bash
# Sur soc-siem
cd /opt/wazuh
cp /path/to/generate-certs.sh .
chmod +x generate-certs.sh
```

### 5.2 Exécuter le script

```bash
./generate-certs.sh
```

Le script va générer :
- ✅ Root CA (autorité de certification)
- ✅ Certificats pour Wazuh Indexer
- ✅ Certificats pour Wazuh Manager
- ✅ Certificats pour Wazuh Dashboard
- ✅ Certificat admin pour l'API

**Durée** : ~1 minute

### 5.3 Vérifier les certificats

```bash
ls -la config/wazuh_indexer_ssl_certs/
ls -la config/wazuh_manager_ssl_certs/
ls -la config/wazuh_dashboard_ssl_certs/
```

---

## 🐳 Étape 6 : Déployer Wazuh

### 6.1 Copier le docker-compose.yml

```bash
# Sur soc-siem
cd /opt/wazuh

# Le fichier docker-compose.yml doit être dans /opt/wazuh
# Si ce n'est pas le cas, le copier depuis votre machine
```

### 6.2 Démarrer Wazuh

```bash
# Démarrer les containers
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### 6.3 Attendre que Wazuh soit prêt

```bash
# Vérifier que tous les services sont healthy
docker-compose ps

# Devrait afficher :
# wazuh-indexer    running (healthy)
# wazuh-manager    running (healthy)
# wazuh-dashboard  running (healthy)
```

**Durée** : ~5-10 minutes pour le premier démarrage

### 6.4 Accéder à Wazuh Dashboard

```bash
# Ouvrir le navigateur
https://10.0.10.10

# Accepter le certificat auto-signé

# Login
Username : admin
Password : SecretPassword123!
```

---

## 📊 Étape 7 : Déployer Zabbix

### 7.1 Copier le docker-compose.yml

```bash
# Sur soc-siem
cd /opt/zabbix

# Le fichier docker-compose.yml doit être dans /opt/zabbix
```

### 7.2 Démarrer Zabbix

```bash
# Démarrer les containers
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### 7.3 Attendre que Zabbix soit prêt

```bash
# Vérifier que tous les services sont healthy
docker-compose ps

# Devrait afficher :
# zabbix-postgres      running (healthy)
# zabbix-server        running (healthy)
# zabbix-web           running (healthy)
# zabbix-java-gateway  running
# zabbix-agent         running
```

**Durée** : ~3-5 minutes pour le premier démarrage

### 7.4 Accéder à Zabbix Web

```bash
# Ouvrir le navigateur
http://10.0.10.10:8080

# Login
Username : Admin
Password : zabbix
```

---

## ✅ Étape 8 : Vérification et Tests

### 8.1 Vérifier Wazuh

```bash
# Vérifier l'API Wazuh
curl -k -u wazuh-admin:SecretPassword123! https://10.0.10.10:55000/

# Vérifier le statut du manager
docker exec wazuh-manager /var/ossec/bin/wazuh-control status

# Vérifier les agents connectés
docker exec wazuh-manager /var/ossec/bin/manage_agents -l
```

### 8.2 Vérifier Zabbix

```bash
# Vérifier l'API Zabbix
curl -X POST http://10.0.10.10:8080/api_jsonrpc.php \
  -H "Content-Type: application/json-rpc" \
  -d '{
    "jsonrpc": "2.0",
    "method": "apiinfo.version",
    "id": 1,
    "auth": null,
    "params": {}
  }'

# Vérifier les hosts monitorés
# Via l'interface web : Configuration → Hosts
```

### 8.3 Vérifier la connectivité réseau

```bash
# Depuis soc-siem, tester la connectivité vers les autres réseaux
ping -c 3 10.0.10.1   # pfSense LAN
ping -c 3 10.0.20.1   # pfSense VICTIM
ping -c 3 10.0.30.1   # pfSense ATTACK

# Tester l'accès Internet
ping -c 3 8.8.8.8
```

### 8.4 Vérifier les logs

```bash
# Logs Wazuh
docker logs wazuh-manager --tail 50
docker logs wazuh-indexer --tail 50
docker logs wazuh-dashboard --tail 50

# Logs Zabbix
docker logs zabbix-server --tail 50
docker logs zabbix-web --tail 50
```

---

## 🎯 Étape 9 : Configuration Initiale

### 9.1 Configuration Wazuh

#### Ajouter un agent (exemple : win-target)

```bash
# Sur win-target (Windows 10)
# Télécharger l'agent Wazuh depuis https://packages.wazuh.com/4.x/windows/
# Installer avec les paramètres suivants :
#   WAZUH_MANAGER: 10.0.10.10
#   WAZUH_REGISTRATION_SERVER: 10.0.10.10
```

#### Configurer les règles personnalisées

```bash
# Sur soc-siem
docker exec -it wazuh-manager bash

# Créer une règle personnalisée
cat > /var/ossec/etc/rules/local_rules.xml << 'EOF'
<group name="local,syslog,sshd,">
  <rule id="100001" level="5">
    <if_sid>5716</if_sid>
    <srcip>10.0.30.0/24</srcip>
    <description>SSH attack from ATTACK network</description>
  </rule>
</group>
EOF

# Redémarrer le manager
/var/ossec/bin/wazuh-control restart
```

### 9.2 Configuration Zabbix

#### Ajouter un host (exemple : soc-siem lui-même)

```bash
# Via l'interface web Zabbix
# Configuration → Hosts → Create host
# Host name : soc-siem
# Groups : Linux servers
# Interfaces :
#   Type : Agent
#   IP address : 10.0.10.10
#   Port : 10050
# Templates : Linux by Zabbix agent
```

#### Configurer les notifications

```bash
# Via l'interface web Zabbix
# Administration → Media types → Email
# Configurer SMTP pour recevoir les alertes
```

---

## 🐛 Dépannage

### Problème : Wazuh Dashboard ne démarre pas

```bash
# Vérifier les logs
docker logs wazuh-dashboard

# Problème courant : certificats SSL
# Régénérer les certificats
./generate-certs.sh

# Redémarrer
docker-compose restart
```

### Problème : Zabbix Web ne démarre pas

```bash
# Vérifier les logs
docker logs zabbix-web

# Problème courant : base de données non initialisée
# Attendre que PostgreSQL soit prêt
docker-compose restart zabbix-postgres
sleep 30
docker-compose restart zabbix-web
```

### Problème : Impossible d'accéder aux interfaces

```bash
# Vérifier que les containers tournent
docker ps

# Vérifier les ports
ss -tlnp | grep -E '443|8080|55000'

# Vérifier le firewall
ufw status

# Ouvrir les ports si nécessaire
ufw allow 443/tcp
ufw allow 8080/tcp
ufw allow 55000/tcp
```

### Problème : Les agents Wazuh ne se connectent pas

```bash
# Vérifier que le manager écoute
docker exec wazuh-manager netstat -tlnp | grep 1514

# Vérifier les logs du manager
docker logs wazuh-manager | grep -i agent

# Tester la connectivité depuis l'agent
telnet 10.0.10.10 1514
```

---

## 📚 Ressources

- [Wazuh Documentation](https://documentation.wazuh.com/)
- [Wazuh Docker](https://documentation.wazuh.com/current/docker/)
- [Zabbix Documentation](https://www.zabbix.com/documentation/current/)
- [Zabbix Docker](https://www.zabbix.com/documentation/current/en/manual/install/containers)

---

## ✅ Checklist de la Phase 3

- [ ] VM soc-siem créée sur Proxmox
- [ ] Ubuntu 22.04 LTS installé
- [ ] Réseau configuré (10.0.10.10)
- [ ] Docker et Docker Compose installés
- [ ] Firewall configuré
- [ ] Certificats SSL générés
- [ ] Wazuh déployé et accessible
- [ ] Zabbix déployé et accessible
- [ ] Connectivité réseau testée
- [ ] Configuration initiale effectuée

---

## 🎉 Phase 3 Terminée !

soc-siem est maintenant opérationnel avec :
- ✅ Wazuh SIEM/XDR (Manager + Indexer + Dashboard)
- ✅ Zabbix Monitoring (Server + Web + Agent)
- ✅ Certificats SSL configurés
- ✅ Firewall et sécurité en place
- ✅ Prêt à recevoir les agents et les logs

**Prochaine étape** : Phase 4 - Installation de soc-soar VM (TheHive + Cortex + Shuffle + MISP)

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

## 🛠️ Commandes Utiles

```bash
# Démarrer tous les services
siem-start

# Arrêter tous les services
siem-stop

# Redémarrer tous les services
siem-restart

# Voir les logs
siem-logs

# Statut des containers
docker ps

# Logs Wazuh
docker logs wazuh-manager -f

# Logs Zabbix
docker logs zabbix-server -f
```
