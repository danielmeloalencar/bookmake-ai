// src/context/SettingsContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type {Settings} from '@/lib/types';

type SettingsContextType = Settings & {
  setTheme: (theme: 'light' | 'dark') => void;
  setAiProvider: (provider: 'google' | 'ollama') => void;
  setOllamaHost: (host: string) => void;
  setOllamaModel: (model: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const getInitialState = (): Settings => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedSettings = window.localStorage.getItem('livromagico_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Basic validation
        if (parsed.theme && parsed.aiProvider) {
          return parsed;
        }
      } catch (e) {
        // Fallback to default if parsing fails
      }
    }
  }
  // Default state
  return {
    theme: 'dark',
    aiProvider: 'google',
    ollamaHost: 'http://127.0.0.1:11434',
    ollamaModel: 'qwen3:8b',
  };
};

export function SettingsProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<Settings>(getInitialState);

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = settings.theme === 'dark';
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(settings.theme);
  }, [settings.theme]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('livromagico_settings', JSON.stringify(settings));
  }, [settings]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setSettings(s => ({...s, theme}));
  }, []);

  const setAiProvider = useCallback((aiProvider: 'google' | 'ollama') => {
    setSettings(s => ({...s, aiProvider}));
  }, []);

  const setOllamaHost = useCallback((ollamaHost: string) => {
    setSettings(s => ({...s, ollamaHost}));
  }, []);

  const setOllamaModel = useCallback((ollamaModel: string) => {
    setSettings(s => ({...s, ollamaModel}));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTheme,
        setAiProvider,
        setOllamaHost,
        setOllamaModel,
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
