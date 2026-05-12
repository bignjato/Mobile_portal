// ============================================================
// VTS - SQLite shema za offline rad
// ============================================================

import { Platform } from 'react-native';

// Web nema SQLite — koristimo mock objekt
const isWeb = Platform.OS === 'web';

let db: any = null;

// Mock DB za web
const webDb = {
  execAsync: async (_sql: string) => {},
  getAllAsync: async (_sql: string, _params?: any[]) => [],
  getFirstAsync: async (_sql: string, _params?: any[]) => null,
  runAsync: async (_sql: string, _params?: any[]) => ({ lastInsertRowId: 0, changes: 0 }),
};

export async function getDatabase(): Promise<any> {
  if (isWeb) return webDb;
  if (!db) {
    const SQLite = await import('expo-sqlite');
    db = await SQLite.openDatabaseAsync('vts.db');
  }
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Radni nalozi
    CREATE TABLE IF NOT EXISTS radni_nalozi (
      id TEXT PRIMARY KEY,
      broj_rn TEXT NOT NULL UNIQUE,
      interni_broj TEXT,
      datum_dokumenta TEXT,
      datum_usluge TEXT,
      broj_plana_odvoza TEXT,
      nalog_pripremio TEXT,
      registracija_vozila TEXT,

      -- Partner
      partner_naziv TEXT,
      partner_adresa TEXT,
      partner_mjesto TEXT,
      partner_oib TEXT,

      -- Lokacija (može biti drugačija)
      lokacija_naziv TEXT,
      lokacija_adresa TEXT,
      lokacija_mjesto TEXT,

      -- Stavke (JSON array)
      stavke TEXT DEFAULT '[]',

      -- Status
      status TEXT DEFAULT 'PLANIRAN',

      -- Terenska evidencija
      vrijeme_dolaska TEXT,
      vrijeme_odlaska TEXT,
      gps_dolazak TEXT,
      potpis TEXT,
      potpis_partner TEXT,
      napomena TEXT,

      -- Sync
      sync_status TEXT DEFAULT 'synced',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Vagarinke
    CREATE TABLE IF NOT EXISTS vagarinke (
      id TEXT PRIMARY KEY,
      broj_vagarinke TEXT NOT NULL UNIQUE,
      interni_broj_rn TEXT,
      skladiste TEXT,
      vrsta_odvage TEXT,
      vaga TEXT,
      kbo TEXT,
      opis_materijala TEXT,
      prvo_vaganje REAL DEFAULT 0,
      drugo_vaganje REAL DEFAULT 0,
      ambalaza REAL DEFAULT 0,
      neto_masa REAL DEFAULT 0,
      datum_prvo_vaganje TEXT,
      datum_drugo_vaganje TEXT,
      komunalna_podrucja TEXT,
      napomena TEXT,
      potpis_vagara TEXT,
      potpis_vozaca TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (interni_broj_rn) REFERENCES radni_nalozi(broj_rn)
    );

    -- Nepravilnosti
    CREATE TABLE IF NOT EXISTS nepravilnosti (
      id TEXT PRIMARY KEY,
      radni_nalog_id TEXT NOT NULL,
      vrsta TEXT NOT NULL,
      opis TEXT,
      fotografija TEXT,
      gps TEXT,
      timestamp TEXT,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (radni_nalog_id) REFERENCES radni_nalozi(id)
    );

    -- Offline queue
    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      tip TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      pokusaji INTEGER DEFAULT 0
    );

    -- Indeksi
    CREATE INDEX IF NOT EXISTS idx_rn_status ON radni_nalozi(status);
    CREATE INDEX IF NOT EXISTS idx_rn_datum ON radni_nalozi(datum_usluge);
    CREATE INDEX IF NOT EXISTS idx_rn_sync ON radni_nalozi(sync_status);
    CREATE INDEX IF NOT EXISTS idx_vagarinka_rn ON vagarinke(interni_broj_rn);
  `);

  console.log('[DB] Baza podataka inicijalizirana');
}
