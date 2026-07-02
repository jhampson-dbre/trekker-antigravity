---
name: task-sync
description: Synchronize Trekker with Antigravity's built-in task.md. Trekker is the source of truth.
---

# Task Synchronization: Trekker is Primary

**CRITICAL: Trekker is the PRIMARY task tracker. task.md is secondary.**

Trekker persists across sessions in SQLite. task.md only lives within a conversation context.
When they conflict, Trekker wins.

## The Rule

```
Trekker = Source of Truth (survives context resets)
task.md = Session Mirror (conversation-scoped only)
```

## Automatic Sync Behavior

### When Starting a Session

1. Read Trekker state first: `trekker --toon task list --status todo,in_progress`
2. Populate task.md from Trekker tasks:
   Write task.md with details of outstanding tasks: `- [ ] TREK-n: [Title] (Priority)`
3. Never trust task.md from previous sessions - always refresh from Trekker

### When Creating Tasks

1. Create in Trekker FIRST:
   `trekker task create -t "Title" -d "Description"`
2. THEN mirror to task.md:
   Add task entry to task.md: `- [ ] TREK-n: Title`

### When Updating Tasks

1. Update Trekker FIRST:
   `trekker task update TREK-n -s in_progress`
2. THEN update task.md:
   Modify entry status: `- [/] TREK-n: Title`

### When Completing Tasks

1. Add summary comment to Trekker:
   `trekker comment add TREK-n -a "agent" -c "Summary: ..."`
2. Mark complete in Trekker:
   `trekker task update TREK-n -s completed`
3. Mark complete in task.md:
   Modify entry status: `- [x] TREK-n: Title`
