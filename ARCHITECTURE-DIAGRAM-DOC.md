# 🏗️ Architecture & Integration Diagram - Documentation

## 📋 Overview

The **Architecture & Integration** page provides an interactive, visual representation of how Infracentra integrates with your infrastructure. This diagram helps you understand:

- How data flows from your infrastructure to Infracentra
- The relationship between different components
- Integration points with third-party tools
- The complete workflow from data collection to response

---

## 🎯 Features

### 1. Interactive Diagram
- **Click on any node** to see detailed information
- **Zoom in/out** to focus on specific areas
- **Reset view** to return to default zoom
- **Export** the diagram for presentations or documentation

### 2. Three View Modes

#### Network Architecture View
Shows the complete network topology including:
- Client infrastructure (endpoints, servers, network devices, IoT)
- Cloud services (AWS, Azure, GCP, SaaS)
- Infracentra platform components
- Integration points with third-party tools

#### Data Flow View
Visualizes how data moves through the system:
- Data collection from all sources
- Normalization and processing
- Analysis and correlation
- Response and automation

#### Integration Points View
Highlights all integration capabilities:
- API connections
- Agent-based collection
- Cloud integrations
- Third-party tool connections

### 3. Node Types

| Color | Type | Description |
|-------|------|-------------|
| 🔵 Blue | Client Infrastructure | Your on-premise devices and systems |
| 🟣 Purple | Cloud Services | AWS, Azure, GCP, SaaS applications |
| 🔵 Cyan | Infracentra Platform | Core platform components |
| 🟢 Green | Integrations | Third-party tools and services |

### 4. Connection Types

| Line Style | Type | Description |
|------------|------|-------------|
| ━━━ Solid Blue | Data Flow | Raw data and logs flowing through the system |
| ━━━ Solid Red | Control Flow | Commands and actions being executed |
| ━━━ Solid Green | Monitoring | Health checks and status updates |
| ━┅┅ Dashed Purple | Integration | API and tool connections |

---

## 🏗️ Architecture Components

### Client Infrastructure

#### Endpoints
- **What**: Workstations, laptops, mobile devices
- **Data Collected**: System logs, application logs, user activity
- **Integration Method**: Agents (Wazuh, Zabbix)
- **Example**: Windows 11 workstations with Wazuh agent

#### Servers
- **What**: On-premise servers (Windows, Linux)
- **Data Collected**: System metrics, application logs, security events
- **Integration Method**: Agents + SNMP
- **Example**: Ubuntu 22.04 servers with Zabbix agent

#### Network Devices
- **What**: Routers, switches, firewalls
- **Data Collected**: Network traffic, configuration changes, security events
- **Integration Method**: SNMP, Syslog, NetFlow
- **Example**: Cisco routers sending Syslog to Infracentra

#### IoT Devices
- **What**: Cameras, sensors, smart devices
- **Data Collected**: Device status, alerts, telemetry data
- **Integration Method**: MQTT, HTTP APIs
- **Example**: IP cameras sending motion detection alerts

### Cloud Services

#### AWS
- **Services**: EC2, S3, RDS, Lambda, CloudTrail
- **Data Collected**: Cloud logs, metrics, security events
- **Integration Method**: AWS API, CloudWatch
- **Example**: CloudTrail logs sent to S3 and ingested by Infracentra

#### Azure
- **Services**: VMs, Storage, SQL Database, Functions
- **Data Collected**: Azure logs, metrics, security events
- **Integration Method**: Azure API, Log Analytics
- **Example**: Azure Activity Logs streamed to Infracentra

#### GCP
- **Services**: Compute Engine, Cloud Storage, BigQuery
- **Data Collected**: GCP logs, metrics, security events
- **Integration Method**: GCP API, Cloud Logging
- **Example**: GCP Audit Logs exported to Infracentra

#### SaaS Applications
- **Applications**: Office 365, Google Workspace, Slack, Salesforce
- **Data Collected**: Application logs, user activity, security events
- **Integration Method**: OAuth APIs, Webhooks
- **Example**: Office 365 audit logs via Microsoft Graph API

### Infracentra Platform

