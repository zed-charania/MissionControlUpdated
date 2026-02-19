# Cursor Prompts (copy/paste)

## Global instruction
You are implementing a local-only Mission Control dashboard for OpenClaw.
- Stack: Next.js (App Router) + TypeScript.
- Add a safe local adapter API under `/api/openclaw/*` that shells out to whitelisted `openclaw` CLI commands.
- Never allow arbitrary command execution.
- Exclude the Office module.

## Prompt 1: Scaffold pages + nav
Create pages and a sidebar nav for:
- Overview (/)
- Tasks (/tasks)
- Content (/content)
- Calendar (/calendar)
- Memory (/memory)
- Team (/team)
- Doctor (/doctor)

## Prompt 2: Implement adapter endpoint
Implement:
- GET /api/health
- GET /api/openclaw/gateway-status -> executes `openclaw gateway status` and returns parsed fields: bind, port, dashboardUrl, running.

## Prompt 3: Doctor page
Doctor page calls /api/health and /api/openclaw/gateway-status and shows:
- Gateway reachable + dashboard URL
- If not reachable: show exact fix commands.

## Prompt 4: Tasks Kanban (local persistence)
Implement a Kanban board with columns: Backlog, In Progress, Blocked, Done.
- CRUD tasks
- Assign owner (string)
- Due date
Persist to local SQLite or a JSON file in `data/`.

## Prompt 5: Content Pipeline
Pipeline columns: Ideas, Draft, Review, Scheduled, Published.
Persist locally. Link items to tasks optionally.

## Prompt 6: Calendar
Calendar view with list of scheduled items from Tasks + Content.

## Prompt 7: Memory
Memory page supports search over:
- `MEMORY.md`
- daily notes under `../memory/` (relative to workspace root when running in that context)
If file access is too complex for sandbox, stub with local persistence first.

## Prompt 8: Team
Team page manages agents/roles/responsibilities and assignments to tasks.
