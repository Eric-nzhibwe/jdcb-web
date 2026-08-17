'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'darkBlue' | 'orange' | 'beige' | 'brown';

const DARK_MODES: ThemeMode[] = ['dark', 'darkBlue', 'brown'];
const STORAGE_KEY = 'jdcb_theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(mode: ThemeMode) {
  const html = document.documentElement;
  // data-theme drives CSS variable scopes and Tailwind dark selector
  html.setAttribute('data-theme', mode);
  // keep .dark class in sync for any remaining dark: utilities
  html.classList.toggle('dark', DARK_MODES.includes(mode));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial: ThemeMode = (saved && ['light','dark','darkBlue','orange','beige','brown'].includes(saved))
      ? saved as ThemeMode
      : 'light';
    setThemeModeState(initial);
    applyTheme(initial);
  }, []);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
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
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
