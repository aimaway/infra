import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Inbox, Plus, Search, RefreshCw, X, ShieldAlert, Clock, AlertOctagon,
  FileText, Lock, CheckCircle2, XCircle, Bot, GitBranch, Users, Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ticketsApi, AdvTicket, TicketEvidence, AuditEntry, Approval, TenantRef,
  ApiError,
} from '../../services/api';

// ---------------------------------------------------------------------------
// Helpers / presentational atoms (all data comes from the real backend API)
// ---------------------------------------------------------------------------

const PRIORITIES = ['p1', 'p2', 'p3', 'p4'];
const CATEGORIES = ['incident', 'service_request', 'problem', 'change', 'vulnerability', 'other'];
const STATUSES = ['new', 'triage', 'open', 'pending', 'escalated', 'resolved', 'closed'];

const prioColor: Record<string, string> = {
  p1: 'bg-red-500/20 text-red-400 border-red-500/40',
  p2: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  p3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  p4: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
};
const statusColor: Record<string, string> = {
  new: 'bg-slate-500/20 text-slate-300',
  triage: 'bg-purple-500/20 text-purple-300',
  open: 'bg-cyan-500/20 text-cyan-300',
  pending: 'bg-amber-500/20 text-amber-300',
  escalated: 'bg-red-500/20 text-red-300',
  resolved: 'bg-emerald-500/20 text-emerald-300',
  closed: 'bg-slate-600/30 text-slate-400',
};
const slaColor: Record<string, string> = {
  breached: 'text-red-400', at_risk: 'text-orange-400', on_track: 'text-emerald-400', met: 'text-emerald-400', paused: 'text-slate-400',
};

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : '—');
const ago = (iso?: string | null) => {
  if (!iso) return '—';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
};

