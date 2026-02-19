#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_EXAMPLE="templates/.env.example"
ENV_LOCAL=".env.local"
DATA_DIR_DEFAULT="./data"

say() { printf "%s\n" "$*"; }

say "Mission Control Setup (local-only)"

# 1) prereqs
if ! command -v node >/dev/null 2>&1; then
  say "ERROR: node not found. Install Node.js 20+ and re-run."
  exit 1
fi
say "- node: $(node -v)"

if ! command -v openclaw >/dev/null 2>&1; then
  say "WARN: openclaw not found on PATH."
  say "      Install OpenClaw first, then re-run: https://docs.openclaw.ai"
else
  say "- openclaw: $(openclaw --version 2>/dev/null || true)"
fi

# 2) .env.local
if [[ ! -f "$ENV_LOCAL" ]]; then
  if [[ ! -f "$ENV_EXAMPLE" ]]; then
    say "ERROR: missing $ENV_EXAMPLE"
    exit 1
  fi
  cp "$ENV_EXAMPLE" "$ENV_LOCAL"
  say "- created $ENV_LOCAL"
else
  say "- found $ENV_LOCAL"
fi

# 3) data dir
DATA_DIR="${MISSION_CONTROL_DATA_DIR:-$DATA_DIR_DEFAULT}"
mkdir -p "$DATA_DIR"
say "- ensured data dir: $DATA_DIR"

# 4) doctor
say ""
say "Running doctor..."
if bash scripts/doctor.sh; then
  true
else
  say "Doctor reported issues. Fix those, then re-run setup."
fi

say ""
say "Next:"
say "  npm i"
say "  npm run dev"
say "  open http://localhost:${MISSION_CONTROL_PORT:-3000}"