#### Data Collector
- **Purpose**: Centralized data ingestion from all sources
- **Capabilities**:
  - Multi-protocol support (Syslog, SNMP, HTTP, MQTT)
  - Data normalization and enrichment
  - Real-time processing
  - High availability and scalability
- **Input**: Raw data from all sources
- **Output**: Normalized data to SIEM engine

#### SIEM Engine
- **Purpose**: Security Information and Event Management
- **Capabilities**:
  - Real-time correlation and analysis
  - AI-powered threat detection
  - Custom detection rules
  - Compliance monitoring
- **Input**: Normalized data from collector
- **Output**: Alerts, incidents, analytics

#### SOAR Engine
- **Purpose**: Security Orchestration, Automation and Response
- **Capabilities**:
  - Automated incident response
  - Custom playbooks and workflows
  - Integration with third-party tools
  - Case management
- **Input**: Alerts and incidents from SIEM
- **Output**: Automated actions, tickets, notifications

#### Dashboard
- **Purpose**: Visualization and reporting
- **Capabilities**:
  - Real-time monitoring
  - Customizable widgets
  - Interactive charts and graphs
  - Compliance reporting
- **Input**: Data from all platform components
- **Output**: Visual insights and reports

### Integrations

#### Wazuh (EDR/XDR)
- **Purpose**: Endpoint detection and response
- **Integration**:
  - Agent deployment on endpoints
  - Real-time threat detection
  - File integrity monitoring
  - Vulnerability detection
- **Data Flow**: Wazuh → Infracentra SIEM

#### Zabbix (Monitoring)
- **Purpose**: Infrastructure monitoring
- **Integration**:
  - Agent-based monitoring
  - SNMP polling
  - Custom metrics collection
  - Alert forwarding
- **Data Flow**: Zabbix → Infracentra Dashboard

#### MISP (Threat Intelligence)
- **Purpose**: Threat intelligence sharing
- **Integration**:
  - IoC sharing and correlation
  - Threat feed ingestion
  - Event synchronization
  - Automated enrichment
- **Data Flow**: MISP ↔ Infracentra SIEM

#### TheHive (Incident Management)
- **Purpose**: Incident response and case management
- **Integration**:
  - Case creation from alerts
  - Task management
  - Observable tracking
  - Timeline reconstruction
- **Data Flow**: Infracentra SOAR → TheHive

---

## 🔄 Data Flow Workflow

### Step 1: Data Collection
```
Client Infrastructure → Data Collector
Cloud Services → Data Collector
Third-party Tools → Data Collector
```

**What Happens**:
1. Agents and integrations collect raw data
2. Data is sent to Infracentra via secure channels
3. Data Collector receives and validates all incoming data

### Step 2: Normalization & Enrichment
```
Data Collector → SIEM Engine
```

**What Happens**:
1. Raw data is normalized into common format
2. Metadata is added (timestamp, source, severity)
3. Context is enriched (user info, asset info, threat intel)
4. Data is indexed for fast querying

### Step 3: Analysis & Detection
```
SIEM Engine → Alerts & Incidents
```

**What Happens**:
1. Correlation rules analyze data patterns
2. AI models detect anomalies and threats
3. Alerts are generated for suspicious activity
4. Incidents are created for confirmed threats

### Step 4: Automation & Response
```
SIEM Engine → SOAR Engine → Actions
```

**What Happens**:
1. SOAR engine receives alerts and incidents
2. Predefined playbooks are triggered
3. Automated actions are executed (isolate, block, notify)
4. Cases are created in TheHive for manual investigation

### Step 5: Visualization & Reporting
```
All Components → Dashboard
```

**What Happens**:
1. Real-time metrics are displayed
2. Custom widgets show relevant data
3. Reports are generated for compliance
4. Insights are provided for decision-making

---

## 🎨 Customization Options

### Adding Custom Nodes
You can customize the diagram to show your specific infrastructure:

1. **Edit the `nodes` array** in `ArchitectureDiagram.tsx`
2. **Define your components**:
   ```typescript
   { 
     id: 'custom-server', 
     type: 'client', 
     label: 'My Custom Server', 
     icon: Server, 
     x: 150, 
     y: 200, 
     description: 'Description of your server' 
   }
   ```

### Adding Custom Connections
Define how your components connect:

