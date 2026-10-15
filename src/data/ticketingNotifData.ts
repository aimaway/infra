// ============================================================================
// Advanced Ticketing (Service A) + Notification & Event Intelligence (Service B)
// Fully SIMULATED data engine — no backend required. Deterministic seed so the
// demo looks identical across reloads, plus live tick helpers for SLA countdowns.
// ============================================================================

export type TicketStatus = 'new' | 'triage' | 'open' | 'in_progress' | 'pending_vendor' | 'escalated' | 'awaiting_approval' | 'resolved' | 'closed';
export type TicketPriority = 'p1' | 'p2' | 'p3' | 'p4';
export type SlaState = 'on_track' | 'at_risk' | 'breached' | 'met';

export interface AiClassification {
  category: string;
  subcategory: string;
  suggestedPriority: TicketPriority;
  confidence: number;            // 0-100
  duplicateOf?: string;          // ticket id
  predictedRootCause: string;
  reasoning: string[];
  modelVersion: string;
}

export interface Evidence {
  id: string;
  kind: 'log' | 'screenshot' | 'pcap' | 'hash' | 'report' | 'email';
  name: string;
  sizeKb: number;
  hash: string;                  // sha256-style fingerprint
  collectedAt: string;
  collectedBy: string;
  immutable: boolean;
}

export interface AuditEntry {
  seq: number;
  at: string;
  actor: string;
  action: string;
  detail: string;
  prevHash: string;              // hash-chained audit history
  hash: string;
}

export interface ApprovalStep {
  id: string;
  role: string;
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  at?: string;
  note?: string;
}

export interface AdvTicket {
  id: string;
  title: string;
  tenant: string;                // multi-tenant client portal
  status: TicketStatus;
  priority: TicketPriority;
  aiPriority: TicketPriority;
  source: 'alert' | 'portal' | 'email' | 'phone' | 'auto';
  category: string;
  assignee?: string;
  team: string;
  createdAt: string;             // ISO
  slaTargetMin: number;
  consumedMin: number;           // simulated elapsed
  breachProbability: number;     // AI prediction 0-100
  escalationLevel: number;       // 0..3
  asset?: string;
  vulnerability?: { cve: string; cvss: number; exploitSeen: boolean };
  relatedIncident?: string;
  duplicateOf?: string;
  rootCause?: string;
  ai: AiClassification;
  evidence: Evidence[];
  approvals: ApprovalStep[];
  audit: AuditEntry[];
  tags: string[];
  csat?: number;
}

export interface Workload {
  agent: string;
  grade: 'L1' | 'L2' | 'L3';
  online: boolean;
  open: number;
  p1p2: number;
  capacityPct: number;
  avgResolveH: number;
  slaBreaches30d: number;
}

// ---------------------------------------------------------------------------
// Service B — Notification & Event Intelligence
// ---------------------------------------------------------------------------
export type Channel = 'in_app' | 'email' | 'sms' | 'webhook' | 'teams' | 'slack';
export type DeliveryStatus = 'delivered' | 'queued' | 'retrying' | 'dead_letter' | 'acknowledged' | 'suppressed';

export interface NotifEvent {
  id: string;
  ts: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  tenant: string;
  source: string;                // wazuh / zabbix / edr / firewall ...
  ruleId: string;
  correlatedGroup?: string;      // correlation cluster id
  suppressed: boolean;           // storm protection kicked in
  dedupCount: number;            // how many raw events collapsed into this one
}

export interface Delivery {
  id: string;
  eventId: string;
  channel: Channel;
  target: string;
  status: DeliveryStatus;
  attempts: number;
  lastAttempt: string;
  nextRetry?: string;
  ackBy?: string;
  ackAt?: string;
  latencyMs: number;
}

export interface NotifRule {
  id: string;
  name: string;
  enabled: boolean;
  whenSeverity: string[];
  whenSources: string[];
  whenTenant: string;            // '*' = all
  timeWindow: string;
  actions: { channel: Channel; target: string; delayMin: number }[];
  escalateAfterMin?: number;
  stormGuard: boolean;
  hits24h: number;
}

