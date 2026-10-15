import React, { useState } from 'react';
import { Search, Download, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { demoAuditLog } from '../../data/mockData';

export default function PlatformAuditPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');

  const filtered = demoAuditLog.filter(e => {
    const matchSearch = e.details.toLowerCase().includes(search.toLowerCase()) ||
      e.actorName.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || e.actorRole === filterRole;
    const matchOutcome = filterOutcome === 'all' || e.outcome === filterOutcome;
    return matchSearch && matchRole && matchOutcome;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-slate-500 text-sm mt-1">Complete activity trail across all organizations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search audit entries..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Roles</option>
            <option value="platform_admin">Platform Admin</option>
            <option value="client_admin">Client Admin</option>
            <option value="client_user">Client User</option>
          </select>
          <select
            value={filterOutcome}
            onChange={e => setFilterOutcome(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success</option>
            <option value="blocked">Blocked</option>
            <option value="failure">Failure</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Details</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Outcome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-slate-200">{entry.actorName}</p>
                      <p className="text-xs text-slate-500">{entry.actorRole.replace('_', ' ')}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-cyan-400 font-mono">{entry.action}</code>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-300 max-w-md truncate">{entry.details}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${
                      entry.outcome === 'success' ? 'text-cyber-green' :
                      entry.outcome === 'blocked' ? 'text-cyber-red' : 'text-cyber-yellow'
                    }`}>
                      {entry.outcome === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       entry.outcome === 'blocked' ? <XCircle className="w-3.5 h-3.5" /> :
                       <AlertTriangle className="w-3.5 h-3.5" />}
                      {entry.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-slate-500 font-mono">{entry.ip}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
