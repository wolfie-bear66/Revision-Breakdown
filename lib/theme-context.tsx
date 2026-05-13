'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'reading';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
});

function applyTheme(t: Theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', t);
  html.classList.remove('dark', 'light', 'reading');
  if (t === 'dark') html.classList.add('dark');
  try { localStorage.setItem('rb-theme', t); } catch {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rb-theme') as Theme | null;
      if (stored && ['dark', 'light', 'reading'].includes(stored)) {
        applyTheme(stored);
        setThemeState(stored);
      }
    } catch {}
  }, []);

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
