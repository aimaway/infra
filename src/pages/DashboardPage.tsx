import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Target, TrendingDown, TrendingUp, Clock, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { mockRiskScore, mockAlerts, mockNISTMapping, mockAlertTimeline, mockThreatTrend } from '../data/mockData';

function RiskGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= score) { clearInterval(interval); setAnimatedScore(score); }
        else setAnimatedScore(current);
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s <= 30) return { text: 'text-cyber-green', stroke: '#00ff88', label: 'Low Risk' };
    if (s <= 60) return { text: 'text-cyber-yellow', stroke: '#ffd700', label: 'Moderate Risk' };
    return { text: 'text-cyber-red', stroke: '#ff3366', label: 'High Risk' };
  };
  const color = getColor(animatedScore);
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (animatedScore / 100) * circumference * 0.75;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="160" viewBox="0 0 200 160">
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(100,116,139,0.1)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} transform="rotate(135, 100, 100)" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={color.stroke} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeDashoffset={dashOffset}
          transform="rotate(135, 100, 100)" className="transition-all duration-500"
          style={{ filter: `drop-shadow(0 0 8px ${color.stroke}40)` }} />
      </svg>
      <div className="absolute top-12 text-center">
        <div className={`text-4xl font-bold ${color.text}`}>{animatedScore}</div>
        <div className="text-xs text-slate-500 mt-1">/ 100</div>
      </div>
      <div className={`text-sm font-medium mt-2 ${color.text}`}>{color.label}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Operations Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time threat monitoring & predictive analytics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-xs text-slate-500">Open Alerts</span></div>
          <p className="text-2xl font-bold text-white">{mockAlerts.filter(a => a.status === 'open').length}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-orange-400" /><span className="text-xs text-slate-500">Active Threats</span></div>
          <p className="text-2xl font-bold text-white">7</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-green-400" /><span className="text-xs text-slate-500">Compliance</span></div>
          <p className="text-2xl font-bold text-white">{mockRiskScore.compliance}%</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-cyan-400" /><span className="text-xs text-slate-500">Auto-Remediated</span></div>
          <p className="text-2xl font-bold text-white">23</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Predictive Risk Score</h3>
          <RiskGauge score={mockRiskScore.overall} />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Recent Security Alerts</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {mockAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-cyber-red animate-pulse' :
                  alert.severity === 'high' ? 'bg-cyber-orange' : 'bg-cyber-yellow'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{alert.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{alert.source}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">24h Alert Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockAlertTimeline}>
              <defs><linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="alerts" stroke="#00d4ff" fill="url(#alertGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Threat Detection vs Blocked</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockThreatTrend}>
              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="threats" fill="#ff3366" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="blocked" fill="#00ff88" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
