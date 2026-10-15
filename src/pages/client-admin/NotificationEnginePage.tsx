import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  simEvents, simDeliveries, simRules, simDlq, quietHours, analytics24h, notifTenants,
  NotifRule, Channel, DeliveryStatus,
} from '../../data/ticketingNotifData';
import {
  Bell, Radio, Mail, MessageSquare, Webhook, Users2, Hash, Zap, Shield,
  Activity, AlertTriangle, CheckCircle2, Clock, RotateCcw, Skull, VolumeX,
  Plus, Trash2, ToggleLeft, ToggleRight, BarChart3, Eye, Moon, Inbox,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const sevColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/15 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  low: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  info: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
};
const dStatusStyle: Record<DeliveryStatus, string> = {
  delivered: 'text-emerald-400', acknowledged: 'text-cyan-400', queued: 'text-slate-400',
  retrying: 'text-amber-400', dead_letter: 'text-red-400', suppressed: 'text-purple-400',
};
const channelIcon: Record<Channel, any> = {
  in_app: Bell, email: Mail, sms: MessageSquare, webhook: Webhook, teams: Users2, slack: Hash,
};

export default function NotificationEnginePage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<NotifRule[]>(simRules);
  const [tab, setTab] = useState<'events' | 'rules' | 'delivery' | 'analytics'>('events');
  const [liveFeed, setLiveFeed] = useState<{ id: string; ts: string; title: string; severity: string }[]>([]);
  const [sevFilter, setSevFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('*');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleSev, setNewRuleSev] = useState('high');
  const [newRuleChannel, setNewRuleChannel] = useState<Channel>('email');
  const [visualBuilderOpen, setVisualBuilderOpen] = useState(false);

  // live simulated event stream every 6s
  useEffect(() => {
    const pool = [...simEvents];
    const iv = setInterval(() => {
      const e = pool[Math.floor(Math.random() * pool.length)];
      setLiveFeed(f => [{ id: `${e.id}-${Date.now()}`, ts: new Date().toLocaleTimeString(), title: e.title, severity: e.severity }, ...f].slice(0, 8));
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  const events = useMemo(() => simEvents.filter(e =>
    (sevFilter === 'all' || e.severity === sevFilter) &&
    (tenantFilter === '*' || e.tenant === tenantFilter)
  ).sort((a, b) => +new Date(b.ts) - +new Date(a.ts)), [sevFilter, tenantFilter]);

  const toggleRule = (id: string) => setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const deleteRule = (id: string) => setRules(rs => rs.filter(r => r.id !== id));
  const addRule = () => {
    if (!newRuleName.trim()) return;
    setRules(rs => [{
      id: `NR-${String(rs.length + 1).padStart(2, '0')}`, name: newRuleName, enabled: true,
      whenSeverity: [newRuleSev], whenSources: ['*'], whenTenant: '*', timeWindow: '24/7',
      actions: [{ channel: newRuleChannel, target: 'default route', delayMin: 0 }], stormGuard: true, hits24h: 0,
    }, ...rs]);
    setNewRuleName(''); setVisualBuilderOpen(false);
  };

  const counts = {
    total: simEvents.length,
    suppressed: simEvents.filter(e => e.suppressed).length,
    correlated: simEvents.filter(e => e.correlatedGroup).length,
    dlq: simDlq.length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20"><Radio className="w-6 h-6 text-amber-400" /></div>
            <h1 className="text-3xl font-bold text-white">Notification & Event Intelligence</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Zap className="w-3 h-3" />Event-driven · Simulated</span>
          </div>
          <p className="text-slate-400 mt-1">Routing rules · correlation & storm protection · delivery diagnostics · acknowledgements</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <select value={tenantFilter} onChange={e => setTenantFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
            <option value="*">{user?.role === 'platform_admin' ? 'All tenants' : 'My organization'}</option>
            {notifTenants.map(tn => <option key={tn} value={tn}>{tn}</option>)}
          </select>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {[
          { l: 'Events (24h)', v: analytics24h.totalEvents, i: Activity, c: 'text-cyan-400' },
          { l: 'Alerts delivered', v: `${analytics24h.deliveredPct}%`, i: CheckCircle2, c: 'text-emerald-400' },
          { l: 'Mean ack time', v: `${analytics24h.meanAckMin} min`, i: Clock, c: 'text-amber-400' },
          { l: 'Storms blocked', v: analytics24h.stormsDetected, i: VolumeX, c: 'text-purple-400' },
          { l: 'Correlation clusters', v: counts.correlated, i: Shield, c: 'text-sky-400' },
          { l: 'Dead-letter items', v: counts.dlq, i: Skull, c: 'text-red-400' },
          { l: 'Quiet-hours digest', v: quietHours.digestsQueued, i: Moon, c: 'text-indigo-400' },
        ].map(k => (
          <div key={k.l} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <k.i className={`w-5 h-5 ${k.c}`} />
            <div className="text-xl font-bold text-white mt-2">{k.v}</div>
            <div className="text-[11px] text-slate-500">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Live feed ticker */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
          <h3 className="text-sm font-semibold text-white">Live event stream (simulated)</h3>
        </div>
        <div className="space-y-1">
          {liveFeed.length === 0 && <div className="text-xs text-slate-500 italic">Awaiting next simulated event…</div>}
          {liveFeed.map(f => (
            <div key={f.id} className="flex items-center gap-3 text-xs animate-pulse-none">
              <span className="text-slate-600 font-mono">{f.ts}</span>
              <span className={`px-1.5 rounded border text-[10px] uppercase ${sevColor[f.severity]}`}>{f.severity}</span>
              <span className="text-slate-300 truncate">{f.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {([['events', 'Events & Correlation', AlertTriangle], ['rules', 'Rule Builder', Zap], ['delivery', 'Delivery Diagnostics', Inbox], ['analytics', 'Analytics', BarChart3]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === id ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ---------------- EVENTS ---------------- */}
      {tab === 'events' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
              {['all', 'critical', 'high', 'medium', 'low', 'info'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="text-xs text-slate-500 self-center flex items-center gap-2"><VolumeX className="w-4 h-4 text-purple-400" />{counts.suppressed} events suppressed by storm protection · dedup collapses repeated raw events into one notification</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-4 py-3">Event</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Source</th>
                {user?.role === 'platform_admin' && <th className="px-4 py-3">Tenant</th>}
                <th className="px-4 py-3">Rule</th><th className="px-4 py-3">Correlation</th><th className="px-4 py-3">Dedup</th><th className="px-4 py-3">When</th>
              </tr></thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="text-slate-200 max-w-[300px] truncate">{e.suppressed && <VolumeX className="w-3.5 h-3.5 text-purple-400 inline mr-1" />}{e.title}</div>
                      <div className="text-[10px] font-mono text-slate-600">{e.id}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded border text-xs uppercase ${sevColor[e.severity]}`}>{e.severity}</span></td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{e.source}</td>
                    {user?.role === 'platform_admin' && <td className="px-4 py-3 text-slate-300 text-xs">{e.tenant}</td>}
                    <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{e.ruleId}</td>
                    <td className="px-4 py-3">{e.correlatedGroup ? <span className="text-sky-400 font-mono text-xs">{e.correlatedGroup}</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{e.dedupCount > 0 ? `×${e.dedupCount + 1}` : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(e.ts).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- RULES ---------------- */}
      {tab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Visual rule builder — WHEN conditions route to THEN actions (all simulated).</p>
            <button onClick={() => setVisualBuilderOpen(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30">
              <Plus className="w-4 h-4" />New rule
            </button>
          </div>

          {visualBuilderOpen && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 grid md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Rule name</label>
                <input value={newRuleName} onChange={e => setNewRuleName(e.target.value)} placeholder="e.g. Critical DB → NOC" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">WHEN severity ≥</label>
                <select value={newRuleSev} onChange={e => setNewRuleSev(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200">
                  {['critical', 'high', 'medium', 'low', 'info'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">THEN send via</label>
                <select value={newRuleChannel} onChange={e => setNewRuleChannel(e.target.value as Channel)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200">
                  {(Object.keys(channelIcon) as Channel[]).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <button onClick={addRule} className="py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium hover:bg-emerald-500/30">Save rule (simulated)</button>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4">
            {rules.map(r => (
              <div key={r.id} className={`rounded-xl border p-4 space-y-3 ${r.enabled ? 'border-slate-700 bg-slate-900/60' : 'border-slate-800 bg-slate-900/30 opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400">{r.id}</span>
                      <h3 className="text-sm font-semibold text-white">{r.name}</h3>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">window: {r.timeWindow} · tenant: {r.whenTenant} · hits 24h: {r.hits24h}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleRule(r.id)} className="text-slate-400 hover:text-white">{r.enabled ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6" />}</button>
                    <button onClick={() => deleteRule(r.id)} className="p-1 text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* visual pipeline */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300">WHEN sev ∈ [{r.whenSeverity.join(', ')}]</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300">src {r.whenSources.join('/')}</span>
                  <span className="text-slate-600">→</span>
                  {r.actions.map((a, i) => {
                    const Icon = channelIcon[a.channel];
                    return <span key={i} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1"><Icon className="w-3 h-3" />{a.channel.replace(/_/g, ' ')}{a.delayMin > 0 ? ` +${a.delayMin}m` : ''}</span>;
                  })}
                  {r.stormGuard && <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1"><VolumeX className="w-3 h-3" />storm guard</span>}
                  {r.escalateAfterMin && <span className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-300 flex items-center gap-1"><RotateCcw className="w-3 h-3" />escalate after {r.escalateAfterMin}m unacked</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 flex items-start gap-3">
            <Moon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-white">Quiet hours — {quietHours.enabled ? 'active' : 'off'}</div>
              <div className="text-slate-400 text-xs mt-1">{quietHours.schedule}. Exempt severities: {quietHours.exemptSeverities.join(', ')}. {quietHours.digestsQueued} notifications batched into morning digest.</div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELIVERY DIAGNOSTICS ---------------- */}
      {tab === 'delivery' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="px-4 py-3">Delivery</th><th className="px-4 py-3">Channel</th><th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Ack</th><th className="px-4 py-3">Next retry</th>
              </tr></thead>
              <tbody>
                {simDeliveries.slice(0, 40).map(d => {
                  const Icon = channelIcon[d.channel];
                  return (
                    <tr key={d.id} className="border-b border-slate-800/60">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{d.id}<div className="text-[10px]">{d.eventId}</div></td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-slate-300 text-xs capitalize"><Icon className="w-3.5 h-3.5 text-slate-500" />{d.channel.replace(/_/g, ' ')}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-[220px] truncate">{d.target}</td>
                      <td className={`px-4 py-3 text-xs font-medium capitalize flex items-center gap-1 ${dStatusStyle[d.status]}`}>
                        {d.status === 'delivered' || d.status === 'acknowledged' ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : d.status === 'dead_letter' ? <Skull className="w-3.5 h-3.5" />
                            : d.status === 'retrying' ? <RotateCcw className="w-3.5 h-3.5" />
                              : d.status === 'suppressed' ? <VolumeX className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {d.status.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{d.attempts}/5</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{d.latencyMs >= 1000 ? `${(d.latencyMs / 1000).toFixed(1)}s` : `${d.latencyMs}ms`}</td>
                      <td className="px-4 py-3 text-xs">{d.ackBy ? <span className="text-cyan-400 flex items-center gap-1"><Eye className="w-3 h-3" />{d.ackBy}</span> : <span className="text-slate-600">—</span>}</td>
                      <td className="px-4 py-3 text-xs">{d.nextRetry ? <span className="text-amber-400">{new Date(d.nextRetry).toLocaleTimeString()}</span> : <span className="text-slate-600">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <h3 className="font-semibold text-red-300 flex items-center gap-2 mb-3"><Skull className="w-5 h-5" />Dead-letter queue ({simDlq.length})</h3>
            <div className="space-y-2">
              {simDlq.map(q => (
                <div key={q.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between"><span className="font-mono text-red-400">{q.id} → {q.deliveryId}</span><span className="text-slate-500">{new Date(q.failedAt).toLocaleString()}</span></div>
                  <div className="text-slate-300">{q.reason}</div>
                  <div className="text-slate-600 font-mono truncate">{q.payloadPreview}</div>
                  <div className="flex gap-2 pt-1">
                    <button className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Replay (simulated)</button>
                    <button className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200">Discard</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ANALYTICS ---------------- */}
      {tab === 'analytics' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" />Event volume vs alerts sent (24h)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics24h.hourlyVolume}>
                <defs>
                  <linearGradient id="gEv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gAl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="events" stroke="#22d3ee" fill="url(#gEv)" name="raw events" />
                <Area type="monotone" dataKey="alerts_sent" stroke="#f59e0b" fill="url(#gAl)" name="alerts sent" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-500 mt-2">Gap between raw events and alerts sent = deduplication, correlation & storm suppression.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-amber-400" />Notifications by severity</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics24h.bySeverity} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {analytics24h.bySeverity.map(s => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: 'Escalations triggered (7d)', v: ri(28, 60), s: 'severity-based routing fired' },
              { l: 'Avg time-to-acknowledge', v: `${analytics24h.meanAckMin}m`, s: 'P1 targets: <10m' },
              { l: 'Suppression ratio', v: `${Math.round((analytics24h.suppressed / analytics24h.totalEvents) * 100)}%`, s: 'noise removed before humans' },
              { l: 'DLQ replay success', v: '89%', s: 'after endpoint recovery' },
            ].map((x, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="text-2xl font-bold text-white">{x.v}</div>
                <div className="text-sm text-slate-300 mt-1">{x.l}</div>
                <div className="text-[11px] text-slate-500">{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// local helper kept outside component for stable output
function ri(min: number, max: number) { return Math.floor(((min + max) / 2 + (min - max)) % (max - min)) + min; }
