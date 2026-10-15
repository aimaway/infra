# 🏠 Home Lab Infracentra - Guide Complet (VMware Edition)

## 📋 Vue d'ensemble

Ce guide documente l'installation complète d'un home lab de cybersécurité pour tester et déployer la plateforme Infracentra sur **VMware Workstation**.

**Architecture** :
- **M1** (HP Laptop, 16GB) : VMware Workstation + pfSense + soc-siem + win-target
- **M2** (Laptop, 16GB) : Kali Linux + soc-soar + targets
- **M3** (Intel NUC, 4GB) : Backup repository (restic)

**Réseaux** :
- **SOC** (10.0.10.0/24) : Outils de défense (Wazuh, Zabbix, TheHive, etc.)
- **VICTIM** (10.0.20.0/24) : Cibles vulnérables
- **ATTACK** (10.0.30.0/24) : Kali Linux (attaquant)

---

## 🚀 Démarrage Rapide

### Prérequis
- ✅ 3 machines physiques (voir spécifications)
- ✅ VMware Workstation Pro (gratuit pour usage personnel)
- ✅ Connexion Internet
- ✅ ~14 heures de temps

### Installation en 10 Phases

| Phase | Machine | Tâche | Temps | Statut |
|-------|---------|-------|-------|--------|
| 1 | M1 | Installation VMware Workstation | 1h | ✅ Terminé |
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

### ✅ Phase 1 : VMware Workstation Installation
**Fichier** : `01-VMWARE-INSTALLATION.md`

**Contenu** :
- Téléchargement de VMware Workstation Pro (gratuit)
- Installation étape par étape
- Configuration des réseaux VMnet (VMnet2, VMnet3, VMnet4)
- Préparation des ISOs
- Création de la VM pfSense

**Résultat** : VMware Workstation opérationnel sur M1 avec 3 réseaux isolés

---

### ✅ Phase 2 : pfSense Installation
**Fichier** : `02-PFSENSE-VMWARE.md`

**Contenu** :
- Création de la VM pfSense sur VMware
- Installation de pfSense CE 2.7.2
- Configuration des 4 interfaces (WAN + SOC + VICTIM + ATTACK)
- Règles de firewall pour segmentation
- Configuration NAT et DHCP

**Résultat** : pfSense opérationnel avec segmentation réseau complète

---

### ✅ Phase 3 : soc-siem Installation
**Fichier** : `03-SOC-SIEM-VMWARE.md`

**Contenu** :
- Création de la VM soc-siem (Ubuntu 22.04)
- Script d'installation automatique
- Génération des certificats SSL
- Déploiement Wazuh (Manager + Indexer + Dashboard)
- Déploiement Zabbix (Server + Web + Agent)

**Fichiers fournis** :
- `scripts/soc-siem-setup.sh` - Script d'installation Ubuntu
- `wazuh/docker-compose.yml` - Déploiement Wazuh
- `wazuh/config/wazuh_cluster/wazuh_manager.conf` - Configuration Wazuh
- `wazuh/generate-certs.sh` - Génération certificats SSL
- `zabbix/docker-compose.yml` - Déploiement Zabbix

**Résultat** : Wazuh et Zabbix opérationnels sur soc-siem

---

## 🗂️ Structure des Fichiers

