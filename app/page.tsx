'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [gateway, setGateway] = useState<any>(null);

  useEffect(() => {
    fetch('/api/openclaw/gateway-status', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setGateway)
      .catch((e) => setGateway({ ok: false, error: String(e) }));
  }, []);

  const data = gateway?.data;
  const ok = gateway?.ok && data?.running;

  return (
    <div>
      <h1 className="page-title">Overview</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="badge">
            <span className={`dot ${ok ? 'dot-ok' : 'dot-bad'}`} />
            <span>Gateway</span>
          </div>
          <div className="mt-3 font-mono text-xs text-gray-300 leading-relaxed">
            {gateway?.ok ? (
              <div>
                running: {String(data.running)}
                <br />
                bind: {data.bind ?? 'unknown'}
                <br />
                port: {data.port ?? 'unknown'}
                <br />
                dashboard: {data.dashboardUrl ?? 'unknown'}
              </div>
            ) : (
              <div>
                not available
                <br />
                error: {gateway?.error ?? 'unknown'}
              </div>
            )}
          </div>
          {!ok && (
            <div className="mt-3 font-mono text-xs text-gray-400">
              Fix:
              <br />
              openclaw gateway status
              <br />
              openclaw status
            </div>
          )}
        </div>

        <div className="card">
          <div className="badge">
            <span className="dot" />
            <span>Modules</span>
          </div>
          <div className="mt-3 text-sm text-gray-300">
            Tasks, Content, Calendar, Memory, Team.
            <br />
            <span className="text-gray-500">Office excluded.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
