// ============================================================
// VTS - Ekran za prijavu
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { login } from '../../src/services/api';
import OneTechLogo from '../../src/components/OneTechLogo';

export default function LoginScreen() {
  const [korisnickoIme, setKorisnickoIme] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!korisnickoIme.trim() || !lozinka.trim()) {
      Alert.alert('Greška', 'Unesite korisničko ime i lozinku.');
      return;
    }
    setLoading(true);
    try {
      await login(korisnickoIme.trim(), lozinka);
      router.replace('/(app)/nalozi');
    } catch (err: any) {
      Alert.alert(
        'Prijava neuspješna',
        err?.response?.data?.message ?? 'Provjerite korisničke podatke i internet vezu.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        {/* Logo / header */}
        <View style={styles.header}>
          <OneTechLogo variant="on-white" width={180} />
          <Text style={styles.subtitle}>VTS Mobilni portal</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Korisničko ime</Text>
          <TextInput
            style={styles.input}
            value={korisnickoIme}
            onChangeText={setKorisnickoIme}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Unesite korisničko ime"
            placeholderTextColor="#94A3B8"
            returnKeyType="next"
          />

          <Text style={styles.label}>Lozinka</Text>
          <TextInput
            style={styles.input}
            value={lozinka}
            onChangeText={setLozinka}
            secureTextEntry
            placeholder="Unesite lozinku"
            placeholderTextColor="#94A3B8"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>PRIJAVA</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242930',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    // zamijenjen s OneTechLogo komponentom
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#EF0C0C',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },
  version: {
    textAlign: 'center',
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 24,
  },
});
