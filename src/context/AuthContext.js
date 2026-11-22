import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as Api from '../services/ApiService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    Api.loadSession().then(setSession).finally(() => setBooting(false));
  }, []);

  const signIn = useCallback(async (email, password) => {
    const s = await Api.login(email, password);
    await Api.saveSession(s.token, s.user);
    setSession(s);
  }, []);

  const signUp = useCallback(async (data) => {
    const s = await Api.register(data);
    await Api.saveSession(s.token, s.user);
    setSession(s);
  }, []);

  const updateUser = useCallback(async (user) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...user } };
      Api.saveSession(next.token, next.user).catch(() => {});
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    await Api.clearSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, booting, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
