# VTS Simulator

Simulator slanja podataka u **VTS Mobilni portal API** (`vts-api`). Koristi se za testiranje admin portala bez stvarne mobilne aplikacije.

## Što radi

- **Web UI** (port `4100`) — interaktivno: prijava, lista naloga, slanje dolaska, potpisa, nepravilnosti, kreiranje novih naloga, auto-generator
- **CLI** — headless, idealno za load test ili demo: `once` (jedan ciklus) ili `auto` (kontinuirano)

## Preduvjet

`vts-api` mora biti pokrenut na `http://localhost:4000`:
```bash
cd ../vts-api && npm run dev
```

## Pokretanje — Web UI

```bash
cd vts-simulator
npm install
npm start
```

Otvori `http://localhost:4100`.

## Pokretanje — CLI

```bash
# jedan ciklus (random vozilo)
npm run cli

# kontinuirano svakih 5s
npm run auto

# specifično vozilo + interval
node cli.js auto --vozilo=KR902OC --interval=3
```

## Ciklus simulacije

1. Login (po registraciji vozila)
2. **Kreiranje RN iz testnog predloška** (RN-Baza_test PDF-ovi koje je parsirao [parse_rn.py](../vts-api/parse_rn.py)) — kopira originalni partner, lokaciju, stavke i OIB, novi ID + današnji datum
3. PATCH dolazak (GPS + timestamp)
4. 80% → POST potpis · 20% → POST nepravilnost

> Predlošci se učitavaju iz `GET /v1/radni-nalozi` i filtriraju po `brojRN` (7+ znamenki) i prisustvu OIB-a — to su nalozi parsirani iz PDF-ova u `RN-Baza_test/`.
> Ako predložaka nema, prvo pokreni: `cd ../vts-api && python parse_rn.py`

## Konfiguracija

| Env / UI input | Default | Opis |
|----------------|---------|------|
| `VTS_API` | `http://localhost:4000` | Base URL API-ja (CLI) |
| `PORT` | `4100` | Port simulator servera |
| API input u UI | `http://localhost:4000` | Promjenjivo u headeru |
