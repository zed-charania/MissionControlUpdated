import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'team member not found' }, { status: 404 });
    }

    if (body.name !== undefined && (!body.name || typeof body.name !== 'string' || !body.name.trim())) {
      return NextResponse.json({ ok: false, error: 'name cannot be empty' }, { status: 400 });
    }
    if (body.role !== undefined && (!body.role || typeof body.role !== 'string' || !body.role.trim())) {
      return NextResponse.json({ ok: false, error: 'role cannot be empty' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const ex = existing as any;
    db.prepare(`
      UPDATE team_members SET name = ?, role = ?, responsibilities = ?, updated_at = ?
      WHERE id = ?
    `).run(
      body.name?.trim() ?? ex.name,
      body.role?.trim() ?? ex.role,
      body.responsibilities !== undefined ? (body.responsibilities?.trim() || null) : ex.responsibilities,
      now,
      id,
    );

    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    return NextResponse.json({ ok: true, data: member });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'team member not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM team_members WHERE id = ?').run(id);
    return NextResponse.json({ ok: true, data: { id } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
