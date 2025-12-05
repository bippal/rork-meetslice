import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const userParticipations = Array.from(db.participants.values()).filter(
      (p) => p.userId === input.userId
    );

    const events = userParticipations
      .map((p) => db.events.get(p.eventId))
      .filter((e) => e !== undefined && !e.isGhostMode);

    return { events, participants: userParticipations };
  });
