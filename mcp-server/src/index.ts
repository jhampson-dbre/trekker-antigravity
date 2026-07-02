#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerTaskTools } from './tools/task.js';
import { registerEpicTools } from './tools/epic.js';
import { registerSubtaskTools } from './tools/subtask.js';
import { registerCommentTools } from './tools/comment.js';
import { registerDependencyTools } from './tools/dependency.js';
import { registerSystemTools } from './tools/system.js';
import { registerSearchTools } from './tools/search.js';
import { registerReadyTools } from './tools/ready.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const server = new McpServer({
  name: 'trekker-mcp',
  version: pkg.version,
});

registerTaskTools(server);
registerEpicTools(server);
registerSubtaskTools(server);
registerCommentTools(server);
registerDependencyTools(server);
registerSystemTools(server);
registerSearchTools(server);
registerReadyTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Failed to start trekker-mcp server:', error);
  process.exit(1);
});
