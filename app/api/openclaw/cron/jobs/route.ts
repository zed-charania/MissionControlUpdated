import { NextResponse } from 'next/server';
import { runOpenClaw } from '@/lib/openclaw/exec';

export async function GET() {
  try {
    const { stdout, stderr } = await runOpenClaw(['cron', 'list']);
    const combined = [stdout, stderr].filter(Boolean).join('\n');

    const jobs = combined
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('─') && !line.toLowerCase().includes('no cron'))
      .map(line => {
        const parts = line.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
        return { raw: line.trim(), parts };
      });

    return NextResponse.json({
      ok: true,
      data: {
        jobs,
        count: jobs.length,
        raw: combined,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown error' }, { status: 500 });
  }
}
