import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem('auth_token');
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync('auth_token');
}

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    getToken().then((token) => {
      setLoggedIn(!!token);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#242930' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <Redirect href={loggedIn ? '/(app)/nalozi' : '/(auth)/login'} />;
}
