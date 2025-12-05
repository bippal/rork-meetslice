export const CONFIG = {
  MAX_GROUP_SIZE: 10,
  TIME_BLOCK_MINUTES: 30,
  START_HOUR: 0,
  END_HOUR: 23,
  DAYS_TO_SHOW: 7,
};

export const PRIVACY_OPTIONS = {
  TTL: {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  },
  BURNER_LINK_USES: 1,
  PANIC_SHAKE_THRESHOLD: 800,
};

export const COLORS = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  available: '#10B981',
  unavailable: '#EF4444',
  unavailableLight: '#FCA5A5',
  neutral: '#E5E7EB',
  neutralDark: '#9CA3AF',
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};
