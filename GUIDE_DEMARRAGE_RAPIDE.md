# 🚀 Guide de Démarrage Rapide - Infracentra

## 📋 Prérequis

- Docker & Docker Compose
- Git
- 8GB RAM minimum
- 20GB d'espace disque

---

## 🎯 Installation Complète (1 heure)

### Étape 1 : Cloner le projet

```bash
git clone <votre-repo-url>
cd infracentra
```

### Étape 2 : Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp backend/.env.example backend/.env

# Éditer avec vos valeurs
nano backend/.env
```

**Variables critiques à modifier :**
```env
SECRET_KEY=<générer-avec-openssl-rand-hex-32>
WAZUH_API_PASSWORD=<votre-mot-de-passe-wazuh>
MISP_API_KEY=<votre-clé-api-misp>
ELASTIC_API_KEY=<votre-clé-api-elastic>
```

Générer un secret key :
```bash
openssl rand -hex 32
```

### Étape 3 : Démarrer les services de base

```bash
# Démarrer PostgreSQL, Redis, Backend et Frontend
docker compose up -d

# Vérifier le statut
docker compose ps

# Voir les logs
docker compose logs -f
```

### Étape 4 : Accéder à l'application

```bash
# Frontend
http://localhost:3000

# Backend API
http://localhost:8000

# API Documentation
http://localhost:8000/docs
```

---

## 🔐 Créer le premier compte admin

### Via l'API

```bash
# Créer un utilisateur platform admin
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@infracentra.io",
    "password": "YourSecurePassword123!",
    "name": "Platform Admin",
    "role": "platform_admin"
  }'

# Se connecter
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@infracentra.io",
    "password": "YourSecurePassword123!"
  }'

# Sauvegarder le token
export TOKEN="<token-from-response>"
```

### Via l'interface web

1. Aller sur http://localhost:3000
2. Cliquer sur "Sign In"
3. Utiliser les identifiants ci-dessus

---

## 🏢 Créer la première organisation

```bash
# Créer une organisation
curl -X POST "http://localhost:8000/api/organizations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aegis Corp International",
    "tier": "enterprise",
    "contact_email": "soc@aegiscorp.io",
    "contact_phone": "+1 (415) 555-0142",
    "industry": "Financial Services",
    "country": "United States"
  }'

# Sauvegarder l'ID de l'organisation
export ORG_ID="<org-id-from-response>"
```

---

## 🔑 Activer les services pour l'organisation

```bash
# Activer Threat Intelligence
curl -X POST "http://localhost:8000/api/entitlements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"org_id\": $ORG_ID,
    \"service_id\": \"threat-intel\",
    \"enabled\": true,
    \"seat_count\": 247
  }"

# Activer Compliance
curl -X POST "http://localhost:8000/api/entitlements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"org_id\": $ORG_ID,
    \"service_id\": \"compliance\",
    \"enabled\": true,
    \"seat_count\": 50
  }"

# Activer Endpoint Protection
curl -X POST "http://localhost:8000/api/entitlements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"org_id\": $ORG_ID,
    \"service_id\": \"endpoint-protection\",
    \"enabled\": true,
    \"seat_count\": 1893
  }"
```

---

## 🔌 Installer les intégrations (Lab Kali)

### 1. Wazuh (EDR/XDR)

```bash
# Installer Wazuh sur Kali
docker run -d --name wazuh \
  -p 514:514/udp -p 1514:1514 -p 55000:55000 \
  -e API_USERNAME=wazuh-admin \
  -e API_PASSWORD=YourSecurePassword123! \
  wazuh/wazuh:4.7.2

# Attendre que Wazuh démarre
sleep 30

# Ajouter l'intégration dans Infracentra
curl -X POST "http://localhost:8000/api/integrations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wazuh",
    "service_id": "endpoint-protection",
    "integration_type": "agent",
    "status": "active",
    "license_type": "open-source",
    "pricing": "free",
    "api_endpoint": "https://localhost:55000",
    "api_key": "YourSecurePassword123!",
    "documentation_url": "https://documentation.wazuh.com/"
  }'

# Tester la connexion
curl -X POST "http://localhost:8000/api/integrations/{id}/test" \
  -H "Authorization: Bearer $TOKEN"
```

**Documentation complète** : `docs/integrations/WAZUH_INTEGRATION.md`

### 2. MISP (Threat Intelligence)

```bash
# Installer MISP
git clone https://github.com/MISP/misp-docker.git
cd misp-docker
cp .env.default .env
nano .env  # Modifier les variables
docker-compose up -d

# Attendre que MISP démarre
sleep 60

# Générer une API key via l'interface web
# http://localhost

# Ajouter l'intégration dans Infracentra
curl -X POST "http://localhost:8000/api/integrations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MISP",
    "service_id": "threat-intel",
    "integration_type": "api",
    "status": "active",
    "license_type": "open-source",
    "pricing": "free",
    "api_endpoint": "https://localhost",
    "api_key": "YourMISPApiKeyHere",
    "documentation_url": "https://www.misp-project.org/"
  }'

