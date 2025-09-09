
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

export interface LocalMcpServer {
  id: string;
  name: string;
  command: string;
  args: string[];
}

export interface McpConfig {
  fs: boolean;
  memory: boolean;
  localServers: LocalMcpServer[];
}


export interface Settings {
  theme: 'light' | 'dark';
  aiProvider: 'google' | 'ollama';
  ollamaHost?: string;
  ollamaModel?: string;
  mcp: McpConfig;
}
