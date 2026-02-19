'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/Modal';

interface CalendarItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  source: 'task' | 'content' | 'event';
  meta: Record<string, any>;
}

const SOURCE_STYLES: Record<string, { label: string; color: string; dot: string }> = {
  task: { label: 'Task', color: 'text-blue-400', dot: 'bg-blue-400' },
  content: { label: 'Content', color: 'text-purple-400', dot: 'bg-purple-400' },
  event: { label: 'Event', color: 'text-amber-400', dot: 'bg-amber-400' },
};

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeTime(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr + 'T00:00:00');
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;
  if (diffDays < 30) return `in ${Math.ceil(diffDays / 7)} weeks`;
  return `in ${Math.ceil(diffDays / 30)} months`;
}

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/calendar?days=30').then(r => r.json());
    if (res.ok) setItems(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    const key = item.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();
  const today = new Date().toISOString().slice(0, 10);
  const twoDaysOut = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const nextUp = items.filter(i => i.date >= today && i.date <= twoDaysOut);

  const deleteEvent = async (id: string) => {
    await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Calendar</h1>
          <p className="text-sm text-gray-500">Upcoming items from tasks, content, and events</p>
        </div>
        <button onClick={() => { setEditEvent(null); setModalOpen(true); }} className="btn-primary">
          + New event
        </button>
      </div>

      {nextUp.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Next Up</h2>
          <div className="flex flex-col gap-2">
            {nextUp.map(item => {
              const style = SOURCE_STYLES[item.source];
              return (
                <div key={`${item.source}-${item.id}`} className="card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <span className="text-sm text-gray-200">{item.title}</span>
                    <span className={`text-xs ${style.color}`}>{style.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{relativeTime(item.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {sortedDates.length === 0 && (
          <div className="card text-center text-sm text-gray-500 py-8">
            No upcoming items in the next 30 days.
          </div>
        )}
        {sortedDates.map(date => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-300">{formatDateHeader(date)}</h3>
              {date === today && (
                <span className="text-[10px] font-medium bg-accent/20 text-accent px-2 py-0.5 rounded-full">Today</span>
              )}
              <div className="flex-1 border-t border-white/[0.06]" />
            </div>
            <div className="flex flex-col gap-2">
              {grouped[date].map(item => {
                const style = SOURCE_STYLES[item.source];
                return (
                  <div key={`${item.source}-${item.id}`} className="card-hover flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                      <span className="text-sm text-gray-200">{item.title}</span>
                      <span className={`badge text-[10px] ${style.color}`}>{style.label}</span>
                      {item.time && <span className="text-xs text-gray-500">{item.time}</span>}
                      {item.meta?.owner && <span className="text-xs text-gray-500">{item.meta.owner}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{relativeTime(date)}</span>
                      {item.source === 'event' && (
                        <button
                          onClick={() => deleteEvent(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editEvent}
        onSaved={load}
      />
    </div>
  );
}

function EventModal({
  open,
  onClose,
  event,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  event: any;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title ?? '');
      setDescription(event.description ?? '');
      setEventDate(event.event_date ?? '');
      setEventTime(event.event_time ?? '');
    } else {
      setTitle('');
      setDescription('');
      setEventDate('');
      setEventTime('');
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;
    setSaving(true);

    const payload = { title, description, eventDate, eventTime: eventTime || null };

    if (event) {
      await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: event.id }),
      });
    } else {
      await fetch('/api/calendar', {
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
    <Modal open={open} onClose={onClose} title={event ? 'Edit Event' : 'New Event'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label className="label">Date</label>
            <input type="date" className="input" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">Time (optional)</label>
            <input type="time" className="input" value={eventTime} onChange={e => setEventTime(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : event ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
