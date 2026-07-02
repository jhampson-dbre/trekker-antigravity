import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker } from '../cli-runner.js';
import type { Task } from '../types.js';

export function registerTaskTools(server: McpServer): void {
  server.registerTool(
    'trekker_task_create',
    {
      title: 'Create Task',
      description: 'Create a new task in trekker',
      inputSchema: {
        title: z.string().describe('Task title'),
        description: z.string().optional().describe('Task description'),
        priority: z.number().min(0).max(5).optional().describe('Priority (0=critical, 5=someday)'),
        epicId: z.string().optional().describe('Epic ID to assign task to (e.g., EPIC-1)'),
        tags: z.string().optional().describe('Comma-separated tags'),
      },
    },
    async ({ title, description, priority, epicId, tags }) => {
      const args = ['task', 'create', '-t', title];
      if (description) args.push('-d', description);
      if (priority !== undefined) args.push('-p', String(priority));
      if (epicId) args.push('-e', epicId);
      if (tags) args.push('--tags', tags);

      const result = await runTrekker<Task>(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_task_list',
    {
      title: 'List Tasks',
      description: 'List tasks with optional filters. Returns paginated results (default: 50 per page, newest first). Use page parameter to get older results.',
      inputSchema: {
        status: z.enum(['todo', 'in_progress', 'completed', 'wont_fix', 'archived']).optional().describe('Filter by status'),
        epicId: z.string().optional().describe('Filter by epic ID'),
        limit: z.number().optional().describe('Results per page (default: 50)'),
        page: z.number().optional().describe('Page number (default: 1)'),
      },
    },
    async ({ status, epicId, limit, page }) => {
      const args = ['task', 'list'];
      if (status) args.push('--status', status);
      if (epicId) args.push('--epic', epicId);
      if (limit !== undefined) args.push('--limit', String(limit));
      if (page !== undefined) args.push('--page', String(page));

      const result = await runTrekker(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_task_show',
    {
      title: 'Show Task',
      description: 'Show details of a specific task',
      inputSchema: {
        taskId: z.string().describe('Task ID (e.g., TREK-1)'),
      },
    },
    async ({ taskId }) => {
      const result = await runTrekker<Task>(['task', 'show', taskId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_task_update',
    {
      title: 'Update Task',
      description: 'Update an existing task',
      inputSchema: {
        taskId: z.string().describe('Task ID (e.g., TREK-1)'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        priority: z.number().min(0).max(5).optional().describe('New priority'),
        status: z.enum(['todo', 'in_progress', 'completed', 'wont_fix', 'archived']).optional().describe('New status'),
        epicId: z.string().optional().describe('New epic ID'),
        tags: z.string().optional().describe('New tags (comma-separated)'),
        removeEpic: z.boolean().optional().describe('Remove task from epic'),
      },
    },
    async ({ taskId, title, description, priority, status, epicId, tags, removeEpic }) => {
      const args = ['task', 'update', taskId];
      if (title) args.push('-t', title);
      if (description) args.push('-d', description);
      if (priority !== undefined) args.push('-p', String(priority));
      if (status) args.push('-s', status);
      if (epicId) args.push('-e', epicId);
      if (tags) args.push('--tags', tags);
      if (removeEpic) args.push('--no-epic');

      const result = await runTrekker<Task>(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_task_delete',
    {
      title: 'Delete Task',
      description: 'Delete a task',
      inputSchema: {
        taskId: z.string().describe('Task ID (e.g., TREK-1)'),
      },
    },
    async ({ taskId }) => {
      const result = await runTrekker(['task', 'delete', taskId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
