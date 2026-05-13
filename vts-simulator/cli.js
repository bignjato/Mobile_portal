#!/usr/bin/env node
// VTS Simulator CLI — batch slanje predložaka iz RN-Baza_test u portal
// Koristi: node cli.js              # pošalji sve predloške kao nove naloge (PLANIRAN)
//         node cli.js --vozilo=KR902OC  # samo predloške tog vozila

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

function buildPayload(rn) {
  return {
    brojRN: rn.brojRN,
    interniBroj: rn.interniBroj || '',
    datumUsluge: rn.datumUsluge,
    voziloId: rn.voziloId,
    vozacId: rn.vozacId,
    partner: rn.partner,
    lokacija: rn.lokacija,
    stavke: rn.stavke || [],
    napomena: rn.napomena || '',
  };
}

async function main() {
  console.log(`🧪 VTS Simulator CLI → ${API}`);
  const all = await api('/v1/radni-nalozi');
  let tpl = all.filter(n => /^\d{7,}$/.test(n.brojRN) && n.partner?.oib);
  if (!tpl.length) tpl = all.filter(n => n.partner?.oib);

  const voziloReg = arg('vozilo');
  if (voziloReg) {
    const vozila = await api('/v1/vozila');
    const v = vozila.find(x => x.registracija === voziloReg);
    if (!v) { console.error(`Vozilo ${voziloReg} nije pronađeno`); process.exit(1); }
    tpl = tpl.filter(t => t.voziloId === v.id);
  }

  console.log(`📚 Predložaka za slanje: ${tpl.length}`);
  let ok = 0, fail = 0;
  for (const rn of tpl) {
    try {
      const r = await api('/v1/radni-nalozi', { method: 'POST', body: JSON.stringify(buildPayload(rn)) });
      console.log(`  ✅ ${r.brojRN} (${r.partner?.naziv?.slice(0, 40) || ''}) → id ${r.id}`);
      ok++;
    } catch (e) {
      console.log(`  ❌ ${rn.brojRN}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nGotovo. OK: ${ok}, FAIL: ${fail}`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
