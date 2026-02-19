import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const VALID_STATUSES = ['ideas', 'draft', 'review', 'scheduled', 'published'] as const;

export async function GET() {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM content_items ORDER BY created_at DESC').all();
    return NextResponse.json({ ok: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, notes, status, owner, scheduledAt } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 });
    }

    const itemStatus = status ?? 'ideas';
    if (!VALID_STATUSES.includes(itemStatus)) {
      return NextResponse.json({ ok: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const db = getDb();
    db.prepare(`
      INSERT INTO content_items (id, title, notes, status, owner, scheduled_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title.trim(), notes?.trim() || null, itemStatus, owner?.trim() || null, scheduledAt || null, now, now);

    const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
