import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  CalendarDays,
  RefreshCw,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock4,
} from 'lucide-react';
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

  const upcomingCount = events.filter(e => e.status === EventStatus.UPCOMING).length;
  const ongoingCount = events.filter(e => e.status === EventStatus.ONGOING).length;
  const completedCount = events.filter(e => e.status === EventStatus.COMPLETED).length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient Header */}
      <header className="gradient-mesh sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Event Manager
              </h1>
              <p className="text-xs text-indigo-200">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-200 hidden sm:inline font-medium">
              {user?.name}
            </span>
            <Link to="/cms">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg"
              >
                <LayoutDashboard className="h-4 w-4" />
                CMS
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button
              onClick={openCreate}
              size="sm"
              className="bg-white text-violet-700 hover:bg-white/90 font-semibold rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: 'Upcoming',
              value: upcomingCount,
              icon: Clock4,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
            },
            {
              label: 'Ongoing',
              value: ongoingCount,
              icon: TrendingUp,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
            },
            {
              label: 'Completed',
              value: completedCount,
              icon: CheckCircle2,
              color: 'text-slate-600',
              bg: 'bg-slate-50',
              border: 'border-slate-200',
            },
            {
              label: 'Total Attendees',
              value: totalAttendees,
              icon: Users,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
              border: 'border-violet-100',
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-3`}
            >
              <div className={`h-10 w-10 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-48">
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as FilterStatus)}
            >
              <SelectTrigger className="bg-white rounded-xl border-slate-200">
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
            className="rounded-xl bg-white border-slate-200 text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-slate-500">{error}</p>
            <Button
              variant="outline"
              onClick={() => void fetchEvents()}
              className="rounded-xl"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                <CalendarDays className="h-10 w-10 text-violet-500" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center">
                <Plus className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">No events yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Create your first event to get started.
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="btn-primary-gradient rounded-xl px-6"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        )}

        {/* Events grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100">
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <span className="text-xl">🗑️</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Delete Event?</h3>
            <p className="text-sm text-slate-500 mt-1.5">
              &ldquo;{deleteTarget.title}&rdquo; will be permanently deleted.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(undefined)}
                disabled={deleting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-xl"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </div>
                ) : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
