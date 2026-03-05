export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  capacity: number;
  attendees: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  date: string;
  location: string;
  capacity: number;
  attendees?: number;
  status?: EventStatus;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
