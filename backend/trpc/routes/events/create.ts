import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import db from '@/backend/db';
import type { Event, EventParticipant } from '@/types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

export default publicProcedure
  .input(
    z.object({
      userId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      ttl: z.number().optional(),
      isGhostMode: z.boolean().optional(),
      isBurnerLink: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const eventId = generateId();
    const code = generateCode();

    const event: Event = {
      id: eventId,
      name: input.name,
      description: input.description,
      organizerId: input.userId,
      code,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ttl: input.ttl,
      isGhostMode: input.isGhostMode,
      isBurnerLink: input.isBurnerLink,
      burnerUsesLeft: input.isBurnerLink ? 1 : undefined,
    };

    const participant: EventParticipant = {
      id: generateId(),
      eventId,
      userId: input.userId,
      role: 'organizer',
    };

    db.events.set(eventId, event);
    db.eventsByCode.set(code, eventId);
    db.participants.set(participant.id, participant);

    return { event, participant };
  });
