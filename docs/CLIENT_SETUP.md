# Client Setup (v1, local-only)

## Prereqs
- Node.js 20+
- OpenClaw installed and running locally

## Steps
1) Clone repo
2) Copy env
   - `cp templates/.env.example .env.local`
3) Run doctor
   - `./scripts/doctor.sh`
4) Install + run
   - `npm i`
   - `npm run dev`

## Expected
- Doctor reports OpenClaw reachable.
- Dashboard shows Gateway: reachable.

## Troubleshooting
- If gateway not reachable:
  - `openclaw gateway status`
  - open dashboard shown by `openclaw status` (usually `http://127.0.0.1:18789/`)