export interface DlqItem {
  id: string;
  deliveryId: string;
  reason: string;
  failedAt: string;
  payloadPreview: string;
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator (seeded) so the simulation is stable
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1337);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const ri = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const hex = (n: number) => Array.from({ length: n }, () => '0123456789abcdef'[ri(0, 15)]).join('');

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

const TENANTS = ['Infracentra Corp', 'TechStart Ltd', 'MedSecure Health', 'Northwind Retail', 'Vertex Logistics'];
const AGENTS: { name: string; grade: 'L1' | 'L2' | 'L3' }[] = [
  { name: 'Marcus Johnson', grade: 'L1' }, { name: 'Alex Rivera', grade: 'L2' },
  { name: 'Sam Ortiz', grade: 'L3' }, { name: 'Priya Nair', grade: 'L2' },
  { name: 'Tom Becker', grade: 'L1' }, { name: 'Lena Fischer', grade: 'L3' },
];
const TEAMS = ['SOC Tier 1', 'SOC Tier 2', 'Infra Ops', 'SecOps Engineering'];

const TICKET_THEMES = [
  { t: 'Ransomware precursor: mass file renames on FS-02', cat: 'Malware', asset: 'fs-prod-02', vuln: { cve: 'CVE-2024-1709', cvss: 9.8, exploitSeen: true }, inc: 'INC-2214', rca: 'Unpatched SolarWinds Serv-U FTP entry point followed by lateral movement via stolen svc account' },
  { t: 'Repeated failed RDP logins from external ASN', cat: 'Intrusion Attempt', asset: 'fw-edge-01', vuln: undefined, inc: 'INC-2208', rca: 'Credential-stuffing botnet; no successful auth observed' },
  { t: 'DNS exfiltration pattern from clinician laptop', cat: 'Data Exfiltration', asset: 'med-lap-114', vuln: { cve: 'CVE-2023-28425', cvss: 5.3, exploitSeen: false }, inc: 'INC-2231', rca: 'Infected browser extension encoding telemetry to long-domain TXT records' },
  { t: 'Alert flooding from Zabbix maintenance window', cat: 'Monitoring Noise', asset: 'zbx-proxy-03', inc: undefined, rca: 'Missing maintenance macro on decommissioned VMware host' },
  { t: 'Privilege escalation attempt on CI runner', cat: 'Insider Risk', asset: 'ci-runner-07', vuln: { cve: 'CVE-2024-2176', cvss: 7.5, exploitSeen: true }, inc: 'INC-2240', rca: 'Misconfigured sudo rules allowed container escape by build service account' },
  { t: 'Phishing email with credential-harvest form', cat: 'Phishing', asset: 'mx-gw-01', inc: 'INC-2245', rca: 'Lookalike domain registered 3 days prior; SPF pass but display-name spoof' },
  { t: 'Firewall policy drift detected vs baseline', cat: 'Configuration', asset: 'fw-core-02', inc: undefined, rca: 'Manual change without change-ticket bypassed IaC pipeline' },
  { t: 'EDR isolate requested: suspicious PowerShell chain', cat: 'Endpoint', asset: 'fin-ws-034', vuln: { cve: 'CVE-2023-23397', cvss: 8.8, exploitSeen: true }, inc: 'INC-2251', rca: 'Outlook CVE exploited for NTLM relay; MITM captured hash' },
  { t: 'Backup job failing after storage array firmware update', cat: 'Availability', asset: 'nas-backup-01', inc: undefined, rca: 'Vendor firmware regression breaking iSCSI CHAP auth' },
  { t: 'Vulnerability scan spike: 41 critical findings post-change', cat: 'Vulnerability', asset: 'dmz-web-04', vuln: { cve: 'CVE-2024-3094', cvss: 10, exploitSeen: false }, inc: undefined, rca: 'New deploy pulled xz-utils 5.6.1 backdoor range' },
  { t: 'Suspicious OAuth app granted mailbox scope', cat: 'Identity', asset: 'idp-tenant-01', inc: 'INC-2259', rca: 'Consent phishing campaign; token replay from novel geography' },
  { t: 'OT PLC unreachable during shift handover', cat: 'Availability', asset: 'plc-line-3', inc: undefined, rca: 'Managed switch STP reconvergence after unauthorised tap device' },
];

