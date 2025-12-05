import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '@/providers/AppProvider';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/config';
import { trpc, trpcClient } from '@/lib/trpc';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 5000,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

function RootLayoutNav() {
  const app = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!app || app.isLoading) return;

    const inAuth = segments[0] === 'welcome';

    if (!app.currentUser && !inAuth) {
      router.replace('/welcome');
    } else if (app.currentUser && inAuth) {
      router.replace('/');
    }
  }, [app, segments, router]);

  useEffect(() => {
    if (app && !app.isLoading) {
      SplashScreen.hideAsync();
    }
  }, [app]);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerStyle: {
          backgroundColor: COLORS.cardBackground,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-event"
        options={{
          title: 'Create Event',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="join-event"
        options={{
          title: 'Join Event',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen name="event" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <AppProvider>
            <RootLayoutNav />
          </AppProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
