import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker, runTrekkerText } from '../cli-runner.js';

export function registerSystemTools(server: McpServer): void {
  server.registerTool(
    'trekker_init',
    {
      title: 'Initialize Trekker',
      description: 'Initialize trekker in the current directory',
      inputSchema: {},
    },
    async () => {
      const result = await runTrekker(['init']);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_quickstart',
    {
      title: 'Quickstart Guide',
      description: 'Get trekker quickstart guide and workflow reference',
      inputSchema: {
        toon: z.boolean().optional().describe('Use token-efficient output format'),
      },
    },
    async ({ toon }) => {
      const result = await runTrekkerText(['quickstart'], { toon: toon ?? true });
      return {
        content: [{ type: 'text', text: result.data ?? result.error ?? 'No output' }],
      };
    }
  );

  server.registerTool(
    'trekker_wipe',
    {
      title: 'Wipe Database',
      description: 'Remove all trekker data (use with caution)',
      inputSchema: {
        confirm: z.boolean().describe('Must be true to confirm deletion'),
      },
    },
    async ({ confirm }) => {
      if (!confirm) {
        return {
          content: [{ type: 'text', text: 'Wipe cancelled: confirm must be true' }],
        };
      }
      const result = await runTrekker(['wipe', '-y']);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
