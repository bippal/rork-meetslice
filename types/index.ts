export interface User {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  organizerId: string;
  code: string;
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  role: 'organizer' | 'guest';
}

export interface TimeSlot {
  id: string;
  eventId: string;
  userId: string;
  date: string;
  timeBlock: string;
  isAvailable: boolean;
}

export type AvailabilityMode = 'available' | 'unavailable';
export type OverlapType = 'all-free' | 'all-busy';
