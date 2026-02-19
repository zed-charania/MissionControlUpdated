import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div>
      <h1 className="page-title mb-1">Marketing</h1>
      <div className="text-sm text-gray-400 mb-6">
        Placeholder tab (Phase 1). Routes into Content Pipeline.
      </div>

      <div className="card">
        <div className="text-sm text-gray-300">
          Use <span className="font-mono">Content</span> to track ideas, drafts, reviews, scheduling, and publishing.
        </div>
        <div className="mt-4 flex gap-2">
          <Link className="btn-primary" href="/content">Open Content Pipeline</Link>
          <Link className="btn-ghost" href="/tasks">Open Tasks</Link>
        </div>
      </div>
    </div>
  );
}
