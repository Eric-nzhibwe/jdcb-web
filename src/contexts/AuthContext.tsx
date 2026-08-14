'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  registerUser, loginUser, logoutUser,
  subscribeToAuthState, updateUserProfile,
} from '@/services/auth';
import type { User, RegisterData, LoginData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<User>;
  login: (data: LoginData) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuthState((u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<User> => {
    setLoading(true); setError(null);
    try {
      const u = await registerUser(data); setUser(u); return u;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const login = useCallback(async (data: LoginData): Promise<User> => {
    setLoading(true); setError(null);
    try {
      const u = await loginUser(data); setUser(u); return u;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try { await logoutUser(); setUser(null); }
    catch (err) { setError(err instanceof Error ? err.message : 'Logout failed'); }
    finally { setLoading(false); }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    await updateUserProfile(user.id, updates);
    setUser({ ...user, ...updates });
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, updateProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