1. **Edit the `connections` array**
2. **Define the data flow**:
   ```typescript
   { 
     from: 'custom-server', 
     to: 'collector', 
     type: 'data', 
     label: 'Custom Data' 
   }
   ```

### Changing Colors
Customize the color scheme:

1. **Edit the `getNodeColor` function**:
   ```typescript
   const getNodeColor = (type: string) => {
     switch (type) {
       case 'client': return '#your-color';
       // ...
     }
   };
   ```

---

## 📊 Use Cases

### Use Case 1: Onboarding New Client
**Scenario**: You're onboarding a new client and need to show them how Infracentra integrates with their infrastructure.

**Steps**:
1. Open the Architecture & Integration page
2. Show the Network Architecture view
3. Highlight their existing infrastructure (blue nodes)
4. Show how Infracentra (cyan nodes) will integrate
5. Explain the data flow and automation workflow

### Use Case 2: Planning New Integration
**Scenario**: You want to integrate a new tool (e.g., CrowdStrike) with Infracentra.

**Steps**:
1. Open the Integration Points view
2. Identify similar integrations (e.g., Wazuh)
3. Use the existing connection pattern as a template
4. Add a new node for CrowdStrike
5. Define the data flow connections

### Use Case 3: Troubleshooting Data Flow
**Scenario**: Data from a specific source is not appearing in the dashboard.

**Steps**:
1. Open the Data Flow view
2. Trace the path from the source to the dashboard
3. Identify where the data flow breaks
4. Check the integration at that point
5. Verify the connection and data format

### Use Case 4: Compliance Reporting
**Scenario**: You need to demonstrate compliance with a specific framework (e.g., SOC 2).

**Steps**:
1. Open the Architecture diagram
2. Export it for documentation
3. Highlight the components that address compliance requirements
4. Show the data flow for audit trails
5. Demonstrate the automation for compliance checks

---

## 🔧 Technical Details

### Component Structure
```
ArchitectureDiagram.tsx
├── State Management
│   ├── view (network | dataflow | integration)
│   ├── zoom (0.5 - 2.0)
│   └── selectedNode (node ID)
├── Data
│   ├── nodes (array of DiagramNode)
│   └── connections (array of Connection)
├── Rendering
│   ├── SVG for connections
│   ├── Nodes with icons
│   └── Legend and workflow description
└── Interactions
    ├── Node selection
    ├── Zoom controls
    └── View switching
```

### Performance Considerations
- **SVG Rendering**: Efficient for large diagrams
- **Zoom**: CSS transform for smooth scaling
- **Selection**: React state for instant updates
- **Export**: HTML2Canvas for diagram export

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ All modern browsers with SVG support

---

## 🚀 Future Enhancements

### Planned Features
1. **Drag & Drop**: Allow users to rearrange nodes
2. **Custom Layouts**: Save and load different diagram layouts
3. **Real-time Updates**: Show live data flow animations
4. **Export Formats**: PDF, PNG, SVG export options
5. **Collaboration**: Share diagrams with team members
6. **Templates**: Pre-built diagrams for common architectures

### Integration Ideas
1. **Live Data**: Connect to actual infrastructure for real-time visualization
2. **Monitoring Tools**: Integrate with Grafana, Kibana for live metrics
3. **Documentation**: Auto-generate architecture documentation
4. **Compliance**: Map diagram to compliance frameworks
5. **Cost Analysis**: Show infrastructure costs by component

---

## 📚 Related Documentation

- [Client Admin Implementation](./CLIENT-ADMIN-IMPLEMENTATION-SUMMARY.md)
- [Navigation Guide](./NAVIGATION-GUIDE.md)
- [Integration Guides](./docs/integrations/)
- [Quick Reference](./QUICK-REFERENCE.md)

---

## 🎯 Summary

The Architecture & Integration diagram is a powerful tool for:
- ✅ Visualizing complex infrastructure
- ✅ Understanding data flow
- ✅ Planning integrations
- ✅ Troubleshooting issues
- ✅ Demonstrating value to clients
- ✅ Documenting architecture

**Access**: Client Admin → Operations → Architecture & Integration

**Status**: ✅ Production Ready

---

**Last Updated**: 2027-01-15  
**Version**: 1.0.0  
**Component**: `src/pages/client-admin/ArchitectureDiagram.tsx`
