import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';

export default publicProcedure
  .input(z.object({ code: z.string() }))
  .query(async ({ input }) => {
    const eventId = db.eventsByCode.get(input.code);
    if (!eventId) return null;

    const event = db.events.get(eventId);
    if (!event) return null;

    const participants = Array.from(db.participants.values()).filter(
      (p) => p.eventId === eventId
    );

    return { event, participants };
  });
