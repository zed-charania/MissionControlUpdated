'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ApiResp<T> = { ok: boolean; data?: T; error?: string };

type GatewayStatus = {
  bind: string | null;
  port: number | null;
  dashboardUrl: string | null;
  listening: string | null;
  running: boolean;
  raw: string;
};

export default function OperationsPage() {
  const [health, setHealth] = useState<ApiResp<{ now: string }> | null>(null);
  const [gateway, setGateway] = useState<ApiResp<GatewayStatus> | null>(null);
  const [ocStatus, setOcStatus] = useState<ApiResp<any> | null>(null);
  const [cron, setCron] = useState<ApiResp<any> | null>(null);
  const [pairing, setPairing] = useState<ApiResp<any> | null>(null);

  useEffect(() => {
    const load = async () => {
      const [h, g, s, c, p] = await Promise.all([
        fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).catch((e) => ({ ok: false, error: String(e) })),
        fetch('/api/openclaw/gateway-status', { cache: 'no-store' }).then(r => r.json()).catch((e) => ({ ok: false, error: String(e) })),
        fetch('/api/openclaw/status', { cache: 'no-store' }).then(r => r.json()).catch((e) => ({ ok: false, error: String(e) })),
        fetch('/api/openclaw/cron/jobs', { cache: 'no-store' }).then(r => r.json()).catch((e) => ({ ok: false, error: String(e) })),
        fetch('/api/openclaw/pairing/pending', { cache: 'no-store' }).then(r => r.json()).catch((e) => ({ ok: false, error: String(e) })),
      ]);
      setHealth(h);
      setGateway(g);
      setOcStatus(s);
      setCron(c);
      setPairing(p);
    };

    load();
  }, []);

  const gatewayOk = Boolean(gateway?.ok && gateway.data?.running);

  const ocRaw = useMemo(() => {
    const raw = ocStatus?.data?.raw ?? ocStatus?.data?.text ?? null;
    if (typeof raw === 'string') return raw;
    return null;
  }, [ocStatus]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Operations</h1>
          <div className="text-sm text-gray-400">
            System health, OpenClaw connectivity, and operational controls.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link className="btn-ghost" href="/doctor">Doctor</Link>
          <Link className="btn-ghost" href="/tasks">Tasks</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="badge">
              <span className={`dot ${gatewayOk ? 'dot-ok' : 'dot-bad'}`} />
              <span>Gateway</span>
            </div>
            {gateway?.data?.dashboardUrl ? (
              <a className="text-xs text-gray-400 hover:text-gray-200" href={gateway.data.dashboardUrl} target="_blank" rel="noreferrer">
                open dashboard
              </a>
            ) : null}
          </div>

          <div className="mt-3 text-sm text-gray-300">
            {gateway?.ok ? (
              <div className="space-y-1">
                <div><span className="text-gray-500">running</span>: {String(gateway.data?.running)}</div>
                <div><span className="text-gray-500">bind</span>: {gateway.data?.bind ?? 'unknown'}</div>
                <div><span className="text-gray-500">port</span>: {gateway.data?.port ?? 'unknown'}</div>
              </div>
            ) : (
              <div className="text-gray-400">{gateway?.error ?? 'not available'}</div>
            )}
          </div>

          {!gatewayOk ? (
            <div className="mt-3 text-xs text-gray-500">
              Fix:
              <div className="mt-1 font-mono">openclaw gateway status</div>
              <div className="font-mono">openclaw gateway start</div>
            </div>
          ) : null}
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div className="badge">
              <span className={`dot ${health?.ok ? 'dot-ok' : 'dot-bad'}`} />
              <span>Mission Control</span>
            </div>
            <div className="text-xs text-gray-500">
              {health?.ok ? health.data?.now : 'unhealthy'}
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-300">
            Local-only. Default bind: <span className="font-mono">127.0.0.1</span>
          </div>

          <div className="mt-3 flex gap-2">
            <Link className="btn-secondary" href="/content">Marketing</Link>
            <Link className="btn-secondary" href="/memory">Research</Link>
          </div>
        </div>

        <div className="card">
          <div className="badge">
            <span className="dot" />
            <span>Cron</span>
          </div>
          <div className="mt-3 text-sm text-gray-300">
            {cron?.ok ? (
              <div className="text-gray-400">
                {(cron.data?.jobs?.length ?? cron.data?.length ?? 0) === 0
                  ? 'No cron jobs detected.'
                  : 'Cron jobs present.'}
              </div>
            ) : (
              <div className="text-gray-500">{cron?.error ?? 'not available'}</div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Tip: keep reminders local and loopback-only.
          </div>
        </div>

        <div className="card">
          <div className="badge">
            <span className="dot" />
            <span>Pairing</span>
          </div>
          <div className="mt-3 text-sm text-gray-300">
            {pairing?.ok ? (
              <div className="text-gray-400">
                {(pairing.data?.pending?.length ?? pairing.data?.length ?? 0) === 0
                  ? 'No pending pairing requests.'
                  : 'Pairing requests pending.'}
              </div>
            ) : (
              <div className="text-gray-500">{pairing?.error ?? 'not available'}</div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Approve pairing via CLI if needed.
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <div className="badge">
            <span className="dot" />
            <span>OpenClaw status (raw)</span>
          </div>
          <span className="text-xs text-gray-500">for debugging and support</span>
        </div>

        <pre className="mt-3 text-xs text-gray-300 whitespace-pre-wrap font-mono">
          {ocRaw ?? (ocStatus?.ok ? JSON.stringify(ocStatus?.data ?? {}, null, 2) : (ocStatus?.error ?? 'not available'))}
        </pre>
      </div>
    </div>
  );
}
