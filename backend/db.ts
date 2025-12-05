import type { Event, EventParticipant, TimeSlot, Notification, User } from '@/types';

interface Database {
  events: Map<string, Event>;
  participants: Map<string, EventParticipant>;
  timeSlots: Map<string, TimeSlot>;
  notifications: Map<string, Notification>;
  users: Map<string, User>;
  eventsByCode: Map<string, string>;
}

const db: Database = {
  events: new Map(),
  participants: new Map(),
  timeSlots: new Map(),
  notifications: new Map(),
  users: new Map(),
  eventsByCode: new Map(),
};

export default db;
