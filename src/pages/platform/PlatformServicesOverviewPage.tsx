import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { simTickets, simEvents, simDeliveries, simDlq, slaStateOf, analytics24h } from '../../data/ticketingNotifData';
import { Ticket, Radio, AlertOctagon, Skull, Building2, ArrowRight, VolumeX, Timer, CheckCircle2 } from 'lucide-react';

export default function PlatformServicesOverviewPage() {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState('*');

  const tenants = ['*', ...Array.from(new Set(simTickets.map(t => t.tenant)))];
  const tickets = tenant === '*' ? simTickets : simTickets.filter(t => t.tenant === tenant);
  const events = tenant === '*' ? simEvents : simEvents.filter(e => e.tenant === tenant);

  const kpis = useMemo(() => ({
    active: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
    breached: tickets.filter(t => slaStateOf(t) === 'breached').length,
    atRisk: tickets.filter(t => slaStateOf(t) === 'at_risk').length,
    approvals: tickets.filter(t => t.status === 'awaiting_approval').length,
    suppressed: events.filter(e => e.suppressed).length,
    deadLetters: simDlq.length,
    ackRate: Math.round((simDeliveries.filter(d => ['delivered', 'acknowledged'].includes(d.status)).length / Math.max(1, simDeliveries.length)) * 100),
  }), [tickets, events]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Building2 className="w-7 h-7 text-purple-400" />Ticketing & Notification Services — Cross-Tenant Overview</h1>
          <p className="text-slate-400 mt-1">Platform-admin view across all client tenants <span className="text-purple-400">(simulated data)</span></p>
        </div>
        <select value={tenant} onChange={e => setTenant(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
          {tenants.map(tn => <option key={tn} value={tn}>{tn === '*' ? 'All tenants' : tn}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {[
          { l: 'Active tickets', v: kpis.active, i: Ticket, c: 'text-cyan-400' },
          { l: 'SLA breached', v: kpis.breached, i: AlertOctagon, c: 'text-red-400' },
          { l: 'At risk', v: kpis.atRisk, i: Timer, c: 'text-amber-400' },
          { l: 'Pending approvals', v: kpis.approvals, i: CheckCircle2, c: 'text-purple-400' },
          { l: 'Storm-suppressed', v: kpis.suppressed, i: VolumeX, c: 'text-indigo-400' },
          { l: 'Dead letters', v: kpis.deadLetters, i: Skull, c: 'text-red-400' },
          { l: 'Delivery success', v: `${kpis.ackRate}%`, i: Radio, c: 'text-emerald-400' },
        ].map(k => (
          <div key={k.l} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <k.i className={`w-5 h-5 ${k.c}`} />
            <div className="text-2xl font-bold text-white mt-2">{k.v}</div>
            <div className="text-[11px] text-slate-500">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Per-tenant rollup */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b border-slate-800">
            <th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Tickets</th><th className="px-4 py-3">Breached</th>
            <th className="px-4 py-3">Awaiting approval</th><th className="px-4 py-3">Events (sampled)</th><th className="px-4 py-3">Suppressed</th>
          </tr></thead>
          <tbody>
            {tenants.filter(t => t !== '*').map(tn => {
              const tt = simTickets.filter(x => x.tenant === tn);
              const ee = simEvents.filter(x => x.tenant === tn);
              return (
                <tr key={tn} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200">{tn}</td>
                  <td className="px-4 py-3 text-slate-300">{tt.length}</td>
                  <td className={`px-4 py-3 ${tt.filter(t => slaStateOf(t) === 'breached').length > 0 ? 'text-red-400' : 'text-slate-400'}`}>{tt.filter(t => slaStateOf(t) === 'breached').length}</td>
                  <td className="px-4 py-3 text-purple-400">{tt.filter(t => t.status === 'awaiting_approval').length}</td>
                  <td className="px-4 py-3 text-slate-300">{ee.length}</td>
                  <td className="px-4 py-3 text-indigo-400">{ee.filter(e => e.suppressed).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Deep links into the operational pages */}
      <div className="grid md:grid-cols-2 gap-4">
        <button onClick={() => navigate('/client-admin/advanced-tickets')} className="text-left p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition group">
          <div className="flex items-center justify-between"><Ticket className="w-6 h-6 text-cyan-400" /><ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400" /></div>
          <h3 className="text-white font-semibold mt-3">Open Advanced Ticketing console</h3>
          <p className="text-xs text-slate-500 mt-1">Queue, SLA breach predictions, evidence vault, approvals and workload management.</p>
        </button>
        <button onClick={() => navigate('/client-admin/notifications')} className="text-left p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition group">
          <div className="flex items-center justify-between"><Radio className="w-6 h-6 text-amber-400" /><ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400" /></div>
          <h3 className="text-white font-semibold mt-3">Open Notification Engine console</h3>
          <p className="text-xs text-slate-500 mt-1">Rule builder, delivery diagnostics, retries, dead-letter queue and analytics (24h volume: {analytics24h.totalEvents}).</p>
        </button>
      </div>
    </div>
  );
}
