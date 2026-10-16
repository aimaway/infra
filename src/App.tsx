import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ComingSoonPage from './pages/ComingSoonPage';

// Client user views
import DashboardPage from './pages/DashboardPage';
import ThreatsPage from './pages/ThreatsPage';
import CompliancePage from './pages/CompliancePage';
import IncidentsPage from './pages/IncidentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NetworkPage from './pages/NetworkPage';
import PSAPage from './pages/PSAPage';

// Platform admin views
import PlatformDashboardPage from './pages/platform/PlatformDashboardPage';
import PlatformClientsPage from './pages/platform/PlatformClientsPage';
import PlatformAuditPage from './pages/platform/PlatformAuditPage';
import PlatformIntegrationsPage from './pages/platform/PlatformIntegrationsPage';
import PlatformServicesOverviewPage from './pages/platform/PlatformServicesOverviewPage';
import AdvancedTicketingPage from './pages/client-admin/AdvancedTicketingPage';
import NotificationEnginePage from './pages/client-admin/NotificationEnginePage';
import ClientPortalPage from './pages/ClientPortalPage';

// Client admin views
import ClientAdminDashboardPage from './pages/client-admin/ClientAdminDashboardPage';
import ClientEntitlementsPage from './pages/client-admin/ClientEntitlementsPage';
import ClientAdminDashboard from './pages/client-admin/ClientAdminDashboard';
import ClientAdminPlans from './pages/client-admin/ClientAdminPlans';
import ServiceDeviceManager from './pages/client-admin/ServiceDeviceManager';
import AlertsPage from './pages/client-admin/AlertsPage';
import StatisticsPage from './pages/client-admin/StatisticsPage';
import NetworkStatistics from './pages/client-admin/NetworkStatistics';
import DeviceStatistics from './pages/client-admin/DeviceStatistics';
import PerformanceStatistics from './pages/client-admin/PerformanceStatistics';
import DeviceDetails from './pages/client-admin/DeviceDetails';
import EmailSecurityPage from './pages/client-admin/EmailSecurityPage';
import EndpointProtectionPage from './pages/client-admin/EndpointProtectionPage';
import CloudSecurityPage from './pages/client-admin/CloudSecurityPage';
import SDWANPage from './pages/client-admin/SDWANPage';
import MonitoredDevicesPage from './pages/client-admin/MonitoredDevicesPage';
import TechniciansManagementPage from './pages/client-admin/TechniciansManagementPage';
import VulnerabilityScanningPage from './pages/client-admin/VulnerabilityScanningPage';
import PatchManagementPage from './pages/client-admin/PatchManagementPage';
import BackupDRPage from './pages/client-admin/BackupDRPage';
import SOARPage from './pages/client-admin/SOARPage';
import DNSFilteringPage from './pages/client-admin/DNSFilteringPage';
import FirewallManagementPage from './pages/client-admin/FirewallManagementPage';
import VPNGatewayPage from './pages/client-admin/VPNGatewayPage';
import ArchitectureDiagram from './pages/client-admin/ArchitectureDiagram';
import CustomerValueDashboard from './pages/client-admin/CustomerValueDashboard';
import SecurityHistoryTimeline from './pages/client-admin/SecurityHistoryTimeline';
import CustomPlaybooksLibrary from './pages/client-admin/CustomPlaybooksLibrary';
import ComplianceReports from './pages/client-admin/ComplianceReports';

import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Always accessible */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
      <Route path="/coming-soon/:serviceId" element={<ComingSoonPage />} />

      {/* Protected Routes - Require authentication */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Client user views */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="threats" element={<ThreatsPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="psa" element={<PSAPage />} />

        {/* Platform admin views */}
        <Route path="admin/dashboard" element={<PlatformDashboardPage />} />
        <Route path="admin/clients" element={<PlatformClientsPage />} />
        <Route path="admin/audit" element={<PlatformAuditPage />} />
        <Route path="admin/integrations" element={<PlatformIntegrationsPage />} />
        <Route path="admin/services-ops" element={<PlatformServicesOverviewPage />} />

        {/* Cross-role service consoles (Advanced Ticketing + Notification Engine) */}
        <Route path="client-admin/advanced-tickets" element={<AdvancedTicketingPage />} />
        <Route path="client-admin/notifications" element={<NotificationEnginePage />} />
        <Route path="portal" element={<ClientPortalPage />} />

        {/* Client admin views */}
        <Route path="client-admin/dashboard" element={<ClientAdminDashboardPage />} />
        <Route path="client-admin/monitored-devices" element={<MonitoredDevicesPage />} />
        <Route path="client-admin/technicians" element={<TechniciansManagementPage />} />
        <Route path="client-admin/entitlements" element={<ClientEntitlementsPage />} />
        <Route path="client-admin/infrastructure" element={<ClientAdminDashboard />} />
        <Route path="client-admin/plans" element={<ClientAdminPlans />} />
        <Route path="client-admin/service/:serviceId/devices" element={<ServiceDeviceManager />} />
        <Route path="client-admin/alerts" element={<AlertsPage />} />
        <Route path="client-admin/alerts/:alertId" element={<AlertsPage />} />
        <Route path="client-admin/statistics" element={<StatisticsPage />} />
        <Route path="client-admin/statistics/network" element={<NetworkStatistics />} />
        <Route path="client-admin/statistics/devices" element={<DeviceStatistics />} />
        <Route path="client-admin/statistics/performance" element={<PerformanceStatistics />} />
        <Route path="client-admin/infrastructure/device/:deviceId" element={<DeviceDetails />} />
        <Route path="client-admin/tickets" element={<Navigate to="/client-admin/advanced-tickets" replace />} />
        
        {/* Service-specific pages */}
        <Route path="client-admin/email-security" element={<EmailSecurityPage />} />
        <Route path="client-admin/email-security/:alertId" element={<EmailSecurityPage />} />
        <Route path="client-admin/endpoint-protection" element={<EndpointProtectionPage />} />
        <Route path="client-admin/endpoint-protection/:alertId" element={<EndpointProtectionPage />} />
        <Route path="client-admin/cloud-security" element={<CloudSecurityPage />} />
        <Route path="client-admin/cloud-security/:alertId" element={<CloudSecurityPage />} />
        <Route path="client-admin/sd-wan" element={<SDWANPage />} />
        <Route path="client-admin/sd-wan/:alertId" element={<SDWANPage />} />
        <Route path="client-admin/vulnerability-scanning" element={<VulnerabilityScanningPage />} />
        <Route path="client-admin/vulnerability-scanning/:vulnId" element={<VulnerabilityScanningPage />} />
        <Route path="client-admin/patch-management" element={<PatchManagementPage />} />
        <Route path="client-admin/backup-dr" element={<BackupDRPage />} />
        <Route path="client-admin/soar" element={<SOARPage />} />
        <Route path="client-admin/dns-filtering" element={<DNSFilteringPage />} />
        <Route path="client-admin/firewall-mgmt" element={<FirewallManagementPage />} />
        <Route path="client-admin/vpn-gateway" element={<VPNGatewayPage />} />
        <Route path="client-admin/architecture" element={<ArchitectureDiagram />} />
        
        {/* Customer Retention Features */}
        <Route path="client-admin/value-dashboard" element={<CustomerValueDashboard />} />
        <Route path="client-admin/security-history" element={<SecurityHistoryTimeline />} />
        <Route path="client-admin/playbooks" element={<CustomPlaybooksLibrary />} />
        <Route path="client-admin/compliance-reports" element={<ComplianceReports />} />

        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all - redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
