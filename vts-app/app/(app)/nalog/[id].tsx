// ============================================================
// VTS - Detalj radnog naloga + Dolazak na lokaciju
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { getNalogById, updateDolazak, updateStatus } from '../../../src/database/radniNalogRepo';
import { RadniNalog } from '../../../src/types';

export default function NalogDetalj() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [nalog, setNalog] = useState<RadniNalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [dolazakLoading, setDolazakLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getNalogById(id).then((rn) => {
        setNalog(rn);
        setLoading(false);
      });
    }
  }, [id]);

  async function handleDolazak() {
    if (!nalog) return;
    setDolazakLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('GPS nije dostupan', 'Dozvola za lokaciju nije odobrena.');
      setDolazakLoading(false);
      return;
    }

    const lokacija = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const sada = format(new Date(), 'HH:mm:ss');

    await updateDolazak(id!, sada, {
      latitude: lokacija.coords.latitude,
      longitude: lokacija.coords.longitude,
      timestamp: lokacija.timestamp,
    });

    Alert.alert(
      '✅ Dolazak zabilježen',
      `Vrijeme: ${sada}\nGPS: ${lokacija.coords.latitude.toFixed(5)}, ${lokacija.coords.longitude.toFixed(5)}`,
      [{ text: 'Nastavi', onPress: () => getNalogById(id!).then(setNalog) }]
    );
    setDolazakLoading(false);
  }

  async function handleZavrsiPreuzimanje() {
    if (!nalog) return;
    await updateStatus(nalog.id, 'PREUZET');
    router.push(`/(app)/potpis/${nalog.id}`);
  }

  function handleNepravilnost() {
    router.push(`/(app)/nepravilnost/${nalog?.id}`);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#242930" />
      </View>
    );
  }

  if (!nalog) {
    return (
      <View style={styles.centered}>
        <Text>Radni nalog nije pronađen.</Text>
      </View>
    );
  }

  const stavka = nalog.stavke[0];
  const jeNaLokaciji = ['NA_LOKACIJI', 'PREUZET', 'POTPISAN', 'IZVAGANO', 'ZATVOREN'].includes(nalog.status);

  return (
    <>
      <Stack.Screen options={{ title: `RN: ${nalog.brojRN}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* ── INFO KARTICA ── */}
        <View style={styles.kartica}>
          <Text style={styles.sekcijaNaslov}>RADNI NALOG</Text>
          <InfoRed labela="Broj RN" vrijednost={nalog.brojRN} bold />
          <InfoRed labela="Interni broj" vrijednost={nalog.interniBroj} />
          <InfoRed labela="Datum usluge" vrijednost={format(new Date(nalog.datumUsluge), 'd. MMMM yyyy.', { locale: hr })} />
          <InfoRed labela="Pripremio" vrijednost={nalog.nalogPripremio} />
          <InfoRed labela="Vozilo" vrijednost={nalog.registracijaVozila} />
        </View>

        {/* ── PARTNER / LOKACIJA ── */}
        <View style={styles.kartica}>
          <Text style={styles.sekcijaNaslov}>LOKACIJA PREUZIMANJA</Text>
          <Text style={styles.partnerNaziv}>{nalog.lokacija.naziv}</Text>
          <Text style={styles.adresa}>{nalog.lokacija.adresa}</Text>
          <Text style={styles.adresa}>{nalog.lokacija.mjesto}</Text>
          <Text style={styles.oib}>OIB: {nalog.partner.oib}</Text>
        </View>

        {/* ── STAVKE / MATERIJAL ── */}
        {nalog.stavke.map((stavka, i) => (
          <View key={i} style={styles.kartica}>
            <Text style={styles.sekcijaNaslov}>STAVKA {stavka.rbr}</Text>
            <InfoRed labela="Materijal" vrijednost={stavka.nazivRobe} bold />
            <InfoRed labela="KBR" vrijednost={stavka.kbr} />
            <InfoRed labela="Šifra artikla" vrijednost={stavka.sifraArtikla} />
            <View style={styles.spremniciRow}>
              <View style={styles.spremnickiChip}>
                <Text style={styles.spremnickiLabel}>SPREMNIK</Text>
                <Text style={styles.spremnickiVrijednost}>{stavka.spremnik}</Text>
              </View>
              <View style={styles.spremnickiChip}>
                <Text style={styles.spremnickiLabel}>TIP</Text>
                <Text style={styles.spremnickiVrijednost}>{stavka.tipSpremnika}</Text>
              </View>
              {stavka.kolicina > 0 && (
                <View style={[styles.spremnickiChip, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={styles.spremnickiLabel}>KOLIČINA</Text>
                  <Text style={[styles.spremnickiVrijednost, { color: '#059669' }]}>
                    {stavka.kolicina.toLocaleString('hr')} {stavka.jedMjere}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* ── GPS / DOLAZAK ── */}
        {jeNaLokaciji && nalog.vrijemeDolaska && (
          <View style={[styles.kartica, styles.dolazakKartica]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.dolazakTekst}>
              Dolazak zabilježen u {nalog.vrijemeDolaska}
            </Text>
          </View>
        )}

        {/* ── AKCIJSKI GUMBI ── */}
        <View style={styles.akcije}>
          {nalog.status === 'PLANIRAN' || nalog.status === 'U_TIJEKU' ? (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleDolazak}
              disabled={dolazakLoading}
            >
              {dolazakLoading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="location" size={20} color="#fff" />
                    <Text style={styles.btnTekst}>ZABILJEŽI DOLAZAK</Text>
                  </>
              }
            </TouchableOpacity>
          ) : null}

          {nalog.status === 'NA_LOKACIJI' && (
            <TouchableOpacity
              style={[styles.btn, styles.btnSuccess]}
              onPress={handleZavrsiPreuzimanje}
            >
              <Ionicons name="cube" size={20} color="#fff" />
              <Text style={styles.btnTekst}>PREUZIMANJE ZAVRŠENO → POTPIS</Text>
            </TouchableOpacity>
          )}

          {nalog.status === 'POTPISAN' && (
            <TouchableOpacity
              style={[styles.btn, styles.btnVaganje]}
              onPress={() => router.push(`/(app)/vagarinka/${nalog.id}`)}
            >
              <Ionicons name="scale" size={20} color="#fff" />
              <Text style={styles.btnTekst}>PRIKAŽI VAGARINKU</Text>
            </TouchableOpacity>
          )}

          {/* Nepravilnost uvijek dostupan */}
          {!['ZATVOREN', 'IZVAGANO'].includes(nalog.status) && (
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={handleNepravilnost}
            >
              <Ionicons name="warning" size={20} color="#fff" />
              <Text style={styles.btnTekst}>PRIJAVI NEPRAVILNOST</Text>
            </TouchableOpacity>
          )}
        </View>

        {nalog.napomena ? (
          <View style={styles.kartica}>
            <Text style={styles.sekcijaNaslov}>NAPOMENA</Text>
            <Text style={styles.napomenaTekst}>{nalog.napomena}</Text>
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}

function InfoRed({ labela, vrijednost, bold }: { labela: string; vrijednost?: string; bold?: boolean }) {
  if (!vrijednost) return null;
  return (
    <View style={infoStyles.red}>
      <Text style={infoStyles.labela}>{labela}</Text>
      <Text style={[infoStyles.vrijednost, bold && infoStyles.bold]}>{vrijednost}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  red: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  labela: { fontSize: 13, color: '#64748B', flex: 1 },
  vrijednost: { fontSize: 13, color: '#1E293B', flex: 2, textAlign: 'right' },
  bold: { fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  partnerNaziv: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  adresa: { fontSize: 14, color: '#475569', marginTop: 2 },
  oib: { fontSize: 12, color: '#94A3B8', marginTop: 4 },

  spremniciRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  spremnickiChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  spremnickiLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 1 },
  spremnickiVrijednost: { fontSize: 16, fontWeight: '800', color: '#242930', marginTop: 2 },

  dolazakKartica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dolazakTekst: { fontSize: 14, fontWeight: '600', color: '#059669' },

  akcije: { gap: 10 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 16,
  },
  btnPrimary: { backgroundColor: '#EF0C0C' },
  btnSuccess: { backgroundColor: '#059669' },
  btnVaganje: { backgroundColor: '#242930' },
  btnDanger: { backgroundColor: '#EF4444' },
  btnTekst: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },

  napomenaTekst: { fontSize: 14, color: '#374151', lineHeight: 20 },
});
