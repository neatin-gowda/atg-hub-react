import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_BASE || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const u = sessionStorage.getItem('atg_user');
      const t = sessionStorage.getItem('atg_token');
      if (u && t) { setUser(JSON.parse(u)); setToken(t); }
    } catch (e) {}
    setLoading(false);
  }, []);

  const saveSession = (u, t) => {
    setUser(u); setToken(t);
    try { sessionStorage.setItem('atg_user', JSON.stringify(u)); sessionStorage.setItem('atg_token', t); } catch (e) {}
  };

  const clearSession = () => {
    setUser(null); setToken(null);
    try { sessionStorage.removeItem('atg_user'); sessionStorage.removeItem('atg_token'); } catch (e) {}
  };

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API}${endpoint}`, {
      ...options, headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (options.method && options.method !== 'GET') throw new Error(data.error || `Failed (${res.status})`);
      return null;
    }
    return res.json().catch(() => null);
  }, [token]);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    if (!data) throw new Error('Invalid email or password');
    saveSession(data.user, data.token);
    return data.user;
  };

  const register = async (name, email, role, password) => {
    const data = await apiFetch('/auth/register', { method: 'POST', body: { name, email, role, password } });
    if (!data) throw new Error('Could not create account');
    saveSession(data.user, data.token);
    return data.user;
  };

  const logout = () => { clearSession(); };

  const updateProfile = async (fields) => {
    const data = await apiFetch('/me', { method: 'PATCH', body: fields });
    if (data?.user) {
      const updated = { ...user, ...data.user };
      setUser(updated);
      try { sessionStorage.setItem('atg_user', JSON.stringify(updated)); } catch (e) {}
      return updated;
    }
    throw new Error('Could not update profile');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
