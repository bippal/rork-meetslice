import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';

export default publicProcedure
  .input(z.object({ eventId: z.string() }))
  .query(async ({ input }) => {
    const event = db.events.get(input.eventId);
    if (!event) return null;

    const participants = Array.from(db.participants.values()).filter(
      (p) => p.eventId === input.eventId
    );

    return { event, participants };
  });
