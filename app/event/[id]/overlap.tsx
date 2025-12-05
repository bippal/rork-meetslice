import { Stack, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useApp } from '@/providers/AppProvider';
import { COLORS, CONFIG } from '@/constants/config';
import {
  generateTimeBlocks,
  generateDates,
  formatDate,
  formatTimeBlock,
} from '@/constants/utils';
import type { OverlapType } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import {
  computeOverlap,
  formatAvailabilityCount,
  getAvailabilityColor,
} from '@/utils/overlap';

export default function OverlapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, getEventParticipants } = useApp();
  const [overlapType, setOverlapType] = useState<OverlapType>('all-free');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const timeSlotsQuery = trpc.availability.get.useQuery(
    { eventId: id || '' },
    { enabled: !!id }
  );

  const timeSlots = useMemo(() => {
    return timeSlotsQuery.data?.timeSlots || [];
  }, [timeSlotsQuery.data]);

  const event = events.find((e) => e?.id === id);
  const eventParticipants = event ? getEventParticipants(event.id) : [];
  const timeBlocks = useMemo(() => generateTimeBlocks(), []);
  const dates = useMemo(() => generateDates(new Date(), CONFIG.DAYS_TO_SHOW), []);

  const participantIds = useMemo(() => {
    if (!event) return [];
    return getEventParticipants(event.id).map((p) => p.userId);
  }, [event, getEventParticipants]);

  const activeParticipantIds = useMemo(() => {
    return selectedParticipants.length > 0 ? selectedParticipants : participantIds;
  }, [selectedParticipants, participantIds]);

  const toggleParticipant = useCallback((userId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  }, []);

  const overlapResults = useMemo(() => {
    if (!id) return null;
    const eventTimeSlots = timeSlots.filter((ts) => ts.eventId === id);
    return computeOverlap(eventTimeSlots, activeParticipantIds);
  }, [id, timeSlots, activeParticipantIds]);

  const displaySlots = useMemo(() => {
    if (!overlapResults) return [];
    return overlapType === 'all-free'
      ? overlapResults.allAvailable
      : overlapResults.allUnavailable;
  }, [overlapResults, overlapType]);

  const getSlotInfo = (date: string, timeBlock: string) => {
    const key = `${date}|${timeBlock}`;
    return overlapResults?.byDateTime.get(key);
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.errorText}>Event not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Group Overlap' }} />
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.controls}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Show overlap type:</Text>
            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  overlapType === 'all-free' && styles.modeButtonActive,
                ]}
                onPress={() => setOverlapType('all-free')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    overlapType === 'all-free' && styles.modeButtonTextActive,
                  ]}
                >
                  Times all free
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  overlapType === 'all-busy' && styles.modeButtonActive,
                ]}
                onPress={() => setOverlapType('all-busy')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    overlapType === 'all-busy' && styles.modeButtonTextActive,
                  ]}
                >
                  Times all busy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {participantIds.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Filter participants ({activeParticipantIds.length}/{participantIds.length}):
              </Text>
              <View style={styles.participantButtons}>
                {eventParticipants.map((participant) => {
                  const isSelected =
                    selectedParticipants.length === 0 ||
                    selectedParticipants.includes(participant.userId);
                  return (
                    <TouchableOpacity
                      key={participant.id}
                      style={[
                        styles.participantButton,
                        isSelected && styles.participantButtonActive,
                      ]}
                      onPress={() => toggleParticipant(participant.userId)}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <View style={styles.checkIcon}>
                          <Check size={14} color={COLORS.primary} strokeWidth={3} />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.participantButtonText,
                          isSelected && styles.participantButtonTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        Participant {participant.userId.slice(0, 6)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {overlapResults && (
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Results:</Text>
            <Text style={styles.summaryText}>
              {overlapType === 'all-free'
                ? `${displaySlots.length} time${displaySlots.length !== 1 ? 's' : ''} when everyone is free`
                : `${displaySlots.length} time${displaySlots.length !== 1 ? 's' : ''} when everyone is busy`}
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {dates.map((date) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              <View style={styles.timeGrid}>
                {timeBlocks.map((timeBlock) => {
                  const slotInfo = getSlotInfo(date, timeBlock);
                  if (!slotInfo) {
                    return (
                      <View key={timeBlock} style={styles.timeSlot}>
                        <Text style={styles.timeSlotText}>
                          {formatTimeBlock(timeBlock)}
                        </Text>
                        <Text style={styles.countText}>0/{activeParticipantIds.length}</Text>
                      </View>
                    );
                  }

                  const isOverlap =
                    overlapType === 'all-free'
                      ? slotInfo.availableCount === slotInfo.totalParticipants && slotInfo.availableCount > 0
                      : slotInfo.unavailableCount === slotInfo.totalParticipants && slotInfo.unavailableCount > 0;

                  const displayCount = overlapType === 'all-free'
                    ? slotInfo.availableCount
                    : slotInfo.unavailableCount;

                  const bgColor = overlapType === 'all-free'
                    ? getAvailabilityColor(slotInfo.availableCount, slotInfo.totalParticipants)
                    : undefined;

                  return (
                    <View
                      key={timeBlock}
                      style={[
                        styles.timeSlot,
                        isOverlap && styles.timeSlotOverlap,
                        overlapType === 'all-free' && !isOverlap && slotInfo.availableCount > 0 && {
                          backgroundColor: bgColor + '20',
                          borderColor: bgColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isOverlap && styles.timeSlotTextOverlap,
                          overlapType === 'all-free' && !isOverlap && slotInfo.availableCount > 0 && {
                            color: bgColor,
                          },
                        ]}
                      >
                        {formatTimeBlock(timeBlock)}
                      </Text>
                      <Text
                        style={[
                          styles.countText,
                          isOverlap && styles.countTextOverlap,
                          overlapType === 'all-free' && !isOverlap && slotInfo.availableCount > 0 && {
                            color: bgColor,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        {formatAvailabilityCount(
                          displayCount,
                          slotInfo.totalParticipants,
                          slotInfo.totalParticipants > 2
                        )}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
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
  controls: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modeButtonTextActive: {
    color: COLORS.primary,
  },
  participantButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 6,
  },
  participantButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  participantButtonTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  dateSection: {
    marginBottom: 32,
  },
  dateHeader: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  timeSlotOverlap: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  timeSlotTextOverlap: {
    color: COLORS.primary,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: COLORS.textSecondary,
  },
  countTextOverlap: {
    color: COLORS.primary,
    fontWeight: '700' as const,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  summary: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '30',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
});
