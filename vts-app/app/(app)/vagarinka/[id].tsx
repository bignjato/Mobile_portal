// ============================================================
// VTS - Prikaz Vagarinke
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { getNalogById, updateStatus } from '../../../src/database/radniNalogRepo';
import { fetchVagarinka } from '../../../src/services/api';
import { RadniNalog, Vagarinka } from '../../../src/types';

export default function VagarinkaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [nalog, setNalog] = useState<RadniNalog | null>(null);
  const [vagarinka, setVagarinka] = useState<Vagarinka | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(false);

  useEffect(() => {
    ucitaj();
  }, [id]);

  async function ucitaj() {
    if (!id) return;
    const rn = await getNalogById(id);
    setNalog(rn);
    if (rn) {
      await provjeriVagarinku(rn.interniBroj);
    }
    setLoading(false);
  }

  async function provjeriVagarinku(interniBroj: string) {
    const v = await fetchVagarinka(interniBroj).catch(() => null);
    if (v) {
      setVagarinka(v);
      // Ažuriraj status na IZVAGANO
      if (nalog && nalog.status === 'POTPISAN') {
        await updateStatus(nalog.id, 'IZVAGANO');
      }
    }
  }

  async function handleRefresh() {
    if (!nalog) return;
    setPollingActive(true);
    await provjeriVagarinku(nalog.interniBroj);
    setPollingActive(false);
  }

  async function handleNoviNalog() {
    if (!nalog) return;
    await updateStatus(nalog.id, 'ZATVOREN');
    router.replace('/(app)/nalozi');
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#242930" /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Vagarinka', headerStyle: { backgroundColor: '#242930' } }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Status RN */}
        <View style={[styles.kartica, styles.statusKartica]}>
          <Ionicons
            name={vagarinka ? 'checkmark-circle' : 'time-outline'}
            size={28}
            color={vagarinka ? '#10B981' : '#F59E0B'}
          />
          <View>
            <Text style={styles.statusNaslov}>
              {vagarinka ? 'Vaganje završeno' : 'Čeka vaganje'}
            </Text>
            <Text style={styles.statusOpis}>
              {vagarinka
                ? `RN ${nalog?.brojRN} je uspješno izvagan`
                : 'Vozilo treba otići na vagu'}
            </Text>
          </View>
        </View>

        {/* Info o RN */}
        {nalog && (
          <View style={styles.kartica}>
            <Text style={styles.sekcijaNaslov}>RADNI NALOG</Text>
            <InfoRed labela="Broj RN" vrijednost={nalog.brojRN} bold />
            <InfoRed labela="Interni broj" vrijednost={nalog.interniBroj} />
            <InfoRed labela="Partner" vrijednost={nalog.partner.naziv} />
            <InfoRed labela="Materijal" vrijednost={nalog.stavke[0]?.nazivRobe} />
            <InfoRed labela="Potpis primljen u" vrijednost={nalog.vrijemeDolaska} />
          </View>
        )}

        {/* Vagarinka podaci */}
        {vagarinka ? (
          <View style={styles.kartica}>
            <Text style={styles.sekcijaNaslov}>VAGARINKA</Text>
            <InfoRed labela="Broj vagarinke" vrijednost={vagarinka.brojVagarinke} bold />
            <InfoRed labela="Skladište" vrijednost={vagarinka.skladiste} />
            <InfoRed labela="Vaga" vrijednost={vagarinka.vaga} />
            <InfoRed labela="Vrsta odvage" vrijednost={vagarinka.vrstaOdvage} />
            <InfoRed labela="KBO / Materijal" vrijednost={`${vagarinka.kbo} – ${vagarinka.opisMaterijala}`} />

            {/* Vizualni prikaz vaganja */}
            <View style={styles.vagaKontejner}>
              <VagaRed labela="Prvo vaganje" vrijednost={vagarinka.prvoVaganje} datum={vagarinka.datumPrvoVaganje} />
              <VagaRed labela="Drugo vaganje" vrijednost={vagarinka.drugoVaganje} datum={vagarinka.datumDrugoVaganje} />
              <VagaRed labela="Ambalaža" vrijednost={vagarinka.ambalaza} />
              <View style={styles.netoDivider} />
              <View style={styles.netoRow}>
                <Text style={styles.netoLabela}>NETO MASA</Text>
                <Text style={styles.netoVrijednost}>
                  {vagarinka.netoMasa.toLocaleString('hr')} kg
                </Text>
              </View>
            </View>

            {vagarinka.komunalnaPodrucja && (
              <InfoRed labela="Komunalna područja" vrijednost={vagarinka.komunalnaPodrucja} />
            )}
          </View>
        ) : (
          <View style={styles.kartica}>
            <View style={styles.cekaNjePrikaz}>
              <Ionicons name="scale-outline" size={48} color="#CBD5E1" />
              <Text style={styles.cekaNjeTekst}>Vagarinka još nije dostupna</Text>
              <Text style={styles.cekaNjeOpis}>
                Vagarinka će biti automatski dohvaćena kad vaga završi mjerenje.
              </Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={handleRefresh}
                disabled={pollingActive}
              >
                <Ionicons name="refresh-outline" size={18} color="#242930" />
                <Text style={styles.refreshTekst}>
                  {pollingActive ? 'Provjeram...' : 'Provjeri status'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Novi RN gumb */}
        <TouchableOpacity style={styles.noviNalogBtn} onPress={handleNoviNalog}>
          <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
          <Text style={styles.noviNalogTekst}>SLJEDEĆI RADNI NALOG</Text>
        </TouchableOpacity>

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

function VagaRed({ labela, vrijednost, datum }: { labela: string; vrijednost: number; datum?: string }) {
  return (
    <View style={vagaStyles.red}>
      <Text style={vagaStyles.labela}>{labela}</Text>
      <View style={vagaStyles.desno}>
        {datum && <Text style={vagaStyles.datum}>{datum}</Text>}
        <Text style={vagaStyles.vrijednost}>{vrijednost.toLocaleString('hr')} kg</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  red: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  labela: { fontSize: 13, color: '#64748B', flex: 1 },
  vrijednost: { fontSize: 13, color: '#1E293B', flex: 2, textAlign: 'right' },
  bold: { fontWeight: '700' },
});

const vagaStyles = StyleSheet.create({
  red: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  labela: { fontSize: 14, color: '#475569' },
  desno: { alignItems: 'flex-end' },
  datum: { fontSize: 11, color: '#94A3B8' },
  vrijednost: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
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
  statusKartica: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  statusNaslov: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  statusOpis: { fontSize: 13, color: '#64748B', marginTop: 2 },

  sekcijaNaslov: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 10 },

  vagaKontejner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  netoDivider: { height: 1.5, backgroundColor: '#E2E8F0', marginVertical: 8 },
  netoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netoLabela: { fontSize: 13, fontWeight: '800', color: '#374151', letterSpacing: 1 },
  netoVrijednost: { fontSize: 22, fontWeight: '900', color: '#059669' },

  cekaNjePrikaz: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  cekaNjeTekst: { fontSize: 16, fontWeight: '700', color: '#94A3B8' },
  cekaNjeOpis: { fontSize: 13, color: '#CBD5E1', textAlign: 'center', maxWidth: 280 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  refreshTekst: { fontSize: 14, fontWeight: '600', color: '#242930' },

  noviNalogBtn: {
    backgroundColor: '#EF0C0C',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  noviNalogTekst: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
