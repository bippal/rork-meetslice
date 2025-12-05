import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEffect } from 'react';
import { useApp } from '@/providers/AppProvider';
import { COLORS } from '@/constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, CheckCircle } from 'lucide-react-native';

export default function JoinCodeScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { joinEvent, events, currentUser, getEventParticipants } = useApp();
  const router = useRouter();

  const eventCode = code?.toUpperCase();
  const event = events.find((e) => e.code === eventCode);
  const eventParticipants = event ? getEventParticipants(event.id) : [];
  const isAlreadyMember = eventParticipants.some((p) => p.userId === currentUser?.id);

  useEffect(() => {
    if (!eventCode) {
      Alert.alert('Error', 'Invalid event code', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }
  }, [eventCode, router]);

  const handleJoin = () => {
    if (eventCode) {
      const success = joinEvent(eventCode);
      if (success) {
        const joinedEvent = events.find((e) => e.code === eventCode);
        if (joinedEvent) {
          router.replace(`/event/${joinedEvent.id}`);
        } else {
          router.replace('/');
        }
      } else {
        Alert.alert('Error', 'Event not found. Please check the code and try again.');
      }
    }
  };

  if (isAlreadyMember && event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            <View style={styles.icon}>
              <CheckCircle size={64} color={COLORS.available} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Already Joined</Text>
            <Text style={styles.description}>
              You&apos;re already a member of &quot;{event.name}&quot;
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace(`/event/${event.id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Go to Event</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            <Text style={styles.errorText}>Event not found</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.icon}>
            <Users size={64} color={COLORS.primary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Join Event</Text>
          <View style={styles.eventCard}>
            <Text style={styles.eventName}>{event.name}</Text>
            {event.description && (
              <Text style={styles.eventDescription}>{event.description}</Text>
            )}
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Event Code</Text>
              <Text style={styles.code}>{event.code}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleJoin}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Join Event</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  eventCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center',
  },
  eventDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  code: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.primary,
    letterSpacing: 4,
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  cancelButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
