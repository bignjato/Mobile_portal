import axios from 'axios';
import type { RadniNalog, Vozac } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://172.16.11.95:4000/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── AUTH ──────────────────────────────────────────
export interface LoginResult {
  vozac: Vozac;
  vozilo: { id: string; registracija: string; naziv: string };
  brojNaloga: number;
}

export async function loginByRegistracija(registracija: string): Promise<LoginResult> {
  const res = await api.post('/auth/login', { registracija: registracija.toUpperCase().replace(/\s/g, '') });
  const { token, vozac, vozilo, brojNaloga } = res.data;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('vozac', JSON.stringify(vozac));
  localStorage.setItem('vozilo', JSON.stringify(vozilo));
  return { vozac, vozilo, brojNaloga };
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('vozac');
  localStorage.removeItem('vozilo');
}

export function getSavedVozac(): Vozac | null {
  const raw = localStorage.getItem('vozac');
  return raw ? JSON.parse(raw) : null;
}

export function getSavedVozilo(): { id: string; registracija: string; naziv: string } | null {
  const raw = localStorage.getItem('vozilo');
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('auth_token');
}

// ── RADNI NALOZI ──────────────────────────────────
export async function fetchDnevniNalozi(datum: string, voziloId?: string): Promise<RadniNalog[]> {
  const params: Record<string, string> = { datum };
  if (voziloId) params.voziloId = voziloId;
  const res = await api.get('/radni-nalozi', { params });
  return res.data.map(mapRN);
}

export async function pushDolazak(id: string, vrijemeDolaska: string, gps: string): Promise<void> {
  await api.patch(`/radni-nalozi/${id}/dolazak`, { vrijemeDolaska, gps, status: 'NA_LOKACIJI' });
}

export async function pushPotpis(
  id: string,
  potpis: string,
  potpisPartner: string,
  gps: string,
  stavke: RadniNalog['stavke']
): Promise<void> {
  await api.post(`/radni-nalozi/${id}/potpis`, {
    potpis,
    potpisPartner,
    gps,
    stavke,
    timestamp: new Date().toISOString(),
  });
}

export async function pushNepravilnost(
  id: string, vrsta: string, opis: string, fotografija?: string
): Promise<void> {
  await api.post(`/radni-nalozi/${id}/nepravilnosti`, { vrsta, opis, fotografija, timestamp: new Date().toISOString() });
}

// ── MAPIRANJE ─────────────────────────────────────
function mapRN(d: any): RadniNalog {
  return {
    id: d.id ?? d.brojRN,
    brojRN: d.brojRN ?? d.id,
    interniBroj: d.interniBroj ?? '',
    datumUsluge: d.datumUsluge ?? '',
    partner: {
      naziv: d.partner?.naziv ?? '',
      adresa: d.partner?.adresa ?? '',
      mjesto: d.partner?.mjesto ?? '',
      oib: d.partner?.oib ?? '',
    },
    lokacija: {
      naziv: d.lokacija?.naziv ?? d.partner?.naziv ?? '',
      adresa: d.lokacija?.adresa ?? d.partner?.adresa ?? '',
      mjesto: d.lokacija?.mjesto ?? d.partner?.mjesto ?? '',
      oib: d.lokacija?.oib ?? '',
      lat: d.lokacija?.lat,
      lng: d.lokacija?.lng,
    },
    stavke: (d.stavke ?? []).map((s: any) => ({
      rbr: s.rbr,
      sifraArtikla: s.sifraArtikla ?? '',
      nazivRobe: s.nazivRobe ?? '',
      tipSpremnika: s.tipSpremnika ?? '',
      kolicina: s.kolicina ?? 0,
      jedMjere: s.jedMjere ?? 'kg',
    })),
    status: d.status ?? 'PLANIRAN',
    vrijemeDolaska: d.vrijemeDolaska,
    gpsDolazak: d.gpsDolazak,
    potpis: d.potpis,
    potpisPartner: d.potpisPartner,
    napomena: d.napomena,
    voziloId: d.voziloId,
    vozacId: d.vozacId,
  };
}