const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border border-transparent ${className}`}>{children}</span>
);

// ---------------------------------------------------------------------------
// Create-ticket modal — every parameter a client or ops team needs
// ---------------------------------------------------------------------------

interface FormState {
  title: string; description: string; priority: string; category: string;
  org_id: string; assignee: string; tags: string; asset: string; vulnerability_ref: string;
}
const emptyForm: FormState = {
  title: '', description: '', priority: 'p3', category: 'incident',
  org_id: '', assignee: '', tags: '', asset: '', vulnerability_ref: '',
};

const CreateTicketModal: React.FC<{
  tenants: TenantRef[]; isPlatform: boolean; onClose: () => void;
  onCreate: (data: Parameters<typeof ticketsApi.create>[0]) => Promise<void>;
}> = ({ tenants, isPlatform, onClose, onCreate }) => {
  const [f, setF] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.title.trim().length < 3) { setErr('Title must be at least 3 characters.'); return; }
    setBusy(true); setErr('');
    try {
      await onCreate({
        title: f.title.trim(),
        description: f.description.trim() || undefined,
        priority: f.priority,
        category: f.category,
        org_id: isPlatform && f.org_id ? Number(f.org_id) : undefined,
        assignee: f.assignee.trim() || undefined,
        tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
        asset: f.asset.trim() || undefined,
        vulnerability_ref: f.vulnerability_ref.trim() || undefined,
      });
      onClose();
    } catch (ex: any) { setErr(ex.message || 'Failed to create ticket'); }
    finally { setBusy(false); }
  };

  const inp = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none';
  const lbl = 'block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Plus className="text-cyan-400" size={20} /> Create Ticket</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div>
          <label className={lbl}>Title *</label>
          <input className={inp} value={f.title} onChange={set('title')} placeholder="e.g. Ransomware signature detected on file server" autoFocus />
        </div>
        <div>
          <label className={lbl}>Description</label>
          <textarea className={inp} rows={3} value={f.description} onChange={set('description')}
            placeholder="Details, logs, impact… (feeds the AI classifier)" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Priority</label>
            <select className={inp} value={f.priority} onChange={set('priority')}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Category</label>
            <select className={inp} value={f.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          {isPlatform && (
            <div>
              <label className={lbl}>Tenant</label>
              <select className={inp} value={f.org_id} onChange={set('org_id')}>
                <option value="">Select tenant…</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={lbl}>Assignee</label>
            <input className={inp} value={f.assignee} onChange={set('assignee')} placeholder="analyst email or name" />
          </div>
          <div>
            <label className={lbl}>Asset</label>
            <input className={inp} value={f.asset} onChange={set('asset')} placeholder="FW-EDGE-01 / 10.0.0.5" />
          </div>
          <div>
            <label className={lbl}>Vulnerability ref (CVE)</label>
            <input className={inp} value={f.vulnerability_ref} onChange={set('vulnerability_ref')} placeholder="CVE-2026-XXXXX" />
          </div>
        </div>
        <div>
          <label className={lbl}>Tags (comma separated)</label>
          <input className={inp} value={f.tags} onChange={set('tags')} placeholder="firewall, compliance, lateral-movement" />
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-800 hover:bg-slate-700">Cancel</button>
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white">
            {busy ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
        <p className="text-[11px] text-slate-500">On submit the backend runs AI-assisted classification, duplicate correlation and starts SLA timers automatically.</p>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Detail drawer: AI triage · SLA · audit chain · evidence vault · approvals
// ---------------------------------------------------------------------------

const DetailDrawer: React.FC<{
  ticket: AdvTicket; onClose: () => void; onChanged: () => void;
}> = ({ ticket, onClose, onChanged }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'overview' | 'audit' | 'evidence' | 'approvals'>('overview');
  const [evidence, setEvidence] = useState<TicketEvidence[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [evName, setEvName] = useState(''); const [evKind, setEvKind] = useState('log'); const [evContent, setEvContent] = useState('');
  const [closureNote, setClosureNote] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const [e, a, aps] = await Promise.all([
        ticketsApi.evidence(ticket.uid),
        ticketsApi.audit(ticket.uid),
        ticketsApi.approvals(ticket.uid),
      ]);
      setEvidence(e); setAudit(a); setApprovals(aps);
    } catch (ex: any) { setErr(ex.message); }
  }, [ticket.uid]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>) => {
    setErr('');
    try { await fn(); await load(); onChanged(); }
    catch (ex: any) { setErr(ex.message); }
  };

  const patch = (data: Record<string, any>) => () => act(() => ticketsApi.update(ticket.uid, data));

  const tabs = ['overview', 'audit', 'evidence', 'approvals'] as const;
  return (
    <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose}>
      <aside onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-slate-900 border-l border-slate-700 overflow-y-auto p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 font-mono">{ticket.uid} · source: {ticket.source}{ticket.alert_id ? ` · alert #${ticket.alert_id}` : ''}</p>
            <h2 className="text-lg font-bold text-white leading-tight">{ticket.title}</h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className={prioColor[ticket.priority]}>{ticket.priority.toUpperCase()}</Badge>
              <Badge className={statusColor[ticket.status]}>{ticket.status}</Badge>
              {ticket.tags.map(t => <Badge key={t} className="bg-slate-700/50 text-slate-300">{t}</Badge>)}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}

        <div className="flex gap-1 border-b border-slate-700">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm capitalize ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4">
            {ticket.description && <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.description}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Asset" value={ticket.asset || '—'} />
              <Info label="CVE" value={ticket.vulnerability_ref || '—'} />
              <Info label="Assignee" value={ticket.assignee || 'Unassigned'} />
              <Info label="Reporter" value={ticket.reporter || '—'} />
              <Info label="Escalation level" value={String(ticket.escalation_level)} />
              <Info label="Created" value={`${ago(ticket.created_at)} ago`} />
            </div>

            <Section icon={<Bot size={16} className="text-purple-400" />} title="AI-Assisted Triage">
              {ticket.ai_category ? (
                <div className="text-sm space-y-1">
                  <p className="text-slate-300">Suggested: <b className="text-purple-300">{ticket.ai_category}</b> · priority <b className="text-purple-300">{(ticket.ai_priority || '').toUpperCase()}</b> · confidence <b>{Math.round((ticket.ai_confidence || 0) * 100)}%</b></p>
                  {ticket.duplicate_of && <p className="text-amber-400">⚠ Possible duplicate of {ticket.duplicate_of}</p>}
                  {ticket.ai_predicted_root_cause && <p className="text-slate-400">Predicted root cause: {ticket.ai_predicted_root_cause}</p>}
                  <ul className="list-disc list-inside text-xs text-slate-400">{ticket.ai_reasoning.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              ) : <p className="text-sm text-slate-500">No classification yet.</p>}
            </Section>

            <Section icon={<Clock size={16} className="text-cyan-400" />} title="SLA & Breach Prediction">
              <div className="text-sm space-y-1">
                <p>Response due: <b>{fmt(ticket.due_response_at)}</b> {ticket.first_response_at ? <span className="text-emerald-400">✓ met</span> : <span className={slaColor[ticket.sla_state || '']}>{ticket.sla_state}</span>}</p>
                <p>Resolution due: <b>{fmt(ticket.due_resolve_at)}</b></p>
                {ticket.breach_prediction && (
                  <p className={`font-semibold ${ticket.breach_prediction.risk === 'high' ? 'text-red-400' : ticket.breach_prediction.risk === 'medium' ? 'text-orange-400' : 'text-emerald-400'}`}>
                    Breach risk: {ticket.breach_prediction.risk?.toUpperCase()} — {ticket.breach_prediction.reason}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {STATUSES.filter(s => s !== ticket.status).map(s => (
                  <button key={s} onClick={patch({ status: s })}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 capitalize">→ {s}</button>
                ))}
              </div>
            </Section>
          </div>
        )}

        {tab === 'audit' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 flex items-center gap-1"><Lock size={12} /> Hash-chained immutable audit trail — each entry links to the previous hash.</p>
            {[...audit].reverse().map(a => (
              <div key={a.seq} className="bg-slate-800/60 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-xs text-slate-500"><span>#{a.seq} · {a.actor}</span><span>{fmt(a.created_at)}</span></div>
                <p className="text-slate-200 font-medium">{a.action}</p>
                {a.detail && <p className="text-slate-400 text-xs">{a.detail}</p>}
                <p className="text-[10px] font-mono text-slate-600 truncate">prev {a.prev_hash.slice(0, 12)}… → {a.entry_hash.slice(0, 12)}…</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'evidence' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 flex items-center gap-1"><FileText size={12} /> Evidence vault — content-addressed (SHA-256), append-only.</p>
            {evidence.map(e => (
              <div key={e.id} className="bg-slate-800/60 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-200">{e.name} <Badge className="bg-slate-700 text-slate-300 ml-1">{e.kind}</Badge></p>
                  <p className="text-[10px] font-mono text-slate-500">sha256:{e.sha256.slice(0, 24)}… · {e.size_kb} KB · {e.collected_by}</p>
                </div>
                {e.immutable && <Lock size={14} className="text-emerald-400" />}
              </div>
            ))}
            <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200" placeholder="Evidence name" value={evName} onChange={e => setEvName(e.target.value)} />
                <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200" value={evKind} onChange={e => setEvKind(e.target.value)}>
                  {['log', 'screenshot', 'pcap', 'config', 'report', 'note'].map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <textarea className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200" rows={2} placeholder="Paste evidence content…" value={evContent} onChange={e => setEvContent(e.target.value)} />
              <button onClick={() => act(async () => { await ticketsApi.addEvidence(ticket.uid, { name: evName || 'evidence', kind: evKind, content: evContent }); setEvName(''); setEvContent(''); })}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold">Add to vault</button>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Evidence-based closure workflow: request closure → approval steps decided by role.</p>
            {!['resolved', 'closed'].includes(ticket.status) && (
              <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
                <textarea className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200" rows={2} placeholder="Closure justification (root cause, fix, evidence refs)…" value={closureNote} onChange={e => setClosureNote(e.target.value)} />
                <button onClick={() => act(() => ticketsApi.closureRequest(ticket.uid, closureNote))}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold">Request Closure</button>
              </div>
            )}
            {approvals.map(ap => (
              <div key={ap.id} className="bg-slate-800/60 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center">
                  <p className="text-slate-200">Step {ap.step}: <b>{ap.approver_role}</b></p>
                  <Badge className={ap.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : ap.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}>{ap.status}</Badge>
                </div>
                {ap.note && <p className="text-xs text-slate-400 mt-1">{ap.note}</p>}
                {ap.decided_by && <p className="text-[11px] text-slate-500">by {ap.decided_by} · {fmt(ap.decided_at)}</p>}
                {ap.status === 'pending' && (user?.role === 'client_admin' || user?.role === 'platform_admin') && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => act(() => ticketsApi.decide(ticket.uid, ap.id, true, 'Verified evidence attached.'))}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white text-xs"><CheckCircle2 size={13} /> Approve</button>
                    <button onClick={() => act(() => ticketsApi.decide(ticket.uid, ap.id, false, 'Insufficient evidence.'))}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white text-xs"><XCircle size={13} /> Reject</button>
                  </div>
                )}
              </div>
            ))}
            {approvals.length === 0 && <p className="text-sm text-slate-500">No approval workflow started.</p>}
          </div>
        )}
      </aside>
    </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><p className="text-[11px] uppercase text-slate-500 tracking-wide">{label}</p><p className="text-slate-200">{value}</p></div>
);
const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-slate-800/40 rounded-lg p-4">
    <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-2">{icon}{title}</h3>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const AdvancedTicketingPage: React.FC = () => {
  const { user } = useAuth();
  const isPlatform = user?.role === 'platform_admin';
  const [tickets, setTickets] = useState<AdvTicket[]>([]);
  const [tenants, setTenants] = useState<TenantRef[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fPrio, setFPrio] = useState('');
  const [fOrg, setFOrg] = useState<number | ''>('');   // tenant filter → sent as ?org_id= to the API
  const [selected, setSelected] = useState<AdvTicket | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showWorkload, setShowWorkload] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const list = await ticketsApi.list({
        q: q || undefined, status: fStatus || undefined, priority: fPrio || undefined,
        org_id: isPlatform && fOrg !== '' ? Number(fOrg) : undefined,
      });
      setTickets(list);
      if (isPlatform) {
        const [tn, wl] = await Promise.all([ticketsApi.tenants(), ticketsApi.workload().catch(() => [])]);
        setTenants(tn); setWorkload(wl);
      }
    } catch (ex: any) {
      setError(ex instanceof ApiError ? ex.message : 'Backend unreachable — is the API container running?');
    } finally { setLoading(false); }
  }, [q, fStatus, fPrio, fOrg, isPlatform]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const stats = useMemo(() => ({
    open: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
    breached: tickets.filter(t => t.sla_state === 'breached').length,
    atRisk: tickets.filter(t => t.sla_state === 'at_risk').length,
    auto: tickets.filter(t => t.source === 'alert_engine').length,
  }), [tickets]);

  const selCls = 'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none';

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Inbox className="text-cyan-400" /> Advanced Ticketing</h1>
          <p className="text-sm text-slate-400">Live data from the ticketing service — AI triage, SLA engines, evidence vault and approval workflows.</p>
        </div>
        <div className="flex gap-2">
          {isPlatform && (
            <button onClick={() => setShowWorkload(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"><Users size={16} /> Team Workload</button>
          )}
          <button onClick={load} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold"><Plus size={16} /> Create Ticket</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Active Tickets" value={stats.open} color="text-cyan-400" icon={<Inbox size={18} />} />
        <Kpi label="SLA Breached" value={stats.breached} color="text-red-400" icon={<AlertOctagon size={18} />} />
        <Kpi label="At Risk (predicted)" value={stats.atRisk} color="text-orange-400" icon={<Clock size={18} />} />
        <Kpi label="Auto-created from Alerts" value={stats.auto} color="text-purple-400" icon={<GitBranch size={18} />} />
      </div>

      {showWorkload && isPlatform && (
        <div className="bg-slate-800/50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Multi-tenant Team Workload</h3>
          {workload.length === 0 ? <p className="text-sm text-slate-500">No open tickets across tenants.</p> : (
            <div className="grid md:grid-cols-3 gap-3">
              {workload.map(w => (
                <div key={w.org_id ?? w.assignee} className="bg-slate-900 rounded-lg p-3 text-sm">
                  <p className="text-slate-200 font-semibold">{w.tenant || w.assignee || 'Unassigned'}</p>
                  <p className="text-xs text-slate-400">open: {w.open} · breached: <span className={w.breached > 0 ? 'text-red-400' : ''}>{w.breached}</span> · p1/p2: {w.p1_p2}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters — all applied server-side */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search title / description / asset / CVE…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" />
        </div>
        <select className={selCls} value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">All statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={selCls} value={fPrio} onChange={e => setFPrio(e.target.value)}>
          <option value="">All priorities</option>{PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>
        {isPlatform && (
          <select className={selCls} value={fOrg} onChange={e => setFOrg(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">All tenants</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2"><ShieldAlert size={16} />{error}</div>}

      {/* Ticket table */}
      <div className="bg-slate-800/40 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-700">
            <th className="px-4 py-3">UID</th><th className="px-4 py-3">Title</th>{isPlatform && <th className="px-4 py-3">Tenant</th>}
            <th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">SLA</th>
            <th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Age</th>
          </tr></thead>
          <tbody>
            {loading && tickets.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading from backend…</td></tr>}
            {!loading && tickets.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center">
                <p className="text-slate-400 mb-2">No tickets yet — the backend is live and waiting for real data.</p>
                <p className="text-xs text-slate-500 mb-4">Every alert ingested through <code className="text-cyan-400">POST /api/alerts</code> that matches an automation rule creates a ticket here instantly. You can also create one manually.</p>
                <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold inline-flex items-center gap-2"><Play size={14} /> Create your first ticket</button>
              </td></tr>
            )}
            {tickets.map(t => (
              <tr key={t.uid} onClick={() => setSelected(t)}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.uid}</td>
                <td className="px-4 py-3 text-slate-200">
                  {t.title}
                  {t.source === 'alert_engine' && <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">auto ← alert</Badge>}
                  {t.duplicate_of && <Badge className="ml-2 bg-amber-500/20 text-amber-300">dup?</Badge>}
                </td>
                {isPlatform && <td className="px-4 py-3 text-slate-400">{tenants.find(x => x.id === t.org_id)?.name || `#${t.org_id}`}</td>}
                <td className="px-4 py-3"><Badge className={prioColor[t.priority]}>{t.priority.toUpperCase()}</Badge></td>
                <td className="px-4 py-3"><Badge className={statusColor[t.status]}>{t.status}</Badge></td>
                <td className={`px-4 py-3 text-xs font-semibold uppercase ${slaColor[t.sla_state || ''] || 'text-slate-500'}`}>{t.sla_state || '—'}</td>
                <td className="px-4 py-3 text-slate-400">{t.assignee || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{ago(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-600 flex items-center gap-1"><RefreshCw size={11} /> Escalation policies run automatically in the backend worker; “Run escalations now” triggers them on demand.</p>
      <button onClick={() => ticketsApi.runEscalations().then(load).catch(e => setError(e.message))}
        className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">Run escalation sweep now</button>

      {showCreate && (
        <CreateTicketModal tenants={tenants} isPlatform={isPlatform} onClose={() => setShowCreate(false)}
          onCreate={async d => { await ticketsApi.create(d); await load(); }} />
      )}
      {selected && <DetailDrawer ticket={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </div>
  );
};

const Kpi: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
    <div className={`${color}`}>{icon}</div>
    <div><p className={`text-2xl font-bold ${color}`}>{value}</p><p className="text-xs text-slate-400">{label}</p></div>
  </div>
);

export default AdvancedTicketingPage;
