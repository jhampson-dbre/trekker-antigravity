import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker } from '../cli-runner.js';
import type { Epic } from '../types.js';

export function registerEpicTools(server: McpServer): void {
  server.registerTool(
    'trekker_epic_create',
    {
      title: 'Create Epic',
      description: 'Create a new epic in trekker',
      inputSchema: {
        title: z.string().describe('Epic title'),
        description: z.string().optional().describe('Epic description'),
        priority: z.number().min(0).max(5).optional().describe('Priority (0=critical, 5=someday)'),
        parentEpicId: z.string().optional().describe('Parent epic ID for nested epics'),
      },
    },
    async ({ title, description, priority, parentEpicId }) => {
      const args = ['epic', 'create', '-t', title];
      if (description) args.push('-d', description);
      if (priority !== undefined) args.push('-p', String(priority));
      if (parentEpicId) args.push('-e', parentEpicId);

      const result = await runTrekker<Epic>(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_epic_list',
    {
      title: 'List Epics',
      description: 'List epics with optional filters. Returns paginated results (default: 50 per page, newest first). Use page parameter to get older results.',
      inputSchema: {
        status: z.enum(['todo', 'in_progress', 'completed', 'archived']).optional().describe('Filter by status'),
        limit: z.number().optional().describe('Results per page (default: 50)'),
        page: z.number().optional().describe('Page number (default: 1)'),
      },
    },
    async ({ status, limit, page }) => {
      const args = ['epic', 'list'];
      if (status) args.push('--status', status);
      if (limit !== undefined) args.push('--limit', String(limit));
      if (page !== undefined) args.push('--page', String(page));

      const result = await runTrekker(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_epic_show',
    {
      title: 'Show Epic',
      description: 'Show details of a specific epic',
      inputSchema: {
        epicId: z.string().describe('Epic ID (e.g., EPIC-1)'),
      },
    },
    async ({ epicId }) => {
      const result = await runTrekker<Epic>(['epic', 'show', epicId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_epic_update',
    {
      title: 'Update Epic',
      description: 'Update an existing epic',
      inputSchema: {
        epicId: z.string().describe('Epic ID (e.g., EPIC-1)'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        priority: z.number().min(0).max(5).optional().describe('New priority'),
        status: z.enum(['todo', 'in_progress', 'completed', 'archived']).optional().describe('New status'),
      },
    },
    async ({ epicId, title, description, priority, status }) => {
      const args = ['epic', 'update', epicId];
      if (title) args.push('-t', title);
      if (description) args.push('-d', description);
      if (priority !== undefined) args.push('-p', String(priority));
      if (status) args.push('-s', status);

      const result = await runTrekker<Epic>(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_epic_delete',
    {
      title: 'Delete Epic',
      description: 'Delete an epic',
      inputSchema: {
        epicId: z.string().describe('Epic ID (e.g., EPIC-1)'),
      },
    },
    async ({ epicId }) => {
      const result = await runTrekker(['epic', 'delete', epicId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
