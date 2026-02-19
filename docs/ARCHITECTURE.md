# Architecture (v1)

## Local-only topology
- Mission Control UI runs on `http://127.0.0.1:<port>`.
- A local adapter API runs in-process with the Next.js server (or as a small companion server).
- Adapter talks to OpenClaw via the `openclaw` CLI.

Rationale:
- Stable for client clones.
- No need to handle gateway websocket/auth nuances in v1.
- Easy to lock down to a safe command allowlist.

## Adapter API contract (v1)
All endpoints return JSON with `{ ok: boolean, data?: any, error?: string }`.

### Health
- `GET /api/health`

### OpenClaw status
- `GET /api/openclaw/status` (wraps `openclaw status --json` if supported, else parses text)
- `GET /api/openclaw/gateway-status`

### Sessions
- `GET /api/openclaw/sessions`

### Cron
- `GET /api/openclaw/cron/jobs`
- `POST /api/openclaw/cron/reminder`
  - body: `{ text: string, when: string|number, tz?: string }`

## Safety
- No arbitrary shell execution.
- Adapter validates inputs.
- Adapter uses a fixed allowlist of CLI subcommands.

## UI modules (excluding Office)
- Tasks (Kanban)
- Content Pipeline (idea -> draft -> review -> scheduled -> published)
- Calendar (month/week + list)
- Memory (search + item detail)
- Team (agents/roles + assignments)

Data storage (v1):
- Local JSON in `./data/` or SQLite (better) to persist tasks/content/calendar/team.
- OpenClaw Memory is read from `workspace/MEMORY.md` + `workspace/memory/` via OpenClaw memory tools later; v1 can be simple local store + search.
