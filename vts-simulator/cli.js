#!/usr/bin/env node
// VTS Simulator — CLI verzija (bez UI-a)
// Koristi: node cli.js auto [--interval=5] [--vozilo=KR902OC]
//         node cli.js once  --vozilo=KR902OC

const API = process.env.VTS_API || 'http://localhost:4000';

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(typeof data === 'string' ? data : data.message);
  return data;
}

function arg(name, def) {
  const m = process.argv.find(a => a.startsWith(`--${name}=`));
  return m ? m.split('=')[1] : def;
}

async function pickVozilo() {
  const reg = arg('vozilo');
  const vozila = await api('/v1/vozila');
  if (reg) {
    const v = vozila.find(x => x.registracija === reg);
    if (!v) throw new Error(`Vozilo ${reg} nije pronađeno`);
    return v;
  }
  return vozila[Math.floor(Math.random() * vozila.length)];
}

async function login(registracija) {
  return api('/v1/auth/login', { method: 'POST', body: JSON.stringify({ registracija }) });
}

async function createNalog(vozilo, vozac) {
  const today = new Date().toISOString().split('T')[0];
  const partneri = ['VALENTIĆ d.o.o.', 'TEST d.o.o.', 'KOMUNALAC', 'PLODINE', 'KONZUM'];
  const tipovi = ['KANTA_120L', 'KANTA_240L', 'KONTEJNER_1100L', 'PRESS_KONTEJNER'];
  const body = {
    datumUsluge: today,
    voziloId: vozilo.id,
    vozacId: vozac.id,
    partner: {
      naziv: partneri[Math.floor(Math.random() * partneri.length)],
      oib: String(Math.floor(10000000000 + Math.random() * 89999999999)),
      adresa: `Ulica ${Math.ceil(Math.random() * 100)}`,
      mjesto: 'Zagreb',
    },
    lokacija: {
      naziv: 'Lokacija',
      adresa: `Ulica ${Math.ceil(Math.random() * 100)}`,
      mjesto: 'Zagreb',
      lat: 45.8 + Math.random() * 0.1,
      lng: 15.9 + Math.random() * 0.2,
    },
    stavke: [{
      rbr: 1,
      sifraArtikla: 'SIM-001',
      nazivRobe: 'Simulirani odvoz',
      tipSpremnika: tipovi[Math.floor(Math.random() * tipovi.length)],
      kolicina: Math.ceil(Math.random() * 5),
      jedMjere: 'kom',
    }],
    napomena: 'CLI simulator',
  };
  return api('/v1/radni-nalozi', { method: 'POST', body: JSON.stringify(body) });
}

async function dolazak(id) {
  return api(`/v1/radni-nalozi/${id}/dolazak`, {
    method: 'PATCH',
    body: JSON.stringify({
      vrijemeDolaska: new Date().toISOString(),
      gps: { lat: 45.81, lng: 15.98 },
    }),
  });
}

async function potpis(id, stavke) {
  return api(`/v1/radni-nalozi/${id}/potpis`, {
    method: 'POST',
    body: JSON.stringify({
      potpis: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      potpisPartner: 'Ivan Horvat',
      stavke: stavke || [],
      timestamp: new Date().toISOString(),
    }),
  });
}

async function nepravilnost(id) {
  return api(`/v1/radni-nalozi/${id}/nepravilnosti`, {
    method: 'POST',
    body: JSON.stringify({
      tip: 'Spremnik nije iznesen',
      opis: 'Auto-simulator',
      vrijeme: new Date().toISOString(),
    }),
  });
}

async function runCycle() {
  const vozilo = await pickVozilo();
  const session = await login(vozilo.registracija);
  console.log(`👤 ${session.vozac.punoIme} / ${vozilo.registracija}`);

  const nalog = await createNalog(vozilo, session.vozac);
  console.log(`  ➕ Kreiran ${nalog.brojRN} (${nalog.partner.naziv})`);

  await dolazak(nalog.id);
  console.log(`  📍 Dolazak`);

  if (Math.random() < 0.8) {
    await potpis(nalog.id, nalog.stavke);
    console.log(`  ✍  Potpisan`);
  } else {
    await nepravilnost(nalog.id);
    console.log(`  ⚠  Nepravilnost`);
  }
}

async function main() {
  const mode = process.argv[2] || 'once';
  console.log(`🧪 VTS Simulator (CLI) → ${API}`);

  if (mode === 'once') {
    await runCycle();
    return;
  }

  if (mode === 'auto') {
    const interval = parseInt(arg('interval', '5')) * 1000;
    console.log(`▶ Auto mode, interval ${interval / 1000}s. Ctrl+C za stop.\n`);
    let i = 0;
    while (true) {
      i++;
      console.log(`\n── ciklus #${i} ──`);
      try { await runCycle(); } catch (e) { console.error('  ❌', e.message); }
      await new Promise(r => setTimeout(r, interval));
    }
  }

  console.log('Korištenje: node cli.js [once|auto] [--vozilo=REG] [--interval=5]');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
