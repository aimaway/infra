# 🔌 Guide d'Intégration - Elastic Security (SIEM)

## 📋 Vue d'overview

Elastic Security est une solution SIEM (Security Information and Event Management) basée sur Elasticsearch. Cette intégration permet à Infracentra de :
- Rechercher et corréler les logs de sécurité
- Créer et gérer des cas de sécurité
- Visualiser les menaces sur des dashboards
- Détecter les anomalies avec ML

## 🚀 Installation d'Elastic Stack

### Option 1 : Docker (Recommandé pour le lab)

```bash
# Créer le réseau
docker network create elastic

# Démarrer Elasticsearch
docker run -d --name elasticsearch --net elastic \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=true" \
  -e "ELASTIC_PASSWORD=YourSecurePassword123!" \
  -e "ES_JAVA_OPTS=-Xms1g -Xmx1g" \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0

# Attendre qu'Elasticsearch soit prêt
sleep 30

# Démarrer Kibana
docker run -d --name kibana --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  -e "ELASTICSEARCH_USERNAME=kibana_system" \
  -e "ELASTICSEARCH_PASSWORD=YourSecurePassword123!" \
  docker.elastic.co/kibana/kibana:8.12.0

# Vérifier
docker ps
```

### Option 2 : Installation native (Kali Linux)

```bash
# Ajouter le repository Elastic
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-8.x.list

# Installer Elasticsearch
apt-get update
apt-get install elasticsearch

# Configurer
nano /etc/elasticsearch/elasticsearch.yml
# Ajouter:
# xpack.security.enabled: true
# network.host: 0.0.0.0

# Définir le mot de passe
/usr/share/elasticsearch/bin/elasticsearch-setup-passwords auto

# Démarrer
systemctl start elasticsearch
systemctl enable elasticsearch

# Installer Kibana
apt-get install kibana

# Configurer
nano /etc/kibana/kibana.yml
# Ajouter:
# elasticsearch.hosts: ["http://localhost:9200"]
# elasticsearch.username: "kibana_system"
# elasticsearch.password: "YourPassword"

# Démarrer
systemctl start kibana
systemctl enable kibana
```

## 🔑 Configuration de l'API

### 1. Accéder à Kibana

```bash
# URL
http://localhost:5601

# Login
Username: elastic
Password: YourSecurePassword123!
```

### 2. Générer une API Key

```bash
# Via Kibana UI
1. Se connecter en tant qu'elastic
2. Aller dans "Stack Management" → "API Keys"
3. Cliquer sur "Create API key"
4. Nom: "infracentra"
5. Restrictions: Aucune (ou spécifique aux index)
6. Copier la clé générée
```

### 3. Tester l'API

```bash
# Avec curl
curl -X GET "localhost:9200/_cluster/health" \
  -H "Authorization: ApiKey YOUR_API_KEY"

# Avec Python
python3 -c "
from elasticsearch import Elasticsearch
es = Elasticsearch('http://localhost:9200', api_key='YOUR_API_KEY')
print(es.cluster.health())
"
```

## 🔗 Intégration avec Infracentra

### 1. Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier backend :

```env
ELASTIC_URL=http://localhost:9200
ELASTIC_API_KEY=YourElasticApiKeyHere
```

### 2. Ajouter l'intégration via l'API Infracentra

```bash
curl -X POST "http://localhost:8000/api/integrations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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
```

### 3. Tester la connexion

```bash
curl -X POST "http://localhost:8000/api/integrations/{id}/test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Utilisation dans Infracentra

### Rechercher des logs

```python
from app.services.elastic import ElasticService

elastic = ElasticService(
    url="http://localhost:9200",
    api_key="YourElasticApiKeyHere"
)

logs = await elastic.search_logs("error", hours=24)
print(f"Found {len(logs)} error logs in last 24h")
```

### Créer un cas de sécurité

```python
case = await elastic.create_security_case(
    title="Suspicious Login Attempt",
    description="Multiple failed login attempts from IP 185.220.101.47",
    severity="high",
    assignee="soc-team"
)
print(f"Created case: {case}")
```

### Récupérer les cas ouverts

```python
cases = await elastic.get_cases(status="open", severity="high")
print(f"Found {len(cases)} open high-severity cases")
```

## 🎯 Scénarios d'usage

### 1. Corrélation d'événements
- Collecte de logs depuis multiples sources
- Corrélation automatique
- Détection de patterns suspects

### 2. Investigation de sécurité
- Recherche full-text dans les logs
- Timeline reconstruction
- Export de preuves

### 3. Reporting
- Dashboards personnalisés
- Rapports automatisés
- Métriques de sécurité

## 🔧 Dépannage

### Problème : Impossible de se connecter à Elasticsearch
```bash
# Vérifier qu'Elasticsearch tourne
docker ps | grep elasticsearch

# Vérifier les logs
docker logs elasticsearch

# Tester l'API manuellement
curl -X GET "localhost:9200/_cluster/health?pretty"
```

### Problème : API Key invalide
```bash
# Régénérer la clé via Kibana
1. Se connecter à Kibana
2. Aller dans "Stack Management" → "API Keys"
3. Supprimer l'ancienne clé
4. Créer une nouvelle clé
```

### Problème : Index non trouvés
```bash
# Lister les index
curl -X GET "localhost:9200/_cat/indices?v" \
  -H "Authorization: ApiKey YOUR_API_KEY"

# Créer un index de test
curl -X PUT "localhost:9200/test-index" \
  -H "Authorization: ApiKey YOUR_API_KEY"
```

## 📚 Ressources

- [Documentation Elastic Security](https://www.elastic.co/guide/en/security/current/index.html)
- [Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Guide](https://www.elastic.co/guide/en/kibana/current/index.html)
- [API Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html)

---

**Status** : ✅ Intégration complète  
**Dernière mise à jour** : 2027-01-15
