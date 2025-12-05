import { Stack, useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { COLORS } from '@/constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateEventScreen() {
  const { createEvent } = useApp();
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleCreate = () => {
    if (name.trim()) {
      const event = createEvent(name.trim(), description.trim() || undefined);
      if (event) {
        router.replace(`/event/${event.id}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Event', headerBackTitle: 'Back' }} />
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.content}>
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
          </View>

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!name.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Create Event</Text>
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
