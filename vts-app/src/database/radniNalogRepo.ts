// ============================================================
// VTS - Repository za Radne Naloge (SQLite)
// ============================================================

import { getDatabase } from './schema';
import { RadniNalog, StatusRN } from '../types';

function rowToRN(row: any): RadniNalog {
  return {
    id: row.id,
    brojRN: row.broj_rn,
    interniBroj: row.interni_broj,
    datumDokumenta: row.datum_dokumenta,
    datumUsluge: row.datum_usluge,
    brojPlanaOdvoza: row.broj_plana_odvoza,
    nalogPripremio: row.nalog_pripremio,
    registracijaVozila: row.registracija_vozila,
    partner: {
      id: row.partner_oib,
      naziv: row.partner_naziv,
      adresa: row.partner_adresa,
      mjesto: row.partner_mjesto,
      drzava: 'HR',
      oib: row.partner_oib,
    },
    lokacija: {
      id: row.partner_oib,
      naziv: row.lokacija_naziv,
      adresa: row.lokacija_adresa,
      mjesto: row.lokacija_mjesto,
      drzava: 'HR',
      oib: row.partner_oib,
    },
    stavke: JSON.parse(row.stavke || '[]'),
    status: row.status as StatusRN,
    vrijemeDolaska: row.vrijeme_dolaska,
    vrijemeOdlaska: row.vrijeme_odlaska,
    gpsDoalazak: row.gps_dolazak ? JSON.parse(row.gps_dolazak) : undefined,
    potpis: row.potpis,
    potpisPartner: row.potpis_partner,
    napomena: row.napomena,
    syncStatus: row.sync_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDnevniNalozi(datumUsluge: string): Promise<RadniNalog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM radni_nalozi WHERE datum_usluge = ? ORDER BY partner_naziv ASC`,
    [datumUsluge]
  );
  return rows.map(rowToRN);
}

export async function getNalogById(id: string): Promise<RadniNalog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT * FROM radni_nalozi WHERE id = ?`,
    [id]
  );
  return row ? rowToRN(row) : null;
}

export async function upsertRadniNalog(rn: RadniNalog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO radni_nalozi (
      id, broj_rn, interni_broj, datum_dokumenta, datum_usluge,
      broj_plana_odvoza, nalog_pripremio, registracija_vozila,
      partner_naziv, partner_adresa, partner_mjesto, partner_oib,
      lokacija_naziv, lokacija_adresa, lokacija_mjesto,
      stavke, status, vrijeme_dolaska, vrijeme_odlaska,
      gps_dolazak, potpis, potpis_partner, napomena,
      sync_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      rn.id, rn.brojRN, rn.interniBroj, rn.datumDokumenta, rn.datumUsluge,
      rn.brojPlanaOdvoza ?? null, rn.nalogPripremio, rn.registracijaVozila,
      rn.partner.naziv, rn.partner.adresa, rn.partner.mjesto, rn.partner.oib,
      rn.lokacija.naziv, rn.lokacija.adresa, rn.lokacija.mjesto,
      JSON.stringify(rn.stavke), rn.status,
      rn.vrijemeDolaska ?? null, rn.vrijemeOdlaska ?? null,
      rn.gpsDoalazak ? JSON.stringify(rn.gpsDoalazak) : null,
      rn.potpis ?? null, rn.potpisPartner ?? null, rn.napomena ?? null,
      rn.syncStatus, rn.createdAt, rn.updatedAt,
    ]
  );
}

export async function updateStatus(id: string, status: StatusRN): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE radni_nalozi SET status = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?`,
    [status, id]
  );
}

export async function updateDolazak(
  id: string,
  vrijemeDolaska: string,
  gps: { latitude: number; longitude: number; timestamp: number }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE radni_nalozi SET
      status = 'NA_LOKACIJI',
      vrijeme_dolaska = ?,
      gps_dolazak = ?,
      sync_status = 'pending',
      updated_at = datetime('now')
    WHERE id = ?`,
    [vrijemeDolaska, JSON.stringify(gps), id]
  );
}

export async function updatePotpis(
  id: string,
  potpis: string,
  potpisPartner: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE radni_nalozi SET
      status = 'POTPISAN',
      potpis = ?,
      potpis_partner = ?,
      sync_status = 'pending',
      updated_at = datetime('now')
    WHERE id = ?`,
    [potpis, potpisPartner, id]
  );
}

export async function getPendingSync(): Promise<RadniNalog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM radni_nalozi WHERE sync_status = 'pending'`
  );
  return rows.map(rowToRN);
}

export async function markSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE radni_nalozi SET sync_status = 'synced' WHERE id = ?`,
    [id]
  );
}
