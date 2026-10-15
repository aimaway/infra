# 🏠 Home Lab Infracentra - Guide Complet

## 📋 Vue d'ensemble

Ce guide documente l'installation complète d'un home lab de cybersécurité pour tester et déployer la plateforme Infracentra.

**Architecture** :
- **M1** (HP Laptop, 16GB) : Proxmox VE + pfSense + soc-siem + win-target
- **M2** (Laptop, 16GB) : Kali Linux + soc-soar + targets
- **M3** (Intel NUC, 4GB) : Backup repository (restic)

**Réseaux** :
- **SOC** (10.0.10.0/24) : Outils de défense (Wazuh, Zabbix, TheHive, etc.)
- **VICTIM** (10.0.20.0/24) : Cibles vulnérables
- **ATTACK** (10.0.30.0/24) : Kali Linux (attaquant)

---

## 🚀 Démarrage Rapide

### Prérequis
- ✅ 3 machines physiques (voir spécifications ci-dessus)
- ✅ Adaptateur Ethernet USB (recommandé pour M1)
- ✅ Connexion Internet
- ✅ ~14 heures de temps

### Installation en 10 Phases

| Phase | Machine | Tâche | Temps | Statut |
|-------|---------|-------|-------|--------|
| 1 | M1 | Installation Proxmox VE | 1h | ✅ Terminé |
| 2 | M1 | Installation pfSense | 1h | ✅ Terminé |
| 3 | M1 | Installation soc-siem (Wazuh + Zabbix) | 2h | ✅ Terminé |
| 4 | M2 | Installation soc-soar (TheHive + Cortex + Shuffle + MISP) | 3h | ⏳ À faire |
| 5 | M2 | Installation targets (DVWA + Metasploitable) | 1h | ⏳ À faire |
| 6 | M2 | Configuration Kali VM | 30min | ⏳ À faire |
| 7 | M1 | Installation win-target (Windows + Sysmon) | 1.5h | ⏳ À faire |
| 8 | M3 | Configuration restic backup | 30min | ⏳ À faire |
| 9 | All | Intégration MISP avec tous les outils | 2h | ⏳ À faire |
| 10 | All | Test complet du pipeline | 1h | ⏳ À faire |

**Total estimé** : ~14 heures

---

## 📚 Documentation par Phase

### ✅ Phase 1 : Proxmox VE Installation
**Fichier** : `01-PROXMOX-INSTALLATION.md`

**Contenu** :
- Téléchargement de l'ISO Proxmox VE 8.x
- Création de la clé USB bootable
- Installation étape par étape
- Configuration réseau (Ethernet + bridges)
- Préparation pour les VMs

**Résultat** : Proxmox VE opérationnel sur M1 avec 3 bridges internes (vmbr1, vmbr2, vmbr3)

---

### ✅ Phase 2 : pfSense Installation
**Fichier** : `02-PFSENSE-INSTALLATION.md`

**Contenu** :
- Création de la VM pfSense sur Proxmox
- Installation de pfSense CE 2.7.2
- Configuration des 4 interfaces (WAN + SOC + VICTIM + ATTACK)
- Règles de firewall pour segmentation
- Configuration NAT et DHCP

**Résultat** : pfSense opérationnel avec segmentation réseau complète

---

### ✅ Phase 3 : soc-siem Installation
**Fichier** : `03-SOC-SIEM-INSTALLATION.md`

**Contenu** :
- Création de la VM soc-siem (Ubuntu 22.04)
- Script d'installation automatique (`scripts/soc-siem-setup.sh`)
- Génération des certificats SSL (`wazuh/generate-certs.sh`)
- Déploiement Wazuh (Manager + Indexer + Dashboard)
- Déploiement Zabbix (Server + Web + Agent)

**Fichiers fournis** :
- `scripts/soc-siem-setup.sh` - Script d'installation Ubuntu
- `wazuh/docker-compose.yml` - Déploiement Wazuh
- `wazuh/config/wazuh_cluster/wazuh_manager.conf` - Configuration Wazuh
- `wazuh/config/wazuh_dashboard/wazuh.yml` - Configuration Dashboard
- `wazuh/generate-certs.sh` - Génération certificats SSL
- `zabbix/docker-compose.yml` - Déploiement Zabbix
- `zabbix/config/zabbix_server.conf` - Configuration Zabbix

**Résultat** : Wazuh et Zabbix opérationnels sur soc-siem

---

### ⏳ Phase 4 : soc-soar Installation (À FAIRE)
**Fichier** : `04-SOC-SOAR-INSTALLATION.md` (À créer)

**Contenu prévu** :
- Création de la VM soc-soar (Ubuntu 22.04)
- Déploiement TheHive (Case Management)
- Déploiement Cortex (IOC Enrichment)
- Déploiement Shuffle (SOAR)
- Déploiement MISP (Threat Intelligence)
- Déploiement OpenVAS (Vulnerability Scanner)