const STATUSES: TicketStatus[] = ['new', 'triage', 'open', 'in_progress', 'pending_vendor', 'escalated', 'awaiting_approval', 'resolved', 'closed'];
const PRIORITIES: TicketPriority[] = ['p1', 'p2', 'p3', 'p4'];
const SLA_BY_PRI: Record<TicketPriority, number> = { p1: 240, p2: 480, p3: 1440, p4: 4320 };

function makeAudit(actorActions: [string, string][]): AuditEntry[] {
  let prev = '0'.repeat(24);
  return actorActions.map(([actor, action], i) => {
    const h = hex(24);
    const e: AuditEntry = { seq: i + 1, at: iso((actorActions.length - i) * ri(20, 90)), actor, action, detail: '', prevHash: prev, hash: h };
    prev = h;
    return e;
  });
}

export const simTickets: AdvTicket[] = TICKET_THEMES.map((th, i) => {
  const pri = pick(PRIORITIES);
  const createdMin = ri(40, 4000);
  const consumed = Math.min(createdMin, ri(30, SLA_BY_PRI[pri] + 400));
  const status = i % 4 === 3 ? pick(['resolved', 'closed', 'awaiting_approval'] as TicketStatus[]) : pick(STATUSES.slice(0, 7));
  const aiPri = pick(PRIORITIES);
  const dup = i > 4 && rnd() > 0.65 ? `TKT-${String(i - 3).padStart(4, '0')}` : undefined;
  const agent = pick(AGENTS);
  const evidences: Evidence[] = Array.from({ length: ri(1, 4) }, (_, k) => ({
    id: `EV-${hex(6).toUpperCase()}`,
    kind: pick(['log', 'screenshot', 'pcap', 'hash', 'report', 'email'] as const),
    name: pick(['sysmon-events', 'edr-process-tree', 'firewall-traffic', 'phish-body', 'memory-dump', 'scan-report']) + `-${k + 1}.${pick(['json', 'evtx', 'pcapng', 'txt', 'pdf'])}`,
    sizeKb: ri(12, 9800),
    hash: 'sha256:' + hex(40),
    collectedAt: iso(createdMin - ri(5, 60)),
    collectedBy: pick(['SOAR auto-collect', ...AGENTS.map(a => a.name)]),
    immutable: true,
  }));
  const breachProb = consumed > SLA_BY_PRI[pri] ? ri(85, 99) : Math.round((consumed / SLA_BY_PRI[pri]) * 70 + ri(0, 25));
  const steps: [string, string][] = [
    [pick(['System Alert', 'Client Portal', 'Email Ingest']), 'created'],
    ['AI Engine v3.2', 'classified'],
    ['AI Engine v3.2', 'sla_timer_started'],
  ];
  if (status !== 'new') steps.push([agent.name, 'assigned']);
  if (['escalated', 'awaiting_approval', 'resolved', 'closed'].includes(status)) steps.push(['Escalation Policy P1', 'escalated_L2']);
  if (['resolved', 'closed'].includes(status)) steps.push(['AI Engine v3.2', 'root_cause_suggested']);
  if (status === 'closed') steps.push(['Sarah Chen', 'evidence_verified_closed']);
  const audit = makeAudit(steps);
  audit.forEach(a => { a.detail = a.action.replace(/_/g, ' '); });
  return {
    id: `TKT-${String(i + 1).padStart(4, '0')}`,
    title: th.t,
    tenant: TENANTS[i % TENANTS.length],
    status,
    priority: pri,
    aiPriority: aiPri,
    source: pick(['alert', 'portal', 'email', 'phone', 'auto'] as const),
    category: th.cat,
    assignee: status === 'new' || status === 'triage' ? undefined : agent.name,
    team: pick(TEAMS),
    createdAt: iso(createdMin),
    slaTargetMin: SLA_BY_PRI[pri],
    consumedMin: consumed,
    breachProbability: Math.min(99, breachProb),
    escalationLevel: ['escalated', 'awaiting_approval'].includes(status) ? ri(1, 3) : pri === 'p1' ? 1 : 0,
    asset: th.asset,
    vulnerability: th.vuln,
    relatedIncident: th.inc,
    duplicateOf: dup,
    rootCause: ['resolved', 'closed'].includes(status) ? th.rca : undefined,
    ai: {
      category: th.cat,
      subcategory: pick(['Initial Access', 'Execution', 'Ex Exfiltration'.replace('Ex ', ''), 'Persistence', 'Availability']).trim(),
      suggestedPriority: aiPri,
      confidence: ri(72, 98),
      duplicateOf: dup,
      predictedRootCause: th.rca,
      reasoning: [
        `Matched ${ri(3, 18)} historical tickets with cosine similarity ${(0.7 + rnd() * 0.29).toFixed(2)}`,
        `Asset ${th.asset ?? 'n/a'} has ${ri(0, 9)} open vulnerabilities (max CVSS ${(3 + rnd() * 7).toFixed(1)})`,
        `Source telemetry shows ${pick(['anomalous auth sequence', 'process injection indicators', 'beaconing pattern', 'policy deviation', 'malicious IOB set'])}`,
        dup ? `Near-duplicate of ${dup} (${ri(80, 97)}% text overlap)` : 'No duplicate cluster found',
      ],
      modelVersion: 'ticket-classifier-v3.2.1 (simulated)',
    },
    evidence: evidences,
    approvals: status === 'awaiting_approval' || status === 'closed' ? [
      { id: 'ap1', role: 'Client Admin', name: pick(['Sarah Chen', 'Jordan Kim', 'Dr. Wong']), status: 'approved', at: iso(ri(10, 300)), note: 'Evidence bundle reviewed.' },
      { id: 'ap2', role: 'SOC Manager', name: 'Elena Rossi', status: status === 'closed' ? 'approved' : 'pending' },
      { id: 'ap3', role: 'Compliance Officer', name: 'David Okafor', status: status === 'closed' ? 'approved' : 'pending' },
    ] : [],
    audit,
    tags: [th.cat.toLowerCase().replace(' ', '-'), pri, pick(['mitre-att&ck', 'compliance', 'vip-client', 'recurrence', 'auto-created'])],
    csat: status === 'closed' ? ri(3, 5) : undefined,
  };
});

