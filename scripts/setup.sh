#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_EXAMPLE="templates/.env.example"
ENV_LOCAL=".env.local"
DATA_DIR_DEFAULT="./data"

say() { printf "%s\n" "$*"; }

port_in_use() {
  local port="$1"
  # lsof is present on macOS by default.
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

choose_port() {
  local start="${1:-3000}"
  local p="$start"
  while [[ "$p" -lt 3100 ]]; do
    if ! port_in_use "$p"; then
      echo "$p"
      return 0
    fi
    p=$((p+1))
  done
  say "ERROR: no free port found in range ${start}-3099"
  exit 1
}

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

# 2b) enforce loopback bind (secure default)
if ! grep -q '^MISSION_CONTROL_BIND=' "$ENV_LOCAL"; then
  printf '\nMISSION_CONTROL_BIND=127.0.0.1\n' >> "$ENV_LOCAL"
fi

# 2c) choose a free port if current/default is taken
CURRENT_PORT="${MISSION_CONTROL_PORT:-}"
if [[ -z "$CURRENT_PORT" ]]; then
  # try to read from .env.local if present
  CURRENT_PORT="$(grep '^MISSION_CONTROL_PORT=' "$ENV_LOCAL" | tail -n 1 | cut -d= -f2 || true)"
fi
CURRENT_PORT="${CURRENT_PORT:-3000}"

if port_in_use "$CURRENT_PORT"; then
  NEW_PORT="$(choose_port 3000)"
  # replace or append
  if grep -q '^MISSION_CONTROL_PORT=' "$ENV_LOCAL"; then
    # macOS sed -i needs backup suffix
    sed -i '' "s/^MISSION_CONTROL_PORT=.*/MISSION_CONTROL_PORT=${NEW_PORT}/" "$ENV_LOCAL"
  else
    printf '\nMISSION_CONTROL_PORT=%s\n' "$NEW_PORT" >> "$ENV_LOCAL"
  fi
  say "- port $CURRENT_PORT in use; set MISSION_CONTROL_PORT=$NEW_PORT in $ENV_LOCAL"
else
  say "- port available: $CURRENT_PORT"
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
PORT_OUT="$(grep '^MISSION_CONTROL_PORT=' "$ENV_LOCAL" | tail -n 1 | cut -d= -f2 || echo "${MISSION_CONTROL_PORT:-3000}")"
say "  open http://127.0.0.1:${PORT_OUT}"
