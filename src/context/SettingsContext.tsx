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
type AIProvider = 'Google' | 'Ollama';

type SettingsContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  ollamaHost: string;
  setOllamaHost: (host: string) => void;
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

const getInitialProvider = (): AIProvider => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('aiProvider');
        if (stored === 'Google' || stored === 'Ollama') {
            return stored;
        }
    }
    return 'Google';
}

const getInitialOllamaModel = (): string => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('ollamaModel') || 'llama3';
    }
    return 'llama3';
}

const getInitialOllamaHost = (): string => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('ollamaHost') || 'http://127.0.0.1:11434';
    }
    return 'http://127.0.0.1:11434';
}


export function SettingsProvider({children}: {children: ReactNode}) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [aiProvider, setAiProviderState] = useState<AIProvider>(getInitialProvider());
  const [ollamaModel, setOllamaModelState] = useState<string>(getInitialOllamaModel());
  const [ollamaHost, setOllamaHostState] = useState<string>(getInitialOllamaHost());


  const setTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    const isDark = newTheme === 'dark';
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };
  
  const setAiProvider = (newProvider: AIProvider) => {
    localStorage.setItem('aiProvider', newProvider);
    setAiProviderState(newProvider);
  }

  const setOllamaModel = (newModel: string) => {
    localStorage.setItem('ollamaModel', newModel);
    setOllamaModelState(newModel);
  }

  const setOllamaHost = (newHost: string) => {
    localStorage.setItem('ollamaHost', newHost);
    setOllamaHostState(newHost);
  }

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
        aiProvider,
        setAiProvider,
        ollamaModel,
        setOllamaModel,
        ollamaHost,
        setOllamaHost,
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
