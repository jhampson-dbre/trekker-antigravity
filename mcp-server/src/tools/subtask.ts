import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker } from '../cli-runner.js';
import type { Task } from '../types.js';

export function registerSubtaskTools(server: McpServer): void {
  server.registerTool(
    'trekker_subtask_create',
    {
      title: 'Create Subtask',
      description: 'Create a subtask under an existing task',
      inputSchema: {
        parentTaskId: z.string().describe('Parent task ID (e.g., TREK-1)'),
        title: z.string().describe('Subtask title'),
        description: z.string().optional().describe('Subtask description'),
        priority: z.number().min(0).max(5).optional().describe('Priority (0=critical, 5=someday)'),
      },
    },
    async ({ parentTaskId, title, description, priority }) => {
      const args = ['subtask', 'create', parentTaskId, '-t', title];
      if (description) args.push('-d', description);
      if (priority !== undefined) args.push('-p', String(priority));

      const result = await runTrekker<Task>(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_subtask_list',
    {
      title: 'List Subtasks',
      description: 'List subtasks of a parent task. Returns paginated results (default: 50 per page, newest first). Use page parameter to get older results.',
      inputSchema: {
        parentTaskId: z.string().describe('Parent task ID (e.g., TREK-1)'),
        limit: z.number().optional().describe('Results per page (default: 50)'),
        page: z.number().optional().describe('Page number (default: 1)'),
      },
    },
    async ({ parentTaskId, limit, page }) => {
      const args = ['subtask', 'list', parentTaskId];
      if (limit !== undefined) args.push('--limit', String(limit));
      if (page !== undefined) args.push('--page', String(page));

      const result = await runTrekker(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_subtask_update',
    {
      title: 'Update Subtask',
      description: 'Update an existing subtask',
      inputSchema: {
        subtaskId: z.string().describe('Subtask ID (e.g., TREK-2)'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        priority: z.number().min(0).max(5).optional().describe('New priority'),
        status: z.enum(['todo', 'in_progress', 'completed', 'wont_fix', 'archived']).optional().describe('New status'),
      },
    },
    async ({ subtaskId, title, description, priority, status }) => {
      const args = ['subtask', 'update', subtaskId];
      if (title) args.push('-t', title);
      if (description) args.push('-d', description);
      if (priority !== undefined) args.push('-p', String(priority));
      if (status) args.push('-s', status);

      const result = await runTrekker<Task>(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_subtask_delete',
    {
      title: 'Delete Subtask',
      description: 'Delete a subtask',
      inputSchema: {
        subtaskId: z.string().describe('Subtask ID (e.g., TREK-2)'),
      },
    },
    async ({ subtaskId }) => {
      const result = await runTrekker(['subtask', 'delete', subtaskId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
