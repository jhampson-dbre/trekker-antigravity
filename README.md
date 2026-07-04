# Trekker Antigravity Plugin

An Antigravity 2.0 plugin for [trekker](https://github.com/obsfx/trekker), the AI-optimized issue tracker. Provides MCP tools, custom slash commands (skills), and hooks for seamless task management in Antigravity.

## Prerequisites

- [trekker](https://github.com/obsfx/trekker) CLI installed globally
- Node.js 18+
- Python 3+ (required for cross-platform hook wrappers)
- Antigravity 2.0 environment

## Installation

To install the Trekker plugin for Antigravity, place the plugin files in one of the plugin search paths:

### Option A: Global Plugin (All Projects)

Clone the repository or symlink it into the global plugins directory:

```bash
# Clone the repository
git clone https://github.com/jhampson-dbre/trekker-antigravity.git

# Link to the global plugins path (on macOS/Linux/WSL)
ln -s $(pwd)/trekker-antigravity ~/.gemini/config/plugins/trekker

# Or on Windows PowerShell:
New-Item -ItemType SymbolicLink -Path "$HOME\.gemini\config\plugins\trekker" -Value (Get-Item .\trekker-antigravity).FullName
```

### Option B: Workspace-Specific Plugin

Clone or symlink the plugin directly inside your workspace's `.agents` directory:

```bash
# Create the workspace plugins folder if it doesn't exist
mkdir -p .agents/plugins

# Link to workspace plugins path (macOS/Linux/WSL)
ln -s $(pwd)/trekker-antigravity .agents/plugins/trekker

# Or on Windows PowerShell:
New-Item -ItemType SymbolicLink -Path ".agents\plugins\trekker" -Value (Get-Item .\trekker-antigravity).FullName
```

### Configuration Files

The plugin uses standard configuration schemas that Antigravity 2.0 automatically discovers and loads from the plugin root directory:
- **`hooks.json`**: Configures hooks for workflow events. Matches specific events (`SessionStart`, `PreCompact`, `Stop`, `SubagentStop`) and runs automated scripts. See [hooks.json](./hooks.json).
- **`plugin.json`**: Provides standard plugin metadata (name, version, description, license) adhering to `https://antigravity.google/schemas/v1/plugin.json`. See [plugin.json](./plugin.json).

**Note on MCP Servers**: Currently, Antigravity 2.0 does not auto-load plugin-level MCP configurations. You must manually add the `trekker` MCP server to your global `~/.gemini/config/mcp_config.json` (or `.agents/mcp_config.json` for workspace-local):

```json
{
  "mcpServers": {
    "trekker": {
      "command": "node",
      "args": ["/path/to/plugins/trekker/mcp-server/dist/index.js"]
    }
  }
}
```
*(Replace `/path/to/plugins/` with the absolute path where you installed the plugin).*

### Initialize Trekker in Your Project

```bash
cd your-project
trekker init
```

## Features

### MCP Tools (26 tools)

The MCP server exposes trekker functionality as tools:

| Category | Tool | Description |
|----------|------|-------------|
| Task | `trekker_task_create` | Create a new task |
| Task | `trekker_task_list` | List tasks with filters and pagination |
| Task | `trekker_task_show` | Show task details |
| Task | `trekker_task_update` | Update task fields |
| Task | `trekker_task_delete` | Delete a task |
| Task | `trekker_task_ready` | Show unblocked tasks ready to work on |
| Epic | `trekker_epic_create` | Create an epic |
| Epic | `trekker_epic_list` | List epics with pagination |
| Epic | `trekker_epic_show` | Show epic details |
| Epic | `trekker_epic_update` | Update an epic |
| Epic | `trekker_epic_delete` | Delete an epic |
| Subtask | `trekker_subtask_create` | Create a subtask |
| Subtask | `trekker_subtask_list` | List subtasks with pagination |
| Subtask | `trekker_subtask_update` | Update a subtask |
| Subtask | `trekker_subtask_delete` | Delete a subtask |
| Comment | `trekker_comment_add` | Add a comment |
| Comment | `trekker_comment_list` | List comments with pagination |
| Comment | `trekker_comment_update` | Update a comment |
| Comment | `trekker_comment_delete` | Delete a comment |
| Dependency | `trekker_dep_add` | Add a dependency |
| Dependency | `trekker_dep_remove` | Remove a dependency |
| Dependency | `trekker_dep_list` | List dependencies |
| Search | `trekker_search` | FTS5 full-text search |
| System | `trekker_init` | Initialize trekker |
| System | `trekker_quickstart` | Get workflow guide |
| System | `trekker_wipe` | Wipe database |

### Custom Slash Commands (Skills)

Custom slash commands are implemented as Antigravity skills under the `skills/` directory.

| Command / Skill | Description |
|---------|-------------|
| `/trekker-prime` | Load workflow context |
| `/trekker-create` | Interactive task creation |
| `/trekker-list` | List tasks with filters |
| `/trekker-show` | Show task details |
| `/trekker-ready` | Find unblocked work |
| `/trekker-start` | Begin working on a task |
| `/trekker-done` | Complete task with summary |
| `/trekker-blocked` | Mark task as blocked |
| `/trekker-epic` | Manage epics |
| `/trekker-comment` | Add comment to task |
| `/trekker-deps` | Manage dependencies |
| `/trekker-history` | View audit trail of changes |
| `/trekker-task-agent` | Run autonomous task agent |

### Workflow Skills

The plugin also installs workflow skills under `skills/` to provide general context and automation:

| Skill | Description |
|-------|-------------|
| `trekker` | Core workflow guide for task management |
| `planning` | Plan and track multi-step tasks before implementation |
| `task-sync` | Synchronize Trekker with Antigravity's built-in todo capabilities |
| `issue-tracking` | Suggest Trekker when user mentions issues, bugs, or tasks |
| `search` | Search-first workflow for finding existing tasks |
| `find-duplicates` | Detect duplicate tasks before creating new ones |
| `smart-query` | Intelligent task querying |

### Hooks (2 hooks)

The plugin includes hooks configured in `hooks.json` for context management and workflow automation. These utilize Python wrappers for native Windows/macOS/Linux compatibility:

- **PreInvocation**: Runs before the model is called on the first turn of a session. Invokes `hooks/session-start.py` to:
  - Show in-progress tasks with recent comments (resume context)
  - Show ready tasks if no work is in progress
  - Provide workflow reminders
- **Stop**: Runs when a task or subagent completes its execution loop. Invokes `hooks/task-completed.py` to:
  - Serve as a "Safety Gate": if the agent has active `in_progress` tasks, it injects a reminder to complete them.
  - Show next ready task to continue the workflow

## Usage

### Basic Workflow via CLI

```bash
# Create a task
trekker task create -t "Implement feature X" -p 1

# Start working
trekker task update TREK-1 -s in_progress

# Add progress notes
trekker comment add TREK-1 -a "antigravity" -c "Progress: completed step 1"

# Complete with summary
trekker comment add TREK-1 -a "antigravity" -c "Summary: implemented X in files A, B"
trekker task update TREK-1 -s completed
```

### Using Slash Command Skills

In Antigravity chat:

```
/trekker-ready          # Find tasks to work on
/trekker-start TREK-1   # Start a task
/trekker-done TREK-1    # Complete with summary
/trekker-history        # View recent changes
```

### Context Preservation

Before ending a session or when prompted by the PreCompact hook:

```bash
trekker comment add TREK-1 -a "antigravity" -c "Checkpoint: done X. Next: Y. Files: a.ts, b.ts"
```

## Project Structure

```
trekker-antigravity/
├── plugin.json               # Plugin metadata
├── mcp_config.json           # Standard MCP config
├── hooks.json                # Hook configuration schema
├── LICENSE                   # Project license
├── .gitignore                # Git ignore configuration
├── README.md                 # Project documentation
├── mcp-server/
│   ├── src/
│   │   ├── index.ts          # MCP server entry
│   │   ├── cli-runner.ts     # CLI execution utility
│   │   ├── types.ts          # TypeScript types
│   │   └── tools/            # MCP tool definitions (26 tools)
│   ├── package.json
│   └── tsconfig.json
├── skills/                   # Custom slash commands and workflow skills
│   ├── trekker/              # Core workflow skill
│   ├── planning/             # Multi-step task planning
│   ├── task-sync/            # Todo synchronization
│   ├── issue-tracking/       # Issue tracking suggestions
│   ├── search/               # Search-first workflow
│   ├── find-duplicates/      # Duplicate detection
│   ├── smart-query/          # Intelligent querying
│   ├── trekker-prime/        # Slash command skill: load context
│   └── ...                   # Other trekker-* slash command skills
├── hooks/
│   ├── session-start.sh      # SessionStart hook script
│   ├── pre-compact.sh        # PreCompact hook script
│   └── task-completed.sh     # Stop/SubagentStop hook script
```

## Development

```bash
# Clone the repository
git clone https://github.com/jhampson-dbre/trekker-antigravity.git
cd trekker-antigravity

# Build MCP server
cd mcp-server
pnpm install
pnpm build

# Watch mode for development
pnpm dev
```

## Troubleshooting

### Plugin not loading

1. Verify trekker CLI is installed: `trekker --version`
2. Check plugin is in correct location:
   - For global: `~/.gemini/config/plugins/trekker`
   - For workspace: `.agents/plugins/trekker`

### MCP tools not available

1. Verify plugin is installed in correct path
2. Check MCP server exists: `ls <plugin-root>/mcp-server/dist/index.js`
3. Restart Antigravity after installation

### Hooks not running

1. Ensure Python 3+ is installed and accessible in your PATH: `python --version`
2. Verify trekker is initialized in project: `ls .trekker`

## License

MIT
