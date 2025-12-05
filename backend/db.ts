import type { Event, EventParticipant, TimeSlot, Notification, User } from '@/types';
import fs from 'fs';
import path from 'path';

interface DatabaseData {
  events: Record<string, Event>;
  participants: Record<string, EventParticipant>;
  timeSlots: Record<string, TimeSlot>;
  notifications: Record<string, Notification>;
  users: Record<string, User>;
  eventsByCode: Record<string, string>;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadDatabase(): DatabaseData {
  ensureDataDir();
  
  if (!fs.existsSync(DB_FILE_PATH)) {
    return {
      events: {},
      participants: {},
      timeSlots: {},
      notifications: {},
      users: {},
      eventsByCode: {},
    };
  }

  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      events: {},
      participants: {},
      timeSlots: {},
      notifications: {},
      users: {},
      eventsByCode: {},
    };
  }
}

function saveDatabase(data: DatabaseData) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function createMapProxy<T>(target: Record<string, T>, saveFn: () => void) {
  return new Proxy(new Map<string, T>(Object.entries(target)), {
    get(mapTarget, prop) {
      const original = Reflect.get(mapTarget, prop);
      
      if (typeof original === 'function') {
        return function (this: Map<string, T>, ...args: unknown[]) {
          const result = original.apply(this, args);
          
          if (['set', 'delete', 'clear'].includes(String(prop))) {
            saveFn();
          }
          
          return result;
        };
      }
      
      return original;
    },
  });
}

let dbData = loadDatabase();

function saveAll() {
  dbData = {
    events: Object.fromEntries(db.events.entries()),
    participants: Object.fromEntries(db.participants.entries()),
    timeSlots: Object.fromEntries(db.timeSlots.entries()),
    notifications: Object.fromEntries(db.notifications.entries()),
    users: Object.fromEntries(db.users.entries()),
    eventsByCode: Object.fromEntries(db.eventsByCode.entries()),
  };
  saveDatabase(dbData);
}

interface Database {
  events: Map<string, Event>;
  participants: Map<string, EventParticipant>;
  timeSlots: Map<string, TimeSlot>;
  notifications: Map<string, Notification>;
  users: Map<string, User>;
  eventsByCode: Map<string, string>;
}

const db: Database = {
  events: createMapProxy(dbData.events, saveAll),
  participants: createMapProxy(dbData.participants, saveAll),
  timeSlots: createMapProxy(dbData.timeSlots, saveAll),
  notifications: createMapProxy(dbData.notifications, saveAll),
  users: createMapProxy(dbData.users, saveAll),
  eventsByCode: createMapProxy(dbData.eventsByCode, saveAll),
};

export default db;
