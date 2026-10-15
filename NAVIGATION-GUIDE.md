# 🗺️ Client Admin Platform - Visual Navigation Guide

## 📍 Complete Navigation Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRACENTRA CLIENT PORTAL                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ OPERATIONS (Main Navigation)                                     │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Overview                                                      │
│    └─→ /client-admin/dashboard                                   │
│        ├─→ Click "Devices" → Infrastructure Map                  │
│        ├─→ Click "Members" → Users                               │
│        ├─→ Click "Services" → My Services                        │
│        └─→ Click "Alerts" → Alerts                               │
│                                                                   │
│ 🗺️ Infrastructure Map                                            │
│    └─→ /client-admin/infrastructure                              │
│        └─→ Click any device → Device Details                     │
│            └─→ /client-admin/infrastructure/device/:deviceId     │
│                ├─→ View SNMP config                              │
│                ├─→ View interfaces (RJ45, SFP, etc.)             │
│                ├─→ View connections                              │
│                └─→ Edit device                                   │
│                                                                   │
│ 🚨 Alerts                                                        │
│    └─→ /client-admin/alerts                                      │
│        └─→ Click any alert → Alert Details                       │
│            ├─→ View affected device → Device Details             │
│            ├─→ Create ticket → Tickets                           │
│            └─→ View related incidents → Incidents                │
│                                                                   │
│ 📈 Statistics (with Dropdown)                                    │
│    └─→ /client-admin/statistics                                  │
│        ├─→ Dropdown: Global Overview                             │
│        ├─→ Dropdown: Network Statistics                          │
│        │   └─→ /client-admin/statistics/network                  │
│        │       └─→ Click device → Device Details                 │
│        ├─→ Dropdown: Device Statistics                           │
│        │   └─→ /client-admin/statistics/devices                  │
│        │       └─→ Click device → Device Details                 │
│        └─→ Dropdown: System Performance                          │
│            └─→ /client-admin/statistics/performance              │
│                                                                   │
│ 🎫 Tickets                                                       │
│    └─→ /client-admin/tickets                                     │
│        ├─→ Click ticket → Ticket Details                         │
│        │   ├─→ Edit ticket                                       │
│        │   ├─→ Resolve ticket                                    │
│        │   ├─→ Escalate ticket                                   │
│        │   ├─→ Assign to technician                              │
│        │   ├─→ View related alert → Alerts                       │
│        │   └─→ View related device → Device Details              │
│        └─→ Create new ticket                                     │
│                                                                   │
│ 🎨 Dashboard Builder                                             │
│    └─→ /client-admin/widgets                                     │
│        ├─→ Add widgets                                           │
│        ├─→ Drag & drop                                           │
│        ├─→ Configure widgets                                     │
│        └─→ Save layout                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ADMINISTRATION                                                   │
├─────────────────────────────────────────────────────────────────┤
│ 💳 Plans & Billing                                               │
│    └─→ /client-admin/plans                                       │
│        ├─→ View current plan                                     │
│        ├─→ Compare plans                                         │
│        ├─→ Upgrade/Downgrade                                     │
│        ├─→ View billing history                                  │
│        ├─→ Manage payment methods                                │
│        └─→ Chat with support (AI chatbot)                        │
│                                                                   │
│ 👥 Users                                                         │
│    └─→ /client-admin/users                                       │
│        ├─→ Click user → Edit User                                │
│        │   ├─→ Edit name                                         │
│        │   ├─→ Edit email                                        │
│        │   ├─→ Change role (Admin/Technician/Viewer)             │
│        │   ├─→ Change grade (L1/L2/L3)                           │
│        │   ├─→ Manage permissions                                │
│        │   └─→ Enable/Disable MFA                                │
│        └─→ Invite new user                                       │
│                                                                   │
│ 🔑 My Services                                                   │
│    └─→ /client-admin/entitlements                                │
│        └─→ View all 16 services with status                      │
│                                                                   │
│ ⚙️ Settings                                                      │
│    └─→ /settings                                                 │
│        ├─→ Profile settings                                      │
│        ├─→ Organization settings                                 │
│        ├─→ Security settings                                     │
│        ├─→ Integrations                                          │
│        └─→ Notifications                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SERVICES (16 Total)                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 🔒 SECURITY SERVICES (8)                                         │
│ ├─→ 🎯 Threat Intelligence                                       │
│ │   └─→ /threats                                                 │
│ │       ├─→ View all threats                                     │
│ │       ├─→ Click threat → Threat Details                        │
│ │       │   ├─→ View affected device → Device Details            │
│ │       │   ├─→ View IoC details                                 │
│ │       │   ├─→ See MITRE ATT&CK mapping                         │
│ │       │   └─→ Create ticket → Tickets                          │
│ │       └─→ Filter by type, severity                             │
│ │                                                                 │
│ ├─→ 📋 Compliance                                                │
│ │   └─→ /compliance                                              │
│ │       ├─→ View compliance status                               │
│ │       ├─→ See simplified explanations                          │
│ │       ├─→ View progress                                        │
│ │       └─→ Get action items                                     │
│ │                                                                 │
│ ├─→ 🚨 Incident Response                                         │
│ │   └─→ /incidents                                               │
│ │       ├─→ View all incidents                                   │
│ │       ├─→ Click incident → Incident Details                    │
│ │       │   ├─→ Escalate (with popup)                            │
│ │       │   ├─→ Resolve (with popup)                             │
│ │       │   ├─→ Run runbook (with popup)                         │
│ │       │   ├─→ View timeline                                    │
│ │       │   ├─→ View related alerts → Alerts                     │
│ │       │   └─→ View related devices → Device Details            │
│ │       └─→ Filter by status, severity                           │
│ │                                                                 │
│ ├─→ 📊 Analytics                                                 │
│ │   └─→ /analytics                                               │
│ │       ├─→ View risk score                                      │
│ │       ├─→ View charts                                          │
│ │       ├─→ View trends                                          │
│ │       └─→ Get AI insights                                      │
│ │                                                                 │
│ ├─→ ⚡ SOAR Automation                                           │
│ │   └─→ /client-admin/soar                                       │
│ │       ├─→ View playbooks                                       │
│ │       ├─→ Execute playbooks                                    │
│ │       ├─→ Monitor execution                                    │
│ │       └─→ View results                                         │
│ │                                                                 │
│ ├─→ 🛡️ Endpoint Protection (EDR/XDR)                            │
│ │   └─→ /client-admin/endpoint-protection                        │
│ │       ├─→ View all endpoint alerts                             │
│ │       ├─→ Click alert → Alert Details                          │
│ │       │   ├─→ View affected device → Device Details            │
│ │       │   ├─→ View threat details                              │
│ │       │   ├─→ See action taken                                 │
│ │       │   └─→ Create ticket → Tickets                          │
│ │       ├─→ Filter by type (ransomware, malware, etc.)           │
│ │       └─→ View stats (blocked, critical, affected devices)     │
│ │                                                                 │
│ ├─→ 📧 Email Security                                            │
│ │   └─→ /client-admin/email-security                             │
│ │       ├─→ View all email alerts                                │
│ │       ├─→ Click alert → Alert Details                          │
│ │       │   ├─→ View sender/recipient                            │
│ │       │   ├─→ View threat type (phishing, malware, etc.)       │
│ │       │   ├─→ See action taken                                 │
│ │       │   ├─→ View mail server → Device Details                │
│ │       │   └─→ Create ticket → Tickets                          │
│ │       ├─→ Filter by type (phishing, malware, spoofing, spam)   │
│ │       └─→ View stats (blocked, quarantined, critical)          │
│ │                                                                 │
│ └─→ ☁️ Cloud Security                                            │
│     └─→ /client-admin/cloud-security                             │
│         ├─→ View all cloud alerts                                │
│         ├─→ Click alert → Alert Details                          │
│         │   ├─→ View cloud provider (AWS/Azure/GCP)              │
│         │   ├─→ View service (S3, VM, IAM, etc.)                 │
│         │   ├─→ View resource                                    │
│         │   ├─→ See severity and status                          │
│         │   └─→ Create ticket → Tickets                          │
│         └─→ View stats (findings, critical, resolved)            │
│                                                                   │
│ 🌐 NETWORK SERVICES (5)                                          │
│ ├─→ 🌐 Network Monitoring                                        │
│ │   └─→ /network                                                 │
│ │       ├─→ View network devices                                 │
│ │       ├─→ Click device → Device Details                        │
│ │       ├─→ View traffic                                         │
│ │       └─→ Monitor performance                                  │
│ │                                                                 │
│ ├─→ 🌐 DNS Filtering                                             │
│ │   └─→ /client-admin/dns-filtering                              │
│ │       ├─→ View DNS alerts                                      │
│ │       ├─→ View blocked domains                                 │
│ │       ├─→ Configure filters                                    │
│ │       └─→ View statistics                                      │
│ │                                                                 │
│ ├─→ 🧱 Firewall Management                                       │
│ │   └─→ /client-admin/firewall-mgmt                              │
│ │       ├─→ View firewall rules                                  │
│ │       ├─→ Click device → Device Details                        │
│ │       ├─→ Manage rules                                         │
│ │       └─→ View logs                                            │
│ │                                                                 │
│ ├─→ 🔐 VPN Gateway                                               │
│ │   └─→ /client-admin/vpn-gateway                                │
│ │       ├─→ View VPN connections                                 │
│ │       ├─→ Click device → Device Details                        │
│ │       ├─→ Manage users                                         │
│ │       └─→ View statistics                                      │
│ │                                                                 │
│ └─→ 🔀 SD-WAN                                                    │
│     └─→ /client-admin/sd-wan                                     │
│         ├─→ View all SD-WAN alerts                               │
│         ├─→ Click alert → Alert Details                          │
│         │   ├─→ View site                                        │
│         │   ├─→ View link (Primary/Secondary/VPN)                │
│         │   ├─→ See status                                       │
│         │   └─→ Create ticket → Tickets                          │
│         ├─→ View site health                                     │
│         └─→ View stats (total sites, healthy, degraded, down)    │
│                                                                   │
│ ⚙️ PSA SERVICES (3)                                              │
│ ├─→ 🔍 Vulnerability Scanning                                    │
│ │   └─→ /psa                                                     │
│ │       ├─→ View vulnerabilities                                 │
│ │       ├─→ Click device → Device Details                        │
│ │       ├─→ View scan results                                    │
│ │       └─→ Schedule scans                                       │
│ │                                                                 │
│ ├─→ 🩹 Patch Management                                          │
│ │   └─→ /client-admin/patch-management                           │
│ │       ├─→ View patches                                         │
│ │       ├─→ Click device → Device Details                        │
│ │       ├─→ Deploy patches                                       │
│ │       └─→ View compliance                                      │
│ │                                                                 │
│ └─→ 💾 Backup & DR                                               │
│     └─→ /client-admin/backup-dr                                  │
│         ├─→ View backup jobs                                     │
│         ├─→ Click device → Device Details                        │
│         ├─→ Manage backups                                       │
│         └─→ Test recovery                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Access Guide

