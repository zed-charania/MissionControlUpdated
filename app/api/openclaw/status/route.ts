import { NextResponse } from 'next/server';
import { runOpenClaw } from '@/lib/openclaw/exec';

export async function GET() {
  try {
    const { stdout, stderr } = await runOpenClaw(['status']);
    const combined = [stdout, stderr].filter(Boolean).join('\n');

    const version = combined.match(/Version:\s*([^\n]+)/)?.[1]?.trim() ?? null;
    const gateway = combined.match(/Gateway:\s*([^\n]+)/)?.[1]?.trim() ?? null;
    const agents = combined.match(/Agents:\s*([^\n]+)/)?.[1]?.trim() ?? null;

    return NextResponse.json({
      ok: true,
      data: {
        version,
        gateway,
        agents,
        raw: combined,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown error' }, { status: 500 });
  }
}
