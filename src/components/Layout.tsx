import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Clock from './Clock';
import Breadcrumb from './Breadcrumb';
import {
  Shield, LayoutDashboard, AlertTriangle, Target, FileCheck,
  Activity, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search, Menu, Zap, Users, Building2, Network,
  HardDrive, UserCog, BarChart3, ClipboardList, ShieldCheck,
  Sun, Moon, Key, Ticket, Mail, Cloud, Wifi, Lock, Globe,
  Scan, Wrench, Database, Monitor, TrendingUp,
  BellRing, Radio, Inbox
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: any;
  label: string;
}

export default function Layout() {
  const { user, organization, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Build navigation based on role
  let operationsNav: NavItem[] = [];
  let adminNav: NavItem[] = [];
  let servicesNav: NavItem[] = [];

  if (user?.role === 'platform_admin') {
    operationsNav = [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Platform Dashboard' },
      { to: '/admin/clients', icon: Building2, label: 'Client Management' },
      { to: '/admin/integrations', icon: Key, label: 'Integrations' },
      { to: '/admin/audit', icon: ClipboardList, label: 'Audit Log' },
      { to: '/admin/services-ops', icon: BellRing, label: 'Ticketing & Alerts Ops' },
      { to: '/client-admin/advanced-tickets', icon: Ticket, label: 'Advanced Ticketing' },
      { to: '/client-admin/notifications', icon: Radio, label: 'Notification Engine' },
    ];
    adminNav = [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  } else if (user?.role === 'client_admin') {
    operationsNav = [
      { to: '/client-admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { to: '/client-admin/value-dashboard', icon: TrendingUp, label: 'Value & Loyalty' },
      { to: '/client-admin/infrastructure', icon: Network, label: 'Infrastructure Map' },
      { to: '/client-admin/architecture', icon: Network, label: 'Architecture & Integration' },
      { to: '/client-admin/security-history', icon: Shield, label: 'Security History' },
      { to: '/client-admin/alerts', icon: AlertTriangle, label: 'Alerts' },
      { to: '/client-admin/statistics', icon: BarChart3, label: 'Statistics' },
      { to: '/client-admin/tickets', icon: Ticket, label: 'Tickets' },
      { to: '/client-admin/advanced-tickets', icon: Inbox, label: 'Advanced Ticketing' },
      { to: '/client-admin/notifications', icon: Radio, label: 'Notification Engine' },
      { to: '/client-admin/playbooks', icon: Zap, label: 'Custom Playbooks' },
      { to: '/client-admin/compliance-reports', icon: FileCheck, label: 'Compliance Reports' },
      { to: '/client-admin/widgets', icon: Activity, label: 'Dashboard Builder' },
    ];
    adminNav = [
      { to: '/client-admin/plans', icon: ShieldCheck, label: 'Plans & Billing' },
      { to: '/client-admin/monitored-devices', icon: Monitor, label: 'Monitored Devices' },
      { to: '/client-admin/technicians', icon: UserCog, label: 'Technicians' },
      { to: '/client-admin/entitlements', icon: Key, label: 'My Services' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
    servicesNav = [
      // Security Services
      { to: '/threats', icon: Target, label: 'Threat Intelligence' },
      { to: '/compliance', icon: FileCheck, label: 'Compliance' },
      { to: '/incidents', icon: AlertTriangle, label: 'Incident Response' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/client-admin/soar', icon: Zap, label: 'SOAR Automation' },
      { to: '/client-admin/endpoint-protection', icon: Shield, label: 'Endpoint Protection' },
      { to: '/client-admin/email-security', icon: Mail, label: 'Email Security' },
      { to: '/client-admin/cloud-security', icon: Cloud, label: 'Cloud Security' },
      // Network Services
      { to: '/network', icon: Network, label: 'Network Monitoring' },
      { to: '/client-admin/dns-filtering', icon: Globe, label: 'DNS Filtering' },
      { to: '/client-admin/firewall-mgmt', icon: Lock, label: 'Firewall Management' },
      { to: '/client-admin/vpn-gateway', icon: Wifi, label: 'VPN Gateway' },
      { to: '/client-admin/sd-wan', icon: Network, label: 'SD-WAN' },
      // PSA Services
      { to: '/client-admin/vulnerability-scanning', icon: Scan, label: 'Vulnerability Scanning' },
      { to: '/client-admin/patch-management', icon: Wrench, label: 'Patch Management' },
      { to: '/client-admin/backup-dr', icon: Database, label: 'Backup & DR' },
    ];
  } else {
    // client_user
    operationsNav = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/threats', icon: Target, label: 'Threat Intel' },
      { to: '/compliance', icon: FileCheck, label: 'Compliance' },
      { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
      { to: '/analytics', icon: Activity, label: 'Analytics' },
      { to: '/network', icon: Network, label: 'Network' },
      { to: '/psa', icon: HardDrive, label: 'PSA' },
      { to: '/portal', icon: Inbox, label: 'Client Portal' },
      { to: '/portal', icon: Radio, label: 'Notifications' },
    ];
    adminNav = [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  }

  const renderNavItems = (items: NavItem[], color: string = 'cyan') => (
    items.map(item => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${isActive
            ? `bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`
        }
        style={({ isActive }) => isActive ? {
          backgroundColor: color === 'purple' ? 'rgba(139,92,246,0.1)' : 'rgba(0,212,255,0.1)',
          color: color === 'purple' ? '#c4b5fd' : '#22d3ee',
          borderColor: color === 'purple' ? 'rgba(139,92,246,0.2)' : 'rgba(0,212,255,0.2)',
        } : {}}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
      </NavLink>
    ))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-64'} hidden lg:flex flex-col transition-all duration-300
        bg-slate-900/90 backdrop-blur-xl border-r border-cyan-500/10`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-cyan-500/10">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Infracentra</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                {user?.role === 'platform_admin' ? 'PLATFORM ADMIN' : 'CLIENT PORTAL'}
              </p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!collapsed && <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            {user?.role === 'platform_admin' ? 'Platform Operations' : user?.role === 'client_admin' ? 'Administration' : 'Operations'}
          </p>}
          {renderNavItems(operationsNav, user?.role === 'platform_admin' ? 'purple' : 'cyan')}

          {adminNav.length > 1 && (
            <>
              {!collapsed && <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {user?.role === 'platform_admin' ? 'System' : user?.role === 'client_admin' ? 'Administration' : 'Account'}
              </p>}
              {collapsed && <div className="my-3 border-t border-slate-800" />}
              {renderNavItems(adminNav, 'cyan')}
            </>
          )}

          {servicesNav.length > 0 && (
            <>
              {!collapsed && <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                Services
              </p>}
              {collapsed && <div className="my-3 border-t border-slate-800" />}
              {renderNavItems(servicesNav, 'green')}
            </>
          )}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-3 p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-4 py-3 border-t border-cyan-500/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{organization?.name || 'Platform Admin'}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded text-slate-500 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-cyan-500/10 overflow-y-auto">
            <div className="flex items-center gap-3 px-5 py-5 border-b border-cyan-500/10">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Infracentra</h1>
                <p className="text-[10px] text-slate-500 font-mono">2027</p>
              </div>
            </div>
            <nav className="px-3 py-4 space-y-1">
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Operations</p>
              {renderNavItems(operationsNav, user?.role === 'platform_admin' ? 'purple' : 'cyan')}
              {adminNav.length > 1 && (
                <>
                  <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    {user?.role === 'client_admin' ? 'Administration' : 'Account'}
                  </p>
                  {renderNavItems(adminNav, 'cyan')}
                </>
              )}
              {servicesNav.length > 0 && (
                <>
                  <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    Services
                  </p>
                  {renderNavItems(servicesNav, 'green')}
                </>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-cyan-500/10 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search threats, assets, controls..."
                className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-green/10 border border-cyber-green/20">
              <Zap className="w-3.5 h-3.5 text-cyber-green" />
              <span className="text-xs font-medium text-cyber-green">Systems Operational</span>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            {/* Clock */}
            <Clock />
            
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyber-red rounded-full animate-pulse" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold lg:hidden">
              {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}>
          <div className="p-6">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