### From Overview Page
```
Overview
  ├─→ Click "Devices" card → Infrastructure Map
  ├─→ Click "Members" card → Users
  ├─→ Click "Services" card → My Services
  └─→ Click "Alerts" card → Alerts
```

### From Infrastructure Map
```
Infrastructure Map
  └─→ Click any device → Device Details
      ├─→ View SNMP config
      ├─→ View interfaces
      ├─→ View connections
      └─→ Edit device
```

### From Alerts
```
Alerts
  └─→ Click any alert → Alert Details
      ├─→ Click device → Device Details
      ├─→ Click "Create Ticket" → Tickets
      └─→ Click incident → Incident Details
```

### From Tickets
```
Tickets
  └─→ Click any ticket → Ticket Details
      ├─→ Edit ticket
      ├─→ Resolve ticket
      ├─→ Escalate ticket
      ├─→ Assign to technician
      ├─→ Click alert → Alert Details
      └─→ Click device → Device Details
```

### From Statistics
```
Statistics
  ├─→ Hover "View Statistics" → Dropdown appears
  │   ├─→ Click "Global Overview" → Statistics (all)
  │   ├─→ Click "Network Statistics" → Network stats
  │   │   └─→ Click device → Device Details
  │   ├─→ Click "Device Statistics" → Device stats
  │   │   └─→ Click device → Device Details
  │   └─→ Click "System Performance" → Performance stats
  ├─→ Click "Network Traffic" card → Network stats
  ├─→ Click "Active Devices" card → Device stats
  ├─→ Click "Security Alerts" card → Alerts
  └─→ Click "System Performance" card → Performance stats
```

