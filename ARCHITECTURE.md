# 🏗️ Architecture du Projet Infracentra

## 📊 Diagramme de Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         INFRACENTRA                              │
│                    Plateforme Unifiée                            │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   FRONTEND   │        │   BACKEND    │        │  DATABASE    │
│   (React)    │        │  (FastAPI)   │        │ (PostgreSQL) │
└──────────────┘        └──────────────┘        └──────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DONNÉES (src/data/)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │servicesData  │  │navigationData│  │comingSoonServices    │  │
│  │  .ts         │  │  .ts         │  │  .ts                 │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ mockData.ts  │  │  [Autres]    │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  COMPOSANTS (src/components/)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              landing/                                     │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │  │
│  │  │ Navigation │ │HeroSection │ │Platform    │           │  │
│  │  │   .tsx     │ │   .tsx     │ │ Pillars.tsx│           │  │
│  │  └────────────┘ └────────────┘ └────────────┘           │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │  │
│  │  │ Services   │ │  MSSP      │ │  Pricing   │           │  │
│  │  │  Grid.tsx  │ │ Section.tsx│ │ Section.tsx│           │  │
│  │  └────────────┘ └────────────┘ └────────────┘           │  │
│  │  ┌────────────┐ ┌────────────┐                          │  │
│  │  │  Academy   │ │   Footer   │                          │  │
│  │  │ Section.tsx│ │   .tsx     │                          │  │
│  │  └────────────┘ └────────────┘                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PAGES (src/pages/)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ LandingPage  │  │ LoginPage    │  │ ServiceDetailPage    │  │
│  │   .tsx       │  │   .tsx       │  │   .tsx               │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ComingSoon    │  │ Dashboard    │  │ Platform Dashboard   │  │
│  │  Page.tsx    │  │  Page.tsx    │  │   Page.tsx           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTES (src/App.tsx)                          │
│                                                                  │
│  /                          → Landing Page                      │
│  /login                     → Login Page                        │
│  /service/:id               → Service Detail Page               │
│  /coming-soon/:id           → Coming Soon Page                  │
│  /dashboard                 → Client User Dashboard             │
│  /admin/dashboard           → Platform Admin Dashboard          │
│  /admin/clients             → Platform Client Management        │
│  /admin/audit               → Platform Audit Log                │
│  /client-admin/dashboard    → Client Admin Dashboard            │
│  /client-admin/users        → Client User Management            │
│  /client-admin/entitlements → Client Service Entitlements       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données

```
┌──────────────┐
│   Utilisateur│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Navigateur │
│  (Browser)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Frontend   │
│   (React)    │
│              │
│  1. Charge   │
│     les      │
│     données  │
│     depuis   │
│     src/data │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Composants   │  │   Pages      │
│ (UI)         │  │ (Assemblage) │
└──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│   Backend    │
│  (FastAPI)   │
│              │
│  2. API      │
│     calls    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Database    │
│ (PostgreSQL) │
│              │
│  3. Stockage │
│     persistant│
└──────────────┘
```

---

## 📦 Les 16 Services Principaux

### 🔒 Security (5 services)
1. **Threat Intelligence** → `/service/threat-intel`
2. **Compliance Mapper** → `/service/compliance`
3. **Incident Response** → `/service/incident-response`
4. **Analytics** → `/service/analytics`
5. **SOAR Automation** → `/service/soar`

### 🌐 Networking (5 services)
6. **Network Monitoring** → `/service/network-monitoring`
7. **DNS Filtering** → `/service/dns-filtering`
8. **Firewall Management** → `/service/firewall-mgmt`
9. **VPN Gateway** → `/service/vpn-gateway`
10. **SD-WAN** → `/service/sd-wan`

### ⚙️ PSA (6 services)
11. **Vulnerability Scanning** → `/service/vuln-scanning`
12. **Patch Management** → `/service/patch-management`
13. **Backup & DR** → `/service/backup-dr`
14. **Endpoint Protection** → `/service/endpoint-protection`
15. **Email Security** → `/service/email-security`
16. **Cloud Security** → `/service/cloud-security`

---

## 🔮 Services "Bientôt Disponibles"

1. **ITDR** (Identity Threat Detection & Response) → `/coming-soon/itdr`
2. **AI Investigator** → `/coming-soon/ai-investigator`
3. **ISOC Platform** → `/coming-soon/isoc-platform`
4. **Threat Hunting AI** → `/coming-soon/threat-hunting-ai`
5. **Cloud-Native Security** → `/coming-soon/cloud-native-security`
6. **OT/ICS Security** → `/coming-soon/ot-security`

---

## 🎯 Rôles Utilisateurs

### 👑 Platform Admin (Super Admin)
- **Accès** : `/admin/dashboard`
- **Permissions** :
  - Gérer tous les clients
  - Activer/désactiver des services
  - Voir les logs d'audit
  - Gérer les licences et API keys
  - Superviser l'ensemble de la plateforme

### 🏢 Client Admin
- **Accès** : `/client-admin/dashboard`
- **Permissions** :
  - Gérer les utilisateurs de son organisation
  - Voir les services activés
  - Accéder aux dashboards de sécurité
  - Configurer les intégrations

### 👤 Client User
- **Accès** : `/dashboard`
- **Permissions** :
  - Voir les dashboards de sécurité
  - Accéder aux services activés pour son organisation
  - Consulter les alertes et incidents
  - Exécuter des playbooks (si autorisé)

---

## 🔐 Système d'Enforcement

```
┌─────────────────────────────────────────────────────────┐
│                   ServiceGate Component                  │
│                                                          │
│  1. Vérifie si le service est activé pour l'org         │
│  2. Si NON → Affiche page "Service non autorisé"        │
│  3. Si OUI → Affiche le contenu du service              │
│  4. Log toutes les tentatives d'accès dans l'audit      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Fichier :** `src/components/ServiceGate.tsx`

**Utilisation :**
```typescript
<ServiceGate serviceId="threat-intel">
  <ThreatIntelContent />
</ServiceGate>
```

---

## 📊 Intégrations Open-Source

### 🔒 Security
- **Wazuh** (EDR/XDR) → `backend/app/integrations/wazuh.py`
- **Elastic Security** (SIEM) → `backend/app/integrations/elastic.py`
- **MISP** (Threat Intel) → `backend/app/integrations/misp.py`

### 🌐 Networking
- **Zabbix** (NMS) → `backend/app/integrations/zabbix.py`
- **pfSense/OPNsense** (Firewall) → `backend/app/integrations/pfsense.py`

### ⚙️ PSA
- **OpenVAS** (Vuln Scanning) → `backend/app/integrations/openvas.py`
- **TheHive** (Incident Mgmt) → `backend/app/integrations/thehive.py`
- **Shuffle** (SOAR) → `backend/app/integrations/shuffle.py`

---

## 🚀 Déploiement

### Développement
```bash
docker compose up -d
```

### Production
```bash
# Voir PRODUCTION.md pour les détails
docker compose -f docker-compose.prod.yml up -d
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | Vue d'ensemble du projet |
| `GUIDE_RAPIDE.md` | Guide rapide pour modifications courantes |
| `GUIDE_MODIFICATION.md` | Guide complet de personnalisation |
| `PRODUCTION.md` | Déploiement en production |
| `INTEGRATIONS.md` | Guide des intégrations open-source |
| `ARCHITECTURE.md` | Ce fichier - Architecture du projet |

---

**Dernière mise à jour :** 2027-01-15  
**Version :** 2.0.0 (Architecture Modulaire)
