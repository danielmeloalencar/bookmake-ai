
/**
 * @fileOverview Manages the lifecycle of the MCP (Model Context Protocol) host.
 * This ensures that the MCP servers are initialized only once and are properly
 * shut down when the application closes.
 */
import {createMcpHost, GenkitMcpHost, McpServerConfig} from '@genkit-ai/mcp';
import {McpConfig} from '@/lib/types';

let mcpHost: GenkitMcpHost | null = null;
let currentConfig: string | null = null;

// Defines all possible built-in MCP servers that can be enabled.
const ALL_SERVERS: Record<string, McpServerConfig> = {
  fs: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
  },
  memory: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
  },
};

/**
 * Returns a singleton instance of the MCP host.
 * If the configuration changes, it shuts down the old host and creates a new one.
 * @param config - The desired configuration for MCP servers.
 * @returns The singleton GenkitMcpHost instance.
 */
export function getMcpHost(config: McpConfig): GenkitMcpHost {
  const configKey = JSON.stringify(config);

  if (mcpHost && currentConfig === configKey) {
    return mcpHost;
  }

  if (mcpHost) {
    console.log('MCP configuration changed. Restarting MCP host...');
    mcpHost.close();
  }

  const activeServers: Record<string, McpServerConfig> = {};
  
  // Add built-in servers if enabled
  if (config.fs) {
    activeServers.fs = ALL_SERVERS.fs;
  }
  if (config.memory) {
    activeServers.memory = ALL_SERVERS.memory;
  }

  // Add local custom servers
  if (config.localServers) {
    config.localServers.forEach(server => {
      activeServers[server.name] = {
        command: server.command,
        args: server.args.filter(arg => arg.trim() !== ''), // Filter out empty strings
        timeout: server.timeout ? server.timeout * 1000 : undefined, // convert seconds to ms
      };
    });
  }


  console.log('Initializing MCP host with servers:', Object.keys(activeServers));
  mcpHost = createMcpHost({
    name: 'livromagico-mcp-host',
    mcpServers: activeServers,
  });

  currentConfig = configKey;
  return mcpHost;
}

/**
 * Shuts down the active MCP host, if it exists.
 * This is useful for cleaning up resources when the application exits.
 */
export async function shutdownMcpHost() {
  if (mcpHost) {
    console.log('Shutting down MCP host...');
    await mcpHost.close();
    mcpHost = null;
    currentConfig = null;
  }
}

// Ensure clean shutdown on process exit
process.on('beforeExit', shutdownMcpHost);
process.on('SIGINT', async () => {
    await shutdownMcpHost();
    process.exit();
});
process.on('SIGTERM', async () => {
    await shutdownMcpHost();
    process.exit();
});