---

## 🎨 Theme Toggle

**Location**: Top-right header (sun/moon icon)

**Action**:
1. Click icon
2. Theme switches instantly
3. Preference saved automatically

**What Changes**:
- Background colors
- Text colors
- Border colors
- Card backgrounds
- Input backgrounds

---

## 🕐 Global Clock

**Location**: Top-right header (next to theme toggle)

**Display**:
- Time: HH:MM:SS
- Date: Day, Month DD, YYYY
- Updates: Every second

---

## 🧭 Breadcrumb Navigation

**Location**: Top of every page (below header)

**Example**:
```
Home / Client Admin / Infrastructure / Device Details
```

**Action**:
- Click any breadcrumb to navigate
- Shows current location
- Helps track navigation path

---

## 📊 Statistics Dropdown

**Location**: Top-right of Statistics page

**How to Access**:
1. Navigate to Statistics
2. Look for "View Statistics" button (top-right)
3. Hover over button
4. Dropdown appears automatically
5. Click desired option

**Options**:
1. Global Overview
2. Network Statistics
3. Device Statistics
4. System Performance

---

## 🎫 Ticket Actions

### Available Actions
- **Edit**: Modify ticket details
- **Resolve**: Mark as resolved (with popup)
- **Escalate**: Move to next level (with popup)
- **Assign**: Assign to technician
- **Delete**: Remove ticket (not from logs)
- **Pin**: Pin important ticket

