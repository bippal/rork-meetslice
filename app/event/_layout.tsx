import { Stack } from 'expo-router';

export default function EventLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="[id]/availability" options={{ title: 'My Availability' }} />
      <Stack.Screen name="[id]/overlap" options={{ title: 'Group Overlap' }} />
    </Stack>
  );
}
