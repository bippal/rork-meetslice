import type { TimeSlot } from '@/types';

export interface OverlapSlot {
  date: string;
  timeBlock: string;
  availableCount: number;
  unavailableCount: number;
  totalParticipants: number;
  availabilityRatio: number;
}

export interface OverlapResults {
  allAvailable: OverlapSlot[];
  allUnavailable: OverlapSlot[];
  partial: OverlapSlot[];
  byDateTime: Map<string, OverlapSlot>;
}

export interface FlexibleOverlapOptions {
  minRequired?: number;
  includePartial?: boolean;
  anonymizeThreshold?: number;
}

export function computeOverlap(
  timeSlots: TimeSlot[],
  selectedUserIds: string[]
): OverlapResults {
  const byDateTime = new Map<string, OverlapSlot>();
  
  timeSlots.forEach((slot) => {
    if (!selectedUserIds.includes(slot.userId)) return;
    
    const key = `${slot.date}|${slot.timeBlock}`;
    
    if (!byDateTime.has(key)) {
      byDateTime.set(key, {
        date: slot.date,
        timeBlock: slot.timeBlock,
        availableCount: 0,
        unavailableCount: 0,
        totalParticipants: selectedUserIds.length,
        availabilityRatio: 0,
      });
    }
    
    const entry = byDateTime.get(key)!;
    if (slot.isAvailable) {
      entry.availableCount++;
    } else {
      entry.unavailableCount++;
    }
  });
  
  const allAvailable: OverlapSlot[] = [];
  const allUnavailable: OverlapSlot[] = [];
  const partial: OverlapSlot[] = [];
  
  byDateTime.forEach((slot) => {
    slot.availabilityRatio = slot.availableCount / slot.totalParticipants;
    
    if (slot.availableCount === slot.totalParticipants && slot.availableCount > 0) {
      allAvailable.push(slot);
    } else if (slot.unavailableCount === slot.totalParticipants && slot.unavailableCount > 0) {
      allUnavailable.push(slot);
    } else {
      partial.push(slot);
    }
  });
  
  return {
    allAvailable,
    allUnavailable,
    partial,
    byDateTime,
  };
}

export function computeFlexibleOverlap(
  timeSlots: TimeSlot[],
  selectedUserIds: string[],
  options: FlexibleOverlapOptions = {}
): OverlapResults {
  const {
    minRequired = selectedUserIds.length,
    includePartial = false,
  } = options;
  
  const baseResults = computeOverlap(timeSlots, selectedUserIds);
  
  if (minRequired === selectedUserIds.length) {
    return baseResults;
  }
  
  const flexibleAvailable: OverlapSlot[] = [];
  
  baseResults.byDateTime.forEach((slot) => {
    if (slot.availableCount >= minRequired) {
      flexibleAvailable.push(slot);
    }
  });
  
  return {
    allAvailable: flexibleAvailable,
    allUnavailable: baseResults.allUnavailable,
    partial: includePartial ? baseResults.partial : [],
    byDateTime: baseResults.byDateTime,
  };
}

export function formatAvailabilityCount(
  available: number,
  total: number,
  anonymize: boolean = true
): string {
  if (total <= 2 || !anonymize) {
    return `${available}/${total}`;
  }
  
  if (available === 1) {
    return 'Few available';
  }
  
  if (available === total - 1) {
    return 'Most available';
  }
  
  return `${available}/${total}`;
}

export function getAvailabilityColor(
  availableCount: number,
  totalCount: number
): string {
  const ratio = availableCount / totalCount;
  
  if (ratio === 1) return '#10B981';
  if (ratio >= 0.75) return '#84CC16';
  if (ratio >= 0.5) return '#F59E0B';
  if (ratio >= 0.25) return '#F97316';
  return '#EF4444';
}

export function sortSlotsByAvailability(
  slots: OverlapSlot[],
  descending: boolean = true
): OverlapSlot[] {
  return [...slots].sort((a, b) => {
    const diff = b.availableCount - a.availableCount;
    return descending ? diff : -diff;
  });
}

export function groupSlotsByDate(slots: OverlapSlot[]): Map<string, OverlapSlot[]> {
  const grouped = new Map<string, OverlapSlot[]>();
  
  slots.forEach((slot) => {
    if (!grouped.has(slot.date)) {
      grouped.set(slot.date, []);
    }
    grouped.get(slot.date)!.push(slot);
  });
  
  return grouped;
}

export function findBestTimes(
  slots: OverlapSlot[],
  count: number = 3
): OverlapSlot[] {
  return sortSlotsByAvailability(slots, true).slice(0, count);
}