### Popup Messages
- "Escalating to Level 2..."
- "Resolving incident..."
- "Executing runbook..."
- "Update in progress..."

---

## 🔍 Search & Filter

### Available Everywhere
- **Search bar**: Find by name, ID, description
- **Filter dropdown**: Filter by status, type, severity
- **Time range**: 1h, 24h, 7d, 30d

### Examples
```
Alerts Page:
  ├─→ Search: "ransomware"
  ├─→ Filter: Critical only
  └─→ Time: Last 24 hours

Tickets Page:
  ├─→ Search: "TKT-001"
  ├─→ Filter: Open only
  └─→ Time: Last 7 days

Devices Page:
  ├─→ Search: "server"
  ├─→ Filter: Online only
  └─→ Type: Servers only
```

---

## 📱 Responsive Design

### Desktop (>1024px)
- Full sidebar visible
- All features available
- Multi-column layouts

### Tablet (768px - 1024px)
- Collapsible sidebar
- Adjusted layouts
- Touch-friendly

### Mobile (<768px)
- Hamburger menu
- Single column layouts
- Optimized for touch

---

## 🎯 Common Workflows

### Workflow 1: Investigate an Alert
```
1. Go to Alerts
2. Click alert
3. View alert details
4. Click affected device → Device Details
5. Investigate device
6. If needed, create ticket → Tickets
7. Assign to technician
8. Track progress
```

### Workflow 2: Manage a Ticket
```
1. Go to Tickets
2. Click ticket
3. View ticket details
4. Edit/Resolve/Escalate as needed
5. Add comments
6. Attach files
7. Update status
8. Close when resolved
```

### Workflow 3: Monitor Infrastructure
```
1. Go to Infrastructure Map
2. View device status
3. Click device with warning → Device Details
4. Check metrics (CPU, memory, disk)
5. Check SNMP config
6. Check interfaces
7. Take action if needed
8. Create ticket if issue found
```

### Workflow 4: Review Statistics
```
1. Go to Statistics
2. Hover "View Statistics"
3. Select view from dropdown
4. Analyze charts
5. Click stat cards for details
6. Identify trends
7. Take action if needed
```

---

## 🚀 Quick Tips

1. **Use Breadcrumb**: Always know where you are
2. **Check Clock**: See current time and date
3. **Toggle Theme**: Switch between dark/light mode
4. **Use Search**: Find anything quickly
5. **Use Filters**: Narrow down results
6. **Click Everything**: Most elements are clickable
7. **Check Dropdowns**: Hover for more options
8. **Read Popups**: Important messages appear in popups
9. **Track Tickets**: Use ticket system for all issues
10. **Monitor Devices**: Click devices for full details

---

## 📞 Support

### Documentation
- **Quick Reference**: `QUICK-REFERENCE.md`
- **Implementation Summary**: `FINAL-IMPLEMENTATION-SUMMARY.md`
- **API Docs**: `http://localhost:8001/docs` (when backend running)

### Common Issues
1. **Theme not switching** → Clear cache, reload page
2. **Dropdown not showing** → Hover over button
3. **Device details not loading** → Check device ID in URL
4. **Tickets not creating** → Fill all required fields
5. **Navigation not working** → Check browser console

---

**Last Updated**: 2027-01-15  
**Version**: 4.0.0  
**Status**: ✅ PRODUCTION READY
