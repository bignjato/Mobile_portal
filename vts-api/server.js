const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve admin portal
app.use('/admin', express.static(path.join(__dirname, 'admin')));

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── AUTH: login po registraciji vozila ────────────────────────────────────────
// POST /v1/auth/login  { registracija: "ZG-1234-AB" }
// Vraca: { token, vozac, vozilo, nalozi }
app.post('/v1/auth/login', (req, res) => {
  const { registracija } = req.body;
  if (!registracija) return res.status(400).json({ message: 'Registracija je obavezna' });

  const data = readData();
  const vozilo = data.vozila.find(v =>
    v.registracija.toLowerCase().replace(/[-\s]/g, '') ===
    registracija.toLowerCase().replace(/[-\s]/g, '')
  );

  if (!vozilo) {
    return res.status(401).json({ message: `Vozilo ${registracija} nije pronađeno u sustavu` });
  }

  const vozac = data.vozaci.find(d => d.voziloId === vozilo.id);
  if (!vozac) {
    return res.status(401).json({ message: 'Nema vozača za ovo vozilo' });
  }

  const token = `demo_${vozilo.id}_${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];
  const nalozi = data.radniNalozi.filter(rn => rn.voziloId === vozilo.id && rn.datumUsluge === today);

  res.json({
    token,
    vozac: { id: vozac.id, ime: vozac.ime, prezime: vozac.prezime, punoIme: `${vozac.ime} ${vozac.prezime}` },
    vozilo: { id: vozilo.id, registracija: vozilo.registracija, naziv: vozilo.naziv },
    brojNaloga: nalozi.length,
  });
});

// ── RADNI NALOZI ──────────────────────────────────────────────────────────────
// GET /v1/radni-nalozi?datum=YYYY-MM-DD&voziloId=V1
app.get('/v1/radni-nalozi', (req, res) => {
  const data = readData();
  let nalozi = data.radniNalozi;
  if (req.query.datum) nalozi = nalozi.filter(rn => rn.datumUsluge === req.query.datum);
  if (req.query.voziloId) nalozi = nalozi.filter(rn => rn.voziloId === req.query.voziloId);
  res.json(nalozi);
});

// GET /v1/radni-nalozi/:id
app.get('/v1/radni-nalozi/:id', (req, res) => {
  const data = readData();
  const rn = data.radniNalozi.find(r => r.id === req.params.id);
  if (!rn) return res.status(404).json({ message: 'Radni nalog nije pronađen' });
  res.json(rn);
});

// POST /v1/radni-nalozi — kreiranje novog RN
app.post('/v1/radni-nalozi', (req, res) => {
  const data = readData();
  const body = req.body;
  const id = `RN-${Date.now()}`;
  const newRN = {
    id,
    brojRN: body.brojRN || id,
    interniBroj: body.interniBroj || String(data.radniNalozi.length + 1).padStart(3, '0'),
    datumUsluge: body.datumUsluge || new Date().toISOString().split('T')[0],
    voziloId: body.voziloId,
    vozacId: body.vozacId,
    status: 'PLANIRAN',
    partner: body.partner,
    lokacija: body.lokacija,
    stavke: body.stavke || [],
    napomena: body.napomena || '',
  };
  data.radniNalozi.push(newRN);
  writeData(data);
  res.status(201).json(newRN);
});

// PUT /v1/radni-nalozi/:id — ažuriranje RN
app.put('/v1/radni-nalozi/:id', (req, res) => {
  const data = readData();
  const idx = data.radniNalozi.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Nije pronađen' });
  data.radniNalozi[idx] = { ...data.radniNalozi[idx], ...req.body };
  writeData(data);
  res.json(data.radniNalozi[idx]);
});

// DELETE /v1/radni-nalozi/:id
app.delete('/v1/radni-nalozi/:id', (req, res) => {
  const data = readData();
  const idx = data.radniNalozi.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Nije pronađen' });
  data.radniNalozi.splice(idx, 1);
  writeData(data);
  res.json({ ok: true });
});

// PATCH /v1/radni-nalozi/:id/dolazak
app.patch('/v1/radni-nalozi/:id/dolazak', (req, res) => {
  const data = readData();
  const idx = data.radniNalozi.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Nije pronađen' });
  data.radniNalozi[idx].status = 'NA_LOKACIJI';
  data.radniNalozi[idx].vrijemeDolaska = req.body.vrijemeDolaska;
  data.radniNalozi[idx].gpsDolazak = req.body.gps;
  writeData(data);
  res.json(data.radniNalozi[idx]);
});

// POST /v1/radni-nalozi/:id/potpis
app.post('/v1/radni-nalozi/:id/potpis', (req, res) => {
  const data = readData();
  const idx = data.radniNalozi.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Nije pronađen' });
  data.radniNalozi[idx].status = 'POTPISAN';
  data.radniNalozi[idx].potpis = req.body.potpis;
  data.radniNalozi[idx].potpisPartner = req.body.potpisPartner;
  data.radniNalozi[idx].stavke = req.body.stavke || data.radniNalozi[idx].stavke;
  data.radniNalozi[idx].vrijemePotpisa = req.body.timestamp;
  writeData(data);
  res.json(data.radniNalozi[idx]);
});

// POST /v1/radni-nalozi/:id/nepravilnosti
app.post('/v1/radni-nalozi/:id/nepravilnosti', (req, res) => {
  const data = readData();
  const idx = data.radniNalozi.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Nije pronađen' });
  data.radniNalozi[idx].status = 'NEPRAVILNOST';
  data.radniNalozi[idx].nepravilnost = req.body;
  writeData(data);
  res.json(data.radniNalozi[idx]);
});

// ── VOZILA ────────────────────────────────────────────────────────────────────
app.get('/v1/vozila', (req, res) => {
  const data = readData();
  res.json(data.vozila);
});

app.post('/v1/vozila', (req, res) => {
  const data = readData();
  const v = { id: `V${Date.now()}`, ...req.body };
  data.vozila.push(v);
  writeData(data);
  res.status(201).json(v);
});

// ── VOZACI ────────────────────────────────────────────────────────────────────
app.get('/v1/vozaci', (req, res) => {
  const data = readData();
  res.json(data.vozaci);
});

app.post('/v1/vozaci', (req, res) => {
  const data = readData();
  const d = { id: `D${Date.now()}`, ...req.body };
  data.vozaci.push(d);
  writeData(data);
  res.status(201).json(d);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚛 VTS Demo API pokrenut na http://0.0.0.0:${PORT}`);
  console.log(`📋 Admin portal: http://localhost:${PORT}/admin`);
  console.log(`🔗 API base:     http://localhost:${PORT}/v1\n`);
});
