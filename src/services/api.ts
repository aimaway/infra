// Real backend API client. All ticketing / notification / discovery / settings
// pages talk to the FastAPI backend through this module — no mock data.
const TOKEN_KEY = 'ic_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (res.status === 204) return undefined as unknown as T;
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const detail =
      (body && (body.detail?.msg ?? body.detail)) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: string; // platform_admin | client_admin | client_user
  org_id: number | null;
  status: string;
}

export async function backendLogin(email: string, password: string): Promise<BackendUser> {
  const tok = await api.post<{ access_token: string }>('/auth/login', { email, password });
  setToken(tok.access_token);
  try {
    return await api.get<BackendUser>('/auth/me');
  } catch {
    clearToken();
    throw new ApiError(401, 'Session token rejected by backend');
  }
}

// ---------------------------------------------------------------------------
// Advanced Ticketing
// ---------------------------------------------------------------------------
export interface AdvTicket {
  id: number;
  uid: string;
  org_id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category: string;
  source: string;
  assignee?: string | null;
  reporter?: string | null;
  tags: string[];
  asset?: string | null;
  vulnerability_ref?: string | null;
  ai_category?: string | null;
  ai_priority?: string | null;
  ai_confidence?: number | null;
  ai_reasoning: string[];
  ai_predicted_root_cause?: string | null;
  duplicate_of?: string | null;
  sla_state?: string | null;
  breach_prediction?: Record<string, any> | null;
  sla_response_minutes?: number | null;
  sla_resolution_minutes?: number | null;
  due_response_at?: string | null;
  due_resolve_at?: string | null;
  first_response_at?: string | null;
  resolved_at?: string | null;
  escalation_level: number;
  alert_id?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface TicketEvidence {
  id: number;
  ticket_uid: string;
  kind: string;
  name: string;
  size_kb: number;
  sha256: string;
  collected_by: string;
  immutable: boolean;
  created_at: string;
}

export interface AuditEntry {
  seq: number;
  created_at: string;
  actor: string;
  action: string;
  detail?: string;
  prev_hash: string;
  entry_hash: string;
}

export interface Approval {
  id: number;
  ticket_uid: string;
  step: number;
  approver_role: string;
  status: string;
  note?: string;
  decided_by?: string | null;
  decided_at?: string | null;
}

export interface TenantRef {
  id: number;
  name: string;
}

export const ticketsApi = {
  list: (params: { org_id?: number; status?: string; priority?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && qs.set(k, String(v)));
    const s = qs.toString();
    return api.get<AdvTicket[]>(`/tickets${s ? `?${s}` : ''}`);
  },
  create: (data: {
    title: string;
    description?: string;
    priority: string;
    category: string;
    org_id?: number;
    assignee?: string;
    tags?: string[];
    asset?: string;
    vulnerability_ref?: string;
  }) => api.post<AdvTicket>('/tickets', data),
  tenants: () => api.get<TenantRef[]>('/tickets/meta/tenants'),
  update: (uid: string, data: Record<string, any>) => api.patch<AdvTicket>(`/tickets/${uid}`, data),
  evidence: (uid: string) => api.get<TicketEvidence[]>(`/tickets/${uid}/evidence`),
  addEvidence: (uid: string, data: { name: string; kind: string; content: string }) =>
    api.post<TicketEvidence>(`/tickets/${uid}/evidence`, data),
  audit: (uid: string) => api.get<AuditEntry[]>(`/tickets/${uid}/audit`),
  approvals: (uid: string) => api.get<Approval[]>(`/tickets/${uid}/approvals`),
  closureRequest: (uid: string, note: string) =>
    api.post<Approval>(`/tickets/${uid}/closure-request`, { note }),
  decide: (uid: string, approvalId: number, approve: boolean, note = '') =>
    api.post<Approval>(`/tickets/${uid}/approvals/${approvalId}/decide`, { approve, note }),
  workload: () => api.get<any[]>('/tickets/ops/workload'),
  runEscalations: () => api.post<any>('/tickets/ops/run-escalations'),
};

// ---------------------------------------------------------------------------
// Notification & Event Intelligence
// ---------------------------------------------------------------------------
export interface AlertRow {
  id: number;
  uid: string;
  org_id: number;
  title: string;
  description?: string;
  severity: string;
  source: string;
  resource?: string | null;
  correlated_count: number;
  storm_suppressed: boolean;
  acked_by?: string | null;
  acked_at?: string | null;
  ticket_uid?: string | null;
  created_at: string;
}

export interface NotifRule {
  id?: number;
  name: string;
  org_id?: number | null;
  enabled: boolean;
  conditions: Record<string, any>;
  channels: string[];
  recipients: string[];
  create_ticket: boolean;
  ticket_priority: string;
  escalate_after_minutes: number;
  quiet_hours?: Record<string, any> | null;
  created_at?: string;
}

export interface NotificationRow {
  id: number;
  org_id: number;
  alert_id?: number | null;
  rule_id?: number | null;
  channel: string;
  recipient: string;
  subject: string;
  body?: string;
  severity: string;
  status: string;
  attempts: number;
  last_error?: string | null;
  sent_at?: string | null;
  acked_by?: string | null;
  acked_at?: string | null;
  created_at: string;
}

export const alertsApi = {
  ingest: (data: {
    title: string;
    description?: string;
    severity: string;
    source: string;
    resource?: string;
    org_id?: number;
    raw_payload?: Record<string, any>;
  }) =>
    api.post<{ alert: AlertRow; pipeline: { notifications: any[]; ticket_created?: boolean; ticket_uid?: string | null } }>('/alerts', data),
  list: (org_id?: number) =>
    api.get<AlertRow[]>(`/alerts${org_id ? `?org_id=${org_id}` : ''}`),
  ack: (id: number) => api.post(`/alerts/${id}/ack`),
  rules: () => api.get<NotifRule[]>('/notification-rules'),
  createRule: (rule: Omit<NotifRule, 'id' | 'created_at'>) =>
    api.post<NotifRule>('/notification-rules', rule),
  updateRule: (id: number, patch: Partial<NotifRule>) =>
    api.patch<NotifRule>(`/notification-rules/${id}`, patch),
  deleteRule: (id: number) => api.del(`/notification-rules/${id}`),
  notifications: (statusF?: string) =>
    api.get<NotificationRow[]>(`/notifications${statusF ? `?status=${statusF}` : ''}`),
  ackNotification: (id: number) => api.post(`/notifications/${id}/ack`),
  retryDeadLetters: () => api.post<any>('/notifications/retry-dead-letters'),
  analytics: () => api.get<Record<string, any>>('/notifications/analytics'),
};

// ---------------------------------------------------------------------------
// Playbooks
// ---------------------------------------------------------------------------
export interface PlaybookStep {
  name: string;
  action: string;
  params: Record<string, any>;
}
export interface Playbook {
  id: number;
  name: string;
  description: string;
  category: string;
  steps: PlaybookStep[];
  enabled: boolean;
}
export interface PlaybookRunLog {
  ok: boolean;
  log: { step: number; name: string; action: string; status: string; detail: string }[];
}

export const playbooksApi = {
  list: () => api.get<Playbook[]>('/playbooks'),
  save: (pb: Omit<Playbook, 'id'> & { id?: number }) =>
    pb.id ? api.put<Playbook>(`/playbooks/${pb.id}`, pb) : api.post<Playbook>('/playbooks', pb),
  remove: (id: number) => api.del(`/playbooks/${id}`),
  run: (id: number) => api.post<PlaybookRunLog>(`/playbooks/${id}/run`),
};

// ---------------------------------------------------------------------------
// Discovery / SNMP
// ---------------------------------------------------------------------------
export interface SnmpCredential {
  id?: number;
  name: string;
  version: string;
  community?: string | null;
  username?: string | null;
  auth_protocol?: string | null;
  auth_passphrase?: string | null;
  priv_protocol?: string | null;
  priv_passphrase?: string | null;
  port: number;
  org_id?: number | null;
  created_at?: string;
}

export interface ScanRow {
  id: number;
  org_id: number;
  network_cidr: string;
  status: string;
  credential_ids: number[];
  total_hosts: number;
  discovered: number;
  snmp_matched: number;
  started_at?: string | null;
  finished_at?: string | null;
  created_by: string;
  created_at: string;
}

export interface DiscoveredDevice {
  id: number;
  scan_id: number;
  org_id: number;
  ip: string;
  mac?: string | null;
  hostname?: string | null;
  os_guess?: string | null;
  device_type?: string | null;
  open_ports: number[];
  snmp_match: boolean;
  sys_desc?: string | null;
  imported: boolean;
  created_at: string;
}

export const discoveryApi = {
  credentials: () => api.get<SnmpCredential[]>('/snmp-credentials'),
  createCredential: (c: Omit<SnmpCredential, 'id' | 'created_at'>) =>
    api.post<SnmpCredential>('/snmp-credentials', c),
  deleteCredential: (id: number) => api.del(`/snmp-credentials/${id}`),
  scans: () => api.get<ScanRow[]>('/scans'),
  startScan: (network_cidr: string, credential_ids: number[], org_id?: number) =>
    api.post<ScanRow>('/scans', { network_cidr, credential_ids, org_id }),
  scanStatus: (id: number) => api.get<ScanRow>(`/scans/${id}`),
  scanDevices: (id: number) => api.get<DiscoveredDevice[]>(`/scans/${id}/devices`),
  devices: () => api.get<DiscoveredDevice[]>('/devices'),
  importDevice: (id: number) => api.post(`/devices/${id}/import`),
  engineStatus: () => api.get<{ nmap_available: boolean; mode: string }>('/engine-status'),
};

// ---------------------------------------------------------------------------
// Platform settings
// ---------------------------------------------------------------------------
export interface SettingsOverview {
  tenants: { id: number; name: string; tier: string; status: string }[];
  rule_count: number;
  global_rule_count: number;
  user_count: number;
  delivery_mode: string;
}

export interface SystemSettings {
  auto_ticketing: boolean;
  sla_escalations: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  webhook_enabled: boolean;
  quiet_hours: boolean;
  escalation_email: string;
  webhook_url: string;
}

export const settingsApi = {
  overview: () => api.get<SettingsOverview>('/settings/overview'),
  get: () => api.get<SystemSettings>('/settings/system'),
  update: (patch: Partial<SystemSettings>) =>
    api.put<SystemSettings>('/settings/system', patch),
  seedDemoTenant: (orgName = 'Acme Corp') =>
    api.post<any>(`/settings/seed-demo-tenant?org_name=${encodeURIComponent(orgName)}`),
};

// ---------------------------------------------------------------------------
// Demo mode — pushes realistic sample ALERTS through the REAL ingest pipeline
// (/api/alerts). The backend then does everything for real: correlation,
// rule matching, notification dispatch and automatic ticket creation. No mock
// data is injected into the UI; this only simulates an upstream feed.
// ---------------------------------------------------------------------------
const SAMPLE_EVENTS = [
  { title: 'Brute-force SSH attempts from 45.132.87.10', severity: 'high', source: 'wazuh', resource: 'fw-edge-01', description: '23 failed authentications in 60s against sshd on DMZ gateway.' },
  { title: 'TLS certificate expires in 6 days', severity: 'medium', source: 'monitor', resource: 'web-prod-02', description: 'Certificate for portal.acme-corp.com reaches expiry on Friday.' },
  { title: 'Critical vulnerability CVE-2026-31337 detected', severity: 'critical', source: 'vuln-scanner', resource: 'db-primary-01', description: 'Unpatched OpenSSL remote-code-execution flaw found during authenticated scan.' },
  { title: 'CPU sustained above 92% for 15 minutes', severity: 'medium', source: 'monitor', resource: 'app-node-03', description: 'Load average 12.4 on 4 vCPU host; suspected runaway worker process.' },
  { title: 'Unauthorized privilege escalation attempt', severity: 'critical', source: 'suricata', resource: 'dc-core-sw-01', description: 'TGP-3 payload observed targeting management VLAN from user workstation.' },
  { title: 'Backup job failed with checksum mismatch', severity: 'low', source: 'backup-agent', resource: 'nas-backup-01', description: 'Nightly snapshot verification failed on volume /vault/archive.' },
];

export async function pushDemoEvents(orgId?: number): Promise<{ alerts: number; tickets: string[] }> {
  const createdTickets: string[] = [];
  let alerts = 0;
  for (const ev of SAMPLE_EVENTS) {
    try {
      const res = await alertsApi.ingest({ ...ev, org_id: orgId });
      alerts += 1;
      const uid = res.pipeline?.ticket_uid;
      if (uid) createdTickets.push(uid);
    } catch { /* tenant may not exist yet — keep going */ }
  }
  return { alerts, tickets: createdTickets };
}
