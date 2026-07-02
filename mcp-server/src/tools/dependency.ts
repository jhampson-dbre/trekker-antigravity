import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker } from '../cli-runner.js';
import type { Dependency } from '../types.js';

export function registerDependencyTools(server: McpServer): void {
  server.registerTool(
    'trekker_dep_add',
    {
      title: 'Add Dependency',
      description: 'Add a dependency between tasks (taskId depends on dependsOnTaskId)',
      inputSchema: {
        taskId: z.string().describe('Task ID that has the dependency (e.g., TREK-2)'),
        dependsOnTaskId: z.string().describe('Task ID that must be completed first (e.g., TREK-1)'),
      },
    },
    async ({ taskId, dependsOnTaskId }) => {
      const result = await runTrekker<Dependency>(['dep', 'add', taskId, dependsOnTaskId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_dep_remove',
    {
      title: 'Remove Dependency',
      description: 'Remove a dependency between tasks',
      inputSchema: {
        taskId: z.string().describe('Task ID (e.g., TREK-2)'),
        dependsOnTaskId: z.string().describe('Task ID to remove from dependencies (e.g., TREK-1)'),
      },
    },
    async ({ taskId, dependsOnTaskId }) => {
      const result = await runTrekker(['dep', 'remove', taskId, dependsOnTaskId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_dep_list',
    {
      title: 'List Dependencies',
      description: 'List dependencies for a task',
      inputSchema: {
        taskId: z.string().describe('Task ID (e.g., TREK-1)'),
      },
    },
    async ({ taskId }) => {
      const result = await runTrekker<Dependency[]>(['dep', 'list', taskId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
