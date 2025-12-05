import { Stack, useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { COLORS, PRIVACY_OPTIONS } from '@/constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Clock, Link2, Eye, EyeOff } from 'lucide-react-native';

export default function CreateEventScreen() {
  const { createEvent } = useApp();
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [ttl, setTtl] = useState<number | undefined>(undefined);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isBurnerLink, setIsBurnerLink] = useState(false);

  const handleCreate = async () => {
    if (name.trim()) {
      const event = await createEvent(
        name.trim(),
        description.trim() || undefined,
        ttl,
        isGhostMode,
        isBurnerLink
      );
      if (event) {
        router.replace(`/event/${event.id}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Event', headerBackTitle: 'Back' }} />
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Event Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Game night, Study session..."
                placeholderTextColor={COLORS.neutralDark}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about this event"
                placeholderTextColor={COLORS.neutralDark}
                value={description}
                onChangeText={setDescription}
                autoCapitalize="sentences"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={() => setShowPrivacy(!showPrivacy)}
              activeOpacity={0.7}
            >
              <View style={styles.privacyToggleLeft}>
                <Shield size={20} color={COLORS.primary} strokeWidth={2} />
                <Text style={styles.privacyToggleText}>Privacy Settings</Text>
              </View>
              {showPrivacy ? (
                <EyeOff size={20} color={COLORS.textSecondary} strokeWidth={2} />
              ) : (
                <Eye size={20} color={COLORS.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>

            {showPrivacy && (
              <View style={styles.privacySection}>
                <View style={styles.privacyOption}>
                  <View style={styles.privacyOptionLeft}>
                    <Clock size={18} color={COLORS.primary} strokeWidth={2} />
                    <View style={styles.privacyOptionText}>
                      <Text style={styles.privacyOptionTitle}>Event TTL</Text>
                      <Text style={styles.privacyOptionDesc}>
                        Auto-delete after inactivity
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.ttlOptions}>
                  <TouchableOpacity
                    style={[styles.ttlButton, ttl === undefined && styles.ttlButtonActive]}
                    onPress={() => setTtl(undefined)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.ttlButtonText,
                        ttl === undefined && styles.ttlButtonTextActive,
                      ]}
                    >
                      Never
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.ttlButton,
                      ttl === PRIVACY_OPTIONS.TTL['24h'] && styles.ttlButtonActive,
                    ]}
                    onPress={() => setTtl(PRIVACY_OPTIONS.TTL['24h'])}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.ttlButtonText,
                        ttl === PRIVACY_OPTIONS.TTL['24h'] && styles.ttlButtonTextActive,
                      ]}
                    >
                      24h
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.ttlButton,
                      ttl === PRIVACY_OPTIONS.TTL['7d'] && styles.ttlButtonActive,
                    ]}
                    onPress={() => setTtl(PRIVACY_OPTIONS.TTL['7d'])}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.ttlButtonText,
                        ttl === PRIVACY_OPTIONS.TTL['7d'] && styles.ttlButtonTextActive,
                      ]}
                    >
                      7d
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.ttlButton,
                      ttl === PRIVACY_OPTIONS.TTL['30d'] && styles.ttlButtonActive,
                    ]}
                    onPress={() => setTtl(PRIVACY_OPTIONS.TTL['30d'])}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.ttlButtonText,
                        ttl === PRIVACY_OPTIONS.TTL['30d'] && styles.ttlButtonTextActive,
                      ]}
                    >
                      30d
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.privacyOption}>
                  <View style={styles.privacyOptionLeft}>
                    <Link2 size={18} color={COLORS.primary} strokeWidth={2} />
                    <View style={styles.privacyOptionText}>
                      <Text style={styles.privacyOptionTitle}>Burner Link</Text>
                      <Text style={styles.privacyOptionDesc}>
                        Invite expires after 1 use
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isBurnerLink}
                    onValueChange={setIsBurnerLink}
                    trackColor={{ false: COLORS.neutral, true: COLORS.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.privacyOption}>
                  <View style={styles.privacyOptionLeft}>
                    <EyeOff size={18} color={COLORS.primary} strokeWidth={2} />
                    <View style={styles.privacyOptionText}>
                      <Text style={styles.privacyOptionTitle}>Ghost Mode</Text>
                      <Text style={styles.privacyOptionDesc}>
                        Event hidden from history
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isGhostMode}
                    onValueChange={setIsGhostMode}
                    trackColor={{ false: COLORS.neutral, true: COLORS.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.privacyNote}>
                  <Text style={styles.privacyNoteText}>
                    💡 Privacy features help protect your data and keep events temporary
                  </Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!name.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Create Event</Text>
          </TouchableOpacity>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  form: {
    gap: 24,
    marginBottom: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  privacyToggle: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyToggleText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  privacySection: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  privacyOptionText: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  privacyOptionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  ttlOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ttlButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ttlButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ttlButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  ttlButtonTextActive: {
    color: '#FFFFFF',
  },
  privacyNote: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    padding: 12,
  },
  privacyNoteText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
