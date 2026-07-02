import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker } from '../cli-runner.js';

export function registerReadyTools(server: McpServer): void {
  server.registerTool(
    'trekker_task_ready',
    {
      title: 'Ready Tasks',
      description: 'Show tasks that are ready to work on (unblocked, todo) with their downstream dependents. Returns paginated results (default: 50 per page). Use page parameter to get older results.',
      inputSchema: {
        limit: z.number().optional().describe('Results per page (default: 50)'),
        page: z.number().optional().describe('Page number (default: 1)'),
      },
    },
    async ({ limit, page }) => {
      const args = ['ready'];
      if (limit !== undefined) args.push('--limit', String(limit));
      if (page !== undefined) args.push('--page', String(page));

      const result = await runTrekker(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
