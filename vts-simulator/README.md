# VTS Simulator

Portal za **kreiranje radnih naloga** u VTS Mobilni portal API-ju, koristeći testne naloge iz `RN-Baza_test` (PDF-ovi parsirani s `parse_rn.py`) kao predloške.

Simulator **samo kreira RN-ove**. Daljnji životni ciklus (dolazak, potpis, nepravilnost) odrađuje se u **admin portalu** (`vts-admin`).

## Što radi

- **Web UI** (port `4100`): lista predložaka iz RN-Baza_test, klik → uređivač sa svim poljima (osnovni podaci, partner, lokacija, stavke). Mogućnost kopiranja, izmjene, slanja pojedinačno ili svih odjednom u portal.
- **CLI**: batch slanje svih predložaka u jednoj komandi.

## Preduvjet

`vts-api` pokrenut na `http://localhost:4000`:
```bash
cd ../vts-api && npm run dev
```

Predlošci su nalozi iz `data.json` parsirani iz PDF-ova. Ako ih nema, prvo:
```bash
cd ../vts-api && python parse_rn.py
```

## Pokretanje — Web UI

```bash
cd vts-simulator
npm install
npm start
```

Otvori `http://localhost:4100`.

### Korištenje UI-a

1. **Lijevo** — lista predložaka iz `RN-Baza_test`. Klik na predložak otvara ga u uređivaču.
2. **Desno** — sva polja editabilna: broj RN, partner (naziv/OIB/adresa), lokacija (s GPS), stavke (dodavanje/uklanjanje), vozilo, vozač, napomena.
3. **Akcije**:
   - **📤 Pošalji u portal** — kreira novi nalog (status `PLANIRAN`) iz trenutnih podataka
   - **📋 Kopiraj kao novi** — duplicira u listi sa sufiksom `-Kxxxx`, slobodno uredi i pošalji
   - **↺ Reset** — vrati original predloška
   - **⏩ Pošalji sve u portal** — batch slanje svih predložaka odjednom

Status u listi:
- `original` — netaknut predložak
- `izmijenjeno` — original s izmjenama
- `kopija` — duplikat

## Pokretanje — CLI

```bash
# pošalji sve predloške kao nove naloge
npm run cli

# samo predloške određenog vozila
node cli.js --vozilo=KR902OC
```

## Konfiguracija

| Env / UI | Default | Opis |
|----------|---------|------|
| `VTS_API` | `http://localhost:4000` | Base URL API-ja (CLI) |
| `PORT` | `4100` | Port simulator servera |

## Sljedeći korak (admin portal)

Nakon što su nalozi poslani, otvori admin portal http://localhost:5173 — Dashboard i Nalozi se auto-osvježavaju svake 3 sekunde i prikazuju live podatke.
