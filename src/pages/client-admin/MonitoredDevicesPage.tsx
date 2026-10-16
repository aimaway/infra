import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Monitor, Plus, Trash2, Play, RefreshCw, ShieldAlert, KeyRound, Download,
  CheckCircle, Radar, Server, Wifi, X, Search, Terminal, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  discoveryApi, ApiError,
  SnmpCredential, ScanRow, DiscoveredDevice,
} from '../../services/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : '—');
const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border border-transparent ${className}`}>{children}</span>
);
const scanStatusColor: Record<string, string> = {
  queued: 'bg-slate-600/40 text-slate-300', running: 'bg-cyan-500/20 text-cyan-300 animate-pulse',
  completed: 'bg-emerald-500/20 text-emerald-300', failed: 'bg-red-500/20 text-red-300',
};

// ---------------------------------------------------------------------------
// SNMP credentials modal
// ---------------------------------------------------------------------------

const CredModal: React.FC<{ onClose: () => void; onSave: (c: Omit<SnmpCredential, 'id' | 'created_at'>) => Promise<void> }> = ({ onClose, onSave }) => {
  const [c, setC] = useState({ name: '', version: 'v2c', community: 'public', username: '', auth_protocol: 'SHA', auth_passphrase: '', priv_protocol: 'AES128', priv_passphrase: '', port: 161 });
  const [err, setErr] = useState('');
  const inp = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none';
  const lbl = 'block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.name.trim()) { setErr('Name is required'); return; }
    try {
      await onSave({
        name: c.name, version: c.version, port: Number(c.port),
        community: c.version !== 'v3' ? c.community : null,
        username: c.version === 'v3' ? c.username : null,
        auth_protocol: c.version === 'v3' ? c.auth_protocol : null,
        auth_passphrase: c.version === 'v3' ? c.auth_passphrase : null,
        priv_protocol: c.version === 'v3' ? c.priv_protocol : null,
        priv_passphrase: c.version === 'v3' ? c.priv_passphrase : null,
      });
      onClose();
    } catch (ex: any) { setErr(ex.message); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><KeyRound className="text-cyan-400" size={18} /> New SNMP Credential</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <div><label className={lbl}>Name *</label><input className={inp} value={c.name} onChange={e => setC({ ...c, name: e.target.value })} placeholder="Edge switches v2c" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Version</label>
            <select className={inp} value={c.version} onChange={e => setC({ ...c, version: e.target.value })}>
              <option value="v1">v1</option><option value="v2c">v2c</option><option value="v3">v3 (auth+priv)</option>
            </select></div>
          <div><label className={lbl}>Port</label><input type="number" className={inp} value={c.port} onChange={e => setC({ ...c, port: Number(e.target.value) })} /></div>
        </div>
        {c.version !== 'v3' ? (
          <div><label className={lbl}>Community string</label><input className={inp} value={c.community} onChange={e => setC({ ...c, community: e.target.value })} /></div>
        ) : (
          <div className="space-y-3">
            <div><label className={lbl}>Security username</label><input className={inp} value={c.username} onChange={e => setC({ ...c, username: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Auth protocol</label>
                <select className={inp} value={c.auth_protocol} onChange={e => setC({ ...c, auth_protocol: e.target.value })}>
                  {['MD5', 'SHA', 'SHA-256', 'SHA-512'].map(p => <option key={p}>{p}</option>)}
                </select></div>
              <div><label className={lbl}>Auth passphrase</label><input type="password" className={inp} value={c.auth_passphrase} onChange={e => setC({ ...c, auth_passphrase: e.target.value })} /></div>
              <div><label className={lbl}>Priv protocol</label>
                <select className={inp} value={c.priv_protocol} onChange={e => setC({ ...c, priv_protocol: e.target.value })}>
                  {['DES', '3DES', 'AES128', 'AES256'].map(p => <option key={p}>{p}</option>)}
                </select></div>
              <div><label className={lbl}>Priv passphrase</label><input type="password" className={inp} value={c.priv_passphrase} onChange={e => setC({ ...c, priv_passphrase: e.target.value })} /></div>
            </div>
          </div>
        )}
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-800 hover:bg-slate-700">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">Save Credential</button>
        </div>
        <p className="text-[11px] text-slate-500">Passphrases are used only at scan time by the backend engine and never returned to the browser.</p>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const MonitoredDevicesPage: React.FC = () => {
  const { user } = useAuth();
  const isPlatform = user?.role === 'platform_admin';
  const [tab, setTab] = useState<'devices' | 'scans' | 'credentials'>('devices');
  const [creds, setCreds] = useState<SnmpCredential[]>([]);
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [engine, setEngine] = useState<{ nmap_available: boolean; mode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCred, setShowCred] = useState(false);
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const [selCreds, setSelCreds] = useState<number[]>([]);
  const [starting, setStarting] = useState(false);
  const [expandedScan, setExpandedScan] = useState<number | null>(null);
  const [scanDevices, setScanDevices] = useState<DiscoveredDevice[]>([]);
  const [q, setQ] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [cr, sc, dv, en] = await Promise.all([
        discoveryApi.credentials(), discoveryApi.scans(), discoveryApi.devices(), discoveryApi.engineStatus(),
      ]);
      setCreds(cr); setScans(sc); setDevices(dv); setEngine(en);
    } catch (ex: any) {
      setError(ex instanceof ApiError ? ex.message : 'Backend unreachable — is the API container running?');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll while a scan is running so progress updates live
  const hasRunning = scans.some(s => ['queued', 'running'].includes(s.status));
  useEffect(() => {
    if (!hasRunning) return;
    const t = setInterval(() => load(true), 2500);
    return () => clearInterval(t);
  }, [hasRunning, load]);

  const startScan = async () => {
    setStarting(true); setError('');
    try {
      await discoveryApi.startScan(cidr, selCreds);
      setTab('scans');
      await load(true);
    } catch (ex: any) { setError(ex.message); }
    finally { setStarting(false); }
  };

  const expand = async (id: number) => {
    if (expandedScan === id) { setExpandedScan(null); return; }
    setExpandedScan(id);
    try { setScanDevices(await discoveryApi.scanDevices(id)); } catch (ex: any) { setError(ex.message); }
  };

  const filtered = useMemo(() => devices.filter(d =>
    !q || [d.ip, d.hostname, d.mac, d.os_guess, d.device_type].some(x => (x || '').toLowerCase().includes(q.toLowerCase()))
  ), [devices, q]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Monitor className="text-cyan-400" /> Monitored Devices & Network Discovery</h1>
          <p className="text-sm text-slate-400">
            Real scanner on the server: {engine ? (engine.nmap_available ? <span className="text-emerald-400">nmap available ({engine.mode})</span> : <span className="text-amber-400">pure-python engine ({engine.mode})</span>) : 'detecting…'}
          </p>
        </div>
        <button onClick={() => load()} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2"><ShieldAlert size={16} />{error}</div>}

      {/* Start-scan panel */}
      <div className="bg-slate-800/50 rounded-xl p-4 flex flex-wrap items-end gap-3">
        <div className="min-w-52 flex-1">
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Target network (CIDR)</label>
          <input value={cidr} onChange={e => setCidr(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" placeholder="192.168.1.0/24" />
        </div>
        <div className="flex-1 min-w-64">
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">SNMP credentials to probe with</label>
          <div className="flex flex-wrap gap-2">
            {creds.length === 0 && <span className="text-xs text-slate-500">none yet — add one below</span>}
            {creds.map(cr => (
              <button key={cr.id} onClick={() => setSelCreds(s => s.includes(cr.id!) ? s.filter(x => x !== cr.id) : [...s, cr.id!])}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selCreds.includes(cr.id!) ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {cr.name} <span className="opacity-60">({cr.version})</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={startScan} disabled={starting || !cidr}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold">
          <Radar size={16} className={starting ? 'animate-spin' : ''} /> {starting ? 'Queuing…' : 'Start Discovery Scan'}
        </button>
      </div>

      <div className="flex gap-1 border-b border-slate-700">
        {(['devices', 'scans', 'credentials'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
            {t}{t === 'devices' ? ` (${devices.length})` : t === 'scans' ? ` (${scans.length})` : ` (${creds.length})`}
          </button>
        ))}
      </div>

      {/* DISCOVERED / IMPORTED DEVICES */}
      {tab === 'devices' && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search IP / hostname / MAC / OS…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" />
          </div>
          <div className="bg-slate-800/40 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-700">
                <th className="px-4 py-3">IP</th><th className="px-4 py-3">Hostname</th><th className="px-4 py-3">MAC</th>
                <th className="px-4 py-3">Type</th><th className="px-4 py-3">OS guess</th><th className="px-4 py-3">Open ports</th>
                <th className="px-4 py-3">SNMP</th><th className="px-4 py-3">Imported</th></tr></thead>
              <tbody>
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center">
                    <Server className="mx-auto text-slate-600 mb-2" size={28} />
                    <p className="text-slate-400 mb-1">No devices discovered yet.</p>
                    <p className="text-xs text-slate-500">Enter a CIDR above and press “Start Discovery Scan” — the server will run real TCP probes (and nmap SYN/UDP scanning when installed) plus SNMP walks with your credentials.</p>
                  </td></tr>
                )}
                {filtered.map(d => (
                  <tr key={d.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-mono text-cyan-300">{d.ip}</td>
                    <td className="px-4 py-3 text-slate-200">{d.hostname || <span className="text-slate-600">—</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{d.mac || '—'}</td>
                    <td className="px-4 py-3 text-slate-300 capitalize">{d.device_type || 'unknown'}</td>
                    <td className="px-4 py-3 text-slate-400">{d.os_guess || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{d.open_ports.slice(0, 8).join(', ') || '—'}</td>
                    <td className="px-4 py-3">{d.snmp_match ? <Badge className="bg-emerald-500/20 text-emerald-300"><Wifi size={11} className="inline mr-1" />matched</Badge> : <span className="text-slate-600">no</span>}</td>
                    <td className="px-4 py-3">{d.imported ? <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle size={12} /> in CMDB</span>
                      : <button onClick={() => discoveryApi.importDevice(d.id).then(() => load(true))} className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"><Download size={12} /> Import</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCAN HISTORY */}
      {tab === 'scans' && (
        <div className="space-y-3">
          {scans.length === 0 && !loading && <p className="text-sm text-slate-500 bg-slate-800/40 rounded-xl p-6 text-center">No scans yet. Start one above — history, progress and per-scan device lists appear here.</p>}
          {[...scans].reverse().map(s => (
            <div key={s.id} className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-slate-100 text-sm">{s.network_cidr}</span>
                <Badge className={scanStatusColor[s.status] || ''}>{s.status}</Badge>
                <span className="text-xs text-slate-400">{s.discovered}/{s.total_hosts} hosts · {s.snmp_matched} SNMP matches</span>
                <span className="text-xs text-slate-500 ml-auto flex items-center gap-1"><Clock size={11} /> {fmt(s.started_at || s.created_at)} · by {s.created_by}</span>
                <button onClick={() => expand(s.id)} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-slate-200"><Terminal size={12} /> {expandedScan === s.id ? 'Hide' : 'Results'}</button>
              </div>
              {s.status === 'running' && <div className="mt-2 h-1.5 rounded bg-slate-700 overflow-hidden"><div className="h-full bg-cyan-500 transition-all" style={{ width: `${s.total_hosts ? Math.round(100 * s.discovered / s.total_hosts) : 10}%` }} /></div>}
              {s.status === 'failed' && s.finished_at && <p className="text-xs text-red-400 mt-1">Scan failed — check the target network is reachable from the API host.</p>}
              {expandedScan === s.id && (
                <div className="mt-3 bg-slate-900 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-left text-slate-500 border-b border-slate-700">
                      <th className="px-3 py-2">IP</th><th className="px-3 py-2">MAC</th><th className="px-3 py-2">Hostname</th>
                      <th className="px-3 py-2">Type</th><th className="px-3 py-2">OS</th><th className="px-3 py-2">Ports</th><th className="px-3 py-2">SNMP sysDescr</th></tr></thead>
                    <tbody>
                      {scanDevices.filter(d => d.scan_id === s.id).map(d => (
                        <tr key={d.id} className="border-b border-slate-800">
                          <td className="px-3 py-2 font-mono text-cyan-300">{d.ip}</td>
                          <td className="px-3 py-2 font-mono">{d.mac || '—'}</td>
                          <td className="px-3 py-2">{d.hostname || '—'}</td>
                          <td className="px-3 py-2 capitalize">{d.device_type || '?'}</td>
                          <td className="px-3 py-2">{d.os_guess || '—'}</td>
                          <td className="px-3 py-2 font-mono">{d.open_ports.join(',') || '—'}</td>
                          <td className="px-3 py-2 text-slate-400 max-w-64 truncate">{d.sys_desc || '—'}</td>
                        </tr>
                      ))}
                      {scanDevices.filter(d => d.scan_id === s.id).length === 0 && <tr><td colSpan={7} className="px-3 py-3 text-slate-500">No rows yet (scan may still be running).</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SNMP CREDENTIALS */}
      {tab === 'credentials' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowCred(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold"><Plus size={16} /> Add SNMP Credential</button>
          </div>
          {creds.length === 0 && !loading && <p className="text-sm text-slate-500 bg-slate-800/40 rounded-xl p-6 text-center">No SNMP credentials stored. Add v1/v2c community strings or v3 auth/priv users, then attach them to discovery scans to fingerprint devices.</p>}
          <div className="grid md:grid-cols-2 gap-3">
            {creds.map(cr => (
              <div key={cr.id} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-100 font-semibold text-sm flex items-center gap-2"><KeyRound size={14} className="text-cyan-400" /> {cr.name} <Badge className="bg-slate-700 text-slate-300">{cr.version}</Badge></p>
                  <p className="text-xs text-slate-400 mt-1">port {cr.port}{cr.version === 'v3' ? ` · user ${cr.username} · auth ${cr.auth_protocol} · priv ${cr.priv_protocol}` : ` · community ••••${(cr.community || '').slice(-2)}`}</p>
                </div>
                <button onClick={() => discoveryApi.deleteCredential(cr.id!).then(() => load(true))} className="p-2 rounded bg-red-600/20 hover:bg-red-600/40 text-red-300"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCred && <CredModal onClose={() => setShowCred(false)} onSave={async c => { await discoveryApi.createCredential({ ...c, org_id: isPlatform ? undefined : undefined }); await load(true); }} />}
    </div>
  );
};

export default MonitoredDevicesPage;
