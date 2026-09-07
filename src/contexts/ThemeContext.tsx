'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'darkBlue' | 'orange' | 'beige' | 'brown';

const DARK_MODES: ThemeMode[] = ['dark', 'darkBlue', 'brown'];
const VALID_MODES: ThemeMode[] = ['light', 'dark', 'darkBlue', 'orange', 'beige', 'brown'];
const STORAGE_KEY = 'jdcb_theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.setAttribute('data-theme', mode);
  html.classList.toggle('dark', DARK_MODES.includes(mode));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with 'light' on both server and client to avoid hydration mismatch.
  // The real saved theme is applied after mount via useEffect.
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved preference after hydration is complete
    let initial: ThemeMode = 'light';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved && VALID_MODES.includes(saved)) initial = saved;
    } catch {
      // localStorage unavailable (private browsing etc.) — use default
    }
    setThemeModeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch { /* ignore */ }
    applyTheme(m);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  return (
    <ThemeContext.Provider value={{
      themeMode,
      isDark: DARK_MODES.includes(themeMode),
      setThemeMode,
      toggleTheme,
    }}>
      {/* Suppress hydration warning on the wrapper — theme class is applied after mount */}
      <div suppressHydrationWarning style={mounted ? undefined : { visibility: 'hidden', pointerEvents: 'none' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
