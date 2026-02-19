import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const members = db.prepare('SELECT * FROM team_members ORDER BY created_at ASC').all();
    return NextResponse.json({ ok: true, data: members });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, responsibilities } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ ok: false, error: 'name is required' }, { status: 400 });
    }
    if (!role || typeof role !== 'string' || !role.trim()) {
      return NextResponse.json({ ok: false, error: 'role is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const db = getDb();

    db.prepare(`
      INSERT INTO team_members (id, name, role, responsibilities, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), role.trim(), responsibilities?.trim() || null, now, now);

    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: member }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
