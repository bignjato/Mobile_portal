export type StatusRN = 'PLANIRAN' | 'NA_LOKACIJI' | 'POTPISAN' | 'NEPRAVILNOST';

export type TipSpremnika = 'KANTA' | 'PRESS_KONTEJNER' | 'OTVORENI_KONTEJNER' | 'PALBOX' | '';

export interface Partner {
  naziv: string;
  adresa: string;
  mjesto: string;
  oib: string;
}

export interface Lokacija {
  naziv: string;
  adresa: string;
  mjesto: string;
  oib?: string;
  lat?: number;
  lng?: number;
}

export interface StavkaRN {
  rbr: number;
  sifraArtikla: string;
  nazivRobe: string;
  tipSpremnika: string;
  kolicina: number;
  jedMjere: string;
}

export interface RadniNalog {
  id: string;
  brojRN: string;
  interniBroj?: string;
  datumUsluge: string;
  voziloId?: string;
  vozacId?: string;
  partner: Partner;
  lokacija: Lokacija;
  stavke: StavkaRN[];
  status: StatusRN;
  vrijemeDolaska?: string;
  gpsDolazak?: string;
  potpis?: string;
  potpisPartner?: string;
  napomena?: string;
}

export interface Vozac {
  id: string;
  ime: string;
  prezime: string;
  punoIme?: string;
  korisnickoIme?: string;
}
