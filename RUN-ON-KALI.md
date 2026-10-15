# ▶️ Run Infracentra on Kali Linux with Docker — **no build on your laptop**

This is the "works out of the box" copy of the project. The React frontend was
**already built** (it lives in `./dist`), so this stack never runs `npm install`
or `vite build` on your machine. It only pulls official latest images.

## What you get

| Service  | Image (latest)   | URL                                             | Notes |
|----------|------------------|-------------------------------------------------|-------|
| Frontend | `nginx:latest`   | http://localhost:3000                           | Serves the pre-built **landing page** + full app from `./dist` |
| Backend  | `python:3.12-slim` | http://localhost:8000/docs                    | FastAPI + Swagger; source mounted directly, deps cached in a volume |
| DB       | `postgres:18`    | localhost:5432                                  | user/pass/db: `infracentra` |
| Cache    | `redis:latest`   | localhost:6379                                  | |

The nginx config proxies `/api/` → backend, so the **integrations pages**
(Wazuh, pfSense, OPNsense, TheHive, MISP, Elastic, OpenVAS/GVM, Shuffle SOAR,
Zabbix, BorgBackup — logos served from `/logos/*.svg`) work against the live
FastAPI integration endpoints (`/api/integrations/*`).

## Steps (copy-paste)

```bash
# 1. Get the code onto Kali
git clone <your-repo-url> infracentra && cd infracentra

# 2. Install & start Docker (one shot)
sudo bash setup-kali.sh
newgrp docker          # or log out / log back in once

# 3. Launch everything — pull only, zero compilation
docker compose -f docker-compose.prebuilt.yml up -d

# 4. Verify
curl -s http://localhost:8000/health     # -> {"status":"healthy"}
xdg-open http://localhost:3000           # landing page
```

Stop / reset:

```bash
docker compose -f docker-compose.prebuilt.yml down          # stop
docker compose -f docker-compose.prebuilt.yml down -v       # wipe data too
```

## Notes

- `docker-compose.yml` (the original) still exists but requires building the
  frontend image — use `docker-compose.prebuilt.yml` instead.
- Login works offline (demo accounts are handled client-side); the backend is
  up for the API/integration routes and auto-creates its tables on startup.
- Change `SECRET_KEY` before exposing this anywhere public.

## Troubleshooting: `infracentra-db` shows as "unhealthy"

Two common causes on Kali:

1. **Corrupted/foreign-owned data volume** — if you previously ran the old
   stack (`postgres:15-alpine`, uid 70) or mixed rootless/sudo docker, the new
   postgres image sees files it doesn't own and crash-loops → never healthy.
2. **Slow first boot** — `initdb` can take longer than the old healthcheck
   window (fixed now with `start_period: 60s` + 10 retries).
3. **Postgres 18+ data-layout change (CONFIRMED cause of the error you saw)** —
   from postgres:18 onward, the official images store the cluster in a
   versioned subdirectory and expect ONE mount at `/var/lib/postgresql`
   (NOT `/var/lib/postgresql/data`). If an old volume created by a previous
   image is still attached, startup fails fatally with:
   *"there appears to be PostgreSQL data in /var/lib/postgresql/data
   (unused mount/volume)"*.
   The compose files are fixed (`pgdata:/var/lib/postgresql`), but the OLD
   named volume MUST be deleted once, otherwise Docker re-attaches it by name.

Fix (wipes only the Postgres data, keeps everything else):

```bash
chmod +x fix-db-health.sh && ./fix-db-health.sh
```

Or manually:

```bash
docker compose -f docker-compose.prebuilt.yml down
docker volume rm <project>_pgdata     # e.g. infracentra_pgdata — list with: docker volume ls
docker compose -f docker-compose.prebuilt.yml up -d
docker inspect --format '{{.State.Health.Status}}' infracentra-db   # -> healthy
```

If it still fails, check the real error with `docker logs infracentra-db`.