export const simWorkloads: Workload[] = AGENTS.map(a => ({
  agent: a.name,
  grade: a.grade,
  online: rnd() > 0.2,
  open: ri(2, 14),
  p1p2: ri(0, 5),
  capacityPct: ri(35, 118),
  avgResolveH: Number((2 + rnd() * 20).toFixed(1)),
  slaBreaches30d: ri(0, 6),
}));

export function slaStateOf(t: AdvTicket): SlaState {
  if (['resolved', 'closed'].includes(t.status)) return t.consumedMin <= t.slaTargetMin ? 'met' : 'breached';
  const ratio = t.consumedMin / t.slaTargetMin;
  if (ratio >= 1) return 'breached';
  if (ratio >= 0.7 || t.breachProbability > 60) return 'at_risk';
  return 'on_track';
}

// ---------------------------------------------------------------------------
// Notification engine simulation
// ---------------------------------------------------------------------------
const EVENT_TITLES = [
  'Potential ransomware encryption behaviour', 'Brute-force SSH burst (1,204 attempts/min)',
  'EDR: LSASS memory access blocked', 'Firewall config changed outside change window',
  'Impossible travel sign-in detected', 'DNS tunneling volume threshold exceeded',
  'Mail gateway: malicious attachment quarantined', 'Backup verification failed (3 consecutive)',
  'New admin account created', 'OT protocol anomaly: unsolicited WRITE',
  'Certificate expiry in 7 days', 'Vulnerability scan completed: 41 critical',
  'Agent heartbeat lost (hyperv cluster)', 'SOAR playbook halted: manual gate',
  'SLA breach predicted on TKT-0004', 'Notification storm detected (rule NR-07)',
];
const SOURCES = ['wazuh-siem', 'zabbix-nms', 'crowdstrike-edr', 'pfSense-fw', 'azure-ad', 'mimecast', 'nessus', 'velo-ot'];
const CHANNELS: Channel[] = ['in_app', 'email', 'sms', 'webhook', 'teams', 'slack'];

