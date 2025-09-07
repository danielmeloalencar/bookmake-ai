
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { nanoid } from 'nanoid';
import type {Settings, McpServer} from '@/lib/types';

type SettingsContextType = Settings & {
  setTheme: (theme: 'light' | 'dark') => void;
  addMcpServer: (server: Omit<McpServer, 'id'>) => void;
  updateMcpServer: (id: string, server: Partial<McpServer>) => void;
  removeMcpServer: (id: string) => void;
  setActiveMcpServerId: (id: string | null) => void;
  getActiveMcpServer: () => McpServer | null;
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
        if (parsed.theme && Array.isArray(parsed.mcpServers)) {
          return parsed;
        }
      } catch (e) {
        // Fallback to default if parsing fails
      }
    }
  }
  // Default state
  const defaultGoogleServer: McpServer = {
    id: nanoid(),
    name: 'Google Gemini Flash',
    provider: 'google',
    model: 'gemini-1.5-flash',
  };
  return {
    theme: 'dark',
    mcpServers: [defaultGoogleServer],
    activeMcpServerId: defaultGoogleServer.id,
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

  const setMcpServers = useCallback((mcpServers: McpServer[]) => {
     setSettings(s => ({...s, mcpServers}));
  }, []);

  const addMcpServer = useCallback((server: Omit<McpServer, 'id'>) => {
    const newServer = { ...server, id: nanoid() };
    setMcpServers([...settings.mcpServers, newServer]);
  }, [settings.mcpServers, setMcpServers]);

  const updateMcpServer = useCallback((id: string, serverUpdate: Partial<McpServer>) => {
    setMcpServers(settings.mcpServers.map(s => s.id === id ? { ...s, ...serverUpdate } : s));
  }, [settings.mcpServers, setMcpServers]);

  const removeMcpServer = useCallback((id: string) => {
    const newServers = settings.mcpServers.filter(s => s.id !== id);
    setMcpServers(newServers);
    // If the active server was deleted, reset to the first available one
    if (settings.activeMcpServerId === id) {
      setSettings(s => ({ ...s, activeMcpServerId: newServers[0]?.id || null }));
    }
  }, [settings.mcpServers, settings.activeMcpServerId, setMcpServers]);

  const setActiveMcpServerId = useCallback((id: string | null) => {
    setSettings(s => ({ ...s, activeMcpServerId: id }));
  }, []);

  const getActiveMcpServer = useCallback(() => {
    return settings.mcpServers.find(s => s.id === settings.activeMcpServerId) || null;
  }, [settings.mcpServers, settings.activeMcpServerId]);


  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTheme,
        addMcpServer,
        updateMcpServer,
        removeMcpServer,
        setActiveMcpServerId,
        getActiveMcpServer,
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
