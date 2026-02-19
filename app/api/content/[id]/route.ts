import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const VALID_STATUSES = ['ideas', 'draft', 'review', 'scheduled', 'published'] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    const existing = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'content item not found' }, { status: 404 });
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
      UPDATE content_items SET title = ?, notes = ?, status = ?, owner = ?, scheduled_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      body.title?.trim() ?? ex.title,
      body.notes !== undefined ? (body.notes?.trim() || null) : ex.notes,
      body.status ?? ex.status,
      body.owner !== undefined ? (body.owner?.trim() || null) : ex.owner,
      body.scheduledAt !== undefined ? (body.scheduledAt || null) : ex.scheduled_at,
      now,
      id,
    );

    const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'content item not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM content_items WHERE id = ?').run(id);
    return NextResponse.json({ ok: true, data: { id } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
