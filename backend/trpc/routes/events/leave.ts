import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';
import type { Notification } from '@/types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default publicProcedure
  .input(
    z.object({
      eventId: z.string(),
      userId: z.string(),
      userName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const event = db.events.get(input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId === input.userId) {
      throw new Error('Organizer cannot leave event');
    }

    Array.from(db.participants.values())
      .filter((p) => p.eventId === input.eventId && p.userId === input.userId)
      .forEach((p) => db.participants.delete(p.id));

    Array.from(db.timeSlots.values())
      .filter((ts) => ts.eventId === input.eventId && ts.userId === input.userId)
      .forEach((ts) => db.timeSlots.delete(ts.id));

    const notification: Notification = {
      id: generateId(),
      eventId: input.eventId,
      eventName: event.name,
      userId: input.userId,
      userName: input.userName,
      type: 'left',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    db.notifications.set(notification.id, notification);

    return { success: true };
  });
