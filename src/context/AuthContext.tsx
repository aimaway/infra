import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Organization } from '../types';
import { demoUsers, demoOrganizations } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginAsDemo: (demoKey: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS: Record<string, { email: string; label: string; description: string }> = {
  'platform-admin': {
    email: 'ops@infracentra.io',
    label: 'Platform Admin',
    description: 'Infracentra staff — manage all clients, entitlements, billing, and audit logs',
  },
  'client-admin-enterprise': {
    email: 'sarah.chen@infracentracorp.io',
    label: 'Client Admin (Enterprise)',
    description: 'Infracentra Corp — full service access, manage users and view all services',
  },
  'client-admin-sme': {
    email: 'jordan@techstart.io',
    label: 'Client Admin (SME)',
    description: 'TechStart — limited services, see enforcement in action',
  },
  'client-admin-midmarket': {
    email: 'dr.wong@medsecure.health',
    label: 'Client Admin (Mid-Market)',
    description: 'MedSecure Health — mid-tier services, some disabled',
  },
  'client-user': {
    email: 'marcus.j@infracentracorp.io',
    label: 'Client User (Analyst)',
    description: 'SOC analyst at Infracentra Corp — operational view only',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resolveUser = useCallback((email: string) => {
    const found = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;
    const org = found.orgId ? demoOrganizations.find(o => o.id === found.orgId) ?? null : null;
    return { user: found, org };
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<User | null> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    const result = resolveUser(email);
    if (result) {
      setUser(result.user);
      setIsLoading(false);
      return result.user;
    } else {
      setUser(demoUsers[0]);
      setIsLoading(false);
      return demoUsers[0];
    }
  }, [resolveUser]);

  const loginAsDemo = useCallback(async (demoKey: string): Promise<User | null> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    const account = DEMO_ACCOUNTS[demoKey];
    if (!account) {
      setIsLoading(false);
      return null;
    }
    const result = resolveUser(account.email);
    if (result) {
      setUser(result.user);
      setIsLoading(false);
      return result.user;
    }
    setIsLoading(false);
    return null;
  }, [resolveUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const organization = user?.orgId
    ? demoOrganizations.find(o => o.id === user.orgId) ?? null
    : null;

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginAsDemo,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function useEntitlement(serviceId: string): { entitled: boolean; orgName: string | null } {
  const { user, organization } = useAuth();
  if (!user || !organization) return { entitled: false, orgName: null };
  if (user.role === 'platform_admin') return { entitled: true, orgName: null };
  const ent = organization.entitlements.find(e => e.serviceId === serviceId);
  return { entitled: !!ent?.enabled, orgName: organization.name };
}
