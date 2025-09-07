

export interface Chapter {
  id: string;
  title: string;
  subchapters: string[];
  content: string;
  status: 'pending' | 'generating' | 'completed';
}

export interface BookProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'new' | 'outlining' | 'generating' | 'editing';
  bookDescription: string;
  targetAudience: string;
  language: string;
  difficultyLevel: string;
  numberOfChapters: number;
  outline: Chapter[];
}

export interface McpServer {
  id: string;
  name: string;
  provider: 'google' | 'ollama';
  host?: string; // Only for Ollama
  model: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  mcpServers: McpServer[];
  activeMcpServerId: string | null;
}