**Services** :
- TheHive : http://10.0.10.11:9000
- Cortex : http://10.0.10.11:9001
- Shuffle : http://10.0.10.11:3001
- MISP : https://10.0.10.11:8443
- OpenVAS : https://10.0.10.11:443

---

### ⏳ Phase 5 : targets Installation (À FAIRE)
**Fichier** : `05-TARGETS-INSTALLATION.md` (À créer)

**Contenu prévu** :
- Création de la VM targets (Ubuntu 22.04)
- Déploiement DVWA (Damn Vulnerable Web Application)
- Déploiement Metasploitable 2
- Déploiement linux-target (Ubuntu Server)

**Services** :
- DVWA : http://10.0.20.12
- Metasploitable : http://10.0.20.13:8080
- linux-target : SSH sur 10.0.20.11

---

### ⏳ Phase 6 : Kali Configuration (À FAIRE)
**Fichier** : `06-KALI-CONFIGURATION.md` (À créer)

**Contenu prévu** :
- Configuration réseau de Kali VM
- Ajout des routes vers pfSense
- Installation des outils nécessaires
- Configuration pour attaquer les targets

---

### ⏳ Phase 7 : win-target Installation (À FAIRE)
**Fichier** : `07-WIN-TARGET-INSTALLATION.md` (À créer)

**Contenu prévu** :
- Création de la VM win-target (Windows 10)
- Installation de Sysmon
- Installation de l'agent Wazuh
- Configuration pour monitoring

---

### ⏳ Phase 8 : restic Backup (À FAIRE)
**Fichier** : `08-RESTIC-BACKUP.md` (À créer)

**Contenu prévu** :
- Configuration de restic sur M3
- Configuration des backups sur toutes les VMs Linux
- Planification des backups automatiques

---

### ⏳ Phase 9 : Intégration MISP (À FAIRE)
**Fichier** : `09-MISP-INTEGRATION.md` (À créer)

**Contenu prévu** :
- Intégration Wazuh → MISP
- Intégration Cortex → MISP
- Intégration Shuffle → MISP
- Intégration TheHive ↔ MISP
- Configuration des feeds MISP

---

### ⏳ Phase 10 : Test Complet (À FAIRE)
**Fichier** : `10-FULL-PIPELINE-TEST.md` (À créer)

**Contenu prévu** :
- Scénario d'attaque complet
- Détection par Wazuh
- Orchestration par Shuffle
- Enrichissement par Cortex/MISP
- Création de cas dans TheHive
- Investigation et résolution

---

## 🗂️ Structure des Fichiers

```
lab-guide/
├── README.md                          ← Ce fichier
├── 01-PROXMOX-INSTALLATION.md         ✅ Phase 1
├── 02-PFSENSE-INSTALLATION.md         ✅ Phase 2
├── 03-SOC-SIEM-INSTALLATION.md        ✅ Phase 3
├── 04-SOC-SOAR-INSTALLATION.md        ⏳ Phase 4 (à créer)
├── 05-TARGETS-INSTALLATION.md         ⏳ Phase 5 (à créer)
├── 06-KALI-CONFIGURATION.md           ⏳ Phase 6 (à créer)
├── 07-WIN-TARGET-INSTALLATION.md      ⏳ Phase 7 (à créer)
├── 08-RESTIC-BACKUP.md                ⏳ Phase 8 (à créer)
├── 09-MISP-INTEGRATION.md             ⏳ Phase 9 (à créer)
├── 10-FULL-PIPELINE-TEST.md           ⏳ Phase 10 (à créer)
│
├── scripts/
│   └── soc-siem-setup.sh              ✅ Script installation soc-siem
│
├── wazuh/
│   ├── docker-compose.yml             ✅ Déploiement Wazuh
│   ├── generate-certs.sh              ✅ Génération certificats SSL
│   └── config/
│       ├── wazuh_cluster/
│       │   └── wazuh_manager.conf     ✅ Configuration Wazuh Manager
│       └── wazuh_dashboard/
│           └── wazuh.yml              ✅ Configuration Wazuh Dashboard
│
└── zabbix/
    ├── docker-compose.yml             ✅ Déploiement Zabbix
    └── config/
        └── zabbix_server.conf         ✅ Configuration Zabbix Server
```

---

## 🔑 Identifiants par Défaut

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **Proxmox** | https://192.168.1.10:8006 | root | ProxmoxAdmin2027! |
| **pfSense** | https://10.0.10.1 | admin | PfsenseAdmin2027! |
| **soc-siem** (SSH) | ssh soc@10.0.10.10 | soc | SocPassword2027! |
| **Wazuh Dashboard** | https://10.0.10.10 | admin | SecretPassword123! |
| **Wazuh API** | https://10.0.10.10:55000 | wazuh-admin | SecretPassword123! |
| **Zabbix Web** | http://10.0.10.10:8080 | Admin | zabbix |

