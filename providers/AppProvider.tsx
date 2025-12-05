import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import type {
  User,
  Event,
  EventParticipant,
  TimeSlot,
  Notification,
} from '@/types';
import { trpc } from '@/lib/trpc';

const STORAGE_KEYS = {
  USER: 'user',
  NOTIFICATIONS: 'notifications',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    },
  });

  const userEventsQuery = trpc.events.getUserEvents.useQuery(
    { userId: currentUser?.id || '' },
    { enabled: !!currentUser }
  );

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      setCurrentUser(userQuery.data);
    }
  }, [userQuery.data]);

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data);
    }
  }, [notificationsQuery.data]);

  const saveNotificationsMutation = useMutation({
    mutationFn: async (newNotifications: Notification[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
      return newNotifications;
    },
    onSuccess: (newNotifications) => {
      setNotifications(newNotifications);
    },
  });

  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      utils.events.getUserEvents.invalidate();
    },
  });

  const joinEventMutation = trpc.events.join.useMutation({
    onSuccess: () => {
      utils.events.getUserEvents.invalidate();
    },
  });

  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      utils.events.getUserEvents.invalidate();
    },
  });

  const leaveEventMutation = trpc.events.leave.useMutation({
    onSuccess: () => {
      utils.events.getUserEvents.invalidate();
    },
  });

  const toggleTimeSlotMutation = trpc.availability.toggle.useMutation({
    onSuccess: () => {
      utils.availability.get.invalidate();
    },
  });

  const setAvailabilityMutation = trpc.availability.set.useMutation({
    onSuccess: () => {
      utils.availability.get.invalidate();
    },
  });

  const createUser = async (name: string) => {
    console.log('=== createUser called ===');
    console.log('Name:', name);
    
    const user: User = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
    };
    
    console.log('User object created:', user);
    
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    console.log('Saved to AsyncStorage');
    
    queryClient.setQueryData(['user'], user);
    console.log('Set query data');
    
    queryClient.refetchQueries({ queryKey: ['user'] });
    console.log('Refetch triggered');
    
    console.log('=== createUser complete ===');
  };

  const createEvent = useCallback(async (
    name: string,
    description?: string,
    ttl?: number,
    isGhostMode?: boolean,
    isBurnerLink?: boolean
  ): Promise<Event | null> => {
    if (!currentUser) return null;

    try {
      const result = await createEventMutation.mutateAsync({
        userId: currentUser.id,
        name,
        description,
        ttl,
        isGhostMode,
        isBurnerLink,
      });

      return result.event;
    } catch {
      return null;
    }
  }, [currentUser, createEventMutation]);

  const joinEvent = useCallback(async (code: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      await joinEventMutation.mutateAsync({
        code,
        userId: currentUser.id,
        userName: currentUser.name,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join event';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, [currentUser, joinEventMutation]);

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      await deleteEventMutation.mutateAsync({
        eventId,
        userId: currentUser.id,
      });
      return true;
    } catch {
      Alert.alert('Error', 'Failed to delete event');
      return false;
    }
  }, [currentUser, deleteEventMutation]);

  const leaveEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      await leaveEventMutation.mutateAsync({
        eventId,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      return true;
    } catch {
      Alert.alert('Error', 'Failed to leave event');
      return false;
    }
  }, [currentUser, leaveEventMutation]);

  const toggleTimeSlot = useCallback(async (eventId: string, date: string, timeBlock: string) => {
    if (!currentUser) return;

    await toggleTimeSlotMutation.mutateAsync({
      eventId,
      userId: currentUser.id,
      date,
      timeBlock,
    });
  }, [currentUser, toggleTimeSlotMutation]);

  const setTimeSlotAvailability = useCallback(async (
    eventId: string,
    date: string,
    timeBlock: string,
    isAvailable: boolean
  ) => {
    if (!currentUser) return;

    await setAvailabilityMutation.mutateAsync({
      eventId,
      userId: currentUser.id,
      date,
      timeBlock,
      isAvailable,
    });
  }, [currentUser, setAvailabilityMutation]);

  const getUserTimeSlots = useCallback((eventId: string, userId: string): TimeSlot[] => {
    const cachedData = queryClient.getQueryData<{ timeSlots: TimeSlot[] }>(['availability.get', { eventId }]);
    if (!cachedData) return [];
    return cachedData.timeSlots.filter((ts) => ts.userId === userId);
  }, [queryClient]);

  const saveNotificationsMutate = saveNotificationsMutation.mutate;

  const markNotificationAsRead = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveNotificationsMutate(updatedNotifications);
  }, [notifications, saveNotificationsMutate]);

  const hideNotification = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
    saveNotificationsMutate(updatedNotifications);
  }, [notifications, saveNotificationsMutate]);

  const panicWipe = useCallback(async () => {
    Alert.alert(
      'Panic Wipe',
      'Delete ALL events and availability data from this device? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
            setNotifications([]);
            Alert.alert('Wiped', 'All local data has been deleted.');
          },
        },
      ]
    );
  }, []);

  const events = useMemo(() => userEventsQuery.data?.events || [], [userEventsQuery.data?.events]);
  const participants = useMemo(() => userEventsQuery.data?.participants || [], [userEventsQuery.data?.participants]);

  const timeSlots = useMemo(() => {
    const allTimeSlots: TimeSlot[] = [];
    for (const event of events) {
      if (!event) continue;
      const cachedData = queryClient.getQueryData<{ timeSlots: TimeSlot[] }>(['availability.get', { eventId: event.id }]);
      if (cachedData) {
        allTimeSlots.push(...cachedData.timeSlots);
      }
    }
    return allTimeSlots;
  }, [events, queryClient]);

  const myEvents = useMemo(() => {
    if (!currentUser) return [];
    return events.filter((e): e is Event => !!e && !e.isGhostMode);
  }, [events, currentUser]);

  const myNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) => {
      const event = events.find((e) => e?.id === n.eventId);
      if (!event) return false;
      return event.organizerId === currentUser.id && n.userId !== currentUser.id;
    });
  }, [notifications, events, currentUser]);

  const getEventParticipants = useCallback((eventId: string): EventParticipant[] => {
    return participants.filter((p) => p.eventId === eventId);
  }, [participants]);

  return {
    currentUser,
    events,
    participants,
    timeSlots,
    notifications,
    myEvents,
    myNotifications,
    isLoading:
      userQuery.isLoading ||
      userEventsQuery.isLoading ||
      notificationsQuery.isLoading,
    createUser,
    createEvent,
    joinEvent,
    deleteEvent,
    leaveEvent,
    toggleTimeSlot,
    setTimeSlotAvailability,
    getUserTimeSlots,
    getEventParticipants,
    markNotificationAsRead,
    hideNotification,
    panicWipe,
  };
});
