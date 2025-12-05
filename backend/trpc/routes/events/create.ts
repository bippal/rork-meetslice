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
    try {
      console.log('=== CREATE EVENT MUTATION ===');
      console.log('Input:', input);
      
      const eventId = generateId();
      const code = generateCode();
      
      console.log('Generated eventId:', eventId);
      console.log('Generated code:', code);

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
      
      console.log('Saving event to db...');
      db.events.set(eventId, event);
      db.eventsByCode.set(code, eventId);
      db.participants.set(participant.id, participant);
      console.log('Event saved successfully');

      return { event, participant };
    } catch (error) {
      console.error('=== CREATE EVENT ERROR ===');
      console.error(error);
      throw error;
    }
  });
