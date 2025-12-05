import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  Alert,
  Platform,
} from 'react-native';
import { useApp } from '@/providers/AppProvider';
import { COLORS, PRIVACY_OPTIONS } from '@/constants/config';
import { Calendar, Plus, Users, Clock, Shield, Trash2, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import type { Event } from '@/types';

interface SwipeableEventCardProps {
  event: Event;
  onPress: () => void;
  onDelete: () => void;
}

function SwipeableEventCard({ event, onPress, onDelete }: SwipeableEventCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwiping, setIsSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        setIsSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0 && gestureState.dx > -100) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwiping(false);
        if (gestureState.dx < -50) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    onDelete();
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[
          styles.eventQuickCard,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.eventQuickCardInner}
          onPress={onPress}
          activeOpacity={0.7}
          disabled={isSwiping}
        >
          <View style={styles.eventQuickIcon}>
            <Calendar size={18} color={COLORS.primary} strokeWidth={2} />
          </View>
          <View style={styles.eventQuickInfo}>
            <Text style={styles.eventQuickName}>{event.name}</Text>
            <Text style={styles.eventQuickCode}>Code: {event.code}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const { myEvents, deleteEvent, currentUser, panicWipe } = useApp();
  const router = useRouter();
  const lastShakeTime = useRef(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let subscription: any;

    const startAccelerometer = async () => {
      try {
        await Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener((data) => {
          const { x, y, z } = data;
          const acceleration = Math.sqrt(x * x + y * y + z * z);

          if (acceleration > 2.5) {
            const now = Date.now();
            if (now - lastShakeTime.current > PRIVACY_OPTIONS.PANIC_SHAKE_THRESHOLD) {
              lastShakeTime.current = now;
              panicWipe();
            }
          }
        });
      } catch (error) {
        console.log('Accelerometer not available:', error);
      }
    };

    startAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [panicWipe]);

  const handleDeleteEvent = (event: Event) => {
    const isOrganizer = event.organizerId === currentUser?.id;

    Alert.alert(
      isOrganizer ? 'Delete Event' : 'Leave Event',
      isOrganizer
        ? `Are you sure you want to delete "${event.name}"? This will remove all participants and availability data.`
        : `Are you sure you want to leave "${event.name}"? Your availability data will be removed.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: isOrganizer ? 'Delete' : 'Leave',
          style: 'destructive',
          onPress: () => {
            deleteEvent(event.id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Calendar size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.heroTitle}>SyncPoint</Text>
            <Text style={styles.heroSubtitle}>
              Find the perfect time for your group without sharing your full schedule
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#EFF6FF' }]}>
                <Users size={24} color={COLORS.primary} strokeWidth={2} />
              </View>
              <Text style={styles.featureTitle}>Group Scheduling</Text>
              <Text style={styles.featureText}>
                Coordinate with 2-10 people effortlessly
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#F0FDF4' }]}>
                <Clock size={24} color={COLORS.available} strokeWidth={2} />
              </View>
              <Text style={styles.featureTitle}>Smart Overlap</Text>
              <Text style={styles.featureText}>
                See when everyone is free or busy
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#FEF2F2' }]}>
                <Shield size={24} color="#F97316" strokeWidth={2} />
              </View>
              <Text style={styles.featureTitle}>Privacy First</Text>
              <Text style={styles.featureText}>
                Never reveals individual schedules
              </Text>
            </View>
          </View>

          {myEvents.length > 0 && (
            <View style={styles.quickAccess}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Events</Text>
                <TouchableOpacity
                  onPress={() => router.push('/create-event')}
                  activeOpacity={0.7}
                >
                  <Plus size={24} color={COLORS.primary} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              {myEvents.slice(0, 5).map((event) => (
                <SwipeableEventCard
                  key={event.id}
                  event={event}
                  onPress={() => router.push(`/event/${event.id}`)}
                  onDelete={() => handleDeleteEvent(event)}
                />
              ))}
              {myEvents.length > 5 && (
                <Text style={styles.moreText}>+{myEvents.length - 5} more events</Text>
              )}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/create-event')}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.primaryButtonText}>Create Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/join-event')}
              activeOpacity={0.7}
            >
              <Users size={20} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.secondaryButtonText}>Join Event</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.privacySection}>
            <View style={styles.privacyHeader}>
              <Shield size={18} color={COLORS.primary} strokeWidth={2} />
              <Text style={styles.privacyTitle}>Privacy Features</Text>
            </View>
            <View style={styles.privacyItems}>
              <View style={styles.privacyItem}>
                <Text style={styles.privacyLabel}>Zero-Knowledge Overlap</Text>
                <Text style={styles.privacyDesc}>Only shows group availability, never individuals</Text>
              </View>
              {Platform.OS !== 'web' && (
                <View style={styles.privacyItem}>
                  <AlertTriangle size={16} color="#F97316" strokeWidth={2} />
                  <View style={styles.privacyItemText}>
                    <Text style={styles.privacyLabel}>Shake to Wipe</Text>
                    <Text style={styles.privacyDesc}>Shake device to delete all local data</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.manualWipeButton}
                onPress={panicWipe}
                activeOpacity={0.7}
              >
                <AlertTriangle size={16} color={COLORS.unavailable} strokeWidth={2} />
                <Text style={styles.manualWipeText}>Manual Data Wipe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  features: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  quickAccess: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  swipeContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: COLORS.unavailable,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  eventQuickCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventQuickCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  eventQuickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventQuickInfo: {
    flex: 1,
  },
  eventQuickName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  eventQuickCode: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  moreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
  privacySection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 20,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  privacyItems: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  privacyItemText: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  privacyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  manualWipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.unavailable + '15',
    borderWidth: 1,
    borderColor: COLORS.unavailable + '30',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  manualWipeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.unavailable,
  },
});
