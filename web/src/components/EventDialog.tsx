import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { EventForm } from './EventForm';
import type { Event, CreateEventPayload } from '../types/event';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
  onSubmit: (data: CreateEventPayload) => Promise<void>;
  isLoading?: boolean;
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  onSubmit,
  isLoading,
}: EventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {event
              ? 'Update the details of this event.'
              : 'Fill in the details below to create a new event.'}
          </DialogDescription>
        </DialogHeader>
        <EventForm
          initialData={event}
          onSubmit={async (data: CreateEventPayload) => {
            await onSubmit(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
