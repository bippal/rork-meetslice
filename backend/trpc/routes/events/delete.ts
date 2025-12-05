import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';

export default publicProcedure
  .input(
    z.object({
      eventId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const event = db.events.get(input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== input.userId) {
      throw new Error('Only organizer can delete event');
    }

    db.events.delete(input.eventId);
    db.eventsByCode.delete(event.code);

    Array.from(db.participants.values())
      .filter((p) => p.eventId === input.eventId)
      .forEach((p) => db.participants.delete(p.id));

    Array.from(db.timeSlots.values())
      .filter((ts) => ts.eventId === input.eventId)
      .forEach((ts) => db.timeSlots.delete(ts.id));

    return { success: true };
  });
