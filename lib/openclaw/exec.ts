import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Whitelist of allowed CLI invocations.
const ALLOW: Array<{ cmd: string; argsPrefix: string[] }> = [
  { cmd: 'openclaw', argsPrefix: ['status'] },
  { cmd: 'openclaw', argsPrefix: ['gateway', 'status'] },
  { cmd: 'openclaw', argsPrefix: ['cron', 'list'] },
  { cmd: 'openclaw', argsPrefix: ['pairing', 'pending'] },
  // Used by Mission Control "Dispatch" to wake the agent via system events.
  { cmd: 'openclaw', argsPrefix: ['system', 'event'] },
  // (Optional) direct agent runs via CLI. Keep disabled until needed.
  // { cmd: 'openclaw', argsPrefix: ['agent'] },
];

function isAllowed(cmd: string, args: string[]) {
  return ALLOW.some((rule) => rule.cmd === cmd && rule.argsPrefix.every((a, i) => args[i] === a));
}

export async function runOpenClaw(args: string[]) {
  if (!isAllowed('openclaw', args)) {
    throw new Error(`Command not allowed: openclaw ${args.join(' ')}`);
  }

  const { stdout, stderr } = await execFileAsync('openclaw', args, {
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
  });

  return { stdout: stdout?.toString() ?? '', stderr: stderr?.toString() ?? '' };
}
