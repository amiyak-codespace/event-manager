import { format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Pencil,
  Trash2,
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Status bar */}
      <div
        className={`h-1 w-full ${
          event.status === EventStatus.UPCOMING
            ? 'bg-blue-400'
            : event.status === EventStatus.ONGOING
              ? 'bg-emerald-400'
              : event.status === EventStatus.COMPLETED
                ? 'bg-slate-300'
                : 'bg-red-400'
        }`}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 flex-1">
            {event.title}
          </h3>
          <Badge variant={STATUS_VARIANTS[event.status]}>
            {STATUS_LABELS[event.status]}
          </Badge>
        </div>

        {event.description && (
          <p className="text-sm text-slate-500 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{format(new Date(event.date), 'PPP · p')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              {event.attendees} / {event.capacity} attendees
            </span>
          </div>
        </div>

        {/* Capacity bar */}
        {event.capacity > 0 && (
          <div className="mt-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Capacity</span>
              <span>{occupancy}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  occupancy >= 100
                    ? 'bg-red-400'
                    : occupancy >= 75
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(occupancy, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(event)}
          className="text-slate-600"
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(event)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}
