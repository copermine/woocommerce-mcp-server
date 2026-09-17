#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadStoreConfig } from './config.js';
import { createMcpServer } from './mcp.js';

try {
  await createMcpServer(loadStoreConfig()).connect(new StdioServerTransport());
  console.error('WooCommerce MCP running on stdin/stdout');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Server startup failed');
  process.exit(1);
}
