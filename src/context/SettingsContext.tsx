// src/context/SettingsContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

type SettingsContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('theme');
    if (
      typeof storedPrefs === 'string' &&
      (storedPrefs === 'light' || storedPrefs === 'dark')
    ) {
      return storedPrefs;
    }

    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  return 'light';
};

export function SettingsProvider({children}: {children: ReactNode}) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    const isDark = newTheme === 'dark';
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
