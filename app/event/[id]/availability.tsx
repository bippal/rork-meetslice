import { Stack, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useState, useMemo } from 'react';
import { useApp } from '@/providers/AppProvider';
import { COLORS, CONFIG } from '@/constants/config';
import {
  generateTimeBlocks,
  generateDates,
  formatDate,
  formatTimeBlock,
} from '@/constants/utils';
import type { AvailabilityMode } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, setTimeSlotAvailability, getUserTimeSlots, currentUser } = useApp();
  const [mode, setMode] = useState<AvailabilityMode>('available');

  const event = events.find((e) => e.id === id);
  const timeBlocks = useMemo(() => generateTimeBlocks(), []);
  const dates = useMemo(() => generateDates(new Date(), CONFIG.DAYS_TO_SHOW), []);

  const userTimeSlots = useMemo(() => {
    if (!currentUser || !id) return [];
    return getUserTimeSlots(id, currentUser.id);
  }, [id, currentUser, getUserTimeSlots]);

  const getSlotStatus = (date: string, timeBlock: string): 'available' | 'unavailable' | 'none' => {
    const slot = userTimeSlots.find((ts) => ts.date === date && ts.timeBlock === timeBlock);
    if (!slot) return 'none';
    return slot.isAvailable ? 'available' : 'unavailable';
  };

  const handleSlotPress = (date: string, timeBlock: string) => {
    if (!id) return;
    const isAvailable = mode === 'available';
    setTimeSlotAvailability(id, date, timeBlock, isAvailable);
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
      <Stack.Screen options={{ title: 'My Availability' }} />
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.modeSelector}>
          <Text style={styles.modeLabel}>I am selecting:</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'available' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('available')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.modeIndicator,
                  mode === 'available' && styles.modeIndicatorAvailable,
                ]}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'available' && styles.modeButtonTextActive,
                ]}
              >
                Available
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'unavailable' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('unavailable')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.modeIndicator,
                  mode === 'unavailable' && styles.modeIndicatorUnavailable,
                ]}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'unavailable' && styles.modeButtonTextActive,
                ]}
              >
                Unavailable
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
                  const status = getSlotStatus(date, timeBlock);
                  return (
                    <TouchableOpacity
                      key={timeBlock}
                      style={[
                        styles.timeSlot,
                        status === 'available' && styles.timeSlotAvailable,
                        status === 'unavailable' && styles.timeSlotUnavailable,
                      ]}
                      onPress={() => handleSlotPress(date, timeBlock)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          status === 'available' && styles.timeSlotTextAvailable,
                          status === 'unavailable' && styles.timeSlotTextUnavailable,
                        ]}
                      >
                        {formatTimeBlock(timeBlock)}
                      </Text>
                    </TouchableOpacity>
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
  modeSelector: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 8,
  },
  modeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  modeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.neutral,
  },
  modeIndicatorAvailable: {
    backgroundColor: COLORS.available,
  },
  modeIndicatorUnavailable: {
    backgroundColor: COLORS.unavailable,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  modeButtonTextActive: {
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
  timeSlotAvailable: {
    backgroundColor: COLORS.available + '20',
    borderColor: COLORS.available,
  },
  timeSlotUnavailable: {
    backgroundColor: COLORS.unavailable + '15',
    borderColor: COLORS.unavailable,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  timeSlotTextAvailable: {
    color: COLORS.available,
  },
  timeSlotTextUnavailable: {
    color: COLORS.unavailable,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
