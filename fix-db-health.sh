#!/usr/bin/env bash
# ============================================================================
# Fixes the "infracentra-db is unhealthy" problem on Kali Linux.
#
# Why db shows as unhealthy:
#   1. postgres refuses to start if /var/lib/postgresql/data has files owned
#      by the wrong user (typical after switching between rootless and sudo
#      docker, mixing postgres:alpine and postgres:debian images on the same
#      volume — uid 70 vs 999 — or after a crashed first boot). The container
#      restarts in a loop -> healthcheck never passes.
#   2. On slow machines the first-boot initdb can take longer than the old
#      5-retry healthcheck window, so compose marks it unhealthy even though
#      Postgres eventually comes up.
#
# This script recreates the db with the fixed compose file (start_period +
# more retries) and wipes only the Postgres volume if needed.
# Usage:  chmod +x fix-db-health.sh && ./fix-db-health.sh
# ============================================================================
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prebuilt.yml"

echo "[1/4] Stopping stack..."
$COMPOSE down --remove-orphans || true

echo "[2/4] Removing possibly-corrupted Postgres data volumes..."
# IMPORTANT: the postgres:18+ images changed their data layout. If you previously
# ran postgres:15-alpine / postgres:16 with the volume mounted at
#   /var/lib/postgresql/data
# the 18 image finds that old volume as an "unused mount" and REFUSES to start
# (fatal error: "there appears to be PostgreSQL data in /var/lib/postgresql/data").
# The fix compose file now mounts at /var/lib/postgresql instead — but the OLD
# volume must still be deleted, because Docker will re-attach it by name.
PROJECT="$(basename "$PWD")"
for vol in "${PROJECT}_pgdata" pgdata infracentra_pgdata; do
  if docker volume rm "$vol" 2>/dev/null; then
    echo "  Removed volume: $vol"
  fi
done
# Also remove any leftover bind-mount dir from older setups
if [ -d ./pg-data ]; then
  echo "  Removing stale ./pg-data bind mount directory..."
  sudo rm -rf ./pg-data 2>/dev/null || rm -rf ./pg-data
fi

echo "[3/4] Starting fresh stack (db will re-initialize cleanly)..."
$COMPOSE up -d

echo "[4/4] Waiting for infracentra-db to become healthy (max ~90s)..."
for i in $(seq 1 30); do
  status=$(docker inspect --format '{{.State.Health.Status}}' infracentra-db 2>/dev/null || echo "unknown")
  echo "  attempt $i: db health = $status"
  [ "$status" = "healthy" ] && break
  sleep 3
done

echo
echo "Current status of all containers:"
$COMPOSE ps

echo
echo "If db is still not healthy, show me these logs:"
echo "  docker logs infracentra-db"
