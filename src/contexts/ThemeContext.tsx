'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'darkBlue' | 'orange' | 'beige' | 'brown';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'jdcb_theme';

const DARK_MODES: ThemeMode[] = ['dark', 'darkBlue', 'brown'];

// CSS variable maps per theme — applied to :root so Tailwind dark: classes still work
const THEME_VARS: Record<ThemeMode, Record<string, string>> = {
  light:    { '--color-bg': '#f2faf5',  '--color-primary': '#2d9e5f', '--color-secondary': '#1b3a2d' },
  dark:     { '--color-bg': '#0d1f14',  '--color-primary': '#3dbf72', '--color-secondary': '#122b1c' },
  darkBlue: { '--color-bg': '#0a0f1e',  '--color-primary': '#4d8ef0', '--color-secondary': '#0d1635' },
  orange:   { '--color-bg': '#fff8f0',  '--color-primary': '#e86f00', '--color-secondary': '#7a3000'  },
  beige:    { '--color-bg': '#f5f0e8',  '--color-primary': '#9b7e52', '--color-secondary': '#4a3728'  },
  brown:    { '--color-bg': '#1a0f08',  '--color-primary': '#c8803a', '--color-secondary': '#2d1a0a'  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved && saved in THEME_VARS) setThemeModeState(saved);
  }, []);

  useEffect(() => {
    const isDark = DARK_MODES.includes(themeMode);
    document.documentElement.classList.toggle('dark', isDark);
    // apply CSS vars
    const vars = THEME_VARS[themeMode];
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [themeMode]);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, isDark: DARK_MODES.includes(themeMode), setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
