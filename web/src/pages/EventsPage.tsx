import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarDays, RefreshCw, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventCard } from '../components/EventCard';
import { EventDialog } from '../components/EventDialog';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { eventsApi } from '../lib/api';
import type { Event, CreateEventPayload } from '../types/event';
import { EventStatus } from '../types/event';

type FilterStatus = 'ALL' | EventStatus;

export function EventsPage() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Event | undefined>();
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventsApi.list(
        filterStatus !== 'ALL' ? filterStatus : undefined,
      );
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  async function handleSave(payload: CreateEventPayload) {
    setSaving(true);
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, payload);
      } else {
        await eventsApi.create(payload);
      }
      await fetchEvents();
    } finally {
      setSaving(false);
      setEditingEvent(undefined);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eventsApi.remove(deleteTarget.id);
      await fetchEvents();
    } finally {
      setDeleting(false);
      setDeleteTarget(undefined);
    }
  }

  function openCreate() {
    setEditingEvent(undefined);
    setDialogOpen(true);
  }

  function openEdit(event: Event) {
    setEditingEvent(event);
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Event Manager
              </h1>
              <p className="text-xs text-slate-500">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">{user?.name}</span>
            <Link to="/cms">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="h-4 w-4" />
                CMS
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-44">
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as FilterStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={EventStatus.UPCOMING}>Upcoming</SelectItem>
                <SelectItem value={EventStatus.ONGOING}>Ongoing</SelectItem>
                <SelectItem value={EventStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={EventStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void fetchEvents()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 bg-white rounded-xl border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-slate-500">{error}</p>
            <Button variant="outline" onClick={() => void fetchEvents()}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <CalendarDays className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-700">No events yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Create your first event to get started.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit dialog */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEvent(undefined);
        }}
        event={editingEvent}
        onSubmit={handleSave}
        isLoading={saving}
      />

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-slate-900 text-lg">
              Delete Event?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              &ldquo;{deleteTarget.title}&rdquo; will be permanently deleted.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(undefined)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
