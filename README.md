# OpenClaw Mission Control (Local)

Local-first dashboard for OpenClaw.

This repo is intended to be **cloneable by clients**. It runs on the client’s machine and connects to the client’s local OpenClaw installation.

## What this is
Mission Control provides a premium dark UI for:
- Tasks (Kanban)
- Content Pipeline
- Calendar
- Memory (search)
- Team (agents/roles)

Office (avatar/visual office) is intentionally excluded.

## Hard requirements (client machine)
- Node.js (20+ recommended)
- OpenClaw installed and on PATH (`openclaw` command works)
- OpenClaw Gateway running locally

## Quick start (client)
```bash
git clone https://github.com/zed-charania/MissionControlUpdated.git
cd MissionControlUpdated

./scripts/setup.sh
npm i
npm run dev
```

Open:
- http://localhost:3000

## How to verify it is “attached”
1) In the Mission Control UI, the **Overview** page should show:
- Gateway `running: true`
- A dashboard URL like `http://127.0.0.1:18789/`

2) The **Doctor** page should show `ok: true` for:
- `/api/health`
- `/api/openclaw/gateway-status`

If Gateway is not running, try:
```bash
openclaw gateway status
openclaw gateway start
```

## Notes for your OpenClaw agent (read this)
Mission Control is a **local dashboard** that mirrors your operating system.

Key facts:
- The Mission Control web UI runs on: `http://localhost:3000`
- It talks to OpenClaw via a **local adapter API** under: `/api/openclaw/*`
- The adapter is locked down to a **command allowlist** (no arbitrary exec).

Agent behavior expectation:
- Treat **Tasks** and **Calendar** as sources of truth for what to do next.
- Treat **Memory** as durable context (searchable notes).
- Use **Team** to understand who owns what.

## Architecture
- UI: Next.js (App Router)
- Local adapter: route handlers that shell out to a *whitelisted* set of `openclaw` CLI commands.

See: `docs/ARCHITECTURE.md`

## Safety
- Local-only by default.
- No hosted/multi-tenant mode in v1.
- No Office module.
- No arbitrary command execution.

## Troubleshooting
- Run doctor:
  ```bash
  ./scripts/doctor.sh
  ```
- Verify OpenClaw:
  ```bash
  openclaw status
  openclaw gateway status
  ```
