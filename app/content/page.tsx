'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/Modal';

interface ContentItem {
  id: string;
  title: string;
  notes: string | null;
  status: string;
  owner: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

const COLUMNS = [
  { key: 'ideas', label: 'Ideas', accent: 'text-purple-400', dot: 'bg-purple-400' },
  { key: 'draft', label: 'Draft', accent: 'text-blue-400', dot: 'bg-blue-400' },
  { key: 'review', label: 'Review', accent: 'text-amber-400', dot: 'bg-amber-400' },
  { key: 'scheduled', label: 'Scheduled', accent: 'text-cyan-400', dot: 'bg-cyan-400' },
  { key: 'published', label: 'Published', accent: 'text-green-400', dot: 'bg-green-400' },
] as const;

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [addToStatus, setAddToStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/content').then(r => r.json());
    if (res.ok) setItems(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const moveItem = async (id: string, status: string) => {
    await fetch(`/api/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/content/${id}`, { method: 'DELETE' });
    load();
  };

  const openCreate = (status?: string) => {
    setEditing(null);
    setAddToStatus(status ?? null);
    setModalOpen(true);
  };
  const openEdit = (item: ContentItem) => {
    setEditing(item);
    setAddToStatus(null);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title mb-1">Content Pipeline</h1>
        <p className="text-sm text-gray-500">Ideas → Draft → Review → Scheduled → Published</p>
      </div>

      <div className="flex items-center gap-6 mb-6">
        {COLUMNS.map(col => {
          const count = items.filter(i => i.status === col.key).length;
          return (
            <div key={col.key} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className={`text-xs font-medium ${col.accent}`}>{col.label}</span>
              <span className="text-lg font-semibold text-white">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {COLUMNS.map(col => {
          const colItems = items.filter(i => i.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                  <span className={`text-sm font-medium ${col.accent}`}>{col.label}</span>
                </div>
                <button
                  onClick={() => openCreate(col.key)}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-col gap-2 min-h-[120px]">
                {colItems.map(item => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onMove={moveItem}
                    onEdit={() => openEdit(item)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
                {colItems.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/[0.06] p-4 text-center text-xs text-gray-500">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editing}
        defaultStatus={addToStatus}
        onSaved={load}
      />
    </div>
  );
}

function ContentCard({
  item,
  onMove,
  onEdit,
  onDelete,
}: {
  item: ContentItem;
  onMove: (id: string, status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const otherStatuses = COLUMNS.filter(c => c.key !== item.status);

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between gap-2">
        <h3
          className="text-sm font-medium text-gray-200 cursor-pointer hover:text-white"
          onClick={onEdit}
        >
          {item.title}
        </h3>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity"
        >
          ✕
        </button>
      </div>
      {item.notes && (
        <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{item.notes}</p>
      )}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {item.owner && <span className="badge text-[10px]">{item.owner}</span>}
        {item.scheduled_at && (
          <span className="text-[10px] text-gray-500">
            {new Date(item.scheduled_at).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="mt-2">
        <select
          className="select text-[11px] py-1 px-2"
          value=""
          onChange={(e) => { if (e.target.value) onMove(item.id, e.target.value); }}
        >
          <option value="">Move to...</option>
          {otherStatuses.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ContentModal({
  open,
  onClose,
  item,
  defaultStatus,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  item: ContentItem | null;
  defaultStatus: string | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('ideas');
  const [owner, setOwner] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setNotes(item.notes ?? '');
      setStatus(item.status);
      setOwner(item.owner ?? '');
      setScheduledAt(item.scheduled_at ?? '');
    } else {
      setTitle('');
      setNotes('');
      setStatus(defaultStatus ?? 'ideas');
      setOwner('');
      setScheduledAt('');
    }
  }, [item, open, defaultStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    const payload = { title, notes, status, owner: owner || null, scheduledAt: scheduledAt || null };

    if (item) {
      await fetch(`/api/content/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/content', {
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
    <Modal open={open} onClose={onClose} title={item ? 'Edit Content' : 'New Content'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[80px]" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
              {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Owner</label>
            <input className="input" value={owner} onChange={e => setOwner(e.target.value)} placeholder="Unassigned" />
          </div>
        </div>
        <div>
          <label className="label">Scheduled Date</label>
          <input type="date" className="input" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
