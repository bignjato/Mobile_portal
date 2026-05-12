import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeDatabase } from '../src/database/schema';
import { startAutoSync } from '../src/services/syncService';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase().catch(console.error);
    const stopSync = startAutoSync(30_000);
    return () => stopSync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
