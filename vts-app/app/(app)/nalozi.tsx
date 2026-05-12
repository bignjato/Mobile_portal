// ============================================================
// VTS - Lista dnevnih radnih naloga
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { fetchDnevniNalozi } from '../../src/services/api';
import { getDnevniNalozi, upsertRadniNalog } from '../../src/database/radniNalogRepo';
import { logout } from '../../src/services/api';
import { syncPendingItems } from '../../src/services/syncService';
import { RadniNalog, StatusRN } from '../../src/types';
import OneTechLogo from '../../src/components/OneTechLogo';

const STATUS_BOJA: Record<StatusRN, string> = {
  PLANIRAN:     '#64748B',
  U_TIJEKU:     '#F59E0B',
  NA_LOKACIJI:  '#3B82F6',
  PREUZET:      '#8B5CF6',
  POTPISAN:     '#10B981',
  IZVAGANO:     '#22C55E',
  ZATVOREN:     '#6B7280',
  NEPRAVILNOST: '#EF4444',
};

const STATUS_LABEL: Record<StatusRN, string> = {
  PLANIRAN:     'Planiran',
  U_TIJEKU:     'U tijeku',
  NA_LOKACIJI:  'Na lokaciji',
  PREUZET:      'Preuzet',
  POTPISAN:     'Potpisan',
  IZVAGANO:     'Izvagano',
  ZATVOREN:     'Zatvoren',
  NEPRAVILNOST: '⚠ Nepravilnost',
};

export default function NaloziScreen() {
  const danas = format(new Date(), 'yyyy-MM-dd');
  const [nalozi, setNalozi] = useState<RadniNalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncInfo, setSyncInfo] = useState('');

  async function ucitajNaloge(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      // Pokušaj dohvatiti s API-ja
      const apiNalozi = await fetchDnevniNalozi(danas);
      for (const rn of apiNalozi) {
        await upsertRadniNalog(rn);
      }
    } catch {
      // Nema interneta — koristimo lokalnu bazu
    }
    const lokalniNalozi = await getDnevniNalozi(danas);
    setNalozi(lokalniNalozi);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => {
      ucitajNaloge();
    }, [])
  );

  async function handleSync() {
    setSyncInfo('Sinkronizacija...');
    const { ok, greske } = await syncPendingItems();
    setSyncInfo(`Synced: ${ok}, Greške: ${greske}`);
    setTimeout(() => setSyncInfo(''), 3000);
    ucitajNaloge();
  }

  async function handleLogout() {
    Alert.alert('Odjava', 'Jeste li sigurni?', [
      { text: 'Odustani', style: 'cancel' },
      {
        text: 'Odjava', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const renderNalog = ({ item }: { item: RadniNalog }) => {
    const stavka = item.stavke[0];
    return (
      <TouchableOpacity
        style={styles.kartica}
        onPress={() => router.push(`/(app)/nalog/${item.id}`)}
        activeOpacity={0.85}
      >
        {/* Lijevi colored border */}
        <View style={[styles.statusBar, { backgroundColor: STATUS_BOJA[item.status] }]} />

        <View style={styles.karticeBody}>
          {/* Gornji red */}
          <View style={styles.row}>
            <Text style={styles.brRN}>RN: {item.brojRN}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_BOJA[item.status] + '22' }]}>
              <Text style={[styles.statusTekst, { color: STATUS_BOJA[item.status] }]}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
          </View>

          {/* Partner */}
          <Text style={styles.partnerNaziv} numberOfLines={1}>{item.partner.naziv}</Text>
          <Text style={styles.adresa} numberOfLines={1}>
            <Ionicons name="location-outline" size={13} color="#64748B" /> {item.lokacija.adresa}
          </Text>

          {/* Materijal */}
          {stavka && (
            <View style={styles.materijalRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{stavka.tipSpremnika}</Text>
              </View>
              <Text style={styles.materijalTekst} numberOfLines={1}>{stavka.nazivRobe}</Text>
              {stavka.kolicina > 0 && (
                <Text style={styles.kolicina}>{stavka.kolicina.toLocaleString('hr')} {stavka.jedMjere}</Text>
              )}
            </View>
          )}

          {/* Donji red */}
          <View style={styles.bottomRow}>
            <Text style={styles.datumTekst}>
              <Ionicons name="calendar-outline" size={12} /> {format(new Date(item.datumUsluge), 'd. MMMM yyyy.', { locale: hr })}
            </Text>
            {item.vrijemeDolaska && (
              <Text style={styles.dolazakTekst}>
                <Ionicons name="time-outline" size={12} /> Dolazak: {item.vrijemeDolaska}
              </Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={22} color="#CBD5E1" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#242930" />
        <Text style={styles.loadingTekst}>Učitavam radne naloge...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <OneTechLogo variant="on-dark" width={140} />
          <Text style={styles.headerSubtitle}>
            {format(new Date(), 'EEEE, d. MMMM yyyy.', { locale: hr })} · {nalozi.length} naloga
          </Text>
        </View>
        <View style={styles.headerActions}>
          {syncInfo ? <Text style={styles.syncInfo}>{syncInfo}</Text> : null}
          <TouchableOpacity style={styles.iconBtn} onPress={handleSync}>
            <Ionicons name="sync-outline" size={24} color="#242930" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={nalozi}
        keyExtractor={(item) => item.id}
        renderItem={renderNalog}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => ucitajNaloge(true)} />
        }
        ListEmptyComponent={
          <View style={styles.prazno}>
            <Ionicons name="document-outline" size={64} color="#CBD5E1" />
            <Text style={styles.praznoTekst}>Nema radnih naloga za danas</Text>
            <Text style={styles.praznoPodtekst}>Povucite dolje za osvježavanje</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTekst: { marginTop: 12, color: '#64748B', fontSize: 15 },

  header: {
    backgroundColor: '#242930',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncInfo: { fontSize: 12, color: '#FCA5A5' },
  iconBtn: {
    backgroundColor: '#fff2',
    borderRadius: 8,
    padding: 8,
  },

  lista: { padding: 16, gap: 12 },

  kartica: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBar: { width: 6 },
  karticeBody: { flex: 1, padding: 14 },
  chevron: { alignSelf: 'center', marginRight: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brRN: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusTekst: { fontSize: 12, fontWeight: '600' },

  partnerNaziv: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  adresa: { fontSize: 13, color: '#64748B', marginTop: 2 },

  materijalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  chip: { backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 12, fontWeight: '700', color: '#242930' },
  materijalTekst: { flex: 1, fontSize: 13, color: '#374151' },
  kolicina: { fontSize: 13, fontWeight: '700', color: '#059669' },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  datumTekst: { fontSize: 12, color: '#94A3B8' },
  dolazakTekst: { fontSize: 12, color: '#10B981', fontWeight: '600' },

  prazno: { flex: 1, alignItems: 'center', paddingTop: 80 },
  praznoTekst: { fontSize: 18, fontWeight: '600', color: '#94A3B8', marginTop: 16 },
  praznoPodtekst: { fontSize: 14, color: '#CBD5E1', marginTop: 4 },
});
