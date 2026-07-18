import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import { getUser, getToken, setAuth, clearAuth } from '../lib/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.access_token, data.refresh_token);
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (fields) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', fields);
      if (data.access_token) {
        setAuth(data.user, data.access_token, data.refresh_token);
        setUser(data.user);
      }
      return data;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout', {}); } catch {}
    clearAuth();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await api.get('/auth/me');
      const updated = { ...getUser(), ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch { clearAuth(); setUser(null); }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isCandidate: user?.role === 'candidate', isEmployer: user?.role === 'employer' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
