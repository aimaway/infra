# Infracentra - Production Deployment Guide

## 🚀 Quick Start (Development)

```bash
# Clean start
docker compose down -v
docker system prune -a --volumes -f

# Build and start
docker compose up --build -d

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001/docs
```

## 🔐 Demo Accounts

### Platform Admin
- **Email**: `ops@infracentra.io`
- **Password**: Any (mock auth)

### Client Admins
1. **Aegis Corp (Enterprise)**: `sarah.chen@aegiscorp.io`
2. **TechStart (SME)**: `jordan@techstart.io`
3. **MedSecure (Mid-Market)**: `dr.wong@medsecure.health`

### Client User
- **Email**: `marcus.j@aegiscorp.io`

---

## 🏭 Production Deployment

### Prerequisites
- Docker & Docker Compose
- Domain name with SSL certificate
- PostgreSQL 15+ (or use containerized)
- Redis 7+ (or use containerized)
- Minimum 4GB RAM, 2 CPU cores

### 1. Environment Configuration

Create `.env` file:

```env
# Database
POSTGRES_USER=infracentra_prod
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=infracentra_db
DATABASE_URL=postgresql+asyncpg://infracentra_prod:<password>@db:5432/infracentra_db

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
VITE_API_URL=https://api.yourdomain.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO
```

Generate secrets:
```bash
openssl rand -hex 32  # For SECRET_KEY
openssl rand -base64 32  # For POSTGRES_PASSWORD
```

### 2. SSL/TLS Configuration

Update `frontend/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # ... rest of config
}

server {
    listen 80;
    server_name app.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Production Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1'

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2'
      replicas: 2

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    command: celery -A app.tasks worker --loglevel=info --concurrency=4
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - backend
      - redis
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'

  beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    command: celery -A app.tasks beat --loglevel=info
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - backend
      - redis

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    restart: always
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend

volumes:
  pgdata:
  redisdata:

networks:
  default:
    driver: bridge
```

### 4. Database Backup Strategy

```bash
#!/bin/bash
# backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

# Create backup
docker exec infracentra-db pg_dump -U infracentra_prod infracentra_db > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Compress
gzip "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 7 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

### 5. Monitoring & Logging

**Prometheus + Grafana Setup**:

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheusdata:/prometheus
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  volumes:
    - grafanadata:/var/lib/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
```

**Log Aggregation with Loki**:

```yaml
loki:
  image: grafana/loki:latest
  volumes:
    - lokidata:/loki
  ports:
    - "3100:3100"

promtail:
  image: grafana/promtail:latest
  volumes:
    - /var/log:/var/log
    - ./promtail.yml:/etc/promtail/config.yml
```

### 6. Security Hardening

**Firewall Rules** (UFW):
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

**Fail2Ban**:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

**Automatic Security Updates**:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🔧 Open Source Tool Integrations

### 1. EDR/XDR Integration (Wazuh)

**Backend Integration** (`backend/app/integrations/wazuh.py`):

```python
import httpx
from typing import List, Dict

class WazuhIntegration:
    def __init__(self, base_url: str, api_user: str, api_password: str):
        self.base_url = base_url
        self.auth = (api_user, api_password)
    
    async def get_agents(self) -> List[Dict]:
        """Fetch all monitored agents"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/agents",
                auth=self.auth,
                params={"limit": 1000}
            )
            return response.json()["data"]["items"]
    
    async def get_alerts(self, level: int = 7) -> List[Dict]:
        """Fetch security alerts"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/alerts",
                auth=self.auth,
                params={"level__gte": level}
            )
            return response.json()["data"]["items"]
    
    async def isolate_agent(self, agent_id: str):
        """Isolate compromised endpoint"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.base_url}/agents/{agent_id}/isolate",
                auth=self.auth
            )
```

**Usage in ServiceGate**:
```python
# In src/components/ServiceGate.tsx
const checkEndpointProtection = async (orgId: string) => {
  const wazuh = new WazuhIntegration(
    process.env.WAZUH_URL!,
    process.env.WAZUH_USER!,
    process.env.WAZUH_PASSWORD!
  );
  
  const agents = await wazuh.get_agents();
  const orgAgents = agents.filter(a => a.org_id === orgId);
  
  return {
    totalAgents: orgAgents.length,
    onlineAgents: orgAgents.filter(a => a.status === 'active').length,
    alerts: await wazuh.get_alerts()
  };
};
```

### 2. SIEM Integration (Elastic Security)

**Backend Integration** (`backend/app/integrations/elastic.py`):

```python
from elasticsearch import AsyncElasticsearch

class ElasticSecurityIntegration:
    def __init__(self, url: str, api_key: str):
        self.es = AsyncElasticsearch(
            hosts=[url],
            api_key=api_key
        )
    
    async def search_threats(self, query: str) -> List[Dict]:
        """Search for threats in Elastic Security"""
        response = await self.es.search(
            index="logs-*",
            body={
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"event.category": "threat"}},
                            {"match": {"message": query}}
                        ]
                    }
                },
                "size": 100
            }
        )
        return response["hits"]["hits"]
    
    async def create_case(self, title: str, description: str, severity: str):
        """Create security case"""
        await self.es.index(
            index=".siem-signals-default",
            body={
                "title": title,
                "description": description,
                "severity": severity,
                "status": "open"
            }
        )
```

