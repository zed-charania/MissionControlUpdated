import { NextResponse } from 'next/server';
import { runOpenClaw } from '@/lib/openclaw/exec';

export async function GET() {
  try {
    const { stdout, stderr } = await runOpenClaw(['pairing', 'pending']);
    const combined = [stdout, stderr].filter(Boolean).join('\n');

    const hasPending = !combined.toLowerCase().includes('no pending');
    const entries = combined
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('─') && !line.toLowerCase().includes('no pending'))
      .map(line => line.trim());

    return NextResponse.json({
      ok: true,
      data: {
        hasPending,
        entries,
        count: entries.length,
        raw: combined,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown error' }, { status: 500 });
  }
}
