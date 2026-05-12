# VTS – Mobilni portal za radne naloge

**EKO-FLOR PLUS d.o.o. / OneTech d.o.o.**

Sustav za digitalno upravljanje radnim nalozima komunalnog voznog parka — web admin portal i mobilna aplikacija za vozače (Android / iOS).

---

## Struktura projekta

```
VTS - Mobilni portal za RN/
├── vts-admin/        # Web admin portal (React 19 + Vite + TypeScript)
├── vts-app/          # Mobilna aplikacija (React Native / Expo)
├── vts-api/          # Backend API (Node.js)
└── vts-web/          # Web prototip / dizajn referencа
```

---

## Grane (Git branching strategija)

| Grana | Svrha |
|-------|-------|
| `main` | Stabilna produkcijska verzija |
| `develop/web` | Razvoj web admin portala |
| `develop/android` | Razvoj Android mobilne aplikacije |
| `develop/ios` | Razvoj iOS mobilne aplikacije |

---

## Tech Stack

| Komponenta | Tehnologija |
|------------|-------------|
| Web admin | React 19, Vite, TypeScript |
| Mobilna app | React Native, Expo |
| API | Node.js |
| Dizajn tokeni | CSS custom properties (OneTech brand) |

### Brand boje
- `--red: #EF0C0C` — primarna akcijska boja
- `--dark: #242930` — sidebar, tamne površine
- `--grey: #7B8287` — sekundarni tekst
- `--bg: #F1F5F9` — pozadina

---

## Lokalni razvoj

### Web admin portal

```bash
cd vts-admin
npm install
npm run dev
```

Otvori `http://localhost:5173`

### Mobilna aplikacija

```bash
cd vts-app
npm install
npx expo start
```

Skeniraj QR kod u **Expo Go** aplikaciji (Android / iOS).

### API server

```bash
cd vts-api
npm install
npm run dev
```

---

## Funkcionalnosti

### Web admin portal
- **Dashboard** — KPI kartice, tjedni grafikon, aktivnost, pregled vozača
- **Radni nalozi** — popis, filtriranje, pretraga, statusni badge-ovi
- **Vozači / Vozila** — detalji vozača, napredak naloga, lokacija vozila
- **Partneri** — popis, detalji, lokacije servisa

### Mobilna aplikacija (vozači)
- Prijava / odjava
- Pregled dnevnih naloga
- Odabir i potvrda tipa otpada (kante, kontejneri, press)
- Digitalni potpis radnog naloga
- Prijava nepravilnosti

---

## Verzije

Pogledaj [CHANGELOG.md](./CHANGELOG.md) za povijest izmjena.

---

## GitHub

Repozitorij: `git@github.com:bignjato/Mobile_portal.git`
