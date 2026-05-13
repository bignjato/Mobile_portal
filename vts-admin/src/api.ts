// API klijent za vts-api
export const API_BASE =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL
  || 'http://localhost:4000';

export type Vozilo = { id: string; registracija: string; naziv: string };
export type Vozac = { id: string; ime: string; prezime: string; voziloId: string };

export type Stavka = {
  rbr: number;
  sifraArtikla: string;
  nazivRobe: string;
  tipSpremnika?: string;
  kolicina: number;
  jedMjere: string;
};

export type RadniNalog = {
  id: string;
  brojRN: string;
  interniBroj?: string;
  datumUsluge: string;
  voziloId: string;
  vozacId: string;
  status: 'PLANIRAN' | 'NA_LOKACIJI' | 'POTPISAN' | 'NEPRAVILNOST';
  partner: { naziv: string; adresa: string; mjesto: string; oib?: string };
  lokacija: { naziv: string; adresa: string; mjesto: string; lat?: number; lng?: number };
  stavke: Stavka[];
  napomena?: string;
  vrijemeDolaska?: string;
  vrijemePotpisa?: string;
  potpisPartner?: string;
  nepravilnost?: { tip: string; opis: string; vrijeme: string };
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  vozila: () => get<Vozilo[]>('/v1/vozila'),
  vozaci: () => get<Vozac[]>('/v1/vozaci'),
  nalozi: (params?: { datum?: string; voziloId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.datum) qs.set('datum', params.datum);
    if (params?.voziloId) qs.set('voziloId', params.voziloId);
    const q = qs.toString();
    return get<RadniNalog[]>(`/v1/radni-nalozi${q ? '?' + q : ''}`);
  },
};

// Status → UI badge mapping
export function statusUi(status: RadniNalog['status']) {
  switch (status) {
    case 'PLANIRAN':     return { label: '📅 Planiran',      variant: 'blue'  as const };
    case 'NA_LOKACIJI':  return { label: '⏳ U tijeku',       variant: 'amber' as const };
    case 'POTPISAN':     return { label: '✅ Potpisan',       variant: 'green' as const };
    case 'NEPRAVILNOST': return { label: '⚠ Nepravilnost',   variant: 'red'   as const };
    default:             return { label: status,              variant: 'blue'  as const };
  }
}

export function initials(ime: string, prezime?: string) {
  const a = (ime || '').trim()[0] || '?';
  const b = (prezime || '').trim()[0] || '';
  return (a + b).toUpperCase();
}

export function timeFromIso(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

export function todayIso() {
  return new Date().toISOString().split('T')[0];
}
