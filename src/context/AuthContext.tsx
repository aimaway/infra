import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Organization } from '../types';
import { demoUsers, demoOrganizations } from '../data/mockData';
import { backendLogin, clearToken, getToken, ApiError } from '../services/api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  backendMode: boolean; // true when the session is backed by the real API
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

// Map a backend user (real API) onto the frontend User shape used everywhere.
function toFrontUser(bu: { id: number; email: string; name: string; role: string; org_id: number | null }): User {
  return {
    id: `be-${bu.id}`,
    email: bu.email,
    name: bu.name || bu.email.split('@')[0],
    role: (bu.role as User['role']) ?? 'client_user',
    orgId: bu.org_id != null ? `org-be-${bu.org_id}` : null,
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    mfaEnabled: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [backendMode, setBackendMode] = useState<boolean>(() => !!getToken());

  // Restore a live backend session on page reload (JWT stored in localStorage).
  useEffect(() => {
    if (!getToken()) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const me = await api.get<any>('/auth/me');
        setUser(toFrontUser(me));
        setBackendMode(true);
      } catch {
        clearToken();
        setBackendMode(false);
        setUser(null);
      }
    })();
  }, []);

  const resolveUser = useCallback((email: string) => {
    const found = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;
    const org = found.orgId ? demoOrganizations.find(o => o.id === found.orgId) ?? null : null;
    return { user: found, org };
  }, []);

  // Real login first; only fall back to the in-memory demo directory when the
  // backend is unreachable AND demo mode is explicitly enabled by the operator.
  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const bu = await backendLogin(email, password);
      setUser(toFrontUser(bu));
      setBackendMode(true);
      setIsLoading(false);
      return toFrontUser(bu);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) {
        setAuthError('Incorrect email or password');
        setIsLoading(false);
        return null;
      }
      // Backend down -> demo fallback (only when demo mode toggle is ON)
      const demoOn = localStorage.getItem('ic_demo_mode') === '1';
      if (!demoOn) {
        setAuthError(e?.message ?? 'Backend unreachable — real login required');
        setIsLoading(false);
        return null;
      }
      const result = resolveUser(email);
      setUser(result ? result.user : demoUsers[0]);
      setBackendMode(false);
      setIsLoading(false);
      return result ? result.user : demoUsers[0];
    }
  }, [resolveUser]);

  const loginAsDemo = useCallback(async (demoKey: string): Promise<User | null> => {
    setIsLoading(true);
    setAuthError(null);
    const account = DEMO_ACCOUNTS[demoKey];
    if (!account) {
      setIsLoading(false);
      return null;
    }
    // Try the real backend with the conventional demo password first.
    try {
      const bu = await backendLogin(account.email, 'Admin#2026');
      setUser(toFrontUser(bu));
      setBackendMode(true);
      setIsLoading(false);
      return toFrontUser(bu);
    } catch {
      /* fall through to local demo */
    }
    const demoOn = localStorage.getItem('ic_demo_mode') === '1';
    if (!demoOn) {
      setAuthError(`Account "${account.email}" does not exist on the backend. Create it in Settings → Seed demo tenant, or turn Demo Mode ON.`);
      setIsLoading(false);
      return null;
    }
    const result = resolveUser(account.email);
    setUser(result ? result.user : null);
    setBackendMode(false);
    setIsLoading(false);
    return result ? result.user : null;
  }, [resolveUser]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setBackendMode(false);
    setAuthError(null);
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
      authError,
      backendMode,
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
