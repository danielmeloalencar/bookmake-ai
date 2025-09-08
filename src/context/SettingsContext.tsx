
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type { McpConfig, Settings, LocalMcpServer } from '@/lib/types';
import { nanoid } from 'nanoid';

type SettingsContextType = Settings & {
  setTheme: (theme: 'light' | 'dark') => void;
  setAiProvider: (provider: 'google' | 'ollama') => void;
  setOllamaHost: (host: string) => void;
  setOllamaModel: (model: string) => void;
  setMcpConfig: (config: McpConfig) => void;
  getSerializableSettings: () => Omit<
    Settings,
    | 'setTheme'
    | 'setAiProvider'
    | 'setOllamaHost'
    | 'setOllamaModel'
    | 'setMcpConfig'
    | 'getSerializableSettings'
    | 'addLocalMcpServer'
    | 'updateLocalMcpServer'
    | 'removeLocalMcpServer'
  >;
  addLocalMcpServer: (server: Omit<LocalMcpServer, 'id'>) => void;
  updateLocalMcpServer: (server: LocalMcpServer) => void;
  removeLocalMcpServer: (id: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const defaultSettings: Omit<Settings, 'mcp'> & { mcp: McpConfig } = {
    theme: 'dark',
    aiProvider: 'google',
    ollamaHost: 'http://127.0.0.1:11434',
    ollamaModel: 'gemma',
    mcp: { fs: false, memory: false, localServers: [] },
}

const getInitialState = (): Settings => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedSettings = window.localStorage.getItem('livromagico_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Merge saved settings with defaults to prevent undefined properties
        const mcp = { ...defaultSettings.mcp, ...(parsed.mcp || {}) };
        return { ...defaultSettings, ...parsed, mcp };
      } catch (e) {
        // Fallback to default if parsing fails
      }
    }
  }
  // Default state
  return defaultSettings;
};

export function SettingsProvider({ children }: { children: ReactNode }) {
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
    setSettings((s) => ({ ...s, theme }));
  }, []);

  const setAiProvider = useCallback((provider: 'google' | 'ollama') => {
    setSettings((s) => ({ ...s, aiProvider: provider }));
  }, []);

  const setOllamaHost = useCallback((host: string) => {
    setSettings((s) => ({ ...s, ollamaHost: host }));
  }, []);

  const setOllamaModel = useCallback((model: string) => {
    setSettings((s) => ({ ...s, ollamaModel: model }));
  }, []);

  const setMcpConfig = useCallback((config: McpConfig) => {
    setSettings((s) => ({ ...s, mcp: config }));
  }, []);

  const addLocalMcpServer = useCallback(
    (server: Omit<LocalMcpServer, 'id'>) => {
      const newServer = { ...server, id: nanoid() };
      setSettings((s) => ({
        ...s,
        mcp: { ...s.mcp, localServers: [...s.mcp.localServers, newServer] },
      }));
    },
    []
  );

  const updateLocalMcpServer = useCallback((server: LocalMcpServer) => {
    setSettings((s) => ({
      ...s,
      mcp: {
        ...s.mcp,
        localServers: s.mcp.localServers.map((ls) =>
          ls.id === server.id ? server : ls
        ),
      },
    }));
  }, []);

  const removeLocalMcpServer = useCallback((id: string) => {
    setSettings((s) => ({
      ...s,
      mcp: {
        ...s.mcp,
        localServers: s.mcp.localServers.filter((ls) => ls.id !== id),
      },
    }));
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
        addLocalMcpServer,
        updateLocalMcpServer,
        removeLocalMcpServer,
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