export const simEvents: NotifEvent[] = Array.from({ length: 26 }, (_, i) => {
  const sev = pick(['critical', 'high', 'medium', 'low', 'info'] as const);
  const dedup = sev === 'info' ? ri(0, 40) : ri(0, 12);
  const storm = dedup > 25;
  return {
    id: `EVT-${String(9100 + i)}`,
    ts: iso(ri(1, 720)),
    title: EVENT_TITLES[i % EVENT_TITLES.length],
    severity: sev,
    tenant: pick(TENANTS),
    source: pick(SOURCES),
    ruleId: `NR-${String(ri(1, 12)).padStart(2, '0')}`,
    correlatedGroup: rnd() > 0.55 ? `GRP-${hex(4).toUpperCase()}` : undefined,
    suppressed: storm && rnd() > 0.4,
    dedupCount: dedup,
  };
});

export const simDeliveries: Delivery[] = simEvents.flatMap(e => {
  const chans = CHANNELS.slice(0, e.severity === 'critical' ? 4 : e.severity === 'high' ? 3 : 2);
  return chans.map((c, j) => {
    const st = e.suppressed && j > 0 ? 'suppressed' as DeliveryStatus
      : pick(['delivered', 'delivered', 'delivered', 'acknowledged', 'retrying', 'queued', 'dead_letter'] as DeliveryStatus[]);
    const attempts = st === 'retrying' ? ri(2, 4) : st === 'dead_letter' ? 5 : 1;
    return {
      id: `DLV-${hex(8)}`,
      eventId: e.id,
      channel: c,
      target: c === 'email' ? pick(['soc-oncall@infracentra.io', 'it@techstart.io', 'alerts@medsecure.health'])
        : c === 'sms' ? '+33 6 •• •• •• 41' : c === 'webhook' ? 'https://hooks.infracentra.io/soc'
          : c === 'teams' ? '#soc-war-room' : c === 'slack' ? '#client-alerts' : 'in-app bell',
      status: st,
      attempts,
      lastAttempt: e.ts,
      nextRetry: st === 'retrying' ? iso(-ri(1, 9)) : undefined,
      ackBy: st === 'acknowledged' ? pick(AGENTS).name : undefined,
      ackAt: st === 'acknowledged' ? iso(ri(1, 120)) : undefined,
      latencyMs: st === 'delivered' || st === 'acknowledged' ? ri(120, 4200) : ri(4000, 60000),
    };
  });
});