### 3. SOAR Integration (Shuffle)

**Backend Integration** (`backend/app/integrations/shuffle.py`):

```python
import httpx

class ShuffleIntegration:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {api_key}"}
    
    async def execute_workflow(self, workflow_id: str, parameters: Dict):
        """Execute SOAR workflow"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/workflows/{workflow_id}/execute",
                headers=self.headers,
                json=parameters
            )
            return response.json()
    
    async def list_workflows(self) -> List[Dict]:
        """List available workflows"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/workflows",
                headers=self.headers
            )
            return response.json()
```

**Example Playbook Execution**:
```python
# Ransomware Response Playbook
async def ransomware_response(endpoint_id: str, ioc: str):
    shuffle = ShuffleIntegration(SHUFFLE_URL, SHUFFLE_API_KEY)
    
    # Step 1: Isolate endpoint
    await shuffle.execute_workflow("isolate-endpoint", {
        "endpoint_id": endpoint_id
    })
    
    # Step 2: Block IOC
    await shuffle.execute_workflow("block-ioc", {
        "ioc": ioc,
        "type": "ip"
    })
    
    # Step 3: Notify SOC
    await shuffle.execute_workflow("notify-soc", {
        "severity": "critical",
        "message": f"Ransomware detected on {endpoint_id}"
    })
```

### 4. Threat Intelligence (MISP)

**Backend Integration** (`backend/app/integrations/misp.py`):

```python
from pymisp import PyMISP

class MISPIntegration:
    def __init__(self, url: str, api_key: str):
        self.misp = PyMISP(url, api_key)
    
    async def search_iocs(self, event_id: str = None) -> List[Dict]:
        """Search for IoCs"""
        if event_id:
            event = self.misp.get_event(event_id)
            return event["Event"]["Attribute"]
        else:
            events = self.misp.search(last="24h")
            return [attr for e in events for attr in e["Event"]["Attribute"]]
    
    async def publish_ioc(self, ioc_type: str, value: str, threat_level: int):
        """Publish new IoC"""
        event = self.misp.new_event(
            threat_level_id=threat_level,
            analysis=1,
            info=f"New {ioc_type} from Infracentra"
        )
        self.misp.add_attribute(
            event["Event"]["id"],
            {"type": ioc_type, "value": value}
        )
```

### 5. Vulnerability Scanning (OpenVAS)

**Backend Integration** (`backend/app/integrations/openvas.py`):

```python
import httpx

class OpenVASIntegration:
    def __init__(self, host: str, port: int, username: str, password: str):
        self.base_url = f"https://{host}:{port}"
        self.auth = (username, password)
    
    async def start_scan(self, target: str, scan_config: str):
        """Start vulnerability scan"""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                f"{self.base_url}/omp",
                auth=self.auth,
                params={
                    "cmd": "create_task",
                    "name": f"Infracentra Scan - {target}",
                    "target": target,
                    "config": scan_config
                }
            )
            return response.json()
    
    async def get_results(self, task_id: str) -> List[Dict]:
        """Get scan results"""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(
                f"{self.base_url}/omp",
                auth=self.auth,
                params={
                    "cmd": "get_results",
                    "task_id": task_id
                }
            )
            return response.json()["results"]
```

### 6. Network Monitoring (Zabbix)

**Backend Integration** (`backend/app/integrations/zabbix.py`):

```python
from pyzabbix import ZabbixAPI

class ZabbixIntegration:
    def __init__(self, url: str, user: str, password: str):
        self.zapi = ZabbixAPI(url)
        self.zapi.login(user, password)
    
    async def get_hosts(self) -> List[Dict]:
        """Get monitored hosts"""
        return self.zapi.host.get(output="extend")
    
    async def get_triggers(self, severity: int = 3) -> List[Dict]:
        """Get active triggers"""
        return self.zapi.trigger.get(
            output="extend",
            min_severity=severity,
            only_true=True
        )
    
    async def get_metrics(self, host_id: str, item_key: str) -> List[Dict]:
        """Get host metrics"""
        return self.zapi.history.get(
            hostids=[host_id],
            output="extend",
            history=0,  # Numeric float
            sortfield="clock",
            sortorder="DESC",
            limit=100
        )
```

### 7. Patch Management (TheHive + Cortex)

**Backend Integration** (`backend/app/integrations/thehive.py`):

```python
from thehive4py.api import TheHiveApi

class TheHiveIntegration:
    def __init__(self, url: str, api_key: str):
        self.api = TheHiveApi(url, api_key)
    
    async def create_case(self, title: str, description: str, severity: int):
        """Create incident case"""
        case = self.api.create_case(
            title=title,
            description=description,
            severity=severity
        )
        return case.json()
    
    async def add_task(self, case_id: str, title: str, description: str):
        """Add task to case"""
        self.api.create_case_task(
            case_id,
            title=title,
            description=description
        )
```

