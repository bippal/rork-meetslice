import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useApp } from '@/providers/AppProvider';
import { COLORS } from '@/constants/config';
import { Calendar, Users, Clock, Share2, Trash2, LogOut } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, getEventParticipants, currentUser, deleteEvent, leaveEvent } = useApp();
  const router = useRouter();

  const event = events.find((e) => e?.id === id);
  const participants = event ? getEventParticipants(event.id) : [];
  const isOrganizer = event?.organizerId === currentUser?.id;

  if (!event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Event not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      const deepLink = `rork-app://join/${event.code}`;
      const message = `Join my event "${event.name}" on SyncPoint!\n\nEvent Code: ${event.code}\n\nTap the link to join: ${deepLink}\n\nOr open the app and enter the code manually.`;
      
      await Share.share({
        message,
        url: deepLink,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.name}"? This will remove all participants and availability data.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteEvent(id);
            if (success) {
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  const handleLeaveEvent = () => {
    Alert.alert(
      'Leave Event',
      `Are you sure you want to leave "${event.name}"? Your availability data will be removed.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const success = await leaveEvent(id);
            if (success) {
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={20} color={COLORS.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eventName}>{event.name}</Text>
          {event.description && (
            <Text style={styles.eventDescription}>{event.description}</Text>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Users size={18} color={COLORS.primary} strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>
                  {participants.length}{' '}
                  {participants.length === 1 ? 'person' : 'people'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={18} color={COLORS.primary} strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Event Code</Text>
                <Text style={styles.infoValue}>{event.code}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/event/${id}/availability`)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Clock size={24} color={COLORS.primary} strokeWidth={2} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>My Availability</Text>
                <Text style={styles.actionDescription}>
                  Mark when you are free or busy
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/event/${id}/overlap`)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Users size={24} color={COLORS.primary} strokeWidth={2} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Group Overlap</Text>
                <Text style={styles.actionDescription}>
                  Find the best time for everyone
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {isOrganizer && (
            <View style={styles.organizerTip}>
              <Text style={styles.tipText}>
                As the organizer, share the event code with your group so they can join
                and mark their availability.
              </Text>
            </View>
          )}

          <View style={styles.dangerZone}>
            {isOrganizer ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteEvent}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={COLORS.unavailable} strokeWidth={2} />
                <Text style={styles.deleteButtonText}>Delete Event</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveEvent}
                activeOpacity={0.7}
              >
                <LogOut size={20} color={COLORS.unavailable} strokeWidth={2} />
                <Text style={styles.leaveButtonText}>Leave Event</Text>
              </TouchableOpacity>
            )}
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
  header: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500' as const,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  organizerTip: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  dangerZone: {
    marginTop: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.unavailable + '15',
    borderWidth: 1,
    borderColor: COLORS.unavailable + '30',
    borderRadius: 12,
    padding: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.unavailable,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.unavailable + '15',
    borderWidth: 1,
    borderColor: COLORS.unavailable + '30',
    borderRadius: 12,
    padding: 16,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.unavailable,
  },
});
