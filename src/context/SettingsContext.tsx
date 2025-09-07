
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type {McpConfig, Settings} from '@/lib/types';
import { getMcpHost, shutdownMcpHost } from '@/ai/mcp-host';


type SettingsContextType = Settings & {
  setTheme: (theme: 'light' | 'dark') => void;
  setAiProvider: (provider: 'google' | 'ollama') => void;
  setOllamaHost: (host: string) => void;
  setOllamaModel: (model: string) => void;
  setMcpConfig: (config: McpConfig) => void;
  getSerializableSettings: () => Omit<Settings, 'setTheme' | 'setAiProvider' | 'setOllamaHost' | 'setOllamaModel' | 'setMcpConfig' | 'getSerializableSettings'>;
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
         return {
            theme: parsed.theme || 'dark',
            aiProvider: parsed.aiProvider || 'google',
            ollamaHost: parsed.ollamaHost || 'http://127.0.0.1:11434',
            ollamaModel: parsed.ollamaModel || 'gemma',
            mcp: parsed.mcp || { fs: false, memory: false },
        };
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
    ollamaModel: 'gemma',
    mcp: { fs: false, memory: false },
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
    // Re-initialize MCP host with new config
    getMcpHost(settings.mcp);
  }, [settings]);

  useEffect(() => {
      // Ensure MCP host is initialized on mount
      getMcpHost(settings.mcp);
      // And shut down when the app unmounts
      return () => {
        shutdownMcpHost();
      }
  }, [settings.mcp]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setSettings(s => ({...s, theme}));
  }, []);

  const setAiProvider = useCallback((provider: 'google' | 'ollama') => {
    setSettings(s => ({...s, aiProvider: provider}));
  }, []);

  const setOllamaHost = useCallback((host: string) => {
    setSettings(s => ({...s, ollamaHost: host}));
  }, []);

  const setOllamaModel = useCallback((model: string) => {
    setSettings(s => ({...s, ollamaModel: model}));
  }, []);

  const setMcpConfig = useCallback((config: McpConfig) => {
    setSettings(s => ({...s, mcp: config}));
  }, []);

  const getSerializableSettings = useCallback(() => {
    const { theme, aiProvider, ollamaHost, ollamaModel, mcp } = settings;
    return { theme, aiProvider, ollamaHost, ollamaModel, mcp };
  }, [settings]);


  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTheme,
        setAiProvider,
        setOllamaHost,
        setOllamaModel,
        setMcpConfig,
        getSerializableSettings,
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
