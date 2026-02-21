import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { buildOpenClawProposal } from '@/lib/proposals/upwork';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as any;
    if (!job) {
      return NextResponse.json({ ok: false, error: 'job not found' }, { status: 404 });
    }

    const draft = buildOpenClawProposal({
      title: job.title,
      description: job.description,
      budget: job.budget,
      client_info: job.client_info,
      recommended_package: job.recommended_package,
    });

    const noteBlock = `\n\n---\nAUTO DRAFT (Approve)\n\nCover Letter:\n${draft.coverLetter}\n\nSuggested Q&A:\n${draft.qa.map((x, i) => `${i + 1}. ${x.q}\n${x.a}`).join('\n\n')}\n---`;

    const now = new Date().toISOString();
    db.prepare('UPDATE jobs SET status = ?, notes = ?, updated_at = ? WHERE id = ?').run(
      'pursuing',
      (job.notes || '') + noteBlock,
      now,
      id,
    );

    const updated = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);

    return NextResponse.json({
      ok: true,
      data: {
        job: updated,
        draft,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