---

## 🌐 Adresses IP

### Réseau Physique (192.168.1.0/24)
- **M1** (Proxmox) : 192.168.1.10
- **M2** (Kali host) : 192.168.1.20
- **M3** (Backup) : 192.168.1.30
- **pfSense WAN** : DHCP (192.168.1.x)

### Réseau SOC (10.0.10.0/24)
- **pfSense LAN** : 10.0.10.1
- **soc-siem** : 10.0.10.10
- **soc-soar** : 10.0.10.11

### Réseau VICTIM (10.0.20.0/24)
- **pfSense VICTIM** : 10.0.20.1
- **win-target** : 10.0.20.10
- **linux-target** : 10.0.20.11
- **DVWA** : 10.0.20.12
- **Metasploitable** : 10.0.20.13

### Réseau ATTACK (10.0.30.0/24)
- **pfSense ATTACK** : 10.0.30.1
- **Kali VM** : 10.0.30.10

---

## 📊 Ports des Services

| Service | Port | Protocole | URL |
|---------|------|-----------|-----|
| Proxmox Web UI | 8006 | HTTPS | https://192.168.1.10:8006 |
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

## 🎯 Prochaines Étapes

### Immédiat
1. ✅ **Phase 1 terminée** : Proxmox installé
2. ✅ **Phase 2 terminée** : pfSense configuré
3. ✅ **Phase 3 terminée** : soc-siem déployé
4. ⏳ **Phase 4** : Installer soc-soar (TheHive + Cortex + Shuffle + MISP)

### Court terme
5. ⏳ **Phase 5** : Installer les targets
6. ⏳ **Phase 6** : Configurer Kali
7. ⏳ **Phase 7** : Installer win-target

### Long terme
8. ⏳ **Phase 8** : Configurer les backups
9. ⏳ **Phase 9** : Intégrer MISP avec tous les outils
10. ⏳ **Phase 10** : Tester le pipeline complet

---

## 🐛 Dépannage Général

### Problème : Impossible d'accéder à une VM
```bash
# Vérifier que la VM est démarrée
# Sur Proxmox : sélectionner la VM → Resume

# Vérifier la connectivité réseau
ping 10.0.10.10  # Depuis une autre VM

# Vérifier le firewall
# Sur pfSense : Firewall → Rules
```

### Problème : Docker ne démarre pas
```bash
# Vérifier le statut
systemctl status docker

# Redémarrer
systemctl restart docker

# Vérifier les logs
journalctl -u docker -n 50
```

### Problème : Certificats SSL invalides
```bash
# Régénérer les certificats
cd /opt/wazuh
./generate-certs.sh

# Redémarrer Wazuh
docker-compose restart
```

---

## 📚 Ressources

### Documentation Officielle
- [Proxmox VE](https://pve.proxmox.com/pve-docs/)
- [pfSense](https://docs.netgate.com/pfsense/en/latest/)
- [Wazuh](https://documentation.wazuh.com/)
- [Zabbix](https://www.zabbix.com/documentation/current/)
- [TheHive](https://docs.strangebee.com/)
- [Cortex](https://docs.strangebee.com/cortex/)
- [Shuffle](https://shuffler.io/docs)
- [MISP](https://www.circl.lu/doc/misp/)

### Communauté
- [Proxmox Forum](https://forum.proxmox.com/)
- [pfSense Forum](https://forum.netgate.com/)
- [Wazuh Google Groups](https://groups.google.com/g/wazuh)
- [Zabbix Forum](https://www.zabbix.com/forum/)

---

## ✅ Critères de Succès

Votre lab est complet quand :

- [x] Les 3 machines peuvent se pinger (192.168.1.x)
- [x] pfSense route le trafic entre SOC, VICTIM, ATTACK
- [x] Wazuh Dashboard montre tous les agents connectés
- [x] Zabbix montre tous les hosts monitorés
- [x] TheHive, Cortex, Shuffle, MISP accessibles via navigateur
- [x] MISP a les threat feeds synchronisés
- [x] Cortex peut interroger MISP pour les IOCs
- [x] Shuffle exécute un playbook sur alerte Wazuh
- [x] TheHive crée automatiquement des cas depuis Shuffle
- [x] Kali peut scanner et exploiter les targets
- [x] Pipeline complet : Attack → Detect → Enrich → Case fonctionne
- [x] restic sauvegarde toutes les VMs vers M3
- [x] Vous pouvez investiguer un cas dans TheHive avec contexte MISP complet

---

## 🎉 Progression

**Phases terminées** : 3/10 (30%)  
**Prochaine phase** : Phase 4 - soc-soar Installation  
**Temps restant estimé** : ~11 heures

---

**Dernière mise à jour** : 2027-01-15  
**Version** : 1.0.0  
**Statut** : ✅ Phases 1-3 terminées, prêt pour Phase 4
