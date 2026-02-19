import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const VALID_STATUSES = ['backlog', 'in_progress', 'blocked', 'done'] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'task not found' }, { status: 404 });
    }

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ ok: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    if (body.title !== undefined && (!body.title || typeof body.title !== 'string' || !body.title.trim())) {
      return NextResponse.json({ ok: false, error: 'title cannot be empty' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const ex = existing as any;
    db.prepare(`
      UPDATE tasks SET title = ?, description = ?, status = ?, owner = ?, due_date = ?, updated_at = ?
      WHERE id = ?
    `).run(
      body.title?.trim() ?? ex.title,
      body.description !== undefined ? (body.description?.trim() || null) : ex.description,
      body.status ?? ex.status,
      body.owner !== undefined ? (body.owner?.trim() || null) : ex.owner,
      body.dueDate !== undefined ? (body.dueDate || null) : ex.due_date,
      now,
      id,
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: task });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'task not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return NextResponse.json({ ok: true, data: { id } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
