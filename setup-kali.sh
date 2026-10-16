#!/usr/bin/env bash
# ============================================================================
# Infracentra — one-shot Docker installer for Kali Linux
# Installs docker.io + docker-compose-plugin from the Kali repos, enables the
# service and adds your user to the docker group. No laptop build required.
# Usage:  sudo bash setup-kali.sh
# ============================================================================
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root:  sudo bash setup-kali.sh"
  exit 1
fi

echo "[1/5] Updating apt (Kali repos)..."
apt-get update -qq

echo "[2/5] Installing Docker Engine + Compose plugin..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  docker.io docker-compose-plugin git >/dev/null || {
    # Fallback to Docker's official repo if Kali packages are unavailable
    curl -fsSL https://get.docker.com | sh
  }

echo "[3/5] Enabling & starting the docker service..."
systemctl enable --now docker

echo "[4/5] Adding current user to the docker group..."
REAL_USER="${SUDO_USER:-$USER}"
usermod -aG docker "$REAL_USER"

echo "[5/5] Versions:"
docker --version
docker compose version

echo
echo "==================================================================="
echo " Done. Log out & back in once (or run 'newgrp docker') so the"
echo " group change takes effect, then from this project folder:"
echo
echo "   docker compose -f docker-compose.prebuilt.yml up -d"
echo
echo " Landing page : http://localhost:3000"
echo " API + Swagger: http://localhost:8000/docs"
echo "==================================================================="
