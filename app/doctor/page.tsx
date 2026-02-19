'use client';

import { useEffect, useState } from 'react';

export default function DoctorPage() {
  const [health, setHealth] = useState<any>(null);
  const [gw, setGw] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const h = await fetch('/api/health', { cache: 'no-store' }).then((r) => r.json());
      setHealth(h);
      const g = await fetch('/api/openclaw/gateway-status', { cache: 'no-store' }).then((r) => r.json());
      setGw(g);
    })().catch((e) => {
      setHealth({ ok: false, error: String(e) });
    });
  }, []);

  return (
    <div>
      <h1 className="page-title">Doctor</h1>

      <div className="card mb-3">
        <div className="badge">
          <span className={`dot ${health?.ok ? 'dot-ok' : 'dot-bad'}`} />
          <span>Mission Control</span>
        </div>
        <pre className="mt-3 font-mono text-xs text-gray-300">{JSON.stringify(health, null, 2)}</pre>
      </div>

      <div className="card">
        <div className="badge">
          <span className={`dot ${gw?.ok && gw?.data?.running ? 'dot-ok' : 'dot-bad'}`} />
          <span>OpenClaw Gateway</span>
        </div>
        <pre className="mt-3 font-mono text-xs text-gray-300">{JSON.stringify(gw, null, 2)}</pre>
        {gw?.ok && gw?.data?.dashboardUrl && (
          <div className="mt-3 font-mono text-xs">
            Dashboard:{' '}
            <a href={gw.data.dashboardUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              {gw.data.dashboardUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
