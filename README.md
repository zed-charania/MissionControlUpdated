# OpenClaw Mission Control (Local)

Local-first dashboard for OpenClaw.

## Goals (v1)
- Run locally on the same machine as the OpenClaw Gateway.
- Provide a client-cloneable repo with an intuitive “attach” experience.
- Ship the core modules from the reference design **excluding Office**:
  - Tasks (Kanban)
  - Content Pipeline
  - Calendar
  - Memory (search)
  - Team (agent management)

## Non-goals (v1)
- Hosted / multi-tenant SaaS.
- Remote access over the public internet.
- The “Office” visual avatar floorplan module.

## Architecture (recommended)
- UI: Next.js (App Router)
- Local adapter: Node server that exposes a safe JSON API and shells out to a *whitelisted* set of `openclaw` CLI commands.
  - This avoids coupling to undocumented internal gateway APIs.
  - Everything stays on localhost.

See: `docs/ARCHITECTURE.md`

## Quick start (planned)
1. `cp templates/.env.example .env.local`
2. `./scripts/doctor.sh`
3. `npm i`
4. `npm run dev`

## Status
Scaffolded. Use Cursor to implement per the specs in `docs/`.
