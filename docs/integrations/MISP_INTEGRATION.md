# 🔌 Guide d'Intégration - MISP (Threat Intelligence)

## 📋 Vue d'ensemble

MISP (Malware Information Sharing Platform) est une plateforme open-source de partage d'informations sur les menaces. Cette intégration permet à Infracentra de :
- Récupérer les IoCs (Indicators of Compromise) en temps réel
- Corréler les menaces avec votre environnement
- Publier de nouveaux IoCs détectés
- Partager avec la communauté MISP

## 🚀 Installation de MISP

### Option 1 : Docker (Recommandé pour le lab)

```bash
# Cloner le repository MISP Docker
git clone https://github.com/MISP/misp-docker.git
cd misp-docker

# Configurer
cp .env.default .env
nano .env

# Modifier les variables
MISP_BASEURL=https://localhost
MISP_EMAIL=admin@misp.local
MISP_ADMIN_EMAIL=admin@misp.local
MISP_ADMIN_PASSWORD=YourSecurePassword123!

# Démarrer
docker-compose up -d

# Vérifier
docker-compose ps
```

### Option 2 : Installation native (Kali Linux)

```bash
# Installer les dépendances
apt-get install -y mariadb-server apache2 libapache2-mod-php php php-cli php-mysql \
  php-gd php-curl php-xml php-mbstring php-json php-zip php-redis git

# Cloner MISP
cd /var/www
git clone https://github.com/MISP/MISP.git
cd MISP
git checkout tags/$(git describe --tags `git rev-list --tags --max-count=1`)

# Installer les dépendances PHP
composer install --no-dev

# Configurer la base de données
mysql -u root -p
CREATE DATABASE misp;
CREATE USER 'misp'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON misp.* TO 'misp'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Initialiser la base
cat INSTALL/MYSQL.sql | mysql -u misp -pYourSecurePassword123! misp

# Configurer Apache
cp INSTALL/apache.misp.ubuntu /etc/apache2/sites-available/misp.conf
a2dissite 000-default
a2ensite misp
a2enmod rewrite
systemctl restart apache2
```

## 🔑 Configuration de l'API

### 1. Accéder à l'interface web

```bash
# URL
https://localhost

# Login par défaut
Email: admin@misp.local
Password: admin (changer immédiatement!)
```

### 2. Générer une clé API

```bash
# Via l'interface web
1. Se connecter en tant qu'admin
2. Aller dans "Administration" → "List users"
3. Cliquer sur votre utilisateur
4. Cliquer sur "Reset auth key"
5. Copier la nouvelle clé
```

### 3. Tester l'API

```bash
# Avec curl
curl -H "Authorization: YOUR_API_KEY" \
     -H "Accept: application/json" \
     -H "Content-type: application/json" \
     https://localhost/events/index

# Avec pymisp
python3 -c "
from pymisp import PyMISP
misp = PyMISP('https://localhost', 'YOUR_API_KEY', ssl=False)
print(misp.get_version())
"
```

## 🔗 Intégration avec Infracentra

### 1. Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier backend :

```env
MISP_URL=https://localhost
MISP_API_KEY=YourMISPApiKeyHere
```

### 2. Ajouter l'intégration via l'API Infracentra

```bash
curl -X POST "http://localhost:8000/api/integrations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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
```

### 3. Tester la connexion

```bash
curl -X POST "http://localhost:8000/api/integrations/{id}/test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Utilisation dans Infracentra

### Récupérer les IoCs

```python
from app.services.misp import MISPService

misp = MISPService(
    url="https://localhost",
    api_key="YourMISPApiKeyHere"
)

iocs = await misp.search_iocs(type_attribute="ip-dst")
print(f"Found {len(iocs)} IP IoCs")
```

### Publier un nouvel IoC

```python
result = await misp.publish_ioc(
    ioc_type="ip-dst",
    value="185.220.101.47",
    category="Network activity",
    threat_level=2,
    comment="Detected by Infracentra"
)
print(f"Published IoC: {result}")
```

### Récupérer les événements récents

```python
events = await misp.get_recent_events(hours=24)
print(f"Found {len(events)} events in last 24h")
```

## 🎯 Scénarios d'usage

### 1. Corrélation de menaces
- Infracentra détecte une activité suspecte
- Recherche dans MISP pour IoCs connus
- Enrichissement de l'alerte avec contexte

### 2. Partage de renseignements
- Détection d'un nouveau malware
- Publication automatique dans MISP
- Partage avec la communauté

### 3. Threat Hunting
- Recherche proactive d'IoCs
- Analyse des tendances
- Identification de campagnes

## 🔧 Dépannage

### Problème : Impossible de se connecter à MISP
```bash
# Vérifier que MISP tourne
docker ps | grep misp

# Vérifier les logs
docker logs misp-server

# Tester l'API manuellement
curl -k https://localhost/events/index
```

### Problème : Clé API invalide
```bash
# Régénérer la clé via l'interface web
1. Se connecter en tant qu'admin
2. Aller dans "Administration" → "List users"
3. Cliquer sur votre utilisateur
4. Cliquer sur "Reset auth key"
```

## 📚 Ressources

- [Documentation MISP](https://www.misp-project.org/)
- [API Documentation](https://www.circl.lu/doc/misp/)
- [GitHub](https://github.com/MISP/MISP)
- [PyMISP](https://github.com/MISP/PyMISP)

---

**Status** : ✅ Intégration complète  
**Dernière mise à jour** : 2027-01-15