# Tester la connexion
curl -X POST "http://localhost:8000/api/integrations/{id}/test" \
  -H "Authorization: Bearer $TOKEN"
```

**Documentation complète** : `docs/integrations/MISP_INTEGRATION.md`

### 3. Elastic Security (SIEM)

```bash
# Installer Elastic Stack
docker network create elastic

docker run -d --name elasticsearch --net elastic \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=true" \
  -e "ELASTIC_PASSWORD=YourSecurePassword123!" \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0

sleep 30

docker run -d --name kibana --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:8.12.0

# Générer une API key via Kibana
# http://localhost:5601

# Ajouter l'intégration dans Infracentra
curl -X POST "http://localhost:8000/api/integrations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elastic Security",
    "service_id": "threat-intel",
    "integration_type": "native",
    "status": "active",
    "license_type": "freemium",
    "pricing": "paid",
    "api_endpoint": "http://localhost:9200",
    "api_key": "YourElasticApiKeyHere",
    "documentation_url": "https://www.elastic.co/guide/en/security/current/index.html"
  }'

# Tester la connexion
curl -X POST "http://localhost:8000/api/integrations/{id}/test" \
  -H "Authorization: Bearer $TOKEN"
```

**Documentation complète** : `docs/integrations/ELASTIC_INTEGRATION.md`

---

## 👥 Créer des utilisateurs pour l'organisation

```bash
# Créer un client admin
curl -X POST "http://localhost:8000/api/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"sarah.chen@aegiscorp.io\",
    \"password\": \"SecurePassword123!\",
    \"name\": \"Sarah Chen\",
    \"role\": \"client_admin\",
    \"org_id\": $ORG_ID
  }"

# Créer un client user
curl -X POST "http://localhost:8000/api/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"marcus.j@aegiscorp.io\",
    \"password\": \"SecurePassword123!\",
    \"name\": \"Marcus Johnson\",
    \"role\": \"client_user\",
    \"org_id\": $ORG_ID
  }"
```

---

## ✅ Vérification

### 1. Tester l'enforcement

```bash
# Se connecter en tant que client admin
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.chen@aegiscorp.io",
    "password": "SecurePassword123!"
  }'

export CLIENT_TOKEN="<token-from-response>"

# Vérifier les entitlements
curl -X GET "http://localhost:8000/api/entitlements/" \
  -H "Authorization: Bearer $CLIENT_TOKEN"

# Tester l'accès à un service activé
curl -X GET "http://localhost:8000/api/entitlements/check/threat-intel" \
  -H "Authorization: Bearer $CLIENT_TOKEN"

# Tester l'accès à un service désactivé
curl -X GET "http://localhost:8000/api/entitlements/check/soar" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
# Devrait retourner: {"entitled": false, "service_id": "soar"}
```

### 2. Vérifier les logs d'audit

```bash
# Voir les logs d'audit
curl -X GET "http://localhost:8000/api/audit/logs?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Tester les intégrations

```bash
# Voir toutes les intégrations
curl -X GET "http://localhost:8000/api/integrations/" \
  -H "Authorization: Bearer $TOKEN"

# Tester chaque intégration
curl -X POST "http://localhost:8000/api/integrations/{id}/test" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Prochaines étapes

1. **Installer les agents Wazuh** sur vos endpoints
2. **Configurer les feeds MISP** pour recevoir des IoCs
3. **Créer des dashboards Kibana** pour la visualisation
4. **Configurer les playbooks SOAR** pour l'automatisation
5. **Former les utilisateurs** avec l'Academy Infracentra

---

## 📚 Documentation

- **Guide d'intégration Wazuh** : `docs/integrations/WAZUH_INTEGRATION.md`
- **Guide d'intégration MISP** : `docs/integrations/MISP_INTEGRATION.md`
- **Guide d'intégration Elastic** : `docs/integrations/ELASTIC_INTEGRATION.md`
- **API Documentation** : http://localhost:8000/docs

---

## 🐛 Dépannage

### Problème : Backend ne démarre pas
```bash
# Vérifier les logs
docker compose logs backend

# Redémarrer
docker compose restart backend
```

### Problème : Impossible de se connecter à la DB
```bash
# Vérifier que PostgreSQL tourne
docker compose ps db

# Tester la connexion
docker exec -it infracentra-db psql -U infracentra -d infracentra
```

### Problème : Intégration ne se connecte pas
```bash
# Vérifier que le service cible tourne
docker ps

# Tester manuellement
curl -k https://localhost:55000  # Wazuh
curl http://localhost:9200       # Elastic
```

---

## 🎉 Vous êtes prêt !

Votre plateforme Infracentra est maintenant opérationnelle avec :
- ✅ Backend réel avec persistance
- ✅ Authentification JWT
- ✅ Enforcement des services
- ✅ 3 intégrations réelles (Wazuh, MISP, Elastic)
- ✅ Logs d'audit complets
- ✅ Documentation détaillée

**Prochaine étape** : Déployer en production avec un vrai domaine !

---

**Dernière mise à jour** : 2027-01-15  
**Version** : 1.0.0 (Production Ready)
