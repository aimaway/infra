import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AdvTicket, simTickets, simWorkloads, slaStateOf, SlaState,
} from '../../data/ticketingNotifData';
import {
  Ticket, Brain, Timer, ShieldAlert, Lock, GitCompare, CheckCircle2, Clock,
  Users, Search, Filter, X, Cpu, Link2, FileLock2, ScrollText, Zap, AlertOctagon,
  TrendingUp, UserCheck, ChevronRight, Sparkles, BarChart3,
} from 'lucide-react';

// ---- small style helpers ---------------------------------------------------
const priBadge: Record<string, string> = {
  p1: 'bg-red-500/20 text-red-400 border-red-500/30',
  p2: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  p3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  p4: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};
const statusBadge: Record<string, string> = {
  new: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  triage: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pending_vendor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  escalated: 'bg-red-500/20 text-red-400 border-red-500/30',
  awaiting_approval: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};
const slaBadge: Record<SlaState, string> = {
  on_track: 'text-emerald-400', at_risk: 'text-amber-400', breached: 'text-red-400', met: 'text-green-400',
};

function fmtMin(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

function timeAgo(isoStr: string) {
  const diff = Math.max(0, Date.now() - new Date(isoStr).getTime());
  return fmtMin(Math.floor(diff / 60000));
}

export default function AdvancedTicketingPage() {
  const { user } = useAuth();
  const isPlatformAdmin = user?.role === 'platform_admin';
  const [tickets, setTickets] = useState<AdvTicket[]>(simTickets);
  const [tab, setTab] = useState<'queue' | 'workload' | 'sla'>('queue');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('*');
  const [tick, setTick] = useState(0); // live SLA countdown heartbeat
  const [approving, setApproving] = useState(false);
  const [reclassified, setReclassified] = useState<Record<string, boolean>>({});

  // simulate SLA timers advancing + occasional AI reclassification events
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(iv);
  }, []);

  const visibleTickets = useMemo(() => {
    void tick;
    return tickets.filter(t => {
      if (!isPlatformAdmin && tenantFilter !== '*' && t.tenant !== tenantFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search && !(`${t.id} ${t.title} ${t.category} ${t.asset ?? ''}`.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [tickets, search, statusFilter, tenantFilter, isPlatformAdmin, tick]);

  const stats = useMemo(() => {
    const active = tickets.filter(t => !['resolved', 'closed'].includes(t.status));
    return {
      total: tickets.length,
      active: active.length,
      breached: tickets.filter(t => slaStateOf(t) === 'breached').length,
      atRisk: tickets.filter(t => slaStateOf(t) === 'at_risk').length,
      awaitingApproval: tickets.filter(t => t.status === 'awaiting_approval').length,
      duplicates: tickets.filter(t => t.duplicateOf).length,
      aiAccuracy: 93.7,
    };
  }, [tickets]);

  const selected = tickets.find(t => t.id === selectedId) || null;

  const tenants = ['*', ...Array.from(new Set(simTickets.map(t => t.tenant)))];

  const runAiTriage = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'triage', ai: { ...t.ai, confidence: Math.min(99, t.ai.confidence + 1) } } : t));
    setReclassified(r => ({ ...r, [id]: true }));
  };

  const approveClosure = (id: string) => {
    setApproving(true);
    setTimeout(() => {
      setTickets(prev => prev.map(t => t.id === id ? {
        ...t,
        status: 'closed',
        approvals: t.approvals.map((a, i) => (i === 0 ? { ...a, status: 'approved' as const, at: new Date().toISOString(), note: 'Approved via portal (simulated).' } : a)),
        audit: [...t.audit, { seq: t.audit.length + 1, at: new Date().toISOString(), actor: user?.name ?? 'You', action: 'approval_granted', detail: 'Evidence-based closure approved', prevHash: t.audit[t.audit.length - 1]?.hash ?? '0'.repeat(24), hash: Math.random().toString(16).slice(2, 26) }],
      } : t));
      setApproving(false);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20"><Ticket className="w-6 h-6 text-cyan-400" /></div>
            <h1 className="text-3xl font-bold text-white">Advanced Ticketing</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Sparkles className="w-3 h-3" />AI-assisted · Simulated</span>
          </div>
          <p className="text-slate-400 mt-1">SLA automation · evidence vault · immutable audit · multi-tenant portal</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <select value={tenantFilter} onChange={e => setTenantFilter(e.target.value)}
            className={`bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 ${!isPlatformAdmin ? '' : ''}`}>
            {tenants.map(tn => <option key={tn} value={tn}>{tn === '*' ? (isPlatformAdmin ? 'All tenants' : 'My organization') : tn}</option>)}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Active tickets', v: stats.active, icon: Ticket, c: 'text-cyan-400' },
          { label: 'SLA breached', v: stats.breached, icon: AlertOctagon, c: 'text-red-400' },
          { label: 'Breach predicted', v: stats.atRisk, icon: TrendingUp, c: 'text-amber-400' },
          { label: 'Awaiting approval', v: stats.awaitingApproval, icon: UserCheck, c: 'text-purple-400' },
          { label: 'Duplicate clusters', v: stats.duplicates, icon: GitCompare, c: 'text-sky-400' },
          { label: 'AI triage accuracy', v: `${stats.aiAccuracy}%`, icon: Cpu, c: 'text-emerald-400' },
        ].map(k => (
          <div key={k.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <k.icon className={`w-5 h-5 ${k.c}`} />
            <div className="text-2xl font-bold text-white mt-2">{k.v}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([['queue', 'Ticket Queue', Ticket], ['sla', 'SLA & Escalations', Timer], ['workload', 'Team Workload', Users]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === id ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets, assets, CVEs…"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm"><Filter className="w-4 h-4" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                {['all', 'new', 'triage', 'open', 'in_progress', 'pending_vendor', 'escalated', 'awaiting_approval', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  {isPlatformAdmin && <th className="px-4 py-3 font-medium">Tenant</th>}
                  <th className="px-4 py-3 font-medium">AI Classification</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">SLA</th>
                  <th className="px-4 py-3 font-medium">Asset / Vuln</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {visibleTickets.map(t => {
                  const sla = slaStateOf(t);
                  const remaining = t.slaTargetMin - t.consumedMin;
                  return (
                    <tr key={t.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 cursor-pointer" onClick={() => setSelectedId(t.id)}>
                      <td className="px-4 py-3">
                        <div className="font-mono text-cyan-400 text-xs">{t.id}</div>
                        <div className="text-slate-200 max-w-[280px] truncate">{t.title}</div>
                        {t.duplicateOf && <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 mt-0.5"><GitCompare className="w-3 h-3" />dup of {t.duplicateOf}</span>}
                      </td>
                      {isPlatformAdmin && <td className="px-4 py-3 text-slate-300 text-xs">{t.tenant}</td>}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300"><Brain className="w-3.5 h-3.5 text-purple-400" />{t.ai.category}</div>
                        <div className="text-[10px] text-slate-500">{reclassified[t.id] ? 're-triaged just now' : `conf ${t.ai.confidence}%`}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded border text-xs font-semibold uppercase ${priBadge[t.priority]}`}>{t.priority}</span>
                        {t.priority !== t.aiPriority && <div className="text-[10px] text-purple-400 mt-1">AI suggests {t.aiPriority}</div>}
                      </td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded border text-xs capitalize ${statusBadge[t.status]}`}>{t.status.replace(/_/g, ' ')}</span></td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 text-xs font-medium ${slaBadge[sla]}`}><Timer className="w-3.5 h-3.5" />
                          {['resolved', 'closed'].includes(t.status) ? sla : remaining > 0 ? `${fmtMin(remaining)} left` : `over by ${fmtMin(-remaining)}`}
                        </div>
                        <div className="text-[10px] text-slate-500">breach risk {t.breachProbability}%</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-slate-300 flex items-center gap-1"><Link2 className="w-3 h-3 text-slate-500" />{t.asset ?? '—'}</div>
                        {t.vulnerability && (
                          <div className={`flex items-center gap-1 mt-0.5 ${t.vulnerability.exploitSeen ? 'text-red-400' : 'text-amber-400'}`}>
                            <ShieldAlert className="w-3 h-3" />{t.vulnerability.cve} · CVSS {t.vulnerability.cvss}{t.vulnerability.exploitSeen ? ' · exploited' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-slate-600" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleTickets.length === 0 && <div className="p-8 text-center text-slate-500">No tickets match your filters.</div>}
          </div>
        </div>
      )}

      {tab === 'sla' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Timer className="w-5 h-5 text-amber-400" />SLA policies & breach predictions</h3>
            {[
              { p: 'P1 — Critical', target: '4h response / 24h resolution', policy: 'Auto-escalate L1→L3 after 30 min unacked; SMS on-call.' },
              { p: 'P2 — High', target: '8h response / 2d resolution', policy: 'Escalate to team lead after 4h; notify client admin.' },
              { p: 'P3 — Medium', target: '1d response / 5d resolution', policy: 'Digest notification; escalate after 3d idle.' },
              { p: 'P4 — Low', target: '3d response / 10d resolution', policy: 'Weekly digest; no auto-escalation.' },
            ].map(s => (
              <div key={s.p} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex justify-between text-sm"><span className="text-slate-200 font-medium">{s.p}</span><span className="text-cyan-400">{s.target}</span></div>
                <p className="text-xs text-slate-500 mt-1">{s.policy}</p>
              </div>
            ))}
            <p className="text-[11px] text-slate-500 italic">Breach prediction model: time-to-SLA × assignee workload × category history (simulated).</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><AlertOctagon className="w-5 h-5 text-red-400" />At-risk & breached (live)</h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {tickets.filter(t => ['at_risk', 'breached'].includes(slaStateOf(t))).sort((a, b) => b.breachProbability - a.breachProbability).map(t => (
                <div key={t.id} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-slate-200 truncate">{t.title}</div>
                    <div className="text-xs text-slate-500 font-mono">{t.id} · {t.tenant} · lvl {t.escalationLevel}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${slaStateOf(t) === 'breached' ? 'text-red-400' : 'text-amber-400'}`}>{t.breachProbability}%</div>
                    <div className="text-[10px] text-slate-500">breach risk</div>
                  </div>
                  <button onClick={() => { setSelectedId(t.id); setTab('queue'); }} className="text-cyan-400 hover:text-cyan-300 text-xs flex-shrink-0">Open →</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'workload' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b border-slate-800">
              <th className="px-4 py-3">Agent</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">Presence</th>
              <th className="px-4 py-3">Open</th><th className="px-4 py-3">P1/P2</th><th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Avg resolve</th><th className="px-4 py-3">Breaches 30d</th>
            </tr></thead>
            <tbody>
              {simWorkloads.map(w => (
                <tr key={w.agent} className="border-b border-slate-800/60">
                  <td className="px-4 py-3 text-slate-200">{w.agent}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">{w.grade}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block w-2 h-2 rounded-full mr-1 ${w.online ? 'bg-emerald-400' : 'bg-slate-600'}`}>{w.online ? 'online' : 'offline'}</span></td>
                  <td className="px-4 py-3 text-slate-300">{w.open}</td>
                  <td className="px-4 py-3 text-slate-300">{w.p1p2}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded bg-slate-800 overflow-hidden"><div className={`h-full ${w.capacityPct > 100 ? 'bg-red-500' : w.capacityPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, w.capacityPct)}%` }} /></div>
                      <span className={`text-xs ${w.capacityPct > 100 ? 'text-red-400' : 'text-slate-400'}`}>{w.capacityPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{w.avgResolveH}h</td>
                  <td className={`px-4 py-3 ${w.slaBreaches30d > 3 ? 'text-red-400' : 'text-slate-300'}`}>{w.slaBreaches30d}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 text-xs text-slate-500 flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" />Smart-assignment would rebalance overloaded agents (&gt;100%) toward peers with spare capacity — simulated in this demo.</div>
        </div>
      )}

      {/* ------------------ Detail drawer ------------------ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setSelectedId(null)}>
          <div className="w-full max-w-2xl h-full overflow-y-auto bg-slate-950 border-l border-cyan-500/20 p-6 space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-cyan-400 text-sm">{selected.id} · <span className="text-slate-400">{selected.tenant}</span></div>
                <h2 className="text-xl font-bold text-white mt-1">{selected.title}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded border text-xs uppercase font-semibold ${priBadge[selected.priority]}`}>{selected.priority}</span>
                  <span className={`px-2 py-0.5 rounded border text-xs capitalize ${statusBadge[selected.status]}`}>{selected.status.replace(/_/g, ' ')}</span>
                  <span className="px-2 py-0.5 rounded border text-xs border-slate-700 text-slate-400">opened {timeAgo(selected.createdAt)} ago</span>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* AI panel */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-purple-300 flex items-center gap-2"><Brain className="w-4 h-4" />AI classification & prioritization</h3>
                <span className="text-[10px] text-slate-500">{selected.ai.modelVersion}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-slate-500 text-xs">Category</div><div className="text-slate-200">{selected.ai.category}</div></div>
                <div><div className="text-slate-500 text-xs">MITRE tactic</div><div className="text-slate-200">{selected.ai.subcategory}</div></div>
                <div><div className="text-slate-500 text-xs">Confidence</div>
                  <div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded bg-slate-800"><div className="h-full rounded bg-purple-500" style={{ width: `${selected.ai.confidence}%` }} /></div><span className="text-purple-300 text-xs">{selected.ai.confidence}%</span></div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {selected.ai.reasoning.map((r, i) => <li key={i} className="text-xs text-slate-400 flex gap-2"><Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />{r}</li>)}
              </ul>
              {selected.duplicateOf && (
                <div className="text-xs text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-lg p-2 flex items-center gap-2"><GitCompare className="w-4 h-4" />Correlated duplicate incident → <button className="underline" onClick={() => setSelectedId(selected.duplicateOf!)}>{selected.duplicateOf}</button></div>
              )}
              <button onClick={() => runAiTriage(selected.id)} className="w-full py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-sm font-medium flex items-center justify-center gap-2"><Cpu className="w-4 h-4" />Re-run AI triage (simulated)</button>
            </div>

            {/* SLA + escalation */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><Timer className="w-4 h-4 text-amber-400" />SLA timer & escalation trail</h3>
              <div className="flex items-center gap-4 text-sm mb-3">
                <span className={slaBadge[slaStateOf(selected)]}>{slaStateOf(selected).replace(/_/g, ' ')}</span>
                <span className="text-slate-400">{fmtMin(selected.consumedMin)} / {fmtMin(selected.slaTargetMin)}</span>
                <span className="text-slate-500 text-xs ml-auto">escalation level {selected.escalationLevel}/3</span>
              </div>
              <div className="w-full h-2 rounded bg-slate-800 overflow-hidden mb-3">
                <div className={`h-full transition-all duration-1000 ${slaStateOf(selected) === 'breached' ? 'bg-red-500' : slaStateOf(selected) === 'at_risk' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (selected.consumedMin / selected.slaTargetMin) * 100)}%` }} />
              </div>
              <div className="text-xs text-slate-500">Predicted breach probability: <span className={selected.breachProbability > 70 ? 'text-red-400' : 'text-amber-400'}>{selected.breachProbability}%</span> · next policy step: {selected.escalationLevel < 3 ? `auto-escalate to L${selected.escalationLevel + 2} on timeout` : 'director notification'}</div>
            </div>

            {/* Asset & vulnerability */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2 mb-2"><Link2 className="w-4 h-4 text-cyan-400" />Linked asset</h3>
                <div className="text-slate-300 font-mono">{selected.asset ?? 'none'}</div>
                {selected.relatedIncident && <div className="text-xs text-slate-500 mt-1">Related incident: <span className="text-cyan-400">{selected.relatedIncident}</span></div>}
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2 mb-2"><ShieldAlert className="w-4 h-4 text-red-400" />Vulnerability tracking</h3>
                {selected.vulnerability ? (
                  <div className="text-slate-300">
                    <span className="font-mono">{selected.vulnerability.cve}</span> · CVSS {selected.vulnerability.cvss}
                    {selected.vulnerability.exploitSeen && <span className="ml-2 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">exploit observed</span>}
                  </div>
                ) : <div className="text-slate-500 text-xs">No linked vulnerabilities (CMDB sync — simulated)</div>}
              </div>
            </div>

            {/* Evidence vault */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><FileLock2 className="w-4 h-4 text-emerald-400" />Evidence vault <span className="text-[10px] font-normal text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5">write-once</span></h3>
              <div className="space-y-2">
                {selected.evidence.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 text-sm">
                    <div className="min-w-0">
                      <div className="text-slate-200 truncate flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{ev.name}<span className="text-[10px] uppercase text-slate-500 border border-slate-700 rounded px-1">{ev.kind}</span></div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{ev.hash}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-xs text-slate-400">{(ev.sizeKb / 1024).toFixed(1)} MB</div>
                      <div className="text-[10px] text-slate-600">by {ev.collectedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Hashes are fingerprinted at collection; any modification breaks chain verification (simulated WORM storage).</p>
            </div>

            {/* RCA */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-cyan-400" />Root-cause analysis</h3>
              {selected.rootCause
                ? <p className="text-sm text-slate-300">{selected.rootCause}</p>
                : <p className="text-sm text-slate-500 italic">AI will propose an RCA once correlated telemetry converges — predicted hypothesis: <span className="text-purple-300 not-italic">“{selected.ai.predictedRootCause}”</span></p>}
            </div>

            {/* Approvals */}
            {(selected.approvals.length > 0 || selected.status === 'resolved') && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><UserCheck className="w-4 h-4 text-purple-400" />Approval workflow (evidence-based closure)</h3>
                <div className="space-y-2">
                  {selected.approvals.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-sm p-2 rounded bg-slate-800/40">
                      <div><span className="text-slate-200">{a.name}</span> <span className="text-slate-500 text-xs">· {a.role}</span></div>
                      <span className={`text-xs flex items-center gap-1 ${a.status === 'approved' ? 'text-emerald-400' : a.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                        {a.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}{a.status}
                      </span>
                    </div>
                  ))}
                </div>
                {selected.status === 'awaiting_approval' && (
                  <button onClick={() => approveClosure(selected.id)} disabled={approving}
                    className="mt-3 w-full py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-sm font-medium disabled:opacity-50">
                    {approving ? 'Verifying evidence chain…' : 'Approve closure (simulated)'}
                  </button>
                )}
              </div>
            )}

            {/* Audit history */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><ScrollText className="w-4 h-4 text-slate-400" />Immutable-style audit history <span className="text-[10px] font-normal text-slate-500">(hash-chained)</span></h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {selected.audit.map(a => (
                  <div key={a.seq} className="text-xs flex items-start gap-3 p-2 rounded bg-slate-800/30">
                    <span className="text-slate-600 font-mono w-6 flex-shrink-0">#{a.seq}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-slate-200">{a.actor}</span> <span className="text-cyan-400">{a.action.replace(/_/g, ' ')}</span>
                      <div className="text-slate-600 font-mono truncate">prev:{a.prevHash.slice(0, 10)}… → {a.hash.slice(0, 10)}…</div>
                    </div>
                    <span className="text-slate-600 flex-shrink-0">{new Date(a.at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
