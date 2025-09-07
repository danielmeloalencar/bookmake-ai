// src/context/SettingsContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import {configureGenkit} from '@/ai/genkit';

type Theme = 'light' | 'dark';
type AiProvider = 'Google' | 'Ollama';

type SettingsContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  globalMinWords?: number;
  setGlobalMinWords: (words?: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  seed?: number;
  setSeed: (seed?: number) => void;
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  ollamaHost?: string;
  setOllamaHost: (host?: string) => void;
  ollamaModel?: string;
  setOllamaModel: (model?: string) => void;
  modelName?: string;
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

const getInitialString = (key: string): string | undefined => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key) || undefined;
  }
  return undefined;
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
    if (stored) {
      const parsed = parseFloat(stored);
      return isNaN(parsed) ? undefined : parsed;
    }
  }
  return undefined;
};

export function SettingsProvider({children}: {children: ReactNode}) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [globalMinWords, setGlobalMinWords] = useState<number | undefined>(() =>
    getInitialNumber('globalMinWords')
  );
  const [temperature, setTemperature] = useState<number>(
    () => getInitialFloat('temperature') ?? 0.8
  );
  const [seed, setSeed] = useState<number | undefined>(() =>
    getInitialNumber('seed')
  );
  const [aiProvider, setAiProvider] = useState<AiProvider>(
    () => (getInitialString('aiProvider') as AiProvider) || 'Google'
  );
  const [ollamaHost, setOllamaHost] = useState<string | undefined>(() =>
    getInitialString('ollamaHost')
  );
  const [ollamaModel, setOllamaModel] = useState<string | undefined>(() =>
    getInitialString('ollamaModel')
  );

  const modelName = useMemo(() => {
    if (aiProvider === 'Ollama' && ollamaModel) {
      return `ollama/${ollamaModel}`;
    }
    // Default to Google Gemini
    return undefined; // Let the flow decide the default google model.
  }, [aiProvider, ollamaModel]);

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
  };

  const handleSetString = (
    key: string,
    value: string | undefined,
    setter: (v?: string) => void
  ) => {
    setter(value);
    if (!value) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  };

  const handleSetNumber = (
    key: string,
    value: number | undefined,
    setter: (v?: number) => void
  ) => {
    setter(value);
    if (value === undefined || isNaN(value)) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  };

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  // Effect to reconfigure Genkit whenever AI provider settings change
  useEffect(() => {
    configureGenkit({
      provider: aiProvider,
      ollamaHost,
    });
  }, [aiProvider, ollamaHost]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        globalMinWords,
        setGlobalMinWords: (v?: number) =>
          handleSetNumber('globalMinWords', v, setGlobalMinWords),
        temperature,
        setTemperature: (v: number) =>
          handleSetNumber('temperature', v, setTemperature),
        seed,
        setSeed: (v?: number) => handleSetNumber('seed', v, setSeed),
        aiProvider,
        setAiProvider: (v: AiProvider) =>
          handleSetString('aiProvider', v, setAiProvider),
        ollamaHost,
        setOllamaHost: (v?: string) =>
          handleSetString('ollamaHost', v, setOllamaHost),
        ollamaModel,
        setOllamaModel: (v?: string) =>
          handleSetString('ollamaModel', v, setOllamaModel),
        modelName,
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
