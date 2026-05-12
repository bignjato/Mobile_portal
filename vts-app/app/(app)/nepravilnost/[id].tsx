// ============================================================
// VTS - Prijava nepravilnosti
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { VrstaNepravilnosti } from '../../../src/types';
import { getDatabase } from '../../../src/database/schema';
import { pushNepravilnost } from '../../../src/services/api';

const VRSTE: { key: VrstaNepravilnosti; label: string; icon: string }[] = [
  { key: 'KRIVI_SPREMNIK',      label: 'Krivi tip/šifra spremnika', icon: 'cube-outline' },
  { key: 'ONECISCEN_MATERIJAL', label: 'Onečišćen materijal',       icon: 'warning-outline' },
  { key: 'NEDOSTUPNA_LOKACIJA', label: 'Lokacija nedostupna',        icon: 'location-outline' },
  { key: 'NEDOSTAJE_SPREMNIK',  label: 'Nedostaje spremnik',         icon: 'remove-circle-outline' },
  { key: 'OSTECEN_SPREMNIK',    label: 'Oštećen spremnik',           icon: 'hammer-outline' },
  { key: 'OSTALO',              label: 'Ostalo',                     icon: 'ellipsis-horizontal-circle-outline' },
];

export default function NepravilnostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [odabranaVrsta, setOdabranaVrsta] = useState<VrstaNepravilnosti | null>(null);
  const [opis, setOpis] = useState('');
  const [fotografija, setFotografija] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFoto() {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setFotografija(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  }

  async function handleSpremi() {
    if (!odabranaVrsta) {
      Alert.alert('Nepravilnost', 'Odaberite vrstu nepravilnosti.');
      return;
    }
    if (!opis.trim()) {
      Alert.alert('Opis', 'Unesite kratki opis nepravilnosti.');
      return;
    }

    setSaving(true);
    try {
      const lokacija = await Location.getCurrentPositionAsync({}).catch(() => null);

      const db = await getDatabase();
      const nepId = `NEP-${Date.now()}`;
      await db.runAsync(
        `INSERT INTO nepravilnosti (id, radni_nalog_id, vrsta, opis, fotografija, gps, timestamp, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 'pending')`,
        [
          nepId, id!, odabranaVrsta, opis.trim(),
          fotografija ?? null,
          lokacija ? JSON.stringify({
            latitude: lokacija.coords.latitude,
            longitude: lokacija.coords.longitude,
            timestamp: lokacija.timestamp,
          }) : null,
        ]
      );

      // Pokušaj odmah sync
      try {
        await pushNepravilnost(
          id!, odabranaVrsta, opis.trim(), fotografija ?? undefined,
          lokacija ? { latitude: lokacija.coords.latitude, longitude: lokacija.coords.longitude } : undefined
        );
        await db.runAsync(`UPDATE nepravilnosti SET sync_status='synced' WHERE id=?`, [nepId]);
      } catch { /* offline — ostat će pending */ }

      Alert.alert('✅ Nepravilnost prijavljena', 'Nepravilnost je zabilježena.', [
        { text: 'U redu', onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Prijava nepravilnosti', headerStyle: { backgroundColor: '#DC2626' } }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Odabir vrste */}
        <View style={styles.kartica}>
          <Text style={styles.sekcijaNaslov}>VRSTA NEPRAVILNOSTI</Text>
          {VRSTE.map((v) => (
            <TouchableOpacity
              key={v.key}
              style={[styles.vrstaBtn, odabranaVrsta === v.key && styles.vrstaBtnAktivan]}
              onPress={() => setOdabranaVrsta(v.key)}
            >
              <Ionicons
                name={v.icon as any}
                size={22}
                color={odabranaVrsta === v.key ? '#fff' : '#64748B'}
              />
              <Text style={[styles.vrstaTekst, odabranaVrsta === v.key && styles.vrstaTekstAktivan]}>
                {v.label}
              </Text>
              {odabranaVrsta === v.key && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Opis */}
        <View style={styles.kartica}>
          <Text style={styles.sekcijaNaslov}>OPIS</Text>
          <TextInput
            style={styles.textarea}
            value={opis}
            onChangeText={setOpis}
            placeholder="Opišite nepravilnost..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Fotografija */}
        <View style={styles.kartica}>
          <Text style={styles.sekcijaNaslov}>FOTOGRAFIJA (opcijalno)</Text>
          {fotografija ? (
            <View>
              <Image source={{ uri: fotografija }} style={styles.previewFoto} />
              <TouchableOpacity style={styles.obrisiBtn} onPress={() => setFotografija(null)}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.obrisiTekst}>Ukloni fotografiju</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.fotoBtn} onPress={handleFoto}>
              <Ionicons name="camera-outline" size={32} color="#94A3B8" />
              <Text style={styles.fotoBtnTekst}>Fotografiraj nepravilnost</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Akcije */}
        <View style={styles.akcije}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelTekst}>Odustani</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.disabled]}
            onPress={handleSpremi}
            disabled={saving}
          >
            <Ionicons name="warning" size={18} color="#fff" />
            <Text style={styles.submitTekst}>PRIJAVI NEPRAVILNOST</Text>
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
  sekcijaNaslov: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  vrstaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  vrstaBtnAktivan: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  vrstaTekst: { fontSize: 15, color: '#374151', flex: 1 },
  vrstaTekstAktivan: { color: '#fff', fontWeight: '600' },

  textarea: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#F8FAFC',
    minHeight: 100,
  },

  fotoBtn: {
    height: 120,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fotoBtnTekst: { fontSize: 14, color: '#94A3B8' },
  previewFoto: { width: '100%', height: 200, borderRadius: 10 },
  obrisiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  obrisiTekst: { color: '#EF4444', fontSize: 13 },

  akcije: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cancelTekst: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#DC2626',
  },
  submitTekst: { fontSize: 15, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.5 },
});
