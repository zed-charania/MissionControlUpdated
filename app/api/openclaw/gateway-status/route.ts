import { NextResponse } from 'next/server';
import { runOpenClaw } from '@/lib/openclaw/exec';

function parseGatewayStatus(text: string) {
  const bind = text.match(/Gateway: bind=([^,\n]+)/)?.[1]?.trim();
  const port = Number(text.match(/port=(\d+)/)?.[1] ?? NaN);
  const dashboardUrl = text.match(/Dashboard:\s*(https?:\/\/\S+)/)?.[1]?.trim();
  const listening = text.match(/Listening:\s*([^\n]+)/)?.[1]?.trim();
  const running = /Runtime:\s*running\b/.test(text);

  return {
    bind: bind ?? null,
    port: Number.isFinite(port) ? port : null,
    dashboardUrl: dashboardUrl ?? null,
    listening: listening ?? null,
    running,
    raw: text,
  };
}

export async function GET() {
  try {
    const { stdout, stderr } = await runOpenClaw(['gateway', 'status']);
    const combined = [stdout, stderr].filter(Boolean).join('\n');
    return NextResponse.json({ ok: true, data: parseGatewayStatus(combined) });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown error' }, { status: 500 });
  }
}
