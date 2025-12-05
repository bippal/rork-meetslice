import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createEvent from "./routes/events/create";
import getByCode from "./routes/events/get-by-code";
import joinEvent from "./routes/events/join";
import getUserEvents from "./routes/events/get-user-events";
import getById from "./routes/events/get-by-id";
import deleteEvent from "./routes/events/delete";
import leaveEvent from "./routes/events/leave";
import setAvailability from "./routes/availability/set";
import getAvailability from "./routes/availability/get";
import toggleSlot from "./routes/availability/toggle";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  events: createTRPCRouter({
    create: createEvent,
    getByCode,
    join: joinEvent,
    getUserEvents,
    getById,
    delete: deleteEvent,
    leave: leaveEvent,
  }),
  availability: createTRPCRouter({
    set: setAvailability,
    get: getAvailability,
    toggle: toggleSlot,
  }),
});

export type AppRouter = typeof appRouter;
