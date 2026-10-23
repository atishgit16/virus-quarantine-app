import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ROLES, ROLE_HOME, ROLE_LABELS, can } from '../utils/permissions';

const AuthContext = createContext(null);

// Demo credentials — replace with real API calls in production
export const DEMO_CREDENTIALS = {
  [ROLES.NURSE]: { password: 'nurse123', displayName: 'Nurse Joy' },
  [ROLES.DOCTOR]: { password: 'doctor123', displayName: 'Dr. House' },
  [ROLES.ADMIN]: { password: 'admin123', displayName: 'Admin Smith' },
  [ROLES.HEAD_DOCTOR]: { password: 'head123', displayName: 'Dr. Watson' },
  [ROLES.SYS_ADMIN]: { password: 'sys123', displayName: 'System Admin' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('vq.user', null);

  // Used by the role switcher inside the app (demo convenience)
  const login = (role) => {
    const cred = DEMO_CREDENTIALS[role];
    setUser({
      role,
      name: cred?.displayName ?? ROLE_LABELS[role] ?? role,
      loginAt: new Date().toISOString(),
    });
  };

  // Used by the LoginPage — validates credentials
  const authenticate = (role, password) => {
    const cred = DEMO_CREDENTIALS[role];
    if (!cred) return { ok: false, error: 'Please select a role.' };
    if (!password || password !== cred.password) {
      return { ok: false, error: 'Incorrect password for this role.' };
    }
    setUser({
      role,
      name: cred.displayName,
      loginAt: new Date().toISOString(),
    });
    return { ok: true };
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      login,
      authenticate,
      logout,
      role: user?.role ?? null,
      homePath: user ? ROLE_HOME[user.role] : '/login',
      hasPermission: (action) => (user ? can(user.role, action) : false),
      roles: ROLES,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}