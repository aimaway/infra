# 🔌 Guide d'Intégration - Wazuh (EDR/XDR)

## 📋 Vue d'ensemble

Wazuh est une solution open-source de détection et réponse sur les endpoints (EDR/XDR). Cette intégration permet à Infracentra de :
- Monitorer tous les endpoints connectés
- Recevoir les alertes de sécurité en temps réel
- Isoler les endpoints compromis
- Détecter les vulnérabilités
- Surveiller l'intégrité des fichiers

## 🚀 Installation de Wazuh

### Option 1 : Docker (Recommandé pour le lab)

```bash
# Créer le réseau
docker network create wazuh-net

# Démarrer Wazuh Manager
docker run -d --name wazuh.manager \
  --net wazuh-net \
  -p 514:514/udp \
  -p 1514:1514 \
  -p 1515:1515 \
  -p 514:514/tcp \
  -p 55000:55000 \
  -e API_USERNAME=wazuh-admin \
  -e API_PASSWORD=YourSecurePassword123! \
  wazuh/wazuh:4.7.2

# Vérifier le statut
docker logs wazuh.manager
```

### Option 2 : Installation native (Kali Linux)

```bash
# Ajouter le repository Wazuh
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg

echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee /etc/apt/sources.list.d/wazuh.list

# Installer
apt-get update
apt-get install wazuh-manager

# Démarrer le service
systemctl start wazuh-manager
systemctl enable wazuh-manager
```

## 🔑 Configuration de l'API

### 1. Accéder à l'API Wazuh

```bash
# URL de l'API
https://localhost:55000

# Authentification
curl -u wazuh-admin:YourSecurePassword123! -k https://localhost:55000/security/user/authenticate
```

### 2. Obtenir le token JWT

```bash
TOKEN=$(curl -u wazuh-admin:YourSecurePassword123! -k https://localhost:55000/security/user/authenticate | jq -r '.data.token')

# Tester le token
curl -k -X GET "https://localhost:55000/agents?limit=10" -H "Authorization: Bearer $TOKEN"
```

## 🔗 Intégration avec Infracentra

### 1. Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier backend :

```env
WAZUH_URL=https://localhost:55000
WAZUH_API_USER=wazuh-admin
WAZUH_API_PASSWORD=YourSecurePassword123!
```

### 2. Ajouter l'intégration via l'API Infracentra

```bash
# Créer l'intégration
curl -X POST "http://localhost:8000/api/integrations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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
```

### 3. Tester la connexion

```bash
curl -X POST "http://localhost:8000/api/integrations/{id}/test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Utilisation dans Infracentra

### Récupérer les agents

```python
from app.services.wazuh import WazuhService

wazuh = WazuhService(
    base_url="https://localhost:55000",
    api_user="wazuh-admin",
    api_password="YourSecurePassword123!"
)

agents = await wazuh.get_agents()
print(f"Found {len(agents)} agents")
```

### Récupérer les alertes

```python
alerts = await wazuh.get_alerts(level=7, hours=24)
print(f"Found {len(alerts)} alerts in last 24h")
```

### Isoler un endpoint

```python
result = await wazuh.isolate_agent("001")
print(f"Agent 001 isolated: {result}")
```

## 🎯 Scénarios d'usage

### 1. Détection de ransomware
- Wazuh détecte un processus suspect
- Alerte envoyée à Infracentra
- Auto-isolation de l'endpoint
- Notification SOC

### 2. Surveillance de la conformité
- Scan quotidien des agents
- Rapport de vulnérabilités
- Alertes si agent offline

### 3. Réponse aux incidents
- Collecte de forensics
- Analyse des logs
- Reconstruction de la timeline

## 🔧 Dépannage

### Problème : Impossible de se connecter à l'API
```bash
# Vérifier que Wazuh tourne
docker ps | grep wazuh

# Vérifier les logs
docker logs wazuh.manager

# Tester l'API manuellement
curl -k https://localhost:55000
```

### Problème : Agents non visibles
```bash
# Vérifier les agents
curl -u wazuh-admin:YourSecurePassword123! -k https://localhost:55000/agents

# Redémarrer le manager
docker restart wazuh.manager
```

## 📚 Ressources

- [Documentation Wazuh](https://documentation.wazuh.com/)
- [API Reference](https://documentation.wazuh.com/current/user-manual/api/reference.html)
- [GitHub](https://github.com/wazuh/wazuh)

---

**Status** : ✅ Intégration complète  
**Dernière mise à jour** : 2027-01-15
