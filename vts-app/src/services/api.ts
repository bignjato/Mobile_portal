// ============================================================
// VTS - API servis za komunikaciju s portalom
// Prilagoditi BASE_URL i endpoint putanje vašem sustavu
// ============================================================

import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { RadniNalog, Vagarinka } from '../types';

// Web fallback za SecureStore (koristi localStorage)
const store = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.deleteItemAsync(key);
  },
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.vas-portal.hr/v1';

let apiInstance: AxiosInstance | null = null;

function getApi(): AxiosInstance {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Automatski dodaj Bearer token
    apiInstance.interceptors.request.use(async (config) => {
      const token = await store.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Globalno hvatanje grešaka
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[API] Greška:', error?.response?.status, error?.message);
        return Promise.reject(error);
      }
    );
  }
  return apiInstance;
}

// ── AUTH ──────────────────────────────────────────────────────
export async function login(
  korisnickoIme: string,
  lozinka: string
): Promise<{ token: string; vozac: { id: string; ime: string; prezime: string; registracijaVozila: string } }> {
  const api = getApi();
  const response = await api.post('/auth/login', { korisnickoIme, lozinka });
  const { token, vozac } = response.data;
  await store.setItemAsync('auth_token', token);
  await store.setItemAsync('vozac', JSON.stringify(vozac));
  return response.data;
}

export async function logout(): Promise<void> {
  await store.deleteItemAsync('auth_token');
  await store.deleteItemAsync('vozac');
  apiInstance = null;
}

export async function getSavedVozac() {
  const raw = await store.getItemAsync('vozac');
  return raw ? JSON.parse(raw) : null;
}

// ── RADNI NALOZI ──────────────────────────────────────────────
export async function fetchDnevniNalozi(datum: string): Promise<RadniNalog[]> {
  // datum format: 'YYYY-MM-DD'
  const api = getApi();
  const response = await api.get('/radni-nalozi', {
    params: { datum, status: 'PLANIRAN' },
  });
  // Pretvaranje API odgovora u naš model
  return response.data.map(mapApiRN);
}

export async function fetchNalog(brojRN: string): Promise<RadniNalog> {
  const api = getApi();
  const response = await api.get(`/radni-nalozi/${brojRN}`);
  return mapApiRN(response.data);
}

export async function pushStatusUpdate(
  brojRN: string,
  status: string,
  payload: object
): Promise<void> {
  const api = getApi();
  await api.patch(`/radni-nalozi/${brojRN}/status`, { status, ...payload });
}

export async function pushPotpis(
  brojRN: string,
  potpis: string,
  potpisPartner: string,
  gps: object
): Promise<void> {
  const api = getApi();
  await api.post(`/radni-nalozi/${brojRN}/potpis`, {
    potpis,        // base64 PNG
    potpisPartner,
    gps,
    timestamp: new Date().toISOString(),
  });
}

export async function pushNepravilnost(
  brojRN: string,
  vrsta: string,
  opis: string,
  fotografija?: string,
  gps?: object
): Promise<void> {
  const api = getApi();
  await api.post(`/radni-nalozi/${brojRN}/nepravilnosti`, {
    vrsta,
    opis,
    fotografija,
    gps,
    timestamp: new Date().toISOString(),
  });
}

// ── VAGARINKA ─────────────────────────────────────────────────
export async function fetchVagarinka(interniBrojRN: string): Promise<Vagarinka | null> {
  const api = getApi();
  try {
    const response = await api.get(`/vagarinke`, {
      params: { interniBrojRN },
    });
    return response.data ? mapApiVagarinka(response.data) : null;
  } catch {
    return null;
  }
}

// ── MAPIRANJE ─────────────────────────────────────────────────
function mapApiRN(data: any): RadniNalog {
  return {
    id: data.id ?? data.broj_rn,
    brojRN: data.broj_rn ?? data.brojRN,
    interniBroj: data.interni_broj ?? data.interniBroj,
    datumDokumenta: data.datum_dokumenta ?? data.datumDokumenta,
    datumUsluge: data.datum_usluge ?? data.datumUsluge,
    brojPlanaOdvoza: data.broj_plana_odvoza,
    nalogPripremio: data.nalog_pripremio ?? data.nalogPripremio ?? '',
    registracijaVozila: data.registracija_vozila ?? data.registracijaVozila ?? '',
    partner: {
      id: data.partner?.oib ?? '',
      naziv: data.partner?.naziv ?? '',
      adresa: data.partner?.adresa ?? '',
      mjesto: data.partner?.mjesto ?? '',
      drzava: 'HR',
      oib: data.partner?.oib ?? '',
    },
    lokacija: {
      id: data.lokacija?.oib ?? data.partner?.oib ?? '',
      naziv: data.lokacija?.naziv ?? data.partner?.naziv ?? '',
      adresa: data.lokacija?.adresa ?? data.partner?.adresa ?? '',
      mjesto: data.lokacija?.mjesto ?? data.partner?.mjesto ?? '',
      drzava: 'HR',
      oib: data.lokacija?.oib ?? data.partner?.oib ?? '',
    },
    stavke: (data.stavke ?? []).map((s: any) => ({
      rbr: s.rbr,
      sifraArtikla: s.sifra_artikla ?? s.sifraArtikla,
      nazivRobe: s.naziv_robe ?? s.nazivRobe,
      kbr: s.kbr ?? '',
      spremnik: s.spremnik ?? '',
      tipSpremnika: s.tip_spremnika ?? s.tipSpremnika ?? '',
      kolicina: s.kolicina ?? 0,
      jedMjere: s.jed_mjere ?? s.jedMjere ?? 'kg',
    })),
    status: data.status ?? 'PLANIRAN',
    syncStatus: 'synced',
    createdAt: data.created_at ?? new Date().toISOString(),
    updatedAt: data.updated_at ?? new Date().toISOString(),
  };
}

function mapApiVagarinka(data: any): Vagarinka {
  return {
    id: data.id,
    brojVagarinke: data.broj_vagarinke ?? data.brojVagarinke,
    interniBrojRN: data.interni_broj_rn ?? data.interniBrojRN,
    skladiste: data.skladiste ?? '',
    vrstaOdvage: data.vrsta_odvage ?? '',
    vaga: data.vaga ?? '',
    kbo: data.kbo ?? '',
    opisMaterijala: data.opis_materijala ?? '',
    prvoVaganje: data.prvo_vaganje ?? 0,
    drugoVaganje: data.drugo_vaganje ?? 0,
    ambalaza: data.ambalaza ?? 0,
    netoMasa: data.neto_masa ?? 0,
    datumPrvoVaganje: data.datum_prvo_vaganje ?? '',
    datumDrugoVaganje: data.datum_drugo_vaganje ?? '',
    komunalnaPodrucja: data.komunalna_podrucja,
    napomena: data.napomena,
    createdAt: data.created_at ?? new Date().toISOString(),
  };
}
