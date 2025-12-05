import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';

export default publicProcedure
  .input(z.object({ eventId: z.string() }))
  .query(async ({ input }) => {
    const timeSlots = Array.from(db.timeSlots.values()).filter(
      (ts) => ts.eventId === input.eventId
    );

    return { timeSlots };
  });
