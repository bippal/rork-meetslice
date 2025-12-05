import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';
import type { EventParticipant, Notification } from '@/types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default publicProcedure
  .input(
    z.object({
      code: z.string(),
      userId: z.string(),
      userName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const eventId = db.eventsByCode.get(input.code);
    if (!eventId) {
      throw new Error('Event not found');
    }

    const event = db.events.get(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const alreadyParticipant = Array.from(db.participants.values()).some(
      (p) => p.eventId === eventId && p.userId === input.userId
    );

    if (alreadyParticipant) {
      return { event, alreadyJoined: true };
    }

    if (event.isBurnerLink && event.burnerUsesLeft !== undefined) {
      if (event.burnerUsesLeft <= 0) {
        throw new Error('This invite link has expired');
      }

      event.burnerUsesLeft -= 1;
      event.lastActivity = new Date().toISOString();
      db.events.set(eventId, event);
    } else {
      event.lastActivity = new Date().toISOString();
      db.events.set(eventId, event);
    }

    const participant: EventParticipant = {
      id: generateId(),
      eventId,
      userId: input.userId,
      role: 'guest',
    };

    db.participants.set(participant.id, participant);

    const notification: Notification = {
      id: generateId(),
      eventId,
      eventName: event.name,
      userId: input.userId,
      userName: input.userName,
      type: 'joined',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    db.notifications.set(notification.id, notification);

    return { event, alreadyJoined: false };
  });
