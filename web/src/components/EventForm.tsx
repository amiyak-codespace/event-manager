import { useState } from 'react';
import { format } from 'date-fns';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Event, CreateEventPayload } from '../types/event';
import { EventStatus } from '../types/event';

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: CreateEventPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function toLocalDatetimeValue(iso: string): string {
  // Reason: datetime-local input requires YYYY-MM-DDTHH:mm format without TZ.
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
}

export function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [date, setDate] = useState(
    initialData?.date ? toLocalDatetimeValue(initialData.date) : '',
  );
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [capacity, setCapacity] = useState(
    initialData?.capacity?.toString() ?? '0',
  );
  const [attendees, setAttendees] = useState(
    initialData?.attendees?.toString() ?? '0',
  );
  const [status, setStatus] = useState<EventStatus>(
    initialData?.status ?? EventStatus.UPCOMING,
  );
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !date || !location.trim()) {
      setError('Title, date, and location are required.');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        location: location.trim(),
        capacity: parseInt(capacity, 10) || 0,
        attendees: parseInt(attendees, 10) || 0,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional event description…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date & Time *</Label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as EventStatus)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EventStatus.UPCOMING}>Upcoming</SelectItem>
              <SelectItem value={EventStatus.ONGOING}>Ongoing</SelectItem>
              <SelectItem value={EventStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={EventStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="Venue or address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={300}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min={0}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="attendees">Attendees</Label>
          <Input
            id="attendees"
            type="number"
            min={0}
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : initialData ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}
