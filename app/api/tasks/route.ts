import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const VALID_STATUSES = ['backlog', 'in_progress', 'blocked', 'done'] as const;

export async function GET() {
  try {
    const db = getDb();
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    return NextResponse.json({ ok: true, data: tasks });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status, owner, dueDate } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 });
    }

    const taskStatus = status ?? 'backlog';
    if (!VALID_STATUSES.includes(taskStatus)) {
      return NextResponse.json({ ok: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const db = getDb();
    db.prepare(`
      INSERT INTO tasks (id, title, description, status, owner, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title.trim(), description?.trim() || null, taskStatus, owner?.trim() || null, dueDate || null, now, now);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: task }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
