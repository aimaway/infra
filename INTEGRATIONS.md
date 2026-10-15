# Infracentra - Open Source Tool Integration Guide

## 🎯 Overview

This guide explains how each Infracentra service integrates with open-source security and infrastructure tools. Each integration includes:
- Architecture diagram
- Configuration steps
- Code examples
- API endpoints
- Troubleshooting

---

## 📋 Table of Contents

1. [EDR/XDR - Wazuh](#1-edrxdr---wazuh)
2. [SIEM - Elastic Security](#2-siem---elastic-security)
3. [SOAR - Shuffle](#3-soar---shuffle)
4. [Threat Intelligence - MISP](#4-threat-intelligence---misp)
5. [Vulnerability Scanning - OpenVAS](#5-vulnerability-scanning---openvas)
6. [Network Monitoring - Zabbix](#6-network-monitoring---zabbix)
7. [Incident Management - TheHive](#7-incident-management---thehive)
8. [Log Management - Graylog](#8-log-management---graylog)
9. [Firewall Management - pfSense/OPNsense](#9-firewall-management---pfsenseopnsense)
10. [Backup & DR - BorgBackup + Restic](#10-backup--dr---borgbackup--restic)

---

## 1. EDR/XDR - Wazuh

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Infracentra                           │
│  ┌──────────────┐      ┌──────────────────────────┐    │
│  │   Frontend   │─────▶│  Wazuh Integration API   │    │
│  └──────────────┘      └────────────┬─────────────┘    │
│                                      │                   │
└──────────────────────────────────────┼───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
                    ▼                  ▼                   ▼
           ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
           │ Wazuh Manager│  │ Wazuh Indexer│   │ Wazuh Agents │
           │  (API Server)│  │  (OpenSearch)│   │  (Endpoints) │
           └──────────────┘  └──────────────┘   └──────────────┘
```

### Setup

**1. Install Wazuh**

```bash
# Docker deployment
docker run -d --name wazuh.manager \
  -p 514:514/udp \
  -p 1514:1514 \
  -p 1515:1515 \
  -p 55000:55000 \
  wazuh/wazuh:4.7.0

# Install agent on endpoints
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-agent
```

**2. Configure Infracentra Integration**

`backend/app/integrations/wazuh.py`:

```python
import httpx
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class WazuhIntegration:
    """
    Wazuh EDR/XDR Integration
    
    Features:
    - Agent management
    - Alert retrieval
    - Endpoint isolation
    - File integrity monitoring
    - Vulnerability detection
    """
    
    def __init__(self, base_url: str, api_user: str, api_password: str):
        self.base_url = base_url.rstrip('/')
        self.auth = (api_user, api_password)
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_agents(self, org_id: str = None) -> List[Dict]:
        """
        Get all monitored agents
        
        Returns:
            List of agent objects with status, OS, IP, etc.
        """
        params = {"limit": 1000, "select": "id,name,ip,status,os,version"}
        
        if org_id:
            # Filter by organization (custom field)
            params["group"] = org_id
        
        response = await self.client.get(
            f"{self.base_url}/agents",
            auth=self.auth,
            params=params
        )
        response.raise_for_status()
        
        data = response.json()
        return data.get("data", {}).get("affected_items", [])
    
    async def get_alerts(
        self,
        level: int = 7,
        hours: int = 24,
        agent_id: str = None
    ) -> List[Dict]:
        """
        Get security alerts
        
        Args:
            level: Minimum alert level (0-15)
            hours: Time range in hours
            agent_id: Filter by specific agent
        
        Returns:
            List of alert objects
        """
        params = {
            "level__gte": level,
            "limit": 500,
            "sort": "-timestamp"
        }
        
        if agent_id:
            params["agent_id"] = agent_id
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        params["date_from"] = start_time.isoformat() + "Z"
        params["date_to"] = end_time.isoformat() + "Z"
        
        response = await self.client.get(
            f"{self.base_url}/alerts",
            auth=self.auth,
            params=params
        )
        response.raise_for_status()
        
        data = response.json()
        return data.get("data", {}).get("affected_items", [])
    
    async def isolate_agent(self, agent_id: str) -> Dict:
        """
        Isolate compromised endpoint from network
        
        This prevents lateral movement while allowing
        communication with Wazuh manager for remediation.
        
        Args:
            agent_id: Wazuh agent ID
        
        Returns:
            Isolation status
        """
        response = await self.client.put(
            f"{self.base_url}/agents/{agent_id}/restart",
            auth=self.auth,
            json={"isolate": True}
        )
        response.raise_for_status()
        
        return {
            "agent_id": agent_id,
            "status": "isolated",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_vulnerabilities(self, agent_id: str) -> List[Dict]:
        """
        Get detected vulnerabilities for an agent
        
        Returns:
            List of CVEs with severity and status
        """
        response = await self.client.get(
            f"{self.base_url}/vulnerability/{agent_id}",
            auth=self.auth,
            params={"limit": 100}
        )
        response.raise_for_status()
        
        data = response.json()
        return data.get("data", {}).get("affected_items", [])
    
    async def run_fim_scan(self, agent_id: str) -> Dict:
        """
        Trigger File Integrity Monitoring scan
        
        Args:
            agent_id: Wazuh agent ID
        
        Returns:
            Scan status
        """
        response = await self.client.put(
            f"{self.base_url}/agents/{agent_id}/restart",
            auth=self.auth
        )
        response.raise_for_status()
        
        return {
            "agent_id": agent_id,
            "action": "fim_scan",
            "status": "triggered"
        }
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Usage in FastAPI endpoint
from fastapi import APIRouter, Depends
from app.integrations.wazuh import WazuhIntegration

router = APIRouter()

@router.get("/endpoint-protection/agents")
async def get_agents(org_id: str):
    """Get all monitored endpoints for organization"""
    wazuh = WazuhIntegration(
        base_url="https://wazuh.local:55000",
        api_user="wazuh-admin",
        api_password="your-password"
    )
    
    try:
        agents = await wazuh.get_agents(org_id)
        return {
            "total": len(agents),
            "online": len([a for a in agents if a["status"] == "active"]),
            "agents": agents
        }
    finally:
        await wazuh.close()

@router.post("/endpoint-protection/isolate/{agent_id}")
async def isolate_endpoint(agent_id: str):
    """Isolate compromised endpoint"""
    wazuh = WazuhIntegration(
        base_url="https://wazuh.local:55000",
        api_user="wazuh-admin",
        api_password="your-password"
    )
    
    try:
        result = await wazuh.isolate_agent(agent_id)
        
        # Log to audit trail
        await log_audit_event(
            action="endpoint.isolated",
            resource="Agent",
            resource_id=agent_id,
            details=f"Endpoint {agent_id} isolated due to security incident"
        )
        
        return result
    finally:
        await wazuh.close()
```

**3. Frontend Integration**

`src/pages/EndpointProtectionPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Agent {
  id: string;
  name: string;
  ip: string;
  status: string;
  os: { name: string; version: string };
  version: string;
}

export default function EndpointProtectionPage() {
  const { organization } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await fetch(
        `/api/endpoint-protection/agents?org_id=${organization?.id}`
      );
      const data = await response.json();
      setAgents(data.agents);
      setLoading(false);
    };

    fetchAgents();
  }, [organization]);

  const handleIsolate = async (agentId: string) => {
    if (!confirm('Isolate this endpoint? This will disconnect it from the network.')) {
      return;
    }

    const response = await fetch(
      `/api/endpoint-protection/isolate/${agentId}`,
      { method: 'POST' }
    );

    if (response.ok) {
      alert('Endpoint isolated successfully');
      // Refresh agent list
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Endpoint Protection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Agents</p>
          <p className="text-2xl font-bold text-white">{agents.length}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Online</p>
          <p className="text-2xl font-bold text-cyber-green">
            {agents.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Offline</p>
          <p className="text-2xl font-bold text-cyber-red">
            {agents.filter(a => a.status !== 'active').length}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Hostname</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">IP</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">OS</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Agent Version</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-slate-200">{agent.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{agent.ip}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {agent.os.name} {agent.os.version}
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${
                    agent.status === 'active' ? 'text-cyber-green' : 'text-cyber-red'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'active' ? 'bg-cyber-green' : 'bg-cyber-red'
                    }`} />
                    {agent.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{agent.version}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleIsolate(agent.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 border border-red-500/20"
                  >
                    Isolate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Configuration

**Environment Variables**:

```env
# Wazuh Integration
WAZUH_URL=https://wazuh.local:55000
WAZUH_API_USER=wazuh-admin
WAZUH_API_PASSWORD=your-secure-password
WAZUH_VERIFY_SSL=true
```

**Docker Compose Addition**:

```yaml
services:
  wazuh:
    image: wazuh/wazuh:4.7.0
    ports:
      - "514:514/udp"
      - "1514:1514"
      - "1515:1515"
      - "55000:55000"
    environment:
      - API_USERNAME=wazuh-admin
      - API_PASSWORD=your-secure-password
    volumes:
      - wazuh_data:/var/ossec/data
      - wazuh_logs:/var/ossec/logs
```

---

## 2. SIEM - Elastic Security

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Infracentra                           │
│  ┌──────────────┐      ┌──────────────────────────┐    │
│  │   Frontend   │─────▶│ Elastic Integration API  │    │
│  └──────────────┘      └────────────┬─────────────┘    │
│                                      │                   │
└──────────────────────────────────────┼───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
                    ▼                  ▼                   ▼
           ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
           │Elasticsearch │  │ Kibana       │   │   Beats      │
           │  (Data Store)│  │  (UI/Dash)   │   │  (Collectors)│
           └──────────────┘  └──────────────┘   └──────────────┘
```

### Setup

**1. Install Elastic Stack**

```bash
# Docker deployment
docker network create elastic

docker run -d --name elasticsearch --net elastic \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=true" \
  -e "ELASTIC_PASSWORD=your-password" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

docker run -d --name kibana --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  -e "ELASTICSEARCH_USERNAME=kibana_system" \
  -e "ELASTICSEARCH_PASSWORD=your-password" \
  docker.elastic.co/kibana/kibana:8.11.0
```

**2. Configure Infracentra Integration**

`backend/app/integrations/elastic.py`:

```python
from elasticsearch import AsyncElasticsearch
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class ElasticSecurityIntegration:
    """
    Elastic Security SIEM Integration
    
    Features:
    - Log search and correlation
    - Security case management
    - Threat detection rules
    - Dashboard integration
    """
    
    def __init__(self, url: str, api_key: str):
        self.es = AsyncElasticsearch(
            hosts=[url],
            api_key=api_key,
            request_timeout=30
        )
    
    async def search_logs(
        self,
        query: str,
        index: str = "logs-*",
        hours: int = 24,
        size: int = 100
    ) -> List[Dict]:
        """
        Search logs with full-text query
        
        Args:
            query: Search query (supports Lucene syntax)
            index: Index pattern
            hours: Time range
            size: Max results
        
        Returns:
            List of log documents
        """
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        body = {
            "query": {
                "bool": {
                    "must": [
                        {"query_string": {"query": query}}
                    ],
                    "filter": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": start_time.isoformat() + "Z",
                                    "lte": end_time.isoformat() + "Z"
                                }
                            }
                        }
                    ]
                }
            },
            "size": size,
            "sort": [{"@timestamp": {"order": "desc"}}]
        }
        
        response = await self.es.search(index=index, body=body)
        
        return [
            {
                "id": hit["_id"],
                "timestamp": hit["_source"]["@timestamp"],
                "message": hit["_source"].get("message", ""),
                "source": hit["_source"].get("agent", {}).get("name", ""),
                "severity": hit["_source"].get("log", {}).get("level", "info"),
                "raw": hit["_source"]
            }
            for hit in response["hits"]["hits"]
        ]
    
    async def create_security_case(
        self,
        title: str,
        description: str,
        severity: str,
        assignee: str = None
    ) -> Dict:
        """
        Create security case in Elastic Security
        
        Args:
            title: Case title
            description: Case description
            severity: low/medium/high/critical
            assignee: Username
        
        Returns:
            Created case object
        """
        case = {
            "title": title,
            "description": description,
            "severity": severity,
            "status": "open",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "created_by": "infracentra"
        }
        
        if assignee:
            case["assignee"] = assignee
        
        response = await self.es.index(
            index=".siem-signals-default",
            body=case,
            refresh=True
        )
        
        return {
            "id": response["_id"],
            "title": title,
            "severity": severity,
            "status": "open"
        }
    
    async def get_cases(
        self,
        status: str = "open",
        severity: str = None
    ) -> List[Dict]:
        """
        Get security cases
        
        Args:
            status: Filter by status
            severity: Filter by severity
        
        Returns:
            List of cases
        """
        query = {
            "bool": {
                "must": [
                    {"term": {"status": status}}
                ]
            }
        }
        
        if severity:
            query["bool"]["must"].append({"term": {"severity": severity}})
        
        response = await self.es.search(
            index=".siem-signals-default",
            body={"query": query, "size": 100}
        )
        
        return [
            {
                "id": hit["_id"],
                "title": hit["_source"]["title"],
                "description": hit["_source"]["description"],
                "severity": hit["_source"]["severity"],
                "status": hit["_source"]["status"],
                "created_at": hit["_source"]["created_at"]
            }
            for hit in response["hits"]["hits"]
        ]
    
    async def close(self):
        """Close Elasticsearch client"""
        await self.es.close()
```

### Configuration

**Environment Variables**:

```env
# Elastic Security Integration
ELASTIC_URL=https://elasticsearch.local:9200
ELASTIC_API_KEY=your-api-key
ELASTIC_VERIFY_SSL=true
```

---

## 3. SOAR - Shuffle

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Infracentra                           │
│  ┌──────────────┐      ┌──────────────────────────┐    │
│  │   Frontend   │─────▶│  Shuffle Integration API │    │
│  └──────────────┘      └────────────┬─────────────┘    │
│                                      │                   │
└──────────────────────────────────────┼───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
                    ▼                  ▼                   ▼
           ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
           │Shuffle Server│  │  Workflows   │   │  Executions  │
           │  (Orchestr.) │  │  (Playbooks) │   │  (Instances) │
           └──────────────┘  └──────────────┘   └──────────────┘
```

### Setup

**1. Install Shuffle**

```bash
# Docker deployment
git clone https://github.com/Shuffle/Shuffle
cd Shuffle
docker-compose up -d

# Access UI at http://localhost:3001
```

**2. Configure Infracentra Integration**

`backend/app/integrations/shuffle.py`:

```python
import httpx
from typing import List, Dict

class ShuffleIntegration:
    """
    Shuffle SOAR Integration
    
    Features:
    - Workflow execution
    - Playbook management
    - Execution monitoring
    - Result retrieval
    """
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def execute_workflow(
        self,
        workflow_id: str,
        parameters: Dict = None
    ) -> Dict:
        """
        Execute SOAR workflow
        
        Args:
            workflow_id: Shuffle workflow ID
            parameters: Input parameters
        
        Returns:
            Execution result
        """
        response = await self.client.post(
            f"{self.base_url}/api/v1/workflows/{workflow_id}/execute",
            headers=self.headers,
            json=parameters or {}
        )
        response.raise_for_status()
        
        return response.json()
    
    async def list_workflows(self) -> List[Dict]:
        """
        List available workflows
        
        Returns:
            List of workflow objects
        """
        response = await self.client.get(
            f"{self.base_url}/api/v1/workflows",
            headers=self.headers
        )
        response.raise_for_status()
        
        return response.json()
    
    async def get_execution(self, execution_id: str) -> Dict:
        """
        Get execution status and results
        
        Args:
            execution_id: Execution ID
        
        Returns:
            Execution details
        """
        response = await self.client.get(
            f"{self.base_url}/api/v1/executions/{execution_id}",
            headers=self.headers
        )
        response.raise_for_status()
        
        return response.json()
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Example: Ransomware Response Playbook
async def ransomware_response_playbook(
    endpoint_id: str,
    ioc: str,
    severity: str = "critical"
):
    """
    Automated ransomware response
    
    Steps:
    1. Isolate endpoint
    2. Block IOC on firewall
    3. Create incident case
    4. Notify SOC team
    5. Collect forensic data
    """
    shuffle = ShuffleIntegration(
        base_url="http://shuffle.local:3001",
        api_key="your-api-key"
    )
    
    try:
        # Execute workflow
        result = await shuffle.execute_workflow(
            workflow_id="ransomware-response-v1",
            parameters={
                "endpoint_id": endpoint_id,
                "ioc": ioc,
                "severity": severity,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        return {
            "execution_id": result["execution_id"],
            "status": "triggered",
            "workflow": "ransomware-response-v1"
        }
    finally:
        await shuffle.close()
```

### Configuration

**Environment Variables**:

```env
# Shuffle SOAR Integration
SHUFFLE_URL=http://shuffle.local:3001
SHUFFLE_API_KEY=your-api-key
```

---

## 4. Threat Intelligence - MISP

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Infracentra                           │
│  ┌──────────────┐      ┌──────────────────────────┐    │
│  │   Frontend   │─────▶│   MISP Integration API   │    │
│  └──────────────┘      └────────────┬─────────────┘    │
│                                      │                   │
└──────────────────────────────────────┼───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
                    ▼                  ▼                   ▼
           ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
           │  MISP Server │  │   Events     │   │   Attributes │
           │  (Threat DB) │  │  (Incidents) │   │    (IoCs)    │
           └──────────────┘  └──────────────┘   └──────────────┘
```

### Setup

**1. Install MISP**

```bash
# Docker deployment
docker run -d --name misp \
  -p 443:443 \
  -e MISP_BASEURL=https://misp.local \
  -e MISP_EMAIL=admin@misp.local \
  -e MISP_ADMIN_EMAIL=admin@misp.local \
  -e MISP_ADMIN_PASSWORD=your-password \
  coolacid/misp-docker:core-latest
```

**2. Configure Infracentra Integration**

`backend/app/integrations/misp.py`:

```python
from pymisp import PyMISP
from typing import List, Dict

class MISPIntegration:
    """
    MISP Threat Intelligence Integration
    
    Features:
    - IoC search and correlation
    - Event publishing
    - Threat sharing
    - Attribute management
    """
    
    def __init__(self, url: str, api_key: str, verify_ssl: bool = True):
        self.misp = PyMISP(url, api_key, ssl=verify_ssl)
    
    async def search_iocs(
        self,
        event_id: str = None,
        value: str = None,
        type_attribute: str = None
    ) -> List[Dict]:
        """
        Search for IoCs (Indicators of Compromise)
        
        Args:
            event_id: Filter by event
            value: Search by IoC value
            type_attribute: Filter by type (ip, domain, hash, etc.)
        
        Returns:
            List of IoC attributes
        """
        search_params = {}
        
        if event_id:
            search_params["event_id"] = event_id
        
        if value:
            search_params["value"] = value
        
        if type_attribute:
            search_params["type_attribute"] = type_attribute
        
        results = self.misp.search(**search_params)
        
        iocs = []
        for event in results:
            for attr in event["Event"]["Attribute"]:
                iocs.append({
                    "id": attr["id"],
                    "event_id": event["Event"]["id"],
                    "type": attr["type"],
                    "value": attr["value"],
                    "category": attr["category"],
                    "comment": attr.get("comment", ""),
                    "timestamp": attr["timestamp"]
                })
        
        return iocs
    
    async def publish_ioc(
        self,
        ioc_type: str,
        value: str,
        category: str,
        threat_level: int = 2,
        comment: str = ""
    ) -> Dict:
        """
        Publish new IoC to MISP
        
        Args:
            ioc_type: Type (ip-src, ip-dst, domain, md5, sha256, etc.)
            value: IoC value
            category: Category (Network activity, Payload delivery, etc.)
            threat_level: 1-4 (high to undefined)
            comment: Optional comment
        
        Returns:
            Created attribute
        """
        # Create or get event
        event = self.misp.new_event(
            threat_level_id=threat_level,
            analysis=1,  # Ongoing
            info=f"New {ioc_type} from Infracentra"
        )
        
        # Add attribute
        attribute = self.misp.add_attribute(
            event["Event"]["id"],
            {
                "type": ioc_type,
                "value": value,
                "category": category,
                "comment": comment
            }
        )
        
        return {
            "id": attribute["Attribute"]["id"],
            "event_id": event["Event"]["id"],
            "type": ioc_type,
            "value": value
        }
    
    async def get_recent_events(self, hours: int = 24) -> List[Dict]:
        """
        Get recent threat events
        
        Args:
            hours: Time range
        
        Returns:
            List of events
        """
        from datetime import datetime, timedelta
        
        last = datetime.utcnow() - timedelta(hours=hours)
        
        results = self.misp.search(date_from=last.isoformat())
        
        return [
            {
                "id": event["Event"]["id"],
                "info": event["Event"]["info"],
                "threat_level": event["Event"]["threat_level_id"],
                "timestamp": event["Event"]["timestamp"],
                "attribute_count": len(event["Event"]["Attribute"])
            }
            for event in results
        ]
```

### Configuration

**Environment Variables**:

```env
# MISP Integration
MISP_URL=https://misp.local
MISP_API_KEY=your-api-key
MISP_VERIFY_SSL=true
```

---

## 5. Vulnerability Scanning - OpenVAS

### Setup

**1. Install OpenVAS**

```bash
# Docker deployment
docker run -d --name openvas \
  -p 9392:9392 \
  -p 8080:80 \
  -e GVMD_ADMIN_PASSWORD=your-password \
  greenbone/gvm:latest
```

**2. Configure Integration**

`backend/app/integrations/openvas.py`:

```python
import httpx
from typing import List, Dict

class OpenVASIntegration:
    """
    OpenVAS Vulnerability Scanner Integration
    
    Features:
    - Scan initiation
    - Result retrieval
    - CVE correlation
    - Report generation
    """
    
    def __init__(self, host: str, port: int, username: str, password: str):
        self.base_url = f"https://{host}:{port}"
        self.auth = (username, password)
        self.client = httpx.AsyncClient(verify=False, timeout=60.0)
    
    async def start_scan(
        self,
        target: str,
        scan_config: str = "Full and fast"
    ) -> Dict:
        """
        Start vulnerability scan
        
        Args:
            target: Target IP or hostname
            scan_config: Scan configuration name
        
        Returns:
            Scan task details
        """
        response = await self.client.post(
            f"{self.base_url}/omp",
            auth=self.auth,
            params={
                "cmd": "create_task",
                "name": f"Infracentra Scan - {target}",
                "target": target,
                "config": scan_config
            }
        )
        response.raise_for_status()
        
        return response.json()
    
    async def get_scan_results(self, task_id: str) -> List[Dict]:
        """
        Get scan results
        
        Args:
            task_id: Scan task ID
        
        Returns:
            List of vulnerabilities
        """
        response = await self.client.get(
            f"{self.base_url}/omp",
            auth=self.auth,
            params={
                "cmd": "get_results",
                "task_id": task_id
            }
        )
        response.raise_for_status()
        
        return response.json().get("results", [])
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
```

---

## 6. Network Monitoring - Zabbix

### Setup

**1. Install Zabbix**

```bash
# Docker deployment
docker run -d --name zabbix-server \
  -p 10051:10051 \
  -e DB_SERVER_HOST=zabbix-db \
  -e MYSQL_USER=zabbix \
  -e MYSQL_PASSWORD=your-password \
  -e MYSQL_DATABASE=zabbix \
  zabbix/zabbix-server-mysql:latest

docker run -d --name zabbix-web \
  -p 8080:8080 \
  -e ZBX_SERVER_HOST=zabbix-server \
  -e DB_SERVER_HOST=zabbix-db \
  -e MYSQL_USER=zabbix \
  -e MYSQL_PASSWORD=your-password \
  zabbix/zabbix-web-nginx-mysql:latest
```

**2. Configure Integration**

`backend/app/integrations/zabbix.py`:

```python
from pyzabbix import ZabbixAPI
from typing import List, Dict

class ZabbixIntegration:
    """
    Zabbix Network Monitoring Integration
    
    Features:
    - Host management
    - Trigger monitoring
    - Metric collection
    - Alert handling
    """
    
    def __init__(self, url: str, user: str, password: str):
        self.zapi = ZabbixAPI(url)
        self.zapi.login(user, password)
    
    async def get_hosts(self) -> List[Dict]:
        """Get all monitored hosts"""
        return self.zapi.host.get(output="extend")
    
    async def get_triggers(self, severity: int = 3) -> List[Dict]:
        """
        Get active triggers
        
        Args:
            severity: Minimum severity (0-5)
                0 - not classified
                1 - information
                2 - warning
                3 - average
                4 - high
                5 - disaster
        """
        return self.zapi.trigger.get(
            output="extend",
            min_severity=severity,
            only_true=True,
            expandDescription=True
        )
    
    async def get_metrics(
        self,
        host_id: str,
        item_key: str,
        limit: int = 100
    ) -> List[Dict]:
        """
        Get host metrics
        
        Args:
            host_id: Host ID
            item_key: Item key (e.g., system.cpu.load)
            limit: Number of data points
        """
        return self.zapi.history.get(
            hostids=[host_id],
            output="extend",
            history=0,  # Numeric float
            sortfield="clock",
            sortorder="DESC",
            limit=limit
        )
```

---

## 7. Incident Management - TheHive

### Setup

**1. Install TheHive**

```bash
# Docker deployment
docker run -d --name thehive \
  -p 9000:9000 \
  -e SECRET_KEY=your-secret-key \
  strangebee/thehive:latest
```

**2. Configure Integration**

`backend/app/integrations/thehive.py`:

```python
from thehive4py.api import TheHiveApi
from typing import List, Dict

class TheHiveIntegration:
    """
    TheHive Incident Management Integration
    
    Features:
    - Case creation
    - Task management
    - Observable tracking
    - Alert correlation
    """
    
    def __init__(self, url: str, api_key: str):
        self.api = TheHiveApi(url, api_key)
    
    async def create_case(
        self,
        title: str,
        description: str,
        severity: int,
        tlp: int = 2
    ) -> Dict:
        """
        Create incident case
        
        Args:
            title: Case title
            description: Case description
            severity: 1-4 (low to critical)
            tlp: Traffic Light Protocol (0-3)
        """
        case = self.api.create_case(
            title=title,
            description=description,
            severity=severity,
            tlp=tlp
        )
        
        return case.json()
    
    async def add_task(
        self,
        case_id: str,
        title: str,
        description: str,
        assignee: str = None
    ) -> Dict:
        """Add task to case"""
        task = self.api.create_case_task(
            case_id,
            title=title,
            description=description,
            owner=assignee
        )
        
        return task.json()
    
    async def add_observable(
        self,
        case_id: str,
        data: str,
        data_type: str,
        message: str = ""
    ) -> Dict:
        """
        Add observable to case
        
        Args:
            data: Observable value (IP, domain, hash, etc.)
            data_type: Type (ip, domain, hash, etc.)
            message: Description
        """
        observable = self.api.create_case_observable(
            case_id,
            data=data,
            dataType=data_type,
            message=message
        )
        
        return observable.json()
```

---

## 8. Log Management - Graylog

### Setup

**1. Install Graylog**

```bash
# Docker deployment
docker run -d --name graylog \
  -p 9000:9000 \
  -p 12201:12201 \
  -p 1514:1514 \
  -e GRAYLOG_PASSWORD_SECRET=your-secret \
  -e GRAYLOG_ROOT_PASSWORD_SHA2=your-password-sha256 \
  -e GRAYLOG_HTTP_EXTERNAL_URI=http://localhost:9000/ \
  graylog/graylog:5.1
```

**2. Configure Integration**

`backend/app/integrations/graylog.py`:

```python
import httpx
from typing import List, Dict

class GraylogIntegration:
    """
    Graylog Log Management Integration
    
    Features:
    - Log search
    - Stream management
    - Alert handling
    - Dashboard integration
    """
    
    def __init__(self, url: str, username: str, password: str):
        self.base_url = url.rstrip('/')
        self.auth = (username, password)
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def search_logs(
        self,
        query: str,
        range_type: str = "relative",
        range_value: int = 300
    ) -> List[Dict]:
        """
        Search logs
        
        Args:
            query: Search query
            range_type: relative/absolute/keyword
            range_value: Time range (seconds for relative)
        """
        response = await self.client.get(
            f"{self.base_url}/api/search/universal/relative",
            auth=self.auth,
            params={
                "query": query,
                "range": range_value
            }
        )
        response.raise_for_status()
        
        return response.json().get("messages", [])
    
    async def get_streams(self) -> List[Dict]:
        """Get all log streams"""
        response = await self.client.get(
            f"{self.base_url}/api/streams",
            auth=self.auth
        )
        response.raise_for_status()
        
        return response.json().get("streams", [])
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
```

---

## 9. Firewall Management - pfSense/OPNsense

### Setup

**1. Configure API Access**

On pfSense/OPNsense:
- Enable API access
- Generate API key
- Configure allowed IPs

**2. Configure Integration**

`backend/app/integrations/pfsense.py`:

```python
import httpx
from typing import List, Dict

class PfSenseIntegration:
    """
    pfSense/OPNsense Firewall Integration
    
    Features:
    - Rule management
    - Alias/blocklist management
    - NAT configuration
    - Status monitoring
    """
    
    def __init__(self, url: str, api_key: str, api_secret: str):
        self.base_url = url.rstrip('/')
        self.headers = {
            "X-API-KEY": api_key,
            "X-API-SECRET": api_secret
        }
        self.client = httpx.AsyncClient(verify=False, timeout=30.0)
    
    async def get_rules(self) -> List[Dict]:
        """Get firewall rules"""
        response = await self.client.get(
            f"{self.base_url}/api/v1/firewall/rule",
            headers=self.headers
        )
        response.raise_for_status()
        
        return response.json().get("data", [])
    
    async def add_alias(self, name: str, addresses: List[str]) -> Dict:
        """
        Add IP alias/blocklist
        
        Args:
            name: Alias name
            addresses: List of IPs/CIDRs
        """
        response = await self.client.post(
            f"{self.base_url}/api/v1/firewall/alias",
            headers=self.headers,
            json={
                "name": name,
                "type": "network",
                "address": ",".join(addresses)
            }
        )
        response.raise_for_status()
        
        return response.json()
    
    async def block_ip(self, ip: str, alias: str = "blocklist") -> Dict:
        """Block IP address"""
        return await self.add_alias(alias, [ip])
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
```

---

## 10. Backup & DR - BorgBackup + Restic

### Setup

**1. Install BorgBackup**

```bash
# Server
apt-get install borgbackup

# Initialize repository
borg init --encryption=repokey /path/to/backup/repo
```

**2. Configure Integration**

`backend/app/integrations/borg.py`:

```python
import subprocess
from typing import List, Dict
from datetime import datetime

class BorgBackupIntegration:
    """
    BorgBackup Integration
    
    Features:
    - Backup creation
    - Restore operations
    - Archive management
    - Encryption
    """
    
    def __init__(self, repository: str, passphrase: str):
        self.repository = repository
        self.env = {
            **os.environ,
            "BORG_PASSPHRASE": passphrase
        }
    
    async def create_backup(
        self,
        paths: List[str],
        archive_name: str = None
    ) -> Dict:
        """
        Create backup archive
        
        Args:
            paths: Paths to backup
            archive_name: Archive name (default: timestamp)
        """
        if not archive_name:
            archive_name = datetime.utcnow().strftime("%Y-%m-%d_%H:%M:%S")
        
        cmd = ["borg", "create", f"{self.repository}::{archive_name}"]
        cmd.extend(paths)
        
        result = subprocess.run(
            cmd,
            env=self.env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Backup failed: {result.stderr}")
        
        return {
            "archive": archive_name,
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def list_archives(self) -> List[Dict]:
        """List all backup archives"""
        result = subprocess.run(
            ["borg", "list", self.repository],
            env=self.env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"List failed: {result.stderr}")
        
        archives = []
        for line in result.stdout.strip().split("\n"):
            if line:
                parts = line.split()
                archives.append({
                    "name": parts[0],
                    "timestamp": parts[1] if len(parts) > 1 else ""
                })
        
        return archives
    
    async def restore(
        self,
        archive: str,
        destination: str,
        paths: List[str] = None
    ) -> Dict:
        """
        Restore from backup
        
        Args:
            archive: Archive name
            destination: Restore destination
            paths: Specific paths to restore (default: all)
        """
        cmd = [
            "borg", "extract",
            f"{self.repository}::{archive}",
            "--destination", destination
        ]
        
        if paths:
            cmd.extend(paths)
        
        result = subprocess.run(
            cmd,
            env=self.env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Restore failed: {result.stderr}")
        
        return {
            "archive": archive,
            "destination": destination,
            "status": "success"
        }
```

---

## 🔧 Integration Testing

### Test All Integrations

Create `backend/tests/test_integrations.py`:

```python
import pytest
from app.integrations.wazuh import WazuhIntegration
from app.integrations.elastic import ElasticSecurityIntegration
from app.integrations.misp import MISPIntegration

@pytest.mark.asyncio
async def test_wazuh_integration():
    """Test Wazuh EDR integration"""
    wazuh = WazuhIntegration(
        base_url="https://wazuh.local:55000",
        api_user="test",
        api_password="test"
    )
    
    agents = await wazuh.get_agents()
    assert isinstance(agents, list)
    
    await wazuh.close()

@pytest.mark.asyncio
async def test_elastic_integration():
    """Test Elastic Security SIEM integration"""
    elastic = ElasticSecurityIntegration(
        url="https://elastic.local:9200",
        api_key="test-key"
    )
    
    logs = await elastic.search_logs("error")
    assert isinstance(logs, list)
    
    await elastic.close()

@pytest.mark.asyncio
async def test_misp_integration():
    """Test MISP threat intelligence integration"""
    misp = MISPIntegration(
        url="https://misp.local",
        api_key="test-key"
    )
    
    iocs = await misp.search_iocs()
    assert isinstance(iocs, list)
```

Run tests:

```bash
pytest backend/tests/test_integrations.py -v
```

---

## 📊 Integration Architecture Summary

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
│                    ┌──────────────────┐                     │
│                    │ Integration Layer │                     │
│                    └────────┬─────────┘                     │
│                             │                               │
│         ┌───────────────────┼───────────────────┐          │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  EDR/XDR     │  │  SIEM        │  │  SOAR        │     │
│  │  (Wazuh)     │  │  (Elastic)   │  │  (Shuffle)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Threat Intel │  │ Vuln Scan    │  │ Network Mon  │     │
│  │ (MISP)       │  │ (OpenVAS)    │  │ (Zabbix)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Incident Mgmt│  │ Log Mgmt     │  │ Firewall     │     │
│  │ (TheHive)    │  │ (Graylog)    │  │ (pfSense)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                             │                               │
│                             ▼                               │
│                    ┌──────────────┐                        │
│                    │ Backup & DR  │                        │
│                    │ (BorgBackup) │                        │
│                    └──────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Next Steps

1. **Deploy Open Source Tools**: Install and configure each tool
2. **Configure API Keys**: Generate API keys for each integration
3. **Update Environment Variables**: Add integration credentials to `.env`
4. **Test Integrations**: Run integration tests
5. **Monitor**: Set up monitoring for all integrations
6. **Document**: Document custom workflows and playbooks

---

## 📞 Support

For integration issues:
- Check tool-specific documentation
- Review API logs in Infracentra
- Test connectivity with curl/Postman
- Check integration test results

---

## 📝 License

All integrations use open-source tools with their respective licenses:
- Wazuh: GPL v2
- Elastic: SSPL/Elastic License
- Shuffle: AGPL v3
- MISP: AGPL v3
- OpenVAS: GPL v2
- Zabbix: GPL v2
- TheHive: AGPL v3
- Graylog: SSPL
- BorgBackup: LGPL v3
