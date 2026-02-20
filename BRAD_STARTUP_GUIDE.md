# Mission Control + OpenClaw (Mac mini) Startup Guide

This guide is written so you can copy/paste commands into Terminal.

## What you are setting up
- **OpenClaw**: local agent runtime + Gateway.
- **Mission Control**: local dashboard app that stores Tasks/Content/Team and can **Dispatch** a task to your OpenClaw agent.
- Everything is **local-only** (binds to 127.0.0.1).

---

## 0) Quick health check (run these first)

### Check Node and npm
OpenClaw requires Node >= 22.12.0.

```
node -v
npm -v
which node
```

If `node -v` is below 22.12.0, install or upgrade Node (see section 1).

### Check OpenClaw and Gateway
```
openclaw --version
openclaw gateway status
```

If the Gateway is not running:
```
openclaw gateway start
openclaw gateway status
```

---

## 1) Install or upgrade dependencies (macOS)

### Install Xcode Command Line Tools (needed for native modules)
```
xcode-select -p
```
If it errors, install:
```
xcode-select --install
```

### Install Homebrew (only if missing)
```
brew --version
```
If missing, install Homebrew and reopen Terminal.

### Install Git + Node (recommended Node via Homebrew)
```
brew update
brew install git node
```

Verify:
```
git --version
node -v
npm -v
```

---

## 2) Get Mission Control onto the machine

### Clone the repo
If the repo is public:
```
cd ~
git clone https://github.com/zed-charania/MissionControlUpdated.git
cd MissionControlUpdated
```

If the repo is private and you have access, easiest is GitHub CLI:
```
brew install gh

gh auth login

gh repo clone zed-charania/MissionControlUpdated
cd MissionControlUpdated
```

---

## 3) Start Mission Control

### Run setup (creates .env.local, creates data dir, runs doctor)
```
cd ~/MissionControlUpdated
./scripts/setup.sh
```

### Install dependencies
```
npm i
```

### Start the server
```
npm run dev
```

Open the URL shown in the terminal output (usually `http://127.0.0.1:3000`).

---

## 4) Using the dashboard (what to click)

### Operations tab
- Confirms Mission Control is healthy.
- Confirms OpenClaw Gateway is reachable.

### Tasks tab
- Create tasks and move them between columns.
- Click **Dispatch** on a task to send it to OpenClaw.
  - Dispatch has a cooldown to prevent spam.

### Marketing tab
- Placeholder that links to Content Pipeline.

### Research tab
- Placeholder that links to Memory.

---

## 5) OpenClaw useful commands (beginner list)

### General status
```
openclaw status
openclaw gateway status
openclaw health
```

### Logs
```
openclaw logs
openclaw logs --follow
```

### Security audit
```
openclaw security audit
openclaw security audit --deep
```

### Cron (scheduled jobs)
```
openclaw cron list
openclaw cron runs <jobId>
openclaw cron run <jobId>
```

---

## 6) Common problems and fixes

### A) OpenClaw says Node version too old
Fix by upgrading Node (section 1) and ensure the new Node is first in PATH:
```
which -a node
node -v
```

### B) Mission Control shows “Unauthorized / gateway token missing”
OpenClaw’s Control UI requires a token.

1) Find the OpenClaw dashboard URL:
```
openclaw status
```
2) Open the dashboard (example: `http://127.0.0.1:18789/`)
3) In **Settings**, copy the Gateway token and set it where the UI asks.

### C) Mission Control throws a Next.js ENOENT about .next/server/*.js
This is a local dev cache issue. Fix:
1) Stop the dev server (Ctrl+C)
2) Delete `.next`
3) Restart

Commands:
```
cd ~/MissionControlUpdated
rm -rf .next
npm run dev
```

---

## 7) Stop Mission Control
In the terminal where it is running:
- Press Ctrl+C

---

## 8) Uninstall (optional)
Remove the folder:
```
cd ~
rm -rf MissionControlUpdated
```
