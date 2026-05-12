// ============================================================
// VTS MOBILNI PORTAL - Tipovi podataka
// Usklađeno s poljima iz RadniNalog i Vagarinka dokumenata
// ============================================================

export interface Vozac {
  id: string;
  ime: string;
  prezime: string;
  korisnickoIme: string;
  registracijaVozila: string;
}

export interface Partner {
  id: string;
  naziv: string;
  adresa: string;
  mjesto: string;
  drzava: string;
  oib: string;
}

export interface StavkaRN {
  rbr: number;
  sifraArtikla: string;        // npr. R105004
  nazivRobe: string;           // npr. "1.02 Miješani papir"
  kbr: string;                 // npr. "20 01 01"
  spremnik: string;            // npr. "R105004"
  tipSpremnika: string;        // npr. "32S" (32 m³ sandučar)
  kolicina: number;            // npr. 9680
  jedMjere: string;            // npr. "kg"
}

export type StatusRN =
  | 'PLANIRAN'
  | 'U_TIJEKU'
  | 'NA_LOKACIJI'
  | 'PREUZET'
  | 'POTPISAN'
  | 'IZVAGANO'
  | 'ZATVOREN'
  | 'NEPRAVILNOST';

export interface LokacijaGPS {
  latitude: number;
  longitude: number;
  timestamp: number;
  tocnost?: number;
}

export interface RadniNalog {
  id: string;
  brojRN: string;              // npr. "26068869"
  interniBroj: string;         // npr. "2501100003743"
  datumDokumenta: string;      // ISO string
  datumUsluge: string;         // ISO string
  brojPlanaOdvoza?: string;
  nalogPripremio: string;      // npr. "Goran Hulina"
  registracijaVozila: string;  // npr. "ZG 6581-KN"

  partner: Partner;
  lokacija: Partner;           // može biti drugačija od partnera
  stavke: StavkaRN[];

  status: StatusRN;

  // Podaci uneseni na terenu
  vrijemeDolaska?: string;
  vrijemeOdlaska?: string;
  gpsDoalazak?: LokacijaGPS;
  potpis?: string;             // base64 SVG/PNG
  potpisPartner?: string;      // ime osobe koja je potpisala
  napomena?: string;

  // Sync
  syncStatus: 'synced' | 'pending' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface Vagarinka {
  id: string;
  brojVagarinke: string;       // npr. "26070748"
  interniBrojRN: string;       // vezuje na RadniNalog.brojRN
  skladiste: string;
  vrstaOdvage: string;         // "Ulaz otpada"
  vaga: string;                // "Velika vaga 2.vaganje"

  kbo: string;                 // "20 01 01"
  opisMaterijala: string;      // "1.02 Miješani papir"

  prvoVaganje: number;
  drugoVaganje: number;
  ambalaza: number;
  netoMasa: number;
  datumPrvoVaganje: string;
  datumDrugoVaganje: string;

  komunalnaPodrucja?: string;
  napomena?: string;
  potpisVagara?: string;
  potpisVozaca?: string;

  createdAt: string;
}

export type VrstaNepravilnosti =
  | 'KRIVI_SPREMNIK'
  | 'ONECISCEN_MATERIJAL'
  | 'NEDOSTUPNA_LOKACIJA'
  | 'NEDOSTAJE_SPREMNIK'
  | 'OSTECEN_SPREMNIK'
  | 'OSTALO';

export interface Nepravilnost {
  id: string;
  radniNalogId: string;
  vrsta: VrstaNepravilnosti;
  opis: string;
  fotografija?: string;        // base64 ili URI
  gps?: LokacijaGPS;
  timestamp: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface OfflineQueueItem {
  id: string;
  tip: 'STATUS_UPDATE' | 'POTPIS' | 'NEPRAVILNOST' | 'VAGARINKA';
  payload: object;
  timestamp: string;
  pokusaji: number;
}

// Navigacijski tipovi
export type RootStackParams = {
  '(auth)/login': undefined;
  '(app)/nalozi': undefined;
  '(app)/nalog/[id]': { id: string };
  '(app)/lokacija/[id]': { id: string };
  '(app)/potpis/[id]': { id: string };
  '(app)/nepravilnost/[id]': { id: string };
  '(app)/vagarinka/[id]': { id: string };
};
