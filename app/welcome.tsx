import { Stack } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { COLORS } from '@/constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { createUser } = useApp();
  const [name, setName] = useState<string>('');

  const handleSubmit = async () => {
    console.log('=== BUTTON PRESSED ===');
    console.log('Name value:', name);
    
    if (!name.trim()) {
      console.log('Name is empty, returning');
      return;
    }
    
    console.log('Calling createUser...');
    await createUser(name);
    console.log('createUser completed');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to SyncPoint</Text>
            <Text style={styles.subtitle}>
              Find the perfect time for your group without sharing your full schedule
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>What is your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.neutralDark}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: -8,
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
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