```
lab-guide/
├── README.md                          ✅ Ce fichier
├── PROGRESSION.md                     ✅ Suivi de progression
├── RÉSUMÉ-LAB.md                      ✅ Résumé complet
│
├── 01-VMWARE-INSTALLATION.md          ✅ Phase 1 (VMware)
├── 02-PFSENSE-VMWARE.md               ✅ Phase 2 (pfSense sur VMware)
├── 03-SOC-SIEM-VMWARE.md              ✅ Phase 3 (soc-siem sur VMware)
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
| **VMware** | Application locale | — | — |
| **pfSense** | https://192.168.1.X | admin | PfsenseAdmin2027! |
| **soc-siem** (SSH) | ssh soc@10.0.10.10 | soc | SocPassword2027! |
| **Wazuh Dashboard** | https://10.0.10.10 | admin | SecretPassword123! |
| **Wazuh API** | https://10.0.10.10:55000 | wazuh-admin | SecretPassword123! |
| **Zabbix Web** | http://10.0.10.10:8080 | Admin | zabbix |

---

## 🌐 Adresses IP

### Réseau Physique (192.168.1.0/24)
- **M1** (VMware host) : 192.168.1.10
- **M2** (Kali host) : 192.168.1.20
- **M3** (Backup) : 192.168.1.30
- **pfSense WAN** : DHCP (192.168.1.x) via VMnet0

### Réseau SOC (10.0.10.0/24) - VMnet2
- **pfSense LAN** : 10.0.10.1
- **soc-siem** : 10.0.10.10
- **soc-soar** : 10.0.10.11

### Réseau VICTIM (10.0.20.0/24) - VMnet3
- **pfSense VICTIM** : 10.0.20.1
- **win-target** : 10.0.20.10
- **linux-target** : 10.0.20.11
- **DVWA** : 10.0.20.12
- **Metasploitable** : 10.0.20.13

### Réseau ATTACK (10.0.30.0/24) - VMnet4
- **pfSense ATTACK** : 10.0.30.1
- **Kali VM** : 10.0.30.10

---

## 📊 Ports des Services

| Service | Port | Protocole | URL |
|---------|------|-----------|-----|
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

## 🎯 VMware vs Proxmox : Pourquoi VMware ?

### Avantages de VMware pour ce lab

1. ✅ **Plus simple** : Installation rapide, interface graphique intuitive
2. ✅ **Gratuit** : VMware Workstation Pro est gratuit pour usage personnel
3. ✅ **Pas de matériel dédié** : Fonctionne sur votre laptop existant
4. ✅ **Réseau flexible** : VMnet faciles à configurer
5. ✅ **Snapshots** : Un clic pour snapshotter une VM
6. ✅ **Clones** : Dupliquer des VMs en quelques secondes
7. ✅ **Coexistence** : Peut fonctionner avec d'autres applications

### Inconvénients

1. ❌ **Performance** : Légèrement réduite (overhead de l'hyperviseur Type 2)
2. ❌ **Ressources partagées** : Partage CPU/RAM avec l'OS host
3. ❌ **Pas pour la production** : Conçu pour le développement/test

### Conclusion

**VMware est parfait pour un lab de test et de développement sur laptop !**

---

## 🎯 Prochaines Étapes

### Immédiat
1. ✅ **Phase 1 terminée** : VMware installé
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
# Dans VMware : VM → Power → Power On

# Vérifier la connectivité réseau
ping 10.0.10.10  # Depuis le host

# Vérifier le firewall
# Sur pfSense : Firewall → Rules
```

### Problème : VMware ne démarre pas

```bash
# Sur Windows
# Vérifier que Hyper-V est désactivé
# Panneau de configuration → Programmes → Activer ou désactiver des fonctionnalités Windows
# Décocher "Hyper-V"
# Redémarrer

# Sur Linux
sudo systemctl status vmware
sudo systemctl restart vmware
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

### Problème : Docker ne démarre pas

```bash
# Vérifier le statut
systemctl status docker

# Redémarrer
systemctl restart docker

# Vérifier les logs
journalctl -u docker -n 50
```

---

## 📚 Ressources

### Documentation Officielle
- [VMware Workstation](https://docs.vmware.com/en/VMware-Workstation-Pro/)
- [pfSense](https://docs.netgate.com/pfsense/en/latest/)
- [Wazuh](https://documentation.wazuh.com/)
- [Zabbix](https://www.zabbix.com/documentation/current/)

### Communauté
- [VMware Community](https://communities.vmware.com/)
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
**Version** : 1.0.0 (VMware Edition)  
**Statut** : ✅ Phases 1-3 terminées, prêt pour Phase 4