---

## 📊 Service Architecture

### How Services Work

```
┌─────────────────────────────────────────────────────────────┐
│                    Infracentra Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │───▶│   Backend    │───▶│  Database    │  │
│  │  (React/Vite)│    │  (FastAPI)   │    │ (PostgreSQL) │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                              │                               │
│                              ▼                               │
│                       ┌──────────────┐                      │
│                       │    Redis     │                      │
│                       │  (Cache/Queue)│                      │
│                       └──────┬───────┘                      │
│                              │                               │
│         ┌────────────────────┼────────────────────┐         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Celery     │    │   Celery     │    │  Integrations│  │
│  │   Worker     │    │    Beat      │    │   Layer      │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                  │          │
└──────────────────────────────────────────────────┼──────────┘
                                                   │
              ┌────────────────────────────────────┼────────┐
              │                                    │        │
              ▼                                    ▼        │
    ┌─────────────────┐              ┌─────────────────┐   │
    │  Wazuh (EDR)    │              │  Elastic (SIEM) │   │
    │  - Agents       │              │  - Logs         │   │
    │  - Alerts       │              │  - Cases        │   │
    │  - Isolation    │              │  - Dashboards   │   │
    └─────────────────┘              └─────────────────┘   │
              │                                    │        │
              ▼                                    ▼        │
    ┌─────────────────┐              ┌─────────────────┐   │
    │  MISP (Threat)  │              │ Shuffle (SOAR)  │   │
    │  - IoCs         │              │  - Playbooks    │   │
    │  - Events       │              │  - Automation   │   │
    │  - Sharing      │              │  - Workflows    │   │
    └─────────────────┘              └─────────────────┘   │
              │                                    │        │
              ▼                                    ▼        │
    ┌─────────────────┐              ┌─────────────────┐   │
    │ OpenVAS (Vuln)  │              │  Zabbix (NMS)   │   │
    │  - Scans        │              │  - Monitoring   │   │
    │  - CVEs         │              │  - Metrics      │   │
    │  - Reports      │              │  - Triggers     │   │
    └─────────────────┘              └─────────────────┘   │
                                                            │
              ┌─────────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ TheHive (Cases) │
    │  - Incidents    │
    │  - Tasks        │
    │  - Observables  │
    └─────────────────┘
```

### Data Flow Example: Ransomware Detection

1. **Detection**: Wazuh agent detects suspicious process
2. **Alert**: Wazuh sends alert to Infracentra backend
3. **Correlation**: Backend correlates with MISP IoCs
4. **Enrichment**: Elastic Security provides context
5. **Response**: Shuffle executes ransomware playbook
   - Isolate endpoint (Wazuh)
   - Block IOC (Firewall)
   - Create case (TheHive)
   - Notify SOC (Slack/PagerDuty)
6. **Logging**: All actions logged to audit trail
7. **Compliance**: Evidence auto-collected for NIST mapping

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall rules (UFW/iptables)
- [ ] Enable fail2ban
- [ ] Set up automatic security updates
- [ ] Configure database backups
- [ ] Enable audit logging
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation (Loki/ELK)
- [ ] Enable MFA for all admin accounts
- [ ] Review API rate limiting
- [ ] Configure CORS properly
- [ ] Set up intrusion detection (OSSEC/Wazuh)
- [ ] Regular security scans (OpenVAS)
- [ ] Document incident response procedures

---

## 📈 Scaling Guide

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '2'
        memory: 2G

worker:
  deploy:
    replicas: 5
    resources:
      limits:
        cpus: '1'
        memory: 1G
```

### Load Balancing

```nginx
# nginx.conf
upstream backend {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX idx_threats_ioc ON threats(ioc);
CREATE INDEX idx_users_org ON users(org_id);

-- Partition large tables
CREATE TABLE alerts_2027 PARTITION OF alerts
    FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Container won't start**
```bash
docker logs <container-name>
docker inspect <container-name>
```

**2. Database connection refused**
```bash
# Check if DB is healthy
docker exec infracentra-db pg_isready -U infracentra_prod

# Restart DB
docker compose restart db
```

**3. Frontend not loading**
```bash
# Check nginx config
docker exec infracentra-frontend nginx -t

# View logs
docker logs infracentra-frontend
```

**4. High memory usage**
```bash
# Check resource usage
docker stats

# Restart memory-heavy services
docker compose restart worker
```

---

## 📞 Support

- **Documentation**: https://docs.infracentra.io
- **GitHub Issues**: https://github.com/infracentra/platform/issues
- **Email**: support@infracentra.io
- **Discord**: https://discord.gg/infracentra

---

## 📝 Changelog

### v1.0.0 (2027-01-15)
- Initial production release
- 16 integrated services
- Multi-tenant architecture
- Service entitlement enforcement
- API key management
- License management
- Device monitoring
- Open source tool integrations
