import React, { useState } from 'react';
import { Building2, Search, Eye, Edit, CheckCircle2, XCircle, Shield, Ban, Users, DollarSign, Key, FileText, Server, Activity, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { demoOrganizations, serviceCatalog } from '../../data/mockData';
import { Organization, ServiceId, ServiceEntitlement } from '../../types';

const tierColors: Record<string, string> = {
  sme: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'mid-market': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

// Mock API keys per client
const mockApiKeys: Record<string, { key: string; createdAt: string; lastUsed: string; status: 'active' | 'revoked' }[]> = {
  'org-aegis': [
    { key: 'ic_live_a1b2c3d4e5f6g7h8i9j0', createdAt: '2026-06-15', lastUsed: '2027-01-15T09:00:00Z', status: 'active' },
    { key: 'ic_test_x9y8z7w6v5u4t3s2r1q0', createdAt: '2026-06-15', lastUsed: '2027-01-14T18:00:00Z', status: 'active' },
  ],
  'org-techstart': [
    { key: 'ic_live_m1n2o3p4q5r6s7t8u9v0', createdAt: '2026-09-20', lastUsed: '2027-01-15T07:40:00Z', status: 'active' },
  ],
  'org-medsecure': [
    { key: 'ic_live_w1x2y3z4a5b6c7d8e9f0', createdAt: '2026-11-01', lastUsed: '2027-01-15T06:30:00Z', status: 'active' },
  ],
};

// Mock licenses
const mockLicenses: Record<string, { id: string; type: string; seats: number; expiresAt: string; status: 'active' | 'expiring' | 'expired' }> = {
  'org-aegis': { id: 'LIC-2026-001', type: 'Enterprise Annual', seats: 500, expiresAt: '2028-06-15', status: 'active' },
  'org-techstart': { id: 'LIC-2026-002', type: 'SME Annual', seats: 50, expiresAt: '2027-09-20', status: 'expiring' },
  'org-medsecure': { id: 'LIC-2026-003', type: 'Mid-Market Annual', seats: 200, expiresAt: '2027-11-01', status: 'active' },
};

// Mock devices per client
const mockDevices: Record<string, { id: string; hostname: string; type: string; os: string; ip: string; status: 'online' | 'offline' | 'degraded'; lastSeen: string; agent: string }[]> = {
  'org-aegis': [
    { id: 'dev-001', hostname: 'FIN-WS-042', type: 'endpoint', os: 'Windows 11', ip: '10.0.5.42', status: 'online', lastSeen: '2027-01-15T09:20:00Z', agent: 'EDR v4.2.1' },
    { id: 'dev-002', hostname: 'FIN-SRV-003', type: 'server', os: 'Windows Server 2022', ip: '10.0.1.3', status: 'online', lastSeen: '2027-01-15T09:20:00Z', agent: 'EDR v4.2.1' },
    { id: 'dev-003', hostname: 'DEV-SRV-007', type: 'server', os: 'Ubuntu 22.04', ip: '10.0.2.7', status: 'online', lastSeen: '2027-01-15T09:20:00Z', agent: 'EDR v4.2.1' },
    { id: 'dev-004', hostname: 'HR-DB-001', type: 'database', os: 'RHEL 9', ip: '10.0.3.1', status: 'online', lastSeen: '2027-01-15T09:20:00Z', agent: 'EDR v4.2.1' },
    { id: 'dev-005', hostname: 'MKT-WS-018', type: 'endpoint', os: 'macOS 14.2', ip: '10.0.5.18', status: 'degraded', lastSeen: '2027-01-15T08:45:00Z', agent: 'EDR v4.2.0' },
  ],
  'org-techstart': [
    { id: 'dev-101', hostname: 'TS-WS-001', type: 'endpoint', os: 'Windows 11', ip: '192.168.1.10', status: 'online', lastSeen: '2027-01-15T07:40:00Z', agent: 'EDR v4.2.1' },
    { id: 'dev-102', hostname: 'TS-SRV-001', type: 'server', os: 'Ubuntu 22.04', ip: '192.168.1.2', status: 'online', lastSeen: '2027-01-15T07:40:00Z', agent: 'EDR v4.2.1' },
  ],
  'org-medsecure': [
    { id: 'dev-201', hostname: 'MS-WS-001', type: 'endpoint', os: 'Windows 11', ip: '172.16.0.10', status: 'online', lastSeen: '2027-01-15T06:30:00Z', agent: 'EDR v4.2.1' },
    { id: 'dev-202', hostname: 'MS-SRV-001', type: 'server', os: 'Windows Server 2022', ip: '172.16.0.2', status: 'online', lastSeen: '2027-01-15T06:30:00Z', agent: 'EDR v4.2.1' },
    { id: 'dev-203', hostname: 'MS-DB-001', type: 'database', os: 'RHEL 9', ip: '172.16.0.3', status: 'online', lastSeen: '2027-01-15T06:30:00Z', agent: 'EDR v4.2.1' },
  ],
};

export default function PlatformClientsPage() {
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'devices' | 'members' | 'api-keys' | 'license' | 'activity'>('services');
  const [entitlements, setEntitlements] = useState<Record<string, ServiceEntitlement[]>>(
    Object.fromEntries(demoOrganizations.map(o => [o.id, [...o.entitlements]]))
  );

  const filtered = demoOrganizations.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const toggleEntitlement = (orgId: string, serviceId: ServiceId) => {
    setEntitlements(prev => ({
      ...prev,
      [orgId]: prev[orgId].map(e =>
        e.serviceId === serviceId
          ? {
              ...e,
              enabled: !e.enabled,
              activatedAt: !e.enabled ? new Date().toISOString().split('T')[0] : e.activatedAt,
              deactivatedAt: !e.enabled ? null : new Date().toISOString().split('T')[0],
            }
          : e
      ),
    }));
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-purple-400" />
            Client Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage organizations, entitlements, licenses, and API keys</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Tier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Services</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Devices</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Revenue</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(org => {
              const orgEnts = entitlements[org.id];
              const activeCount = orgEnts.filter(e => e.enabled).length;
              const deviceCount = mockDevices[org.id]?.length || 0;
              return (
                <tr key={org.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => { setSelectedOrg(org); setActiveTab('services'); }}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-200">{org.name}</p>
                    <p className="text-xs text-slate-500">{org.contactEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${tierColors[org.tier]}`}>
                      {org.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${
                      org.status === 'active' ? 'text-green-400' :
                      org.status === 'suspended' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        org.status === 'active' ? 'bg-green-500' :
                        org.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      {org.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">{activeCount}/{serviceCatalog.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">{deviceCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-cyber-green font-medium">${org.monthlyRevenue.toLocaleString()}/mo</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedOrg(org); setActiveTab('services'); }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors border border-cyan-500/20"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Client Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrg(null)} />
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-cyan-500/20 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{selectedOrg.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${tierColors[selectedOrg.tier]}`}>
                      {selectedOrg.tier}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedOrg.contactEmail} • {selectedOrg.industry} • {selectedOrg.country}
                  </p>
                </div>
                <button onClick={() => setSelectedOrg(null)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700">✕</button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto">
                {[
                  { id: 'services', label: 'Services', icon: Shield },
                  { id: 'devices', label: 'Devices', icon: Server },
                  { id: 'members', label: 'Members', icon: Users },
                  { id: 'api-keys', label: 'API Keys', icon: Key },
                  { id: 'license', label: 'License', icon: FileText },
                  { id: 'activity', label: 'Activity', icon: Activity },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'services' && (
                <div className="space-y-3">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-4">
                    <p className="text-xs text-red-400 font-medium">
                      ⚠️ Enforcement Active: Disabling a service immediately blocks access for all users. All attempts are logged.
                    </p>
                  </div>
                  {serviceCatalog.map(service => {
                    const ent = entitlements[selectedOrg.id].find(e => e.serviceId === service.id);
                    const isAvailable = service.availableTiers.includes(selectedOrg.tier);
                    const isEnabled = ent?.enabled ?? false;
                    return (
                      <div key={service.id} className={`p-4 rounded-lg border transition-all ${
                        isEnabled ? 'bg-cyan-500/5 border-cyan-500/20' :
                        !isAvailable ? 'bg-slate-800/20 border-slate-700/20 opacity-50' :
                        'bg-slate-800/20 border-slate-700/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{service.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-medium text-slate-200">{service.name}</h5>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase ${
                                  service.category === 'security' ? 'bg-cyan-500/10 text-cyan-400' :
                                  service.category === 'networking' ? 'bg-purple-500/10 text-purple-400' :
                                  'bg-green-500/10 text-green-400'
                                }`}>{service.category}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">${service.basePrice}/mo</span>
                            {isAvailable ? (
                              <button
                                onClick={() => toggleEntitlement(selectedOrg.id, service.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  isEnabled
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20'
                                }`}
                              >
                                {isEnabled ? 'Disable' : 'Enable'}
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-500">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">Monitored Devices ({mockDevices[selectedOrg.id]?.length || 0})</h3>
                    <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
                      Deploy Agent
                    </button>
                  </div>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Hostname</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Type</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">OS</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">IP</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Status</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Agent</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Last Seen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockDevices[selectedOrg.id]?.map(device => (
                          <tr key={device.id} className="border-b border-slate-700/30 hover:bg-slate-800/50">
                            <td className="px-4 py-3 text-sm text-slate-200 font-mono">{device.hostname}</td>
                            <td className="px-4 py-3 text-xs text-slate-400 capitalize">{device.type}</td>
                            <td className="px-4 py-3 text-xs text-slate-400">{device.os}</td>
                            <td className="px-4 py-3 text-xs text-slate-400 font-mono">{device.ip}</td>
                            <td className="px-4 py-3">
                              <span className={`flex items-center gap-1.5 text-xs font-medium ${
                                device.status === 'online' ? 'text-cyber-green' :
                                device.status === 'degraded' ? 'text-cyber-yellow' : 'text-cyber-red'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  device.status === 'online' ? 'bg-cyber-green' :
                                  device.status === 'degraded' ? 'bg-cyber-yellow' : 'bg-cyber-red'
                                }`} />
                                {device.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">{device.agent}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{new Date(device.lastSeen).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">Organization Members</h3>
                    <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
                      Invite Member
                    </button>
                  </div>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Name</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Email</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Role</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">MFA</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Mock members based on org */}
                        {selectedOrg.id === 'org-infracentra' && (
                          <>
                            <tr className="border-b border-slate-700/30">
                              <td className="px-4 py-3 text-sm text-slate-200">Sarah Chen</td>
                              <td className="px-4 py-3 text-xs text-slate-400">sarah.chen@infracentracorp.io</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400">Admin</span></td>
                              <td className="px-4 py-3 text-xs text-cyber-green">Enabled</td>
                              <td className="px-4 py-3 text-xs text-slate-500">2027-01-15 09:15</td>
                            </tr>
                            <tr className="border-b border-slate-700/30">
                              <td className="px-4 py-3 text-sm text-slate-200">Marcus Johnson</td>
                              <td className="px-4 py-3 text-xs text-slate-400">marcus.j@infracentracorp.io</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">Analyst</span></td>
                              <td className="px-4 py-3 text-xs text-cyber-green">Enabled</td>
                              <td className="px-4 py-3 text-xs text-slate-500">2027-01-15 08:50</td>
                            </tr>
                            <tr className="border-b border-slate-700/30">
                              <td className="px-4 py-3 text-sm text-slate-200">Alex Rivera</td>
                              <td className="px-4 py-3 text-xs text-slate-400">alex.r@infracentracorp.io</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">Analyst</span></td>
                              <td className="px-4 py-3 text-xs text-cyber-green">Enabled</td>
                              <td className="px-4 py-3 text-xs text-slate-500">2027-01-14 22:00</td>
                            </tr>
                          </>
                        )}
                        {selectedOrg.id === 'org-techstart' && (
                          <>
                            <tr className="border-b border-slate-700/30">
                              <td className="px-4 py-3 text-sm text-slate-200">Jordan Kim</td>
                              <td className="px-4 py-3 text-xs text-slate-400">jordan@techstart.io</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400">Admin</span></td>
                              <td className="px-4 py-3 text-xs text-cyber-green">Enabled</td>
                              <td className="px-4 py-3 text-xs text-slate-500">2027-01-15 07:40</td>
                            </tr>
                            <tr className="border-b border-slate-700/30">
                              <td className="px-4 py-3 text-sm text-slate-200">Sam Ortiz</td>
                              <td className="px-4 py-3 text-xs text-slate-400">sam@techstart.io</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">User</span></td>
                              <td className="px-4 py-3 text-xs text-cyber-red">Disabled</td>
                              <td className="px-4 py-3 text-xs text-slate-500">2027-01-14 19:10</td>
                            </tr>
                          </>
                        )}
                        {selectedOrg.id === 'org-medsecure' && (
                          <>
                            <tr className="border-b border-slate-700/30">
                              <td className="px-4 py-3 text-sm text-slate-200">Dr. Lisa Wong</td>
                              <td className="px-4 py-3 text-xs text-slate-400">dr.wong@medsecure.health</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400">Admin</span></td>
                              <td className="px-4 py-3 text-xs text-cyber-green">Enabled</td>
                              <td className="px-4 py-3 text-xs text-slate-500">2027-01-15 06:30</td>
                            </tr>
                            <tr className="border-b border-slate-700/30">
                              <td className="px-4 py-3 text-sm text-slate-200">Parker Nguyen</td>
                              <td className="px-4 py-3 text-xs text-slate-400">parker@medsecure.health</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">User</span></td>
                              <td className="px-4 py-3 text-xs text-cyber-green">Enabled</td>
                              <td className="px-4 py-3 text-xs text-slate-500">2027-01-15 08:00</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'api-keys' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">API Keys</h3>
                    <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20 flex items-center gap-2">
                      <Key className="w-3.5 h-3.5" />
                      Generate New Key
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mockApiKeys[selectedOrg.id]?.map((apiKey, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-slate-200 font-mono">{apiKey.key}</code>
                            <button className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                            apiKey.status === 'active' ? 'bg-cyber-green/10 text-cyber-green' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {apiKey.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Created: {apiKey.createdAt}</span>
                          <span>Last used: {new Date(apiKey.lastUsed).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button className="px-2 py-1 rounded text-xs text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Rotate
                          </button>
                          <button className="px-2 py-1 rounded text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'license' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">License Information</h3>
                  {mockLicenses[selectedOrg.id] && (
                    <div className="p-6 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">License ID</p>
                          <p className="text-sm text-slate-200 font-mono mt-1">{mockLicenses[selectedOrg.id].id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Type</p>
                          <p className="text-sm text-slate-200 mt-1">{mockLicenses[selectedOrg.id].type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Seats</p>
                          <p className="text-sm text-slate-200 mt-1">{mockLicenses[selectedOrg.id].seats}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Expires</p>
                          <p className="text-sm text-slate-200 mt-1">{mockLicenses[selectedOrg.id].expiresAt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            mockLicenses[selectedOrg.id].status === 'active' ? 'bg-cyber-green/10 text-cyber-green' :
                            mockLicenses[selectedOrg.id].status === 'expiring' ? 'bg-cyber-yellow/10 text-cyber-yellow' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              mockLicenses[selectedOrg.id].status === 'active' ? 'bg-cyber-green' :
                              mockLicenses[selectedOrg.id].status === 'expiring' ? 'bg-cyber-yellow' : 'bg-red-500'
                            }`} />
                            {mockLicenses[selectedOrg.id].status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-700/30">
                        <button className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-medium border border-cyan-500/20 hover:bg-cyan-500/20">
                          Renew License
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Recent Activity</h3>
                  <div className="space-y-2">
                    {[
                      { time: '2 min ago', action: 'Risk score recalculated', type: 'system' },
                      { time: '15 min ago', action: 'New threat alert detected', type: 'alert' },
                      { time: '1 hour ago', action: 'Compliance scan completed', type: 'compliance' },
                      { time: '3 hours ago', action: 'User login successful', type: 'auth' },
                      { time: '6 hours ago', action: 'Threat intel feed updated', type: 'system' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/20">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          log.type === 'alert' ? 'bg-red-500' :
                          log.type === 'compliance' ? 'bg-purple-500' :
                          log.type === 'auth' ? 'bg-yellow-500' : 'bg-slate-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-300">{log.action}</p>
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
