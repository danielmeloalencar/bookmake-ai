
/**
 * @fileOverview Manages the lifecycle of the MCP (Model Context Protocol) host.
 * This ensures that the MCP servers are initialized only once and are properly
 * shut down when the application closes.
 */

// This file is temporarily disabled to resolve a dependency conflict.
// The MCP functionality can be restored once the dependency issues are resolved.

export function getMcpHost(config: any): any {
  console.log('MCP host is temporarily disabled.');
  return {
    getActiveTools: async () => [],
    getActiveResources: async () => [],
    close: async () => {},
  };
}

export async function shutdownMcpHost() {
  console.log('MCP host is temporarily disabled, nothing to shut down.');
}
