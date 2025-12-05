import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';
import type { TimeSlot } from '@/types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default publicProcedure
  .input(
    z.object({
      eventId: z.string(),
      userId: z.string(),
      date: z.string(),
      timeBlock: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const existingSlot = Array.from(db.timeSlots.values()).find(
      (ts) =>
        ts.eventId === input.eventId &&
        ts.userId === input.userId &&
        ts.date === input.date &&
        ts.timeBlock === input.timeBlock
    );

    if (existingSlot) {
      db.timeSlots.delete(existingSlot.id);
      return { deleted: true };
    } else {
      const newSlot: TimeSlot = {
        id: generateId(),
        eventId: input.eventId,
        userId: input.userId,
        date: input.date,
        timeBlock: input.timeBlock,
        isAvailable: true,
      };
      db.timeSlots.set(newSlot.id, newSlot);
      return { deleted: false, slot: newSlot };
    }
  });
