import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker } from '../cli-runner.js';

export function registerSearchTools(server: McpServer): void {
  server.registerTool(
    'trekker_search',
    {
      title: 'Search',
      description: 'Search tasks, epics, subtasks, and comments using FTS5 full-text search',
      inputSchema: {
        query: z.string().describe('Search query (supports FTS5 syntax)'),
        type: z.string().optional().describe('Filter by type: epic,task,subtask,comment (comma-separated)'),
        status: z.string().optional().describe('Filter by status'),
        limit: z.number().optional().describe('Results per page (default: 20)'),
        page: z.number().optional().describe('Page number (default: 1)'),
        rebuildIndex: z.boolean().optional().describe('Rebuild the search index before searching'),
      },
    },
    async ({ query, type, status, limit, page, rebuildIndex }) => {
      const args = ['search', query];
      if (type) args.push('--type', type);
      if (status) args.push('--status', status);
      if (limit !== undefined) args.push('--limit', String(limit));
      if (page !== undefined) args.push('--page', String(page));
      if (rebuildIndex) args.push('--rebuild-index');

      const result = await runTrekker(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
