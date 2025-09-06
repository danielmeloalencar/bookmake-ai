// src/context/SettingsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

type SettingsContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  globalMinWords?: number;
  setGlobalMinWords: (words?: number) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('theme');
    if (typeof storedPrefs === 'string' && (storedPrefs === 'light' || storedPrefs === 'dark')) {
      return storedPrefs;
    }

    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  return 'light';
};

const getInitialMinWords = (): number | undefined => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedWords = window.localStorage.getItem('globalMinWords');
      if (storedWords) {
        const parsed = parseInt(storedWords, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
    }
    return undefined;
};


export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [globalMinWords, setGlobalMinWords] = useState<number | undefined>(getInitialMinWords);

  const rawSetTheme = (rawTheme: Theme) => {
    const root = window.document.documentElement;
    const isDark = rawTheme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(rawTheme);

    localStorage.setItem('theme', rawTheme);
  };
  
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    rawSetTheme(newTheme);
  }
  
  const handleSetGlobalMinWords = (words?: number) => {
    setGlobalMinWords(words);
    if(words === undefined || isNaN(words)) {
        localStorage.removeItem('globalMinWords');
    } else {
        localStorage.setItem('globalMinWords', String(words));
    }
  }

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme: handleSetTheme, globalMinWords, setGlobalMinWords: handleSetGlobalMinWords }}>
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
