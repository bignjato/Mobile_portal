# VTS – Mobilni portal za Radne Naloge
### EKO-FLOR PLUS d.o.o.

React Native / Expo aplikacija za tablet — upravljanje radnim nalozima na terenu.

---

## 📱 Podržane platforme
- **iPad** (iOS 15+) — testiranje putem Expo Go
- **Android tablet** (Android 10+)
- **Android ručni terminal s RFID/barcode** (keyboard wedge mode)

---

## 🚀 Pokretanje (1. put)

### Preduvjeti
```bash
# Instaliraj Node.js (https://nodejs.org) - verzija 18 ili novija
node --version  # treba biti >= 18

# Instaliraj Expo CLI
npm install -g expo-cli eas-cli
```

### Instalacija projekta
```bash
cd vts-app
npm install
```

### Konfiguracija API URL-a
Kreiraj datoteku `.env` u folderu `vts-app/`:
```env
EXPO_PUBLIC_API_URL=https://api.vas-portal.hr/v1
```

> **Prilagoditi URL** prema adresi vašeg portala koji ima API za radne naloge.

### Pokretanje razvojnog servera
```bash
npx expo start
```

Otvori **Expo Go** aplikaciju na iPadu i skeniraj QR kod koji se pojavi u terminalu.
Aplikacija se odmah učitava na tabletu!

---

## 📂 Struktura projekta

```
vts-app/
├── app/                    # Expo Router ekrani
│   ├── (auth)/
│   │   └── login.tsx       # Ekran za prijavu
│   ├── (app)/
│   │   ├── nalozi.tsx      # Lista dnevnih RN-ova
│   │   ├── nalog/[id].tsx  # Detalj RN + dolazak
│   │   ├── potpis/[id].tsx # Digitalni potpis
│   │   ├── nepravilnost/   # Prijava nepravilnosti
│   │   └── vagarinka/      # Prikaz vagarinke
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Redirect (login/nalozi)
│
├── src/
│   ├── types/index.ts      # TypeScript tipovi (RadniNalog, Vagarinka...)
│   ├── database/
│   │   ├── schema.ts       # SQLite shema (offline baza)
│   │   └── radniNalogRepo.ts # CRUD operacije
│   └── services/
│       ├── api.ts          # REST API klijent
│       └── syncService.ts  # Offline → online sync
│
├── app.json                # Expo konfiguracija
├── package.json
└── .env                    # API URL (kreirati ručno)
```

---

## 🔄 Tijek rada u aplikaciji

```
PRIJAVA
  ↓
LISTA DNEVNIH RN-ova (preuzimanje s API-ja)
  ↓
ODABIR RN-a → Detalj (partner, adresa, materijal, spremnik)
  ↓
ZABILJEŽI DOLAZAK (GPS automatski bilježi koordinate i vrijeme)
  ↓
Provjera/ispravak: tip spremnika, materijal
  ↓ (opcijalno: PRIJAVI NEPRAVILNOST)
PREUZIMANJE ZAVRŠENO → POTPIS
  ↓
Digitalni potpis partnera (prstom/stylusom) + ime potpisnika
  ↓
Status: POTPISAN → Čeka vaganje
  ↓
VAGANJE (vaga automatski generira vagarinku u sustavu)
  ↓
Vagarinka dohvaćena → Neto masa prikazana
  ↓
SLJEDEĆI RADNI NALOG
```

---

## 📡 API Specifikacija

Aplikacija očekuje sljedeće endpointe:

| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/auth/login` | Prijava vozača |
| GET | `/radni-nalozi?datum=YYYY-MM-DD` | Dnevni nalozi |
| GET | `/radni-nalozi/:brojRN` | Jedan nalog |
| PATCH | `/radni-nalozi/:brojRN/status` | Ažuriranje statusa |
| POST | `/radni-nalozi/:brojRN/potpis` | Upload potpisa (base64) |
| POST | `/radni-nalozi/:brojRN/nepravilnosti` | Prijava nepravilnosti |
| GET | `/vagarinke?interniBrojRN=xxx` | Vagarinka za RN |

### Primjer odgovora za GET /radni-nalozi
```json
[
  {
    "id": "26068869",
    "broj_rn": "26068869",
    "interni_broj": "2501100003743",
    "datum_dokumenta": "2026-05-11",
    "datum_usluge": "2026-05-11",
    "nalog_pripremio": "Goran Hulina",
    "registracija_vozila": "ZG 6581-KN",
    "partner": {
      "naziv": "GRAFIČKI ZAVOD HRVATSKE d.o.o.",
      "adresa": "MIČEVEĆKA 7 ZAGREB",
      "mjesto": "HR-10000 ZAGREB",
      "oib": "21141199398"
    },
    "lokacija": { ... },
    "stavke": [
      {
        "rbr": 1,
        "sifra_artikla": "R105004",
        "naziv_robe": "1.02 Miješani papir",
        "kbr": "20 01 01",
        "spremnik": "R105004",
        "tip_spremnika": "32S",
        "kolicina": 9680,
        "jed_mjere": "kg"
      }
    ],
    "status": "PLANIRAN"
  }
]
```

---

## 📦 Build za produkciju

### iOS (App Store / TestFlight)
```bash
eas build --platform ios --profile production
```

### Android (APK za terminal / tablet)
```bash
eas build --platform android --profile production
```

### APK za direktnu instalaciju (sideload)
```bash
eas build --platform android --profile preview
```

---

## 🔧 RFID / Barcode terminal

Za Android ručne terminale (Zebra, Honeywell, itp.) koji imaju RFID/barcode čitač:

- Terminal šalje skenirani kod kao **keyboard wedge** (simulira tipkovnički unos)
- U ekranu detalja RN-a, polje za skeniranje je automatski fokusirano
- Skenirani kod se uspoređuje s brojem RN ili šifrom spremnika
- Nema potrebe za posebnom integracijom — radi "out of the box"

---

## 🗺️ GPS i Geofencing

- **expo-location** koristi se za dohvat trenutne GPS pozicije
- Koordinate se bilježe pri dolasku na lokaciju
- Opcija: automatska detekcija dolaska (geofence) — konfigurirati radijus u `src/services/gpsService.ts`

---

## 📋 Statusi radnog naloga

| Status | Boja | Opis |
|--------|------|------|
| PLANIRAN | Siva | Nalog kreiran, čeka izvršenje |
| U_TIJEKU | Narančasta | Vozač je krenuo prema lokaciji |
| NA_LOKACIJI | Plava | GPS dolazak zabilježen |
| PREUZET | Ljubičasta | Materijal preuzet, ide na potpis |
| POTPISAN | Zelena | Partner potpisao, čeka vaganje |
| IZVAGANO | Tamno zelena | Vagarinka dostupna |
| ZATVOREN | Siva | Nalog kompletiran |
| NEPRAVILNOST | Crvena | Prijavljena nepravilnost |

---

## 📞 Kontakt za razvoj
boris@infobot.hr
