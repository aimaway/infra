# 📊 Suivi de Progression - Home Lab Infracentra

## 🎯 Progression Globale

**Phases terminées** : 3/10 (30%)  
**Temps estimé total** : 14 heures  
**Temps restant** : ~11 heures  
**Dernière mise à jour** : 2027-01-15

---

## ✅ Phase 1 : Proxmox VE Installation (TERMINÉ)

**Fichier** : `01-PROXMOX-INSTALLATION.md`  
**Temps estimé** : 1 heure  
**Temps réel** : _____ heure(s)

### Checklist
- [x] ISO Proxmox VE 8.x téléchargé
- [x] Clé USB bootable créée
- [x] BIOS/UEFI configuré (Secure Boot désactivé, VT-x activé)
- [x] Proxmox VE installé
- [x] Interface de management configurée (192.168.1.10)
- [x] Accès web fonctionnel (https://192.168.1.10:8006)
- [x] Bridges internes créés (vmbr1, vmbr2, vmbr3)
- [x] ISOs téléchargés (Ubuntu, pfSense)
- [x] Système mis à jour

### Notes
- Adaptateur Ethernet USB utilisé : OUI / NON
- IP de management : 192.168.1.10
- Mot de passe root noté : OUI / NON

### Problèmes rencontrés
- [ ] Aucun
- [ ] Problème Wi-Fi (solution : adaptateur Ethernet USB)
- [ ] Autre : _______________________

---

## ✅ Phase 2 : pfSense Installation (TERMINÉ)

**Fichier** : `02-PFSENSE-INSTALLATION.md`  
**Temps estimé** : 1 heure  
**Temps réel** : _____ heure(s)

### Checklist
- [x] VM pfSense créée sur Proxmox (ID 100)
- [x] 4 interfaces réseau configurées (WAN, LAN, VICTIM, ATTACK)
- [x] pfSense CE 2.7.2 installé
- [x] Interfaces OPT1 et OPT2 assignées
- [x] IPs configurées (10.0.10.1, 10.0.20.1, 10.0.30.1)
- [x] DHCP activé sur les 3 réseaux
- [x] Règles de firewall configurées
- [x] NAT outbound configuré
- [x] Connectivité testée entre réseaux
- [x] Accès web fonctionnel

### Notes
- IP WAN (DHCP) : 192.168.1.___
- IP LAN (SOC) : 10.0.10.1
- IP VICTIM : 10.0.20.1
- IP ATTACK : 10.0.30.1
- Mot de passe admin noté : OUI / NON

### Problèmes rencontrés
- [ ] Aucun
- [ ] Interfaces non détectées
- [ ] Règles firewall bloquantes
- [ ] Autre : _______________________

---

## ✅ Phase 3 : soc-siem Installation (TERMINÉ)

**Fichier** : `03-SOC-SIEM-INSTALLATION.md`  
**Temps estimé** : 2 heures  
**Temps réel** : _____ heure(s)

### Checklist
- [x] VM soc-siem créée sur Proxmox (ID 101)
- [x] Ubuntu 22.04 LTS installé
- [x] Réseau configuré (10.0.10.10)
- [x] Script d'installation exécuté
- [x] Docker et Docker Compose installés
- [x] Firewall configuré (UFW)
- [x] Certificats SSL générés
- [x] Wazuh déployé (Manager + Indexer + Dashboard)
- [x] Zabbix déployé (Server + Web + Agent)
- [x] Connectivité réseau testée
- [x] Configuration initiale effectuée

### Notes
- IP soc-siem : 10.0.10.10
- Login SSH : soc / SocPassword2027!
- Wazuh Dashboard : https://10.0.10.10 (admin / SecretPassword123!)
- Zabbix Web : http://10.0.10.10:8080 (Admin / zabbix)

### Problèmes rencontrés
- [ ] Aucun
- [ ] Docker ne démarre pas
- [ ] Certificats SSL invalides
- [ ] Wazuh Dashboard inaccessible
- [ ] Zabbix Web inaccessible
- [ ] Autre : _______________________

---

## ⏳ Phase 4 : soc-soar Installation (À FAIRE)

**Fichier** : `04-SOC-SOAR-INSTALLATION.md` (À créer)  
**Temps estimé** : 3 heures  
**Temps réel** : _____ heure(s)

### Checklist
- [ ] VM soc-soar créée sur Proxmox (ID 102)
- [ ] Ubuntu 22.04 LTS installé
- [ ] Réseau configuré (10.0.10.11)
- [ ] Docker et Docker Compose installés
- [ ] TheHive déployé
- [ ] Cortex déployé
- [ ] Shuffle déployé
- [ ] MISP déployé
- [ ] OpenVAS déployé
- [ ] Connectivité réseau testée
- [ ] Configuration initiale effectuée

### Notes
- IP soc-soar : 10.0.10.11
- TheHive : http://10.0.10.11:9000
- Cortex : http://10.0.10.11:9001
- Shuffle : http://10.0.10.11:3001
- MISP : https://10.0.10.11:8443
- OpenVAS : https://10.0.10.11:443

### Problèmes rencontrés
- [ ] Aucun
- [ ] Autre : _______________________

---

## ⏳ Phase 5 : targets Installation (À FAIRE)

**Fichier** : `05-TARGETS-INSTALLATION.md` (À créer)  
**Temps estimé** : 1 heure  
**Temps réel** : _____ heure(s)

### Checklist
- [ ] VM targets créée sur Proxmox (ID 103)
- [ ] Ubuntu 22.04 LTS installé
- [ ] Réseau configuré (10.0.20.11-13)
- [ ] DVWA déployé
- [ ] Metasploitable 2 déployé
- [ ] linux-target déployé
- [ ] Agents Wazuh installés
- [ ] Agents Zabbix installés
- [ ] Connectivité réseau testée

### Notes
- DVWA : http://10.0.20.12
- Metasploitable : http://10.0.20.13:8080
- linux-target : SSH sur 10.0.20.11

### Problèmes rencontrés
- [ ] Aucun
- [ ] Autre : _______________________

---

## ⏳ Phase 6 : Kali Configuration (À FAIRE)

**Fichier** : `06-KALI-CONFIGURATION.md` (À créer)  
**Temps estimé** : 30 minutes  
**Temps réel** : _____ heure(s)

### Checklist
- [ ] Kali VM configurée sur M2
- [ ] Réseau configuré (10.0.30.10)
- [ ] Routes vers pfSense ajoutées
- [ ] Outils d'attaque installés
- [ ] Connectivité vers targets testée
- [ ] Connectivité Internet testée

### Notes
- IP Kali : 10.0.30.10
- Gateway : 10.0.30.1

### Problèmes rencontrés
- [ ] Aucun
- [ ] Autre : _______________________

---

## ⏳ Phase 7 : win-target Installation (À FAIRE)

**Fichier** : `07-WIN-TARGET-INSTALLATION.md` (À créer)  
**Temps estimé** : 1.5 heures  
**Temps réel** : _____ heure(s)

### Checklist
- [ ] VM win-target créée sur Proxmox (ID 104)
- [ ] Windows 10 installé
- [ ] Réseau configuré (10.0.20.10)
- [ ] Sysmon installé
- [ ] Agent Wazuh installé
- [ ] Agent Zabbix installé
- [ ] Connectivité réseau testée

### Notes
- IP win-target : 10.0.20.10
- Login Windows : _______________

### Problèmes rencontrés
- [ ] Aucun
- [ ] Autre : _______________________

---

## ⏳ Phase 8 : restic Backup (À FAIRE)

**Fichier** : `08-RESTIC-BACKUP.md` (À créer)  
**Temps estimé** : 30 minutes  
**Temps réel** : _____ heure(s)

### Checklist
- [ ] restic installé sur M3
- [ ] Repository de backup configuré
- [ ] Backups configurés sur toutes les VMs Linux
- [ ] Planification automatique configurée
- [ ] Test de restauration effectué

### Notes
- Repository : \\192.168.1.30\backups
- Fréquence : quotidienne

### Problèmes rencontrés
- [ ] Aucun
- [ ] Autre : _______________________

---

## ⏳ Phase 9 : Intégration MISP (À FAIRE)

**Fichier** : `09-MISP-INTEGRATION.md` (À créer)  
**Temps estimé** : 2 heures  
**Temps réel** : _____ heure(s)

### Checklist
- [ ] Wazuh → MISP configuré
- [ ] Cortex → MISP configuré
- [ ] Shuffle → MISP configuré
- [ ] TheHive ↔ MISP configuré
- [ ] Feeds MISP synchronisés
- [ ] Tests de corrélation effectués

### Notes
- MISP URL : https://10.0.10.11:8443
- API Keys générées : OUI / NON

### Problèmes rencontrés
- [ ] Aucun
- [ ] Autre : _______________________

---

## ⏳ Phase 10 : Test Complet (À FAIRE)

**Fichier** : `10-FULL-PIPELINE-TEST.md` (À créer)  
**Temps estimé** : 1 heure  
**Temps réel** : _____ heure(s)

### Checklist
- [ ] Scénario d'attaque exécuté (Kali → targets)
- [ ] Détection par Wazuh confirmée
- [ ] Orchestration par Shuffle vérifiée
- [ ] Enrichissement par Cortex/MISP confirmé
- [ ] Création de cas dans TheHive vérifiée
- [ ] Investigation effectuée
- [ ] Résolution documentée

### Notes
- Scénario testé : _______________________
- Temps de détection : _____ minutes
- Temps de réponse : _____ minutes

### Problèmes rencontrés
- [ ] Aucun
- [ ] Autre : _______________________

---

## 📊 Résumé

### Phases Terminées
- ✅ Phase 1 : Proxmox VE Installation
- ✅ Phase 2 : pfSense Installation
- ✅ Phase 3 : soc-siem Installation

### Phases en Cours
- ⏳ Aucune

### Phases à Faire
- ⏳ Phase 4 : soc-soar Installation
- ⏳ Phase 5 : targets Installation
- ⏳ Phase 6 : Kali Configuration
- ⏳ Phase 7 : win-target Installation
- ⏳ Phase 8 : restic Backup
- ⏳ Phase 9 : Intégration MISP
- ⏳ Phase 10 : Test Complet

### Statistiques
- **Phases terminées** : 3/10 (30%)
- **Temps investi** : _____ heures
- **Temps restant estimé** : ~11 heures
- **Problèmes rencontrés** : _____
- **Problèmes résolus** : _____

---

## 🎯 Prochaine Action

**Phase suivante** : Phase 4 - soc-soar Installation  
**Fichier à créer** : `04-SOC-SOAR-INSTALLATION.md`  
**Temps estimé** : 3 heures

### Prérequis
- [ ] Phase 3 terminée et vérifiée
- [ ] soc-siem accessible et fonctionnel
- [ ] Wazuh et Zabbix opérationnels
- [ ] Certificats SSL valides

### Objectifs
- [ ] Créer la VM soc-soar sur Proxmox
- [ ] Installer Ubuntu 22.04 LTS
- [ ] Déployer TheHive, Cortex, Shuffle, MISP, OpenVAS
- [ ] Configurer les intégrations
- [ ] Tester l'accès aux interfaces web

---

## 📝 Notes Générales

### Décisions Importantes
- Utilisation d'un adaptateur Ethernet USB pour M1 : OUI
- Mot de passe root Proxmox : _______________________
- Domaine du lab : lab.local

### Ressources Utilisées
- RAM totale M1 : 16 GB
- RAM totale M2 : 16 GB
- RAM totale M3 : 4 GB
- Espace disque total : _____ GB

### Contacts et Support
- Documentation Proxmox : https://pve.proxmox.com/pve-docs/
- Documentation Wazuh : https://documentation.wazuh.com/
- Forum Wazuh : https://groups.google.com/g/wazuh

---

**Dernière mise à jour** : 2027-01-15  
**Version** : 1.0.0  
**Statut** : ✅ Phases 1-3 terminées, prêt pour Phase 4
