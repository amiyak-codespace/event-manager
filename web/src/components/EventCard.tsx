import { format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { Event } from '../types/event';
import { EventStatus } from '../types/event';

const STATUS_LABELS: Record<EventStatus, string> = {
  [EventStatus.UPCOMING]: 'Upcoming',
  [EventStatus.ONGOING]: 'Ongoing',
  [EventStatus.COMPLETED]: 'Completed',
  [EventStatus.CANCELLED]: 'Cancelled',
};

const STATUS_VARIANTS: Record<
  EventStatus,
  'upcoming' | 'ongoing' | 'completed' | 'cancelled'
> = {
  [EventStatus.UPCOMING]: 'upcoming',
  [EventStatus.ONGOING]: 'ongoing',
  [EventStatus.COMPLETED]: 'completed',
  [EventStatus.CANCELLED]: 'cancelled',
};

const STATUS_GRADIENT: Record<EventStatus, string> = {
  [EventStatus.UPCOMING]: 'from-blue-500 to-cyan-500',
  [EventStatus.ONGOING]: 'from-emerald-500 to-teal-500',
  [EventStatus.COMPLETED]: 'from-slate-400 to-slate-500',
  [EventStatus.CANCELLED]: 'from-red-400 to-rose-500',
};

const STATUS_BG: Record<EventStatus, string> = {
  [EventStatus.UPCOMING]: 'bg-blue-50',
  [EventStatus.ONGOING]: 'bg-emerald-50',
  [EventStatus.COMPLETED]: 'bg-slate-50',
  [EventStatus.CANCELLED]: 'bg-red-50',
};

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const occupancy =
    event.capacity > 0
      ? Math.round((event.attendees / event.capacity) * 100)
      : 0;

  const isFull = occupancy >= 100;
  const isAlmostFull = occupancy >= 75 && !isFull;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm card-hover overflow-hidden flex flex-col">
      {/* Gradient header strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${STATUS_GRADIENT[event.status]}`} />

      <div className="p-5 flex flex-col gap-3.5 flex-1">
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 flex-1">
            {event.title}
          </h3>
          <Badge variant={STATUS_VARIANTS[event.status]} className="shrink-0">
            {STATUS_LABELS[event.status]}
          </Badge>
        </div>

        {event.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Meta info */}
        <div className={`rounded-xl p-3 space-y-2 ${STATUS_BG[event.status]}`}>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-medium">{format(new Date(event.date), 'MMM d, yyyy')}</span>
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
            <span className="text-slate-500">{format(new Date(event.date), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              <span className="font-medium">{event.attendees}</span>
              <span className="text-slate-400"> / {event.capacity} attendees</span>
            </span>
            {isFull && (
              <span className="ml-auto text-xs font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                Full
              </span>
            )}
            {isAlmostFull && (
              <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                Almost full
              </span>
            )}
          </div>
        </div>

        {/* Capacity progress bar */}
        {event.capacity > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Capacity</span>
              <span className={isFull ? 'text-red-500 font-medium' : isAlmostFull ? 'text-amber-500 font-medium' : ''}>{occupancy}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                  isFull
                    ? 'from-red-400 to-red-500'
                    : isAlmostFull
                      ? 'from-amber-400 to-orange-400'
                      : 'from-emerald-400 to-teal-400'
                }`}
                style={{ width: `${Math.min(occupancy, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="px-5 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(event)}
          className="text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(event)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
