import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../services/adminApi';

// Mirrors the backend RBAC matrix (the server is the real enforcer; this only hides UI).
const PERMS = {
  viewProducts: ['owner', 'admin', 'manager', 'viewer'],
  stock: ['owner', 'admin', 'manager'],
  editProducts: ['owner', 'admin'],
  import: ['owner', 'admin', 'manager'],
  catalogue: ['owner', 'admin'],
  logs: ['owner', 'admin'],
  export: ['owner', 'admin'],
  users: ['owner'],
  settings: ['owner'],
};
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);
  useEffect(() => {
    if (tokenStore.get()) api.me().then((r) => setUser(r.user)).catch(() => tokenStore.clear()).finally(() => setLoading(false));
    window.addEventListener('tc:unauthorized', logout);
    return () => window.removeEventListener('tc:unauthorized', logout);
  }, [logout]);

  const login = async (email, password, remember) => {
    const r = await api.login(email, password);
    tokenStore.set(r.token, remember);
    setUser(r.user);
  };
  const can = (perm) => Boolean(user && PERMS[perm]?.includes(user.role));
  return <Ctx.Provider value={{ user, loading, login, logout, can }}>{children}</Ctx.Provider>;
}
