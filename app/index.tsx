import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useApp } from '@/providers/AppProvider';
import { COLORS } from '@/constants/config';
import { Calendar, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { myEvents, getEventParticipants } = useApp();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>My Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/create-event')}
            activeOpacity={0.7}
          >
            <Plus size={24} color={COLORS.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {myEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Calendar size={48} color={COLORS.neutralDark} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptyText}>
                Create an event or join one with a code
              </Text>
              <View style={styles.emptyButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/create-event')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryButtonText}>Create Event</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/join-event')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Join Event</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {myEvents.map((event) => {
                const participants = getEventParticipants(event.id);
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    onPress={() => router.push(`/event/${event.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.eventHeader}>
                      <View style={styles.eventIcon}>
                        <Calendar size={20} color={COLORS.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        {event.description && (
                          <Text style={styles.eventDescription} numberOfLines={1}>
                            {event.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.eventFooter}>
                      <Text style={styles.participantCount}>
                        {participants.length}{' '}
                        {participants.length === 1 ? 'participant' : 'participants'}
                      </Text>
                      <Text style={styles.eventCode}>Code: {event.code}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {myEvents.length > 0 && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => router.push('/join-event')}
              activeOpacity={0.7}
            >
              <Text style={styles.floatingButtonText}>Join Event</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  participantCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500' as const,
  },
  eventCode: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  bottomActions: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  floatingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
});
