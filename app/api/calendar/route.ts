import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const days = Number(req.nextUrl.searchParams.get('days') || '30');
    const now = new Date();
    const end = new Date(now.getTime() + days * 86400000);
    const startStr = now.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const tasks = (db.prepare(
      'SELECT id, title, owner, due_date, status FROM tasks WHERE due_date IS NOT NULL AND due_date >= ? AND due_date <= ? ORDER BY due_date'
    ).all(startStr, endStr) as any[]).map(t => ({
      id: t.id,
      title: t.title,
      date: t.due_date,
      source: 'task' as const,
      meta: { owner: t.owner, status: t.status },
    }));

    const content = (db.prepare(
      'SELECT id, title, owner, scheduled_at, status FROM content_items WHERE scheduled_at IS NOT NULL AND scheduled_at >= ? AND scheduled_at <= ? ORDER BY scheduled_at'
    ).all(startStr, endStr) as any[]).map(c => ({
      id: c.id,
      title: c.title,
      date: c.scheduled_at,
      source: 'content' as const,
      meta: { owner: c.owner, status: c.status },
    }));

    const events = (db.prepare(
      'SELECT * FROM calendar_events WHERE event_date >= ? AND event_date <= ? ORDER BY event_date, event_time'
    ).all(startStr, endStr) as any[]).map(e => ({
      id: e.id,
      title: e.title,
      date: e.event_date,
      time: e.event_time,
      source: 'event' as const,
      meta: { description: e.description },
    }));

    const all = [...tasks, ...content, ...events].sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ ok: true, data: all });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, eventDate, eventTime } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 });
    }
    if (!eventDate) {
      return NextResponse.json({ ok: false, error: 'eventDate is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const db = getDb();

    db.prepare(`
      INSERT INTO calendar_events (id, title, description, event_date, event_time, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title.trim(), description?.trim() || null, eventDate, eventTime || null, now, now);

    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: event }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, eventDate, eventTime } = body;

    if (!id) return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });

    const db = getDb();
    const existing = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id) as any;
    if (!existing) return NextResponse.json({ ok: false, error: 'event not found' }, { status: 404 });

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE calendar_events SET title = ?, description = ?, event_date = ?, event_time = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title?.trim() ?? existing.title,
      description !== undefined ? (description?.trim() || null) : existing.description,
      eventDate ?? existing.event_date,
      eventTime !== undefined ? (eventTime || null) : existing.event_time,
      now,
      id,
    );

    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: event });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });

    const db = getDb();
    const existing = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
    if (!existing) return NextResponse.json({ ok: false, error: 'event not found' }, { status: 404 });

    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
    return NextResponse.json({ ok: true, data: { id } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
