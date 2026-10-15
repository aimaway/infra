#!/bin/bash
# ============================================================================
# Script d'installation pour soc-siem VM (Wazuh + Zabbix)
# Host : M1 (Proxmox)
# IP : 10.0.10.10
# Réseau : SOC (vmbr1)
# ============================================================================

set -e  # Exit on error

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  Installation de soc-siem VM (Wazuh + Zabbix)${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""

# ============================================================================
# ÉTAPE 1 : Configuration système de base
# ============================================================================
echo -e "${YELLOW}[1/10] Configuration système de base...${NC}"

# Mettre à jour le système
apt update && apt upgrade -y

# Installer les paquets essentiels
apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    net-tools \
    iproute2 \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    python3 \
    python3-pip

# Configurer le hostname
hostnamectl set-hostname soc-siem

# Configurer le fuseau horaire
timedatectl set-timezone Europe/Paris

# Configurer les locales
locale-gen en_US.UTF-8
update-locale LANG=en_US.UTF-8

echo -e "${GREEN}✓ Système de base configuré${NC}"
echo ""

# ============================================================================
# ÉTAPE 2 : Configuration réseau
# ============================================================================
echo -e "${YELLOW}[2/10] Configuration réseau...${NC}"

# Configuration réseau statique
cat > /etc/netplan/01-netcfg.yaml << 'EOF'
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 10.0.10.10/24
      gateway4: 10.0.10.1
      nameservers:
        addresses: [10.0.10.1, 8.8.8.8, 1.1.1.1]
EOF

# Appliquer la configuration réseau
netplan apply

# Attendre que le réseau soit prêt
sleep 5

# Tester la connectivité
ping -c 3 10.0.10.1 || echo -e "${RED}⚠ Impossible de ping le gateway${NC}"
ping -c 3 8.8.8.8 || echo -e "${RED}⚠ Impossible de ping Internet${NC}"

echo -e "${GREEN}✓ Réseau configuré (10.0.10.10)${NC}"
echo ""

# ============================================================================
# ÉTAPE 3 : Installation de Docker
# ============================================================================
echo -e "${YELLOW}[3/10] Installation de Docker...${NC}"

# Supprimer les anciennes versions
apt remove -y docker docker-engine docker.io containerd runc || true

# Ajouter la clé GPG officielle de Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Ajouter le repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter l'utilisateur courant au groupe docker
usermod -aG docker $SUDO_USER

# Démarrer et activer Docker
systemctl start docker
systemctl enable docker

# Vérifier l'installation
docker --version
docker-compose version || docker compose version

echo -e "${GREEN}✓ Docker installé${NC}"
echo ""

# ============================================================================
# ÉTAPE 4 : Configuration du firewall (UFW)
# ============================================================================
echo -e "${YELLOW}[4/10] Configuration du firewall...${NC}"

# Installer UFW
apt install -y ufw

# Configurer les règles
ufw default deny incoming
ufw default allow outgoing

# Autoriser SSH
ufw allow 22/tcp comment 'SSH'

# Autoriser Wazuh
ufw allow 1514/tcp comment 'Wazuh Agent'
ufw allow 1515/tcp comment 'Wazuh Agent Enrollment'
ufw allow 1514/udp comment 'Wazuh Agent UDP'
ufw allow 55000/tcp comment 'Wazuh API'

# Autoriser Zabbix
ufw allow 10050/tcp comment 'Zabbix Agent'
ufw allow 10051/tcp comment 'Zabbix Server'
ufw allow 8080/tcp comment 'Zabbix Web'

# Autoriser HTTPS pour Wazuh Dashboard
ufw allow 443/tcp comment 'Wazuh Dashboard HTTPS'

# Activer UFW
echo "y" | ufw enable

# Vérifier le statut
ufw status verbose

echo -e "${GREEN}✓ Firewall configuré${NC}"
echo ""

# ============================================================================
# ÉTAPE 5 : Création des répertoires de données
# ============================================================================
echo -e "${YELLOW}[5/10] Création des répertoires de données...${NC}"

# Créer les répertoires pour Wazuh
mkdir -p /opt/wazuh/{config,logs,queue,etc}
mkdir -p /opt/wazuh-indexer/{data,backups}
mkdir -p /opt/wazuh-dashboard/{data,config}

# Créer les répertoires pour Zabbix
mkdir -p /opt/zabbix/{config,data,snmptraps,alertscripts,externalscripts}
mkdir -p /var/lib/zabbix

# Définir les permissions
chown -R 1000:1000 /opt/wazuh*
chown -R 1996:1996 /opt/zabbix  # UID de l'utilisateur Zabbix dans le container

echo -e "${GREEN}✓ Répertoires créés${NC}"
echo ""

# ============================================================================
# ÉTAPE 6 : Configuration des variables d'environnement
# ============================================================================
echo -e "${YELLOW}[6/10] Configuration des variables d'environnement...${NC}"

cat > /opt/.env << 'EOF'
# ============================================================================
# Variables d'environnement pour soc-siem
# ============================================================================

# Wazuh
WAZUH_IMAGE_VERSION=4.7.2
WAZUH_PASSWORD=SecretPassword123!

# Zabbix
ZABBIX_DB_PASSWORD=zabbix_password_2027

# Réseau
NETWORK_NAME=siem-network
SUBNET=172.20.0.0/16

# Stockage
WAZUH_DATA_DIR=/opt/wazuh
WAZUH_INDEXER_DATA_DIR=/opt/wazuh-indexer/data
WAZUH_DASHBOARD_DATA_DIR=/opt/wazuh-dashboard/data
ZABBIX_DATA_DIR=/opt/zabbix/data
EOF

# Protéger le fichier
chmod 600 /opt/.env

echo -e "${GREEN}✓ Variables d'environnement configurées${NC}"
echo ""

# ============================================================================
# ÉTAPE 7 : Création du réseau Docker
# ============================================================================
echo -e "${YELLOW}[7/10] Création du réseau Docker...${NC}"

# Créer le réseau Docker pour les containers SIEM
docker network create --driver bridge --subnet 172.20.0.0/16 siem-network || echo "Le réseau existe déjà"

# Vérifier
docker network ls | grep siem-network

echo -e "${GREEN}✓ Réseau Docker créé${NC}"
echo ""

# ============================================================================
# ÉTAPE 8 : Installation de Docker Compose (standalone)
# ============================================================================
echo -e "${YELLOW}[8/10] Installation de Docker Compose standalone...${NC}"

# Télécharger Docker Compose v2
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
chmod +x /usr/local/bin/docker-compose

# Vérifier
docker-compose --version

echo -e "${GREEN}✓ Docker Compose installé${NC}"
echo ""

# ============================================================================
# ÉTAPE 9 : Configuration du swap (si nécessaire)
# ============================================================================
echo -e "${YELLOW}[9/10] Configuration du swap...${NC}"

# Vérifier si le swap existe déjà
if [ $(swapon --show | wc -l) -eq 0 ]; then
    # Créer un fichier de swap de 4GB
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Ajouter au fstab pour persistance
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # Configurer swappiness
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    
    echo -e "${GREEN}✓ Swap configuré (4GB)${NC}"
else
    echo -e "${YELLOW}⚠ Swap déjà configuré${NC}"
fi

echo ""

# ============================================================================
# ÉTAPE 10 : Scripts de gestion
# ============================================================================
echo -e "${YELLOW}[10/10] Création des scripts de gestion...${NC}"

# Script pour démarrer tous les services
cat > /usr/local/bin/siem-start << 'EOF'
#!/bin/bash
echo "Démarrage des services SIEM..."
cd /opt/wazuh && docker-compose up -d
cd /opt/zabbix && docker-compose up -d
echo "Tous les services sont démarrés"
docker ps
EOF

# Script pour arrêter tous les services
cat > /usr/local/bin/siem-stop << 'EOF'
#!/bin/bash
echo "Arrêt des services SIEM..."
cd /opt/wazuh && docker-compose down
cd /opt/zabbix && docker-compose down
echo "Tous les services sont arrêtés"
EOF

# Script pour redémarrer tous les services
cat > /usr/local/bin/siem-restart << 'EOF'
#!/bin/bash
echo "Redémarrage des services SIEM..."
siem-stop
sleep 5
siem-start
EOF

# Script pour voir les logs
cat > /usr/local/bin/siem-logs << 'EOF'
#!/bin/bash
echo "Logs des services SIEM (Ctrl+C pour quitter)..."
cd /opt/wazuh && docker-compose logs -f
EOF

# Rendre les scripts exécutables
chmod +x /usr/local/bin/siem-*

echo -e "${GREEN}✓ Scripts de gestion créés${NC}"
echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  Installation terminée avec succès !${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${YELLOW}Prochaines étapes :${NC}"
echo "1. Copier les fichiers docker-compose.yml dans /opt/wazuh et /opt/zabbix"
echo "2. Démarrer les services : siem-start"
echo "3. Accéder aux interfaces :"
echo "   - Wazuh Dashboard : https://10.0.10.10"
echo "   - Zabbix Web : http://10.0.10.10:8080"
echo ""
echo -e "${YELLOW}Commandes utiles :${NC}"
echo "  siem-start    : Démarrer tous les services"
echo "  siem-stop     : Arrêter tous les services"
echo "  siem-restart  : Redémarrer tous les services"
echo "  siem-logs     : Voir les logs"
echo ""
echo -e "${YELLOW}Identifiants par défaut :${NC}"
echo "  Wazuh : admin / SecretPassword123!"
echo "  Zabbix : Admin / zabbix"
echo ""
echo -e "${GREEN}✓ Système prêt pour le déploiement de Wazuh et Zabbix${NC}"
