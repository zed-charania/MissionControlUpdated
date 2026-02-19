'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/Modal';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  responsibilities: string | null;
  created_at: string;
  updated_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  'chief of staff': 'bg-purple-500/20 text-purple-300',
  'engineer': 'bg-blue-500/20 text-blue-300',
  'designer': 'bg-pink-500/20 text-pink-300',
  'writer': 'bg-green-500/20 text-green-300',
  'analyst': 'bg-amber-500/20 text-amber-300',
  'manager': 'bg-cyan-500/20 text-cyan-300',
};

function getRoleColor(role: string) {
  const lower = role.toLowerCase();
  for (const [key, val] of Object.entries(ROLE_COLORS)) {
    if (lower.includes(key)) return val;
  }
  return 'bg-gray-500/20 text-gray-300';
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/team').then(r => r.json());
    if (res.ok) setMembers(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteMember = async (id: string) => {
    await fetch(`/api/team/${id}`, { method: 'DELETE' });
    load();
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setModalOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="page-title mb-0">Meet the Team</h1>
        <button onClick={openCreate} className="btn-primary">+ Add member</button>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        {members.length} member{members.length !== 1 ? 's' : ''}, each with a role and responsibilities.
      </p>

      {members.length === 0 ? (
        <div className="card text-center text-sm text-gray-500 py-8">
          No team members yet. Add your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className="card-hover group flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-semibold text-gray-300">
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-semibold text-white cursor-pointer hover:text-accent"
                    onClick={() => openEdit(m)}
                  >
                    {m.name}
                  </h3>
                  <p className="text-xs text-gray-400">{m.role}</p>
                </div>
                <button
                  onClick={() => deleteMember(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity"
                >
                  ✕
                </button>
              </div>
              {m.responsibilities && (
                <p className="mt-3 text-xs text-gray-400 line-clamp-3">{m.responsibilities}</p>
              )}
              <div className="mt-3">
                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${getRoleColor(m.role)}`}>
                  {m.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <TeamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        member={editing}
        onSaved={load}
      />
    </div>
  );
}

function TeamModal({
  open,
  onClose,
  member,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRole(member.role);
      setResponsibilities(member.responsibilities ?? '');
    } else {
      setName('');
      setRole('');
      setResponsibilities('');
    }
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    setSaving(true);

    const payload = { name, role, responsibilities };

    if (member) {
      await fetch(`/api/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/team', {
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
    <Modal open={open} onClose={onClose} title={member ? 'Edit Member' : 'New Member'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input" value={role} onChange={e => setRole(e.target.value)} required placeholder="e.g. Engineer, Writer, Analyst" />
        </div>
        <div>
          <label className="label">Responsibilities</label>
          <textarea className="input min-h-[80px]" value={responsibilities} onChange={e => setResponsibilities(e.target.value)} placeholder="What does this team member do?" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : member ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
