import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { runOpenClaw } from '@/lib/openclaw/exec';

function buildDispatchPrompt(task: any) {
  const parts = [
    'Mission Control task dispatch.',
    '',
    `Task: ${task.title}`,
    task.description ? `Description: ${task.description}` : null,
    task.owner ? `Owner: ${task.owner}` : null,
    task.due_date ? `Due: ${task.due_date}` : null,
    `Status: ${task.status}`,
    '',
    'Instructions:',
    '- Acknowledge the task.',
    '- Ask 1-3 clarifying questions only if truly required.',
    '- Propose a concrete next action and any artifact you will produce.',
  ].filter(Boolean);
  return parts.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const taskId = body?.taskId;

    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json({ ok: false, error: 'taskId is required' }, { status: 400 });
    }

    const sessionId = typeof body?.sessionId === 'string' && body.sessionId.trim()
      ? body.sessionId.trim()
      : null;

    // Default to the main agent id when dispatching.
    const agentId = typeof body?.agentId === 'string' && body.agentId.trim() ? body.agentId.trim() : 'main';
    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
    if (!task) {
      return NextResponse.json({ ok: false, error: 'task not found' }, { status: 404 });
    }

    const requestText = buildDispatchPrompt(task);

    // v1 dispatch mechanism: enqueue a system event to wake the main agent.
    // This keeps everything local-only and avoids channel delivery.
    const args = ['system', 'event', '--mode', 'now', '--expect-final', '--json', '--text', requestText];

    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;

    try {
      const res = await runOpenClaw(args);
      stdout = res.stdout;
      stderr = res.stderr;
      exitCode = 0;
    } catch (e: any) {
      // runOpenClaw throws on not allowed, but also may throw on exec errors.
      stderr = (e?.message ? String(e.message) : String(e)) + (e?.stderr ? `\n${e.stderr}` : '');
      stdout = e?.stdout ? String(e.stdout) : '';
      exitCode = typeof e?.code === 'number' ? e.code : 1;
    }

    // Update task status to in_progress when dispatched.
    const now = new Date().toISOString();
    if (task.status === 'backlog') {
      db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?').run('in_progress', now, taskId);
    }

    const dispatchId = crypto.randomUUID();
    let responseJson: any = null;
    const combined = [stdout, stderr].filter(Boolean).join('\n');
    try {
      // CLI may print non-JSON lines; parse only if stdout is clean JSON.
      responseJson = stdout && stdout.trim().startsWith('{') ? JSON.parse(stdout) : null;
    } catch {
      responseJson = null;
    }

    db.prepare(`
      INSERT INTO task_dispatches (id, task_id, session_id, agent_id, request_text, response_json, response_text, exit_code, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      dispatchId,
      taskId,
      sessionId ?? 'default',
      agentId,
      requestText,
      responseJson ? JSON.stringify(responseJson) : null,
      combined,
      exitCode,
      now,
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

    return NextResponse.json({
      ok: exitCode === 0,
      data: {
        dispatchId,
        task: updatedTask,
        sessionId,
        agentId,
        exitCode,
        responseJson,
        responseText: combined,
      },
      error: exitCode === 0 ? undefined : 'dispatch failed',
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
