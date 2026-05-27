/**
 * DFD Level 1 — Actor session state (post-login JWT) shared across mobile pages.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, getAuthToken, login, register, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setBooting(false);
      return;
    }
    try {
      const res = await fetchMe();
      if (res.success) setUser(res.data);
      else setUser(null);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(async body => {
    const res = await login(body);
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  }, []);

  const signUp = useCallback(async body => {
    const res = await register(body);
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, booting, signIn, signUp, signOut, refresh: bootstrap }),
    [user, booting, signIn, signUp, signOut, bootstrap],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
