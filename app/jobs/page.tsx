'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

interface Job {
  id: string;
  title: string;
  description: string | null;
  budget: string | null;
  client_info: string | null;
  source_url: string | null;
  fit_score: number;
  complexity: number;
  recommended_package: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const COLUMNS = [
  { key: 'new', label: 'New', color: 'bg-gray-500' },
  { key: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
  { key: 'pursuing', label: 'Pursuing', color: 'bg-purple-500' },
  { key: 'proposed', label: 'Proposed', color: 'bg-amber-500' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500' },
  { key: 'lost', label: 'Lost', color: 'bg-red-500' },
] as const;

const PACKAGES = ['A', 'B', 'C', 'D'] as const;

function scoreBadge(score: number) {
  if (score >= 70) return 'bg-emerald-500/20 text-emerald-300';
  if (score >= 50) return 'bg-amber-500/20 text-amber-300';
  return 'bg-gray-500/20 text-gray-400';
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/jobs').then(r => r.json()).catch(() => ({ ok: false, data: [] }));
    if (res.ok) setJobs(res.data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeJobs = jobs.filter(j => !['won', 'lost', 'skipped'].includes(j.status));
  const wonJobs = jobs.filter(j => j.status === 'won');
  const totalPipelineValue = activeJobs.reduce((sum, j) => {
    const num = parseInt(j.budget?.replace(/[^0-9]/g, '') ?? '0', 10);
    return sum + (Number.isFinite(num) ? num : 0);
  }, 0);

  const moveJob = async (id: string, status: string) => {
    await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const deleteJob = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    load();
  };

  const createDelivery = async (job: Job) => {
    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        title: job.title,
        clientName: job.client_info || null,
      }),
    }).then(r => r.json());
    if (res.ok) router.push('/deliveries');
  };

  const approveAndDraft = async (job: Job) => {
    const res = await fetch(`/api/jobs/${job.id}/approve`, { method: 'POST' }).then(r => r.json());
    if (!res?.ok) return;

    const draftText = [
      res.data?.draft?.coverLetter || '',
      '',
      'Suggested Q&A:',
      ...(res.data?.draft?.qa || []).map((x: any, i: number) => `${i + 1}. ${x.q}\n${x.a}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(draftText);
    } catch {}

    if (job.source_url) window.open(job.source_url, '_blank', 'noopener,noreferrer');
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0">Jobs Pipeline</h1>
          <div className="flex items-center gap-6 mt-2">
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-white">{activeJobs.length}</span>{' '}
              <span className="text-xs text-gray-500">Active</span>
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-emerald-400">{wonJobs.length}</span>{' '}
              <span className="text-xs text-gray-500">Won</span>
            </div>
            {totalPipelineValue > 0 && (
              <div className="text-sm text-gray-400">
                <span className="font-semibold text-white">${totalPipelineValue.toLocaleString()}</span>{' '}
                <span className="text-xs text-gray-500">Pipeline</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">+ Add Job</button>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {COLUMNS.map(col => {
          const colJobs = jobs.filter(j => j.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-xs font-medium text-gray-200">{col.label}</span>
                <span className="text-xs text-gray-500">{colJobs.length}</span>
              </div>
              <div className="flex flex-col gap-2 min-h-[120px]">
                {colJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onMove={moveJob}
                    onEdit={() => { setEditing(job); setModalOpen(true); }}
                    onDelete={() => deleteJob(job.id)}
                    onApprove={job.status === 'qualified' ? () => approveAndDraft(job) : undefined}
                    onCreateDelivery={job.status === 'won' ? () => createDelivery(job) : undefined}
                  />
                ))}
                {colJobs.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/[0.06] p-3 text-center text-xs text-gray-500">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <JobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        job={editing}
        onSaved={load}
      />
    </div>
  );
}

function JobCard({
  job,
  onMove,
  onEdit,
  onDelete,
  onApprove,
  onCreateDelivery,
}: {
  job: Job;
  onMove: (id: string, status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  onCreateDelivery?: () => void;
}) {
  const otherStatuses = COLUMNS.filter(c => c.key !== job.status);

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between gap-1">
        <h3
          className="text-xs font-medium text-gray-200 cursor-pointer hover:text-white line-clamp-2"
          onClick={onEdit}
        >
          {job.title}
        </h3>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${scoreBadge(job.fit_score)}`}>
          {job.fit_score}
        </span>
        {job.budget && (
          <span className="text-[10px] text-emerald-400">{job.budget}</span>
        )}
        {job.recommended_package && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
            Pkg {job.recommended_package}
          </span>
        )}
      </div>

      {job.source_url && (
        <a
          href={job.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 text-[10px] text-blue-400 hover:text-blue-300 block truncate"
        >
          View on Upwork
        </a>
      )}

      {onApprove && (
        <button
          onClick={onApprove}
          className="mt-2 w-full text-[10px] py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors font-medium"
        >
          Approve & Draft Application
        </button>
      )}

      {onCreateDelivery && (
        <button
          onClick={onCreateDelivery}
          className="mt-2 w-full text-[10px] py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-medium"
        >
          Create Delivery &rarr;
        </button>
      )}

      <div className="mt-2">
        <select
          className="select text-[10px] py-0.5 px-1.5 w-full"
          value=""
          onChange={(e) => { if (e.target.value) onMove(job.id, e.target.value); }}
        >
          <option value="">Move to...</option>
          {otherStatuses.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
          <option value="skipped">Skip</option>
        </select>
      </div>
    </div>
  );
}

function JobModal({
  open,
  onClose,
  job,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [clientInfo, setClientInfo] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [fitScore, setFitScore] = useState(0);
  const [complexity, setComplexity] = useState(3);
  const [recommendedPackage, setRecommendedPackage] = useState('');
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDescription(job.description ?? '');
      setBudget(job.budget ?? '');
      setClientInfo(job.client_info ?? '');
      setSourceUrl(job.source_url ?? '');
      setFitScore(job.fit_score);
      setComplexity(job.complexity);
      setRecommendedPackage(job.recommended_package ?? '');
      setStatus(job.status);
      setNotes(job.notes ?? '');
    } else {
      setTitle(''); setDescription(''); setBudget(''); setClientInfo('');
      setSourceUrl(''); setFitScore(0); setComplexity(3);
      setRecommendedPackage(''); setStatus('new'); setNotes('');
    }
  }, [job, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    const payload = {
      title, description, budget, clientInfo, sourceUrl,
      fitScore, complexity,
      recommendedPackage: recommendedPackage || null,
      status, notes,
    };

    if (job) {
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    onClose();
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title={job ? 'Edit Job' : 'Add Job'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[60px]" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Budget</label>
            <input className="input" value={budget} onChange={e => setBudget(e.target.value)} placeholder="$1,500" />
          </div>
          <div>
            <label className="label">Source URL</label>
            <input className="input" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://upwork.com/..." />
          </div>
        </div>
        <div>
          <label className="label">Client Info</label>
          <input className="input" value={clientInfo} onChange={e => setClientInfo(e.target.value)} placeholder="Rating, spend history, location" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Fit Score (0-100)</label>
            <input type="number" min={0} max={100} className="input" value={fitScore} onChange={e => setFitScore(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Complexity (1-5)</label>
            <input type="number" min={1} max={5} className="input" value={complexity} onChange={e => setComplexity(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Package</label>
            <select className="select" value={recommendedPackage} onChange={e => setRecommendedPackage(e.target.value)}>
              <option value="">None</option>
              {PACKAGES.map(p => <option key={p} value={p}>Package {p}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
              {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[60px]" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : job ? 'Update' : 'Add Job'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
