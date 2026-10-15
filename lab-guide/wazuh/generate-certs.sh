#!/bin/bash
# ============================================================================
# Script de génération des certificats SSL pour Wazuh
# Documentation : https://documentation.wazuh.com/current/user-manual/deployment-options/docker/wazuh-container.html
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  Génération des certificats SSL pour Wazuh${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""

# Créer les répertoires pour les certificats
echo -e "${YELLOW}[1/5] Création des répertoires...${NC}"
mkdir -p config/wazuh_indexer_ssl_certs
mkdir -p config/wazuh_manager_ssl_certs
mkdir -p config/wazuh_dashboard_ssl_certs

# ============================================================================
# Génération de l'autorité de certification (Root CA)
# ============================================================================
echo -e "${YELLOW}[2/5] Génération de l'autorité de certification...${NC}"

# Créer le fichier de configuration de l'CA
cat > config/root-ca.conf << 'EOF'
[ req ]
prompt = no
distinguished_name = req_distinguished_name

[ req_distinguished_name ]
C = US
ST = California
L = San Jose
O = Wazuh
OU = Wazuh Root CA
CN = Wazuh Root CA
EOF

# Générer la clé privée de l'CA
openssl genrsa -out config/root-ca-key.pem 2048

# Générer le certificat de l'CA
openssl req -x509 -new -nodes \
  -key config/root-ca-key.pem \
  -sha256 \
  -days 3650 \
  -out config/root-ca.pem \
  -config config/root-ca.conf

echo -e "${GREEN}✓ Root CA générée${NC}"
echo ""

# ============================================================================
# Génération des certificats pour Wazuh Indexer
# ============================================================================
echo -e "${YELLOW}[3/5] Génération des certificats pour Wazuh Indexer...${NC}"

# Créer le fichier de configuration pour l'indexer
cat > config/indexer.conf << 'EOF'
[ req ]
prompt = no
distinguished_name = req_distinguished_name
req_extensions = v3_req

[ req_distinguished_name ]
C = US
ST = California
L = San Jose
O = Wazuh
OU = Wazuh Indexer
CN = wazuh.indexer

[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = wazuh.indexer
DNS.2 = localhost
IP.1 = 127.0.0.1
IP.2 = 172.20.0.1
EOF

# Générer la clé privée
openssl genrsa -out config/indexer-key.pem 2048

# Générer la requête de certificat
openssl req -new \
  -key config/indexer-key.pem \
  -out config/indexer.csr \
  -config config/indexer.conf

# Signer le certificat avec l'CA
openssl x509 -req \
  -in config/indexer.csr \
  -CA config/root-ca.pem \
  -CAkey config/root-ca-key.pem \
  -CAcreateserial \
  -out config/indexer.pem \
  -days 3650 \
  -sha256 \
  -extensions v3_req \
  -extfile config/indexer.conf

# Copier les certificats dans le bon répertoire
cp config/indexer.pem config/wazuh_indexer_ssl_certs/
cp config/indexer-key.pem config/wazuh_indexer_ssl_certs/
cp config/root-ca.pem config/wazuh_indexer_ssl_certs/

# Générer le certificat admin
cat > config/admin.conf << 'EOF'
[ req ]
prompt = no
distinguished_name = req_distinguished_name

[ req_distinguished_name ]
C = US
ST = California
L = San Jose
O = Wazuh
OU = Wazuh Admin
CN = admin
EOF

openssl genrsa -out config/admin-key.pem 2048
openssl req -new \
  -key config/admin-key.pem \
  -out config/admin.csr \
  -config config/admin.conf

openssl x509 -req \
  -in config/admin.csr \
  -CA config/root-ca.pem \
  -CAkey config/root-ca-key.pem \
  -CAcreateserial \
  -out config/admin.pem \
  -days 3650 \
  -sha256

cp config/admin.pem config/wazuh_indexer_ssl_certs/
cp config/admin-key.pem config/wazuh_indexer_ssl_certs/

echo -e "${GREEN}✓ Certificats Indexer générés${NC}"
echo ""

# ============================================================================
# Génération des certificats pour Wazuh Manager
# ============================================================================
echo -e "${YELLOW}[4/5] Génération des certificats pour Wazuh Manager...${NC}"

cat > config/manager.conf << 'EOF'
[ req ]
prompt = no
distinguished_name = req_distinguished_name
req_extensions = v3_req

[ req_distinguished_name ]
C = US
ST = California
L = San Jose
O = Wazuh
OU = Wazuh Manager
CN = wazuh.manager

[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = wazuh.manager
DNS.2 = localhost
IP.1 = 127.0.0.1
IP.2 = 172.20.0.2
EOF

openssl genrsa -out config/manager-key.pem 2048
openssl req -new \
  -key config/manager-key.pem \
  -out config/manager.csr \
  -config config/manager.conf

openssl x509 -req \
  -in config/manager.csr \
  -CA config/root-ca.pem \
  -CAkey config/root-ca-key.pem \
  -CAcreateserial \
  -out config/manager.pem \
  -days 3650 \
  -sha256 \
  -extensions v3_req \
  -extfile config/manager.conf

cp config/manager.pem config/wazuh_manager_ssl_certs/sslmanager.cert
cp config/manager-key.pem config/wazuh_manager_ssl_certs/sslmanager.key
cp config/root-ca.pem config/wazuh_manager_ssl_certs/rootCA.pem

echo -e "${GREEN}✓ Certificats Manager générés${NC}"
echo ""

# ============================================================================
# Génération des certificats pour Wazuh Dashboard
# ============================================================================
echo -e "${YELLOW}[5/5] Génération des certificats pour Wazuh Dashboard...${NC}"

cat > config/dashboard.conf << 'EOF'
[ req ]
prompt = no
distinguished_name = req_distinguished_name
req_extensions = v3_req

[ req_distinguished_name ]
C = US
ST = California
L = San Jose
O = Wazuh
OU = Wazuh Dashboard
CN = wazuh.dashboard

[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = wazuh.dashboard
DNS.2 = localhost
IP.1 = 127.0.0.1
IP.2 = 172.20.0.3
IP.3 = 10.0.10.10
EOF

openssl genrsa -out config/dashboard-key.pem 2048
openssl req -new \
  -key config/dashboard-key.pem \
  -out config/dashboard.csr \
  -config config/dashboard.conf

openssl x509 -req \
  -in config/dashboard.csr \
  -CA config/root-ca.pem \
  -CAkey config/root-ca-key.pem \
  -CAcreateserial \
  -out config/dashboard.pem \
  -days 3650 \
  -sha256 \
  -extensions v3_req \
  -extfile config/dashboard.conf

cp config/dashboard.pem config/wazuh_dashboard_ssl_certs/dashboard.pem
cp config/dashboard-key.pem config/wazuh_dashboard_ssl_certs/dashboard-key.pem
cp config/root-ca.pem config/wazuh_dashboard_ssl_certs/root-ca.pem

echo -e "${GREEN}✓ Certificats Dashboard générés${NC}"
echo ""

# ============================================================================
# Configuration des permissions
# ============================================================================
echo -e "${YELLOW}Configuration des permissions...${NC}"

chmod 644 config/wazuh_indexer_ssl_certs/*.pem
chmod 600 config/wazuh_indexer_ssl_certs/*-key.pem
chmod 644 config/wazuh_manager_ssl_certs/*.cert
chmod 600 config/wazuh_manager_ssl_certs/*.key
chmod 644 config/wazuh_dashboard_ssl_certs/*.pem
chmod 600 config/wazuh_dashboard_ssl_certs/*-key.pem

echo -e "${GREEN}✓ Permissions configurées${NC}"
echo ""

# ============================================================================
# Résumé
# ============================================================================
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  Certificats SSL générés avec succès !${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${YELLOW}Fichiers générés :${NC}"
echo "  - config/wazuh_indexer_ssl_certs/"
echo "    • root-ca.pem (Root CA)"
echo "    • indexer.pem (Certificat Indexer)"
echo "    • indexer-key.pem (Clé privée Indexer)"
echo "    • admin.pem (Certificat Admin)"
echo "    • admin-key.pem (Clé privée Admin)"
echo ""
echo "  - config/wazuh_manager_ssl_certs/"
echo "    • sslmanager.cert (Certificat Manager)"
echo "    • sslmanager.key (Clé privée Manager)"
echo "    • rootCA.pem (Root CA)"
echo ""
echo "  - config/wazuh_dashboard_ssl_certs/"
echo "    • dashboard.pem (Certificat Dashboard)"
echo "    • dashboard-key.pem (Clé privée Dashboard)"
echo "    • root-ca.pem (Root CA)"
echo ""
echo -e "${YELLOW}Prochaine étape :${NC}"
echo "  docker-compose up -d"
echo ""
echo -e "${GREEN}✓ Prêt à démarrer Wazuh${NC}"
