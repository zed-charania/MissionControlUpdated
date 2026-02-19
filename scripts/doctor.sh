#!/usr/bin/env bash
set -euo pipefail

echo "Mission Control Doctor"
echo "- node: $(node -v 2>/dev/null || echo 'missing')"
echo "- openclaw: $(command -v openclaw >/dev/null && openclaw --version || echo 'missing')"

echo
if command -v openclaw >/dev/null; then
  echo "[openclaw status]"
  openclaw status || true
  echo
  echo "[openclaw gateway status]"
  openclaw gateway status || true
else
  echo "OpenClaw missing. Install OpenClaw first."
fi
