// src/context/SettingsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

type SettingsContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  globalMinWords?: number;
  setGlobalMinWords: (words?: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  seed?: number;
  setSeed: (seed?: number) => void;
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

const getInitialNumber = (key: string): number | undefined => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        const parsed = parseInt(stored, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
    }
    return undefined;
};

const getInitialFloat = (key: string): number | undefined => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(key);
        if(stored) {
            const parsed = parseFloat(stored);
            return isNaN(parsed) ? undefined : parsed;
        }
    }
    return undefined;
}


export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [globalMinWords, setGlobalMinWords] = useState<number | undefined>(() => getInitialNumber('globalMinWords'));
  const [temperature, setTemperature] = useState<number>(() => getInitialFloat('temperature') ?? 0.8);
  const [seed, setSeed] = useState<number | undefined>(() => getInitialNumber('seed'));


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
  
  const handleSetTemperature = (temp: number) => {
      setTemperature(temp);
      localStorage.setItem('temperature', String(temp));
  }
  
  const handleSetSeed = (newSeed?: number) => {
      setSeed(newSeed);
      if(newSeed === undefined || isNaN(newSeed)) {
          localStorage.removeItem('seed');
      } else {
          localStorage.setItem('seed', String(newSeed));
      }
  }

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ 
        theme, 
        setTheme: handleSetTheme, 
        globalMinWords, 
        setGlobalMinWords: handleSetGlobalMinWords,
        temperature,
        setTemperature: handleSetTemperature,
        seed,
        setSeed: handleSetSeed
     }}>
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
