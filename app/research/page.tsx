import Link from 'next/link';

export default function ResearchPage() {
  return (
    <div>
      <h1 className="page-title mb-1">Research</h1>
      <div className="text-sm text-gray-400 mb-6">
        Placeholder tab (Phase 1). Routes into Memory.
      </div>

      <div className="card">
        <div className="text-sm text-gray-300">
          Use <span className="font-mono">Memory</span> to search notes and context.
        </div>
        <div className="mt-4 flex gap-2">
          <Link className="btn-primary" href="/memory">Open Memory</Link>
          <Link className="btn-ghost" href="/tasks">Open Tasks</Link>
        </div>
      </div>
    </div>
  );
}