export const simRules: NotifRule[] = [
  { id: 'NR-01', name: 'Critical → War room (all channels)', enabled: true, whenSeverity: ['critical'], whenSources: ['*'], whenTenant: '*', timeWindow: '24/7', actions: [{ channel: 'in_app', target: 'bell', delayMin: 0 }, { channel: 'sms', target: 'on-call L3', delayMin: 0 }, { channel: 'email', target: 'soc-oncall@infracentra.io', delayMin: 0 }, { channel: 'teams', target: '#soc-war-room', delayMin: 1 }], escalateAfterMin: 10, stormGuard: true, hits24h: 14 },
  { id: 'NR-02', name: 'High → SOC queue + client email', enabled: true, whenSeverity: ['high'], whenSources: ['wazuh-siem', 'crowdstrike-edr'], whenTenant: '*', timeWindow: '24/7', actions: [{ channel: 'in_app', target: 'bell', delayMin: 0 }, { channel: 'email', target: 'client SOC distribution', delayMin: 5 }], escalateAfterMin: 30, stormGuard: true, hits24h: 47 },
  { id: 'NR-03', name: 'Business-hours routing (quiet hours aware)', enabled: true, whenSeverity: ['medium', 'low'], whenSources: ['*'], whenTenant: '*', timeWindow: 'Mon-Fri 08:00-18:00 CET', actions: [{ channel: 'in_app', target: 'bell', delayMin: 0 }, { channel: 'email', target: 'daily digest pool', delayMin: 60 }], stormGuard: true, hits24h: 128 },
  { id: 'NR-04', name: 'Availability alerts → NOC webhook', enabled: true, whenSeverity: ['high', 'medium'], whenSources: ['zabbix-nms'], whenTenant: '*', timeWindow: '24/7', actions: [{ channel: 'webhook', target: 'noc.pager', delayMin: 0 }], escalateAfterMin: 15, stormGuard: false, hits24h: 22 },
  { id: 'NR-05', name: 'VIP tenant override (always SMS)', enabled: true, whenSeverity: ['high', 'critical'], whenSources: ['*'], whenTenant: 'MedSecure Health', timeWindow: '24/7', actions: [{ channel: 'sms', target: 'VIP duty phone', delayMin: 0 }, { channel: 'slack', target: '#vip-medsecure', delayMin: 0 }], escalateAfterMin: 5, stormGuard: true, hits24h: 9 },
  { id: 'NR-06', name: 'Auth anomalies → Identity team', enabled: false, whenSeverity: ['medium', 'high'], whenSources: ['azure-ad'], whenTenant: '*', timeWindow: '24/7', actions: [{ channel: 'teams', target: '#identity-ops', delayMin: 0 }], stormGuard: true, hits24h: 0 },
  { id: 'NR-07', name: 'Maintenance-window muting (storm protection)', enabled: true, whenSeverity: ['low', 'info', 'medium'], whenSources: ['zabbix-nms'], whenTenant: '*', timeWindow: 'Sun 01:00-05:00 CET', actions: [{ channel: 'in_app', target: 'muted queue', delayMin: 0 }], stormGuard: true, hits24h: 312 },
  { id: 'NR-08', name: 'Compliance events → audit officer', enabled: true, whenSeverity: ['medium', 'high'], whenSources: ['nessus', 'pfSense-fw'], whenTenant: '*', timeWindow: '24/7', actions: [{ channel: 'email', target: 'audit-officer@infracentra.io', delayMin: 120 }], stormGuard: false, hits24h: 6 },
];

export const simDlq: DlqItem[] = simDeliveries.filter(d => d.status === 'dead_letter').slice(0, 6).map(d => ({
  id: `DLQ-${hex(6).toUpperCase()}`,
  deliveryId: d.id,
  reason: pick(['SMTP 550 mailbox unavailable after 5 retries', 'SMS gateway timeout (carrier throttling)', 'Webhook endpoint returned 5xx (circuit breaker open)', 'Teams connector token expired', 'Payload exceeds 256KB channel limit']),
  failedAt: d.lastAttempt,
  payloadPreview: `{"event":"${simEvents.find(e => e.id === d.eventId)?.title ?? ''}","severity":"...","tenant":"..."}`,
}));

export const quietHours = {
  enabled: true,
  schedule: 'Mon–Fri 22:00 → 07:00 CET · Weekends full-day',
  exemptSeverities: ['critical'],
  digestsQueued: ri(14, 60),
};

export const notifTenants = TENANTS;
export const analytics24h = {
  totalEvents: simEvents.length * 41 + ri(50, 200),
  suppressed: simEvents.filter(e => e.suppressed).length * 37,
  deliveredPct: 97.4,
  meanAckMin: Number((2 + rnd() * 9).toFixed(1)),
  stormsDetected: ri(2, 7),
  dlqCount: simDlq.length,
  bySeverity: [
    { name: 'Critical', value: simEvents.filter(e => e.severity === 'critical').length * 3 + 2, color: '#ef4444' },
    { name: 'High', value: simEvents.filter(e => e.severity === 'high').length * 3 + 4, color: '#f97316' },
    { name: 'Medium', value: simEvents.filter(e => e.severity === 'medium').length * 5 + 6, color: '#eab308' },
    { name: 'Low', value: simEvents.filter(e => e.severity === 'low').length * 6 + 8, color: '#3b82f6' },
    { name: 'Info', value: simEvents.filter(e => e.severity === 'info').length * 9 + 10, color: '#64748b' },
  ],
  hourlyVolume: Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, events: ri(4, 90), alerts_sent: ri(1, 30) })),
};
