import { Stack, useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { COLORS } from '@/constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JoinEventScreen() {
  const { joinEvent } = useApp();
  const router = useRouter();
  const [code, setCode] = useState<string>('');

  const handleJoin = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode) {
      const success = await joinEvent(trimmedCode);
      if (success) {
        Alert.alert('Success', 'You have joined the event!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', 'Event not found. Please check the code and try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Join Event', headerBackTitle: 'Back' }} />
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.description}>
              Enter the event code shared by the organizer to join
            </Text>
            <View style={styles.field}>
              <Text style={styles.label}>Event Code</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC123"
                placeholderTextColor={COLORS.neutralDark}
                value={code}
                onChangeText={(text) => setCode(text.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, !code.trim() && styles.buttonDisabled]}
            onPress={handleJoin}
            disabled={!code.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Join Event</Text>
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
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  form: {
    gap: 24,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
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
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
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
