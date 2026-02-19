'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/Modal';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  owner: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  name: string;
}

const COLUMNS = [
  { key: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { key: 'blocked', label: 'Blocked', color: 'bg-amber-500' },
  { key: 'done', label: 'Done', color: 'bg-green-500' },
] as const;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = useCallback(async () => {
    const [tasksRes, teamRes] = await Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/team').then(r => r.json()).catch(() => ({ ok: false, data: [] })),
    ]);
    if (tasksRes.ok) setTasks(tasksRes.data);
    if (teamRes.ok) setTeam(teamRes.data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completionPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const moveTask = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    load();
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (task: Task) => { setEditing(task); setModalOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0">Tasks</h1>
          <div className="flex items-center gap-6 mt-2">
            {COLUMNS.map(col => (
              <div key={col.key} className="flex items-center gap-2 text-sm text-gray-400">
                <span className={`h-2 w-2 rounded-full ${col.color}`} />
                <span>{tasks.filter(t => t.status === col.key).length}</span>
                <span className="text-gray-500 text-xs">{col.label}</span>
              </div>
            ))}
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-white">{total}</span>{' '}
              <span className="text-xs text-gray-500">Total</span>
              <span className="ml-3 font-semibold text-white">{completionPct}%</span>{' '}
              <span className="text-xs text-gray-500">Done</span>
            </div>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">+ New task</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-medium text-gray-200">{col.label}</span>
                <span className="text-xs text-gray-500">{colTasks.length}</span>
              </div>
              <div className="flex flex-col gap-2 min-h-[120px]">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    team={team}
                    onMove={moveTask}
                    onEdit={() => openEdit(task)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/[0.06] p-4 text-center text-xs text-gray-500">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editing}
        team={team}
        onSaved={load}
      />
    </div>
  );
}

function TaskCard({
  task,
  team,
  onMove,
  onEdit,
  onDelete,
}: {
  task: Task;
  team: TeamMember[];
  onMove: (id: string, status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const otherStatuses = COLUMNS.filter(c => c.key !== task.status);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);

  const dispatch = async () => {
    setDispatching(true);
    setDispatchMsg(null);
    try {
      const res = await fetch('/api/openclaw/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      }).then(r => r.json());

      if (!res.ok) {
        setDispatchMsg(res.error || 'Dispatch failed');
      } else {
        setDispatchMsg('Dispatched');
      }
    } catch (e: any) {
      setDispatchMsg(String(e));
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between gap-2">
        <h3
          className="text-sm font-medium text-gray-200 cursor-pointer hover:text-white"
          onClick={onEdit}
        >
          {task.title}
        </h3>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity"
        >
          ✕
        </button>
      </div>
      {task.description && (
        <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {task.owner && (
            <span className="badge text-[10px]">{task.owner}</span>
          )}
          {task.due_date && (
            <span className="text-[10px] text-gray-500">
              Due {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <button
          onClick={dispatch}
          disabled={dispatching}
          className="btn-secondary text-[11px] py-1 px-2"
          title="Dispatch to OpenClaw agent"
        >
          {dispatching ? 'Dispatching…' : 'Dispatch'}
        </button>
      </div>

      {dispatchMsg && (
        <div className="mt-2 text-[11px] text-gray-400">
          {dispatchMsg}
        </div>
      )}

      <div className="mt-2">
        <select
          className="select text-[11px] py-1 px-2"
          value=""
          onChange={(e) => { if (e.target.value) onMove(task.id, e.target.value); }}
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

function TaskModal({
  open,
  onClose,
  task,
  team,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  team: TeamMember[];
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('backlog');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setOwner(task.owner ?? '');
      setDueDate(task.due_date ?? '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('backlog');
      setOwner('');
      setDueDate('');
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    const payload = { title, description, status, owner: owner || null, dueDate: dueDate || null };

    if (task) {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/tasks', {
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
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} />
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
            <select className="select" value={owner} onChange={e => setOwner(e.target.value)}>
              <option value="">Unassigned</option>
              {team.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : task ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
