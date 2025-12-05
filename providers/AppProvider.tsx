import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import type {
  User,
  Event,
  EventParticipant,
  TimeSlot,
} from '@/types';
import { PRIVACY_OPTIONS } from '@/constants/config';

const STORAGE_KEYS = {
  USER: 'user',
  EVENTS: 'events',
  PARTICIPANTS: 'participants',
  TIME_SLOTS: 'timeSlots',
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    },
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const participantsQuery = useQuery({
    queryKey: ['participants'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const timeSlotsQuery = useQuery({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TIME_SLOTS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      setCurrentUser(userQuery.data);
    }
  }, [userQuery.data]);

  useEffect(() => {
    if (eventsQuery.data) {
      setEvents(eventsQuery.data);
    }
  }, [eventsQuery.data]);

  useEffect(() => {
    if (participantsQuery.data) {
      setParticipants(participantsQuery.data);
    }
  }, [participantsQuery.data]);

  useEffect(() => {
    if (timeSlotsQuery.data) {
      setTimeSlots(timeSlotsQuery.data);
    }
  }, [timeSlotsQuery.data]);

  const saveUserMutation = useMutation({
    mutationFn: async (user: User) => {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return user;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
    },
  });

  const saveEventsMutation = useMutation({
    mutationFn: async (newEvents: Event[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(newEvents));
      return newEvents;
    },
    onSuccess: (newEvents) => {
      setEvents(newEvents);
    },
  });

  const saveParticipantsMutation = useMutation({
    mutationFn: async (newParticipants: EventParticipant[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(newParticipants));
      return newParticipants;
    },
    onSuccess: (newParticipants) => {
      setParticipants(newParticipants);
    },
  });

  const saveTimeSlotsMutation = useMutation({
    mutationFn: async (newTimeSlots: TimeSlot[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(newTimeSlots));
      return newTimeSlots;
    },
    onSuccess: (newTimeSlots) => {
      setTimeSlots(newTimeSlots);
    },
  });

  const createUser = (name: string) => {
    const user: User = {
      id: generateId(),
      name,
    };
    saveUserMutation.mutate(user);
  };

  const createEvent = (
    name: string,
    description?: string,
    ttl?: number,
    isGhostMode?: boolean,
    isBurnerLink?: boolean
  ) => {
    if (!currentUser) return null;

    const event: Event = {
      id: generateId(),
      name,
      description,
      organizerId: currentUser.id,
      code: generateCode(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ttl,
      isGhostMode,
      isBurnerLink,
      burnerUsesLeft: isBurnerLink ? PRIVACY_OPTIONS.BURNER_LINK_USES : undefined,
    };

    const participant: EventParticipant = {
      id: generateId(),
      eventId: event.id,
      userId: currentUser.id,
      role: 'organizer',
    };

    saveEventsMutation.mutate([...events, event]);
    saveParticipantsMutation.mutate([...participants, participant]);

    return event;
  };

  const joinEvent = (code: string) => {
    if (!currentUser) return false;

    const event = events.find((e) => e.code === code);
    if (!event) return false;

    const alreadyParticipant = participants.some(
      (p) => p.eventId === event.id && p.userId === currentUser.id
    );
    if (alreadyParticipant) return true;

    if (event.isBurnerLink && event.burnerUsesLeft !== undefined) {
      if (event.burnerUsesLeft <= 0) {
        Alert.alert('Invalid Link', 'This invite link has expired.');
        return false;
      }

      const updatedEvents = events.map((e) =>
        e.id === event.id
          ? { ...e, burnerUsesLeft: e.burnerUsesLeft! - 1, lastActivity: new Date().toISOString() }
          : e
      );
      saveEventsMutation.mutate(updatedEvents);
    } else {
      const updatedEvents = events.map((e) =>
        e.id === event.id ? { ...e, lastActivity: new Date().toISOString() } : e
      );
      saveEventsMutation.mutate(updatedEvents);
    }

    const participant: EventParticipant = {
      id: generateId(),
      eventId: event.id,
      userId: currentUser.id,
      role: 'guest',
    };

    saveParticipantsMutation.mutate([...participants, participant]);
    return true;
  };

  const updateEventActivity = (eventId: string) => {
    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, lastActivity: new Date().toISOString() } : e
    );
    saveEventsMutation.mutate(updatedEvents);
  };

  const setTimeSlotAvailability = (
    eventId: string,
    date: string,
    timeBlock: string,
    isAvailable: boolean
  ) => {
    if (!currentUser) return;

    const existingIndex = timeSlots.findIndex(
      (ts) =>
        ts.eventId === eventId &&
        ts.userId === currentUser.id &&
        ts.date === date &&
        ts.timeBlock === timeBlock
    );

    let newTimeSlots: TimeSlot[];

    if (existingIndex >= 0) {
      newTimeSlots = [...timeSlots];
      newTimeSlots[existingIndex] = {
        ...newTimeSlots[existingIndex],
        isAvailable,
      };
    } else {
      const newSlot: TimeSlot = {
        id: generateId(),
        eventId,
        userId: currentUser.id,
        date,
        timeBlock,
        isAvailable,
      };
      newTimeSlots = [...timeSlots, newSlot];
    }

    saveTimeSlotsMutation.mutate(newTimeSlots);
    updateEventActivity(eventId);
  };

  const toggleTimeSlot = (eventId: string, date: string, timeBlock: string) => {
    if (!currentUser) return;

    const existing = timeSlots.find(
      (ts) =>
        ts.eventId === eventId &&
        ts.userId === currentUser.id &&
        ts.date === date &&
        ts.timeBlock === timeBlock
    );

    let newTimeSlots: TimeSlot[];

    if (existing) {
      newTimeSlots = timeSlots.filter((ts) => ts.id !== existing.id);
    } else {
      const newSlot: TimeSlot = {
        id: generateId(),
        eventId,
        userId: currentUser.id,
        date,
        timeBlock,
        isAvailable: true,
      };
      newTimeSlots = [...timeSlots, newSlot];
    }

    saveTimeSlotsMutation.mutate(newTimeSlots);
  };

  const getUserTimeSlots = (eventId: string, userId: string) => {
    return timeSlots.filter((ts) => ts.eventId === eventId && ts.userId === userId);
  };

  const getEventParticipants = (eventId: string) => {
    return participants.filter((p) => p.eventId === eventId);
  };

  const deleteEvent = (eventId: string) => {
    if (!currentUser) return false;

    const event = events.find((e) => e.id === eventId);
    if (!event) return false;

    if (event.organizerId !== currentUser.id) return false;

    const newEvents = events.filter((e) => e.id !== eventId);
    const newParticipants = participants.filter((p) => p.eventId !== eventId);
    const newTimeSlots = timeSlots.filter((ts) => ts.eventId !== eventId);

    saveEventsMutation.mutate(newEvents);
    saveParticipantsMutation.mutate(newParticipants);
    saveTimeSlotsMutation.mutate(newTimeSlots);

    return true;
  };

  const leaveEvent = (eventId: string) => {
    if (!currentUser) return false;

    const event = events.find((e) => e.id === eventId);
    if (!event) return false;

    if (event.organizerId === currentUser.id) return false;

    const newParticipants = participants.filter(
      (p) => !(p.eventId === eventId && p.userId === currentUser.id)
    );
    const newTimeSlots = timeSlots.filter(
      (ts) => !(ts.eventId === eventId && ts.userId === currentUser.id)
    );

    saveParticipantsMutation.mutate(newParticipants);
    saveTimeSlotsMutation.mutate(newTimeSlots);

    return true;
  };

  useEffect(() => {
    const cleanupExpiredEvents = () => {
      const now = Date.now();
      const expiredEvents = events.filter((event) => {
        if (!event.ttl) return false;
        const lastActivity = new Date(event.lastActivity).getTime();
        return now - lastActivity > event.ttl;
      });

      if (expiredEvents.length > 0) {
        const expiredIds = expiredEvents.map((e) => e.id);
        const newEvents = events.filter((e) => !expiredIds.includes(e.id));
        const newParticipants = participants.filter((p) => !expiredIds.includes(p.eventId));
        const newTimeSlots = timeSlots.filter((ts) => !expiredIds.includes(ts.eventId));

        saveEventsMutation.mutate(newEvents);
        saveParticipantsMutation.mutate(newParticipants);
        saveTimeSlotsMutation.mutate(newTimeSlots);

        console.log(`Cleaned up ${expiredEvents.length} expired events`);
      }
    };

    cleanupExpiredEvents();
    const interval = setInterval(cleanupExpiredEvents, 60000);
    return () => clearInterval(interval);
  }, [events, participants, timeSlots]);

  const panicWipe = async () => {
    Alert.alert(
      'Panic Wipe',
      'Delete ALL events and availability data from this device? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEYS.EVENTS);
            await AsyncStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
            await AsyncStorage.removeItem(STORAGE_KEYS.TIME_SLOTS);
            setEvents([]);
            setParticipants([]);
            setTimeSlots([]);
            Alert.alert('Wiped', 'All data has been deleted.');
          },
        },
      ]
    );
  };

  const myEvents = useMemo(() => {
    if (!currentUser) return [];
    const myParticipations = participants.filter((p) => p.userId === currentUser.id);
    const filteredEvents = events.filter((e) => myParticipations.some((p) => p.eventId === e.id));
    
    if (filteredEvents.some((e) => e.isGhostMode)) {
      return filteredEvents.filter((e) => !e.isGhostMode);
    }
    
    return filteredEvents;
  }, [events, participants, currentUser]);

  return {
    currentUser,
    events,
    participants,
    timeSlots,
    myEvents,
    isLoading:
      userQuery.isLoading ||
      eventsQuery.isLoading ||
      participantsQuery.isLoading ||
      timeSlotsQuery.isLoading,
    createUser,
    createEvent,
    joinEvent,
    deleteEvent,
    leaveEvent,
    setTimeSlotAvailability,
    toggleTimeSlot,
    getUserTimeSlots,
    getEventParticipants,
    updateEventActivity,
    panicWipe,
  };
});
