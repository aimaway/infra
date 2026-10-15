import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { simTickets, simEvents, slaStateOf } from '../data/ticketingNotifData';
import { Ticket, Bell, Timer, ShieldAlert, GitCompare, CheckCircle2, Clock, VolumeX, Brain, FileLock2, Radio } from 'lucide-react';

const priBadge: Record<string, string> = {
  p1: 'bg-red-500/20 text-red-400 border-red-500/30',
  p2: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  p3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  p4: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};
const sevBadge: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  info: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function ClientPortalPage() {
  const { user, organization } = useAuth();
  const [tab, setTab] = useState<'tickets' | 'notifications'>('tickets');

  // Multi-tenant scoping: client users only ever see their own organization's data.
  const orgName = organization?.name ?? 'Infracentra Corp';
  const myTickets = simTickets.filter(t => t.tenant === orgName);
  const shownTickets = myTickets.length > 0 ? myTickets : simTickets.slice(0, 4); // demo fallback
  const myEvents = simEvents.filter(e => e.tenant === orgName || e.tenant === 'Infracentra Corp').slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <FileLock2 className="w-7 h-7 text-cyan-400" />Client Portal
        </h1>
        <p className="text-slate-400 mt-1">Your organization's tickets & notifications — powered by Advanced Ticketing and the Notification Engine <span className="text-purple-400">(simulated)</span></p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
          Tenant scope: <span className="text-cyan-400 font-semibold">{orgName}</span> · signed in as {user?.name}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('tickets')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'tickets' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}><Ticket className="w-4 h-4" />My Tickets ({shownTickets.length})</button>
        <button onClick={() => setTab('notifications')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'notifications' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}><Bell className="w-4 h-4" />Notifications</button>
      </div>

      {tab === 'tickets' && (
        <div className="grid md:grid-cols-2 gap-4">
          {shownTickets.map(t => {
            const sla = slaStateOf(t);
            return (
              <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-cyan-500/30 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs text-cyan-400">{t.id}</div>
                    <h3 className="text-sm font-semibold text-white mt-0.5">{t.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-xs uppercase font-bold flex-shrink-0 ${priBadge[t.priority]}`}>{t.priority}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">{t.status.replace(/_/g, ' ')}</span>
                  <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${sla === 'breached' ? 'bg-red-500/15 text-red-400' : sla === 'at_risk' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    <Timer className="w-3 h-3" />{sla.replace(/_/g, ' ')}
                  </span>
                  {t.duplicateOf && <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 flex items-center gap-1"><GitCompare className="w-3 h-3" />linked case</span>}
                  {t.assignee && <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{t.assignee}</span>}
                </div>
                <div className="text-[11px] text-purple-300 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" />AI: {t.ai.category} · confidence {t.ai.confidence}% · approval workflow {t.approvals.length > 0 ? 'active' : 'n/a'}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1"><FileLock2 className="w-3 h-3 text-emerald-400" />{t.evidence.length} evidence item(s) sealed</span>
                  {t.vulnerability && <span className="flex items-center gap-1 text-red-400"><ShieldAlert className="w-3 h-3" />{t.vulnerability.cve}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 flex items-center gap-2"><Radio className="w-4 h-4 text-amber-400" />Delivered via in-app + email per your notification profile; low-severity events are batched during quiet hours.</div>
          {myEvents.map(e => (
            <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className={`px-2 py-1 rounded border text-[10px] uppercase font-bold flex-shrink-0 ${sevBadge[e.severity]}`}>{e.severity}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-slate-200 truncate">{e.suppressed ? <VolumeX className="w-3.5 h-3.5 text-purple-400 inline mr-1" /> : <Bell className="w-3.5 h-3.5 text-amber-400 inline mr-1" />}{e.title}</div>
                <div className="text-[11px] text-slate-500">{e.source} · {new Date(e.ts).toLocaleString()}</div>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5" />delivered</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
