import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { runTrekker } from '../cli-runner.js';
import type { Comment } from '../types.js';

export function registerCommentTools(server: McpServer): void {
  server.registerTool(
    'trekker_comment_add',
    {
      title: 'Add Comment',
      description: 'Add a comment to a task',
      inputSchema: {
        taskId: z.string().describe('Task ID (e.g., TREK-1)'),
        agent: z.string().describe('Agent name (who is adding the comment)'),
        content: z.string().describe('Comment content'),
      },
    },
    async ({ taskId, agent, content }) => {
      const result = await runTrekker<Comment>(['comment', 'add', taskId, '-a', agent, '-c', content]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_comment_list',
    {
      title: 'List Comments',
      description: 'List comments on a task. Returns paginated results (default: 50 per page, newest first). Use page parameter to get older results.',
      inputSchema: {
        taskId: z.string().describe('Task ID (e.g., TREK-1)'),
        limit: z.number().optional().describe('Results per page (default: 50)'),
        page: z.number().optional().describe('Page number (default: 1)'),
      },
    },
    async ({ taskId, limit, page }) => {
      const args = ['comment', 'list', taskId];
      if (limit !== undefined) args.push('--limit', String(limit));
      if (page !== undefined) args.push('--page', String(page));

      const result = await runTrekker(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_comment_update',
    {
      title: 'Update Comment',
      description: 'Update a comment',
      inputSchema: {
        commentId: z.string().describe('Comment ID (e.g., CMT-1)'),
        content: z.string().describe('New comment content'),
      },
    },
    async ({ commentId, content }) => {
      const result = await runTrekker<Comment>(['comment', 'update', commentId, '-c', content]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.registerTool(
    'trekker_comment_delete',
    {
      title: 'Delete Comment',
      description: 'Delete a comment',
      inputSchema: {
        commentId: z.string().describe('Comment ID (e.g., CMT-1)'),
      },
    },
    async ({ commentId }) => {
      const result = await runTrekker(['comment', 'delete', commentId]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
