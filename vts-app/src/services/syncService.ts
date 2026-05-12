// ============================================================
// VTS - Offline Sync servis
// Radi sinkronizaciju kad internet postane dostupan
// ============================================================

import NetInfo from '@react-native-community/netinfo';
import { getPendingSync, markSynced } from '../database/radniNalogRepo';
import { pushStatusUpdate, pushPotpis } from './api';

export async function syncPendingItems(): Promise<{ ok: number; greske: number }> {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    console.log('[SYNC] Nema interneta, preskačem sync');
    return { ok: 0, greske: 0 };
  }

  const pending = await getPendingSync();
  let ok = 0;
  let greske = 0;

  for (const rn of pending) {
    try {
      if (rn.status === 'POTPISAN' && rn.potpis) {
        await pushPotpis(
          rn.brojRN,
          rn.potpis,
          rn.potpisPartner ?? '',
          rn.gpsDoalazak ?? {}
        );
      } else {
        await pushStatusUpdate(rn.brojRN, rn.status, {
          vrijemeDolaska: rn.vrijemeDolaska,
          vrijemeOdlaska: rn.vrijemeOdlaska,
          gps: rn.gpsDoalazak,
          napomena: rn.napomena,
        });
      }
      await markSynced(rn.id);
      ok++;
    } catch (err) {
      console.error('[SYNC] Greška za RN', rn.brojRN, err);
      greske++;
    }
  }

  console.log(`[SYNC] Završeno: ${ok} synced, ${greske} grešaka`);
  return { ok, greske };
}

export function startAutoSync(intervalMs = 30_000): () => void {
  const id = setInterval(() => {
    syncPendingItems().catch(console.error);
  }, intervalMs);
  return () => clearInterval(id);
}
