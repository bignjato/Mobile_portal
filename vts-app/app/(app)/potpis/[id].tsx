// ============================================================
// VTS - Ekran za digitalni potpis
// ============================================================

import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import SignatureCanvas from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import { updatePotpis } from '../../../src/database/radniNalogRepo';

export default function PotpisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sigRef = useRef<any>(null);
  const [potpisPartner, setPotpisPartner] = useState('');
  const [potpisBase64, setPotpisBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleOK(signature: string) {
    setPotpisBase64(signature);
  }

  function handleObrisi() {
    sigRef.current?.clearSignature();
    setPotpisBase64(null);
  }

  async function handleSpremi() {
    if (!potpisBase64) {
      Alert.alert('Potpis', 'Molimo dodajte potpis.');
      return;
    }
    if (!potpisPartner.trim()) {
      Alert.alert('Ime', 'Molimo unesite ime osobe koja potpisuje.');
      return;
    }
    setSaving(true);
    await updatePotpis(id!, potpisBase64, potpisPartner.trim());
    Alert.alert(
      '✅ Potpisan!',
      `Radni nalog potpisan od strane: ${potpisPartner}\n\nStatus: POTPISAN — čeka vaganje.`,
      [{
        text: 'U redu',
        onPress: () => router.replace('/(app)/nalozi'),
      }]
    );
    setSaving(false);
  }

  const webStyle = `.m-signature-pad { box-shadow: none; border: none; }
    .m-signature-pad--body { border: none; }
    .m-signature-pad--footer { display: none; }
    body, html { height: 100%; margin: 0; padding: 0; }`;

  return (
    <>
      <Stack.Screen options={{ title: 'Potpis partnera' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.kartica}>
          <Text style={styles.naslov}>Potpis dokumenta</Text>
          <Text style={styles.opis}>
            Partner potpisuje primitak radnog naloga. Nakon potpisa, nalog dobiva status POTPISAN i čeka vaganje.
          </Text>
        </View>

        {/* Ime potpisnika */}
        <View style={styles.kartica}>
          <Text style={styles.labela}>Ime i prezime potpisnika</Text>
          <TextInput
            style={styles.input}
            value={potpisPartner}
            onChangeText={setPotpisPartner}
            placeholder="Npr. Ivan Horvat"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
          />
        </View>

        {/* Canvas za potpis */}
        <View style={styles.kartica}>
          <Text style={styles.labela}>Potpis (prstom ili stylusom)</Text>
          <View style={styles.canvasWrapper}>
            <SignatureCanvas
              ref={sigRef}
              onOK={handleOK}
              onEmpty={() => setPotpisBase64(null)}
              webStyle={webStyle}
              backgroundColor="#FAFAFA"
              penColor="#1E293B"
              minWidth={2}
              maxWidth={5}
              style={styles.canvas}
              autoClear={false}
            />
          </View>
          {potpisBase64 && (
            <View style={styles.potpisanRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.potpisanTekst}>Potpis unesen</Text>
            </View>
          )}
        </View>

        {/* Gumbi */}
        <View style={styles.gumbi}>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleObrisi}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.btnTekst, { color: '#EF4444' }]}>OBRIŠI POTPIS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, (!potpisBase64 || saving) && styles.disabled]}
            onPress={handleSpremi}
            disabled={!potpisBase64 || saving}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.btnTekst}>POTVRDI I SPREMI</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },

  kartica: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  naslov: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  opis: { fontSize: 14, color: '#64748B', lineHeight: 20 },

  labela: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#F8FAFC',
  },

  canvasWrapper: {
    height: 250,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  canvas: { flex: 1 },

  potpisanRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  potpisanTekst: { fontSize: 13, color: '#10B981', fontWeight: '600' },

  gumbi: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  btnPrimary: { backgroundColor: '#242930' },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  btnTekst: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
});
