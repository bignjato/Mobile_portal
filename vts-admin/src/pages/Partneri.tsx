import { useMemo, useState } from 'react'
import { Card, Badge, Table, Tr, Td, Btn, FilterChip, StatRow } from '../components/ui'

type Lokacija = {
  adresa: string
  naziv: string
  dana: string
  variant: 'amber' | 'blue' | 'grey' | 'green'
}

type Partner = {
  id: string
  name: string
  kat: string
  grad: string
  mtd: number
  variant: 'green' | 'grey' | 'red'
  status: 'Aktivan' | 'Neaktivan'
  oib: string
  kontakt: string
  telefon: string
  ugovorDo: string
  lokacije: Lokacija[]
}

const INITIAL_PARTNERI: Partner[] = [
  {
    id: 'P1', name: 'KONZUM d.o.o.', kat: 'Maloprodaja', grad: 'Zagreb',
    mtd: 124, variant: 'green', status: 'Aktivan',
    oib: '62226620908', kontakt: 'Ana Šimić', telefon: '+385 1 234 5678', ugovorDo: '31.12.2026.',
    lokacije: [
      { adresa: 'Ilica 242, Zagreb',       naziv: 'Konzum Ilica · 3 kante, 1 kontejner', dana: 'Uto, Pet',      variant: 'amber' },
      { adresa: 'Maksimirska 120, Zagreb', naziv: 'Konzum Maksimir · 5 kanti',           dana: 'Pon, Sri, Pet', variant: 'blue' },
      { adresa: 'Vukovarska 271, Zagreb',  naziv: 'Konzum Vukovarska · 4 kante',         dana: 'Pon, Čet',      variant: 'blue' },
    ],
  },
  {
    id: 'P2', name: 'SPAR Hrvatska d.o.o.', kat: 'Maloprodaja', grad: 'Zagreb',
    mtd: 98, variant: 'green', status: 'Aktivan',
    oib: '14834561795', kontakt: 'Marko Jurić', telefon: '+385 1 555 1234', ugovorDo: '30.06.2026.',
    lokacije: [
      { adresa: 'Ozaljska 105, Zagreb', naziv: 'SPAR Ozaljska · 2 kontejnera',  dana: 'Pon, Sri, Pet', variant: 'blue' },
      { adresa: 'Radnička 80, Zagreb',  naziv: 'SPAR Radnička · 4 kante',       dana: 'Uto, Čet',      variant: 'amber' },
    ],
  },
  {
    id: 'P3', name: 'TOMMY d.o.o.', kat: 'Maloprodaja', grad: 'Split',
    mtd: 76, variant: 'green', status: 'Aktivan',
    oib: '00278260010', kontakt: 'Ivana Babić', telefon: '+385 21 666 777', ugovorDo: '31.03.2027.',
    lokacije: [
      { adresa: 'Bauerova 12, Zagreb',  naziv: 'TOMMY Bauerova · 3 kante',  dana: 'Uto, Pet',      variant: 'amber' },
      { adresa: 'Savska 41, Zagreb',    naziv: 'TOMMY Savska · 2 kontejnera', dana: 'Pon, Čet',    variant: 'blue' },
    ],
  },
  {
    id: 'P4', name: 'LIDL Hrvatska d.o.o.', kat: 'Maloprodaja', grad: 'Velika Gorica',
    mtd: 62, variant: 'green', status: 'Aktivan',
    oib: '38763325239', kontakt: 'Petar Knežević', telefon: '+385 1 888 9999', ugovorDo: '31.12.2025.',
    lokacije: [
      { adresa: 'Žitnjak bb, Zagreb',       naziv: 'LIDL Žitnjak · 1 press',     dana: 'Sri',          variant: 'green' },
      { adresa: 'Slavonska av. 100, Zagreb', naziv: 'LIDL Slavonska · 3 kante',  dana: 'Pon, Pet',     variant: 'amber' },
    ],
  },
  {
    id: 'P5', name: 'STUDENAC d.o.o.', kat: 'Maloprodaja', grad: 'Omiš',
    mtd: 54, variant: 'green', status: 'Aktivan',
    oib: '53056966535', kontakt: 'Marija Tomić', telefon: '+385 21 333 444', ugovorDo: '15.09.2026.',
    lokacije: [
      { adresa: 'Vlaška 78, Zagreb', naziv: 'Studenac Vlaška · 2 kante', dana: 'Čet', variant: 'grey' },
    ],
  },
  {
    id: 'P6', name: 'Pekarnica Mlinar d.o.o.', kat: 'Prehrana', grad: 'Zagreb',
    mtd: 8, variant: 'grey', status: 'Neaktivan',
    oib: '01234567899', kontakt: '—', telefon: '—', ugovorDo: '—',
    lokacije: [
      { adresa: 'Trg bana Jelačića 4, Zagreb', naziv: 'Mlinar centar · 1 kanta', dana: 'Pet', variant: 'grey' },
    ],
  },
  {
    id: 'P7', name: 'Restoran Lanik d.o.o.', kat: 'Ugostiteljstvo', grad: 'Zagreb',
    mtd: 22, variant: 'green', status: 'Aktivan',
    oib: '98765432101', kontakt: 'Tomislav Lanik', telefon: '+385 1 444 5566', ugovorDo: '31.12.2026.',
    lokacije: [
      { adresa: 'Tkalčićeva 22, Zagreb', naziv: 'Lanik Tkalčićeva · 1 kontejner', dana: 'Pon, Sri, Pet, Ned', variant: 'blue' },
    ],
  },
  {
    id: 'P8', name: 'Hotel Esplanade d.d.', kat: 'Ugostiteljstvo', grad: 'Zagreb',
    mtd: 31, variant: 'green', status: 'Aktivan',
    oib: '14829834729', kontakt: 'Sandra Horvat', telefon: '+385 1 456 6666', ugovorDo: '30.06.2027.',
    lokacije: [
      { adresa: 'Mihanovićeva 1, Zagreb', naziv: 'Esplanade · 2 kontejnera + 1 press', dana: 'Svaki dan', variant: 'green' },
    ],
  },
]

type StatusFilter = 'svi' | 'Aktivan' | 'Neaktivan'

export default function Partneri() {
  const [partneri, setPartneri] = useState<Partner[]>(INITIAL_PARTNERI)
  const [filter, setFilter] = useState<StatusFilter>('svi')
  const [kategorija, setKategorija] = useState<string>('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(0)
  const [detail, setDetail] = useState<Partner | null>(null)
  const [stats, setStats] = useState<Partner | null>(null)
  const [editing, setEditing] = useState<{ partnerId: string; idx: number | null } | null>(null)

  const kategorijeOptions = useMemo(
    () => Array.from(new Set(partneri.map(p => p.kat))).sort(),
    [partneri]
  )

  const filtered = useMemo(() => partneri.filter(p => {
    if (filter !== 'svi' && p.status !== filter) return false
    if (kategorija && p.kat !== kategorija) return false
    const q = search.toLowerCase()
    if (q && !p.name.toLowerCase().includes(q) && !p.grad.toLowerCase().includes(q)) return false
    return true
  }), [partneri, filter, kategorija, search])

  const counts = useMemo(() => ({
    svi: partneri.length,
    aktivni: partneri.filter(p => p.status === 'Aktivan').length,
    neaktivni: partneri.filter(p => p.status === 'Neaktivan').length,
  }), [partneri])

  const saveLokacija = (partnerId: string, idx: number | null, lok: Lokacija) => {
    setPartneri(prev => prev.map(p => {
      if (p.id !== partnerId) return p
      const next = [...p.lokacije]
      if (idx === null) next.push(lok)
      else next[idx] = lok
      return { ...p, lokacije: next }
    }))
    setEditing(null)
  }

  const deleteLokacija = (partnerId: string, idx: number) => {
    if (!confirm('Obrisati lokaciju?')) return
    setPartneri(prev => prev.map(p =>
      p.id === partnerId ? { ...p, lokacije: p.lokacije.filter((_, i) => i !== idx) } : p
    ))
  }

  const FILTERS_DEF: { key: StatusFilter; label: string }[] = [
    { key: 'svi',       label: `Svi (${counts.svi})` },
    { key: 'Aktivan',   label: `Aktivni (${counts.aktivni})` },
    { key: 'Neaktivan', label: `Neaktivni (${counts.neaktivni})` },
  ]

  const p = filtered[selected] ?? filtered[0] ?? partneri[0]

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {FILTERS_DEF.map(f => (
          <FilterChip
            key={f.key}
            active={filter === f.key}
            onClick={() => { setFilter(f.key); setSelected(0) }}
          >
            {f.label}
          </FilterChip>
        ))}
        <div style={{ flex: 1 }} />
        <input
          placeholder="🔍 Traži partnera…"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelected(0) }}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, fontFamily: 'inherit', minWidth: 180 }}
        />
        <select
          value={kategorija}
          onChange={e => { setKategorija(e.target.value); setSelected(0) }}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}
        >
          <option value="">Sve kategorije</option>
          {kategorijeOptions.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <Btn variant="outline">📥 Izvoz</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        <Card noPad>
          <Table head={['Partner', 'Grad', 'Nalozi MTD', 'Status', '']}>
            {filtered.length === 0 ? (
              <Tr>
                <Td first>
                  <div style={{ padding: '20px 0', color: 'var(--text2)', textAlign: 'center' }}>
                    Nema partnera za odabrane filtere
                  </div>
                </Td>
                <Td><></></Td><Td><></></Td><Td><></></Td><Td><></></Td>
              </Tr>
            ) : filtered.map((pr, i) => (
              <Tr key={pr.id} highlight={i === selected}>
                <Td first>
                  <div style={{ cursor: 'pointer' }} onClick={() => setSelected(i)}>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{pr.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>{pr.kat}</div>
                  </div>
                </Td>
                <Td>{pr.grad}</Td>
                <Td><Badge variant={pr.mtd > 20 ? 'blue' : 'grey'}>{pr.mtd}</Badge></Td>
                <Td><Badge variant={pr.variant}>{pr.status}</Badge></Td>
                <Td><Btn onClick={() => setDetail(pr)}>Otvori</Btn></Td>
              </Tr>
            ))}
          </Table>
        </Card>

        {filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{p.kat} · {p.lokacije.length} lokacija</div>
                </div>
                <Badge variant={p.variant}>{p.status}</Badge>
              </div>
              <StatRow label="OIB" value={p.oib} />
              <StatRow label="Grad" value={p.grad} />
              <StatRow label="Kontakt" value={p.kontakt} />
              <StatRow label="Telefon" value={<span style={{ color: 'var(--blue)' }}>{p.telefon}</span>} />
              <StatRow label="Ugovor do" value={p.ugovorDo} valueColor={p.ugovorDo.includes('2025') ? 'var(--amber)' : 'var(--green)'} />
              <StatRow label="Nalozi ovaj mj." value={p.mtd} />
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Btn variant="outline" onClick={() => setDetail(p)}>📄 Detalji</Btn>
                <Btn variant="outline" onClick={() => setStats(p)}>📊 Statistika</Btn>
              </div>
            </Card>

            <Card style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>
                  Lokacije ({p.lokacije.length})
                </div>
                <Btn variant="outline" onClick={() => setEditing({ partnerId: p.id, idx: null })}>+ Dodaj</Btn>
              </div>
              {p.lokacije.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Nema lokacija.</div>
              ) : p.lokacije.map((l, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 10px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'white',
                  marginBottom: 6,
                }}>
                  <div style={{ fontSize: 16 }}>📍</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.adresa}</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.naziv}</div>
                  </div>
                  <Badge variant={l.variant}>{l.dana}</Badge>
                  <button
                    onClick={() => setEditing({ partnerId: p.id, idx: i })}
                    title="Uredi"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4, color: 'var(--text2)' }}
                  >✏️</button>
                  <button
                    onClick={() => deleteLokacija(p.id, i)}
                    title="Obriši"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4, color: 'var(--red)' }}
                  >🗑️</button>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {detail && (
        <PartnerModal
          partner={partneri.find(x => x.id === detail.id) ?? detail}
          onClose={() => setDetail(null)}
          onShowStats={() => { setStats(detail); setDetail(null) }}
        />
      )}
      {stats && (
        <StatistikaModal
          partner={partneri.find(x => x.id === stats.id) ?? stats}
          onClose={() => setStats(null)}
        />
      )}
      {editing && (
        <LokacijaModal
          initial={
            editing.idx !== null
              ? partneri.find(x => x.id === editing.partnerId)?.lokacije[editing.idx] ?? null
              : null
          }
          onClose={() => setEditing(null)}
          onSave={lok => saveLokacija(editing.partnerId, editing.idx, lok)}
        />
      )}
    </>
  )
}

function PartnerModal({ partner, onClose, onShowStats }: { partner: Partner; onClose: () => void; onShowStats: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 12, padding: 20, width: 'min(620px, 92vw)',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detalji partnera</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{partner.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{partner.kat} · {partner.grad}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text2)', lineHeight: 1, padding: 4 }}
            aria-label="Zatvori"
          >✕</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <Badge variant={partner.variant}>{partner.status}</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 8, columnGap: 12, fontSize: 12, marginBottom: 16 }}>
          <span style={{ color: 'var(--text2)' }}>OIB</span>
          <span style={{ fontWeight: 700 }}>{partner.oib}</span>

          <span style={{ color: 'var(--text2)' }}>Kontakt osoba</span>
          <span>{partner.kontakt}</span>

          <span style={{ color: 'var(--text2)' }}>Telefon</span>
          <span style={{ color: 'var(--blue)' }}>{partner.telefon}</span>

          <span style={{ color: 'var(--text2)' }}>Ugovor do</span>
          <span>{partner.ugovorDo}</span>

          <span style={{ color: 'var(--text2)' }}>Nalozi MTD</span>
          <span style={{ fontWeight: 700 }}>{partner.mtd}</span>

          <span style={{ color: 'var(--text2)' }}>Broj lokacija</span>
          <span style={{ fontWeight: 700 }}>{partner.lokacije.length}</span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text2)' }}>
          Lokacije
        </div>
        {partner.lokacije.map((l, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg)',
            marginBottom: 6,
          }}>
            <div style={{ fontSize: 16 }}>📍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{l.adresa}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{l.naziv}</div>
            </div>
            <Badge variant={l.variant}>{l.dana}</Badge>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <Btn variant="outline" onClick={onClose}>Zatvori</Btn>
          <Btn variant="outline" onClick={onShowStats}>📊 Statistika</Btn>
          <Btn variant="outline">📥 Izvoz</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Statistika modal ────────────────────────────────────
function StatistikaModal({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  // Deterministic mock data derived from partner id + mtd
  const seed = partner.id.charCodeAt(1)
  const months = ['Pro', 'Sij', 'Velj', 'Ožu', 'Tra', 'Svi']
  const monthly = months.map((_, i) => Math.max(4, Math.round(partner.mtd * (0.55 + ((seed + i * 7) % 50) / 100))))
  const maxM = Math.max(...monthly)
  const ytd = monthly.reduce((a, b) => a + b, 0)
  const avg = Math.round(ytd / monthly.length)
  const trend = monthly[monthly.length - 1] - monthly[monthly.length - 2]
  const trendPct = Math.round((trend / Math.max(1, monthly[monthly.length - 2])) * 100)
  const topDriver = ['Ivan Horvat', 'Ana Knežević', 'Marko Babić', 'Tomislav Matić'][seed % 4]
  const irregularitiesPct = Math.max(0, ((seed * 3) % 12))

  const locStats = partner.lokacije.map((l, i) => ({
    adresa: l.adresa,
    count: Math.max(2, Math.round(partner.mtd / Math.max(1, partner.lokacije.length) * (0.7 + ((seed + i) % 60) / 100))),
  }))
  const maxLoc = Math.max(1, ...locStats.map(l => l.count))

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 12, padding: 20, width: 'min(640px, 92vw)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: 'inherit' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statistika partnera</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{partner.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>{partner.kat} · {partner.grad}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text2)', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          <StatCard label="Ovaj mjesec" value={partner.mtd} unit="naloga" />
          <StatCard label="YTD" value={ytd} unit="naloga" />
          <StatCard label="Mj. prosjek" value={avg} unit="naloga" />
          <StatCard
            label="Trend"
            value={`${trend >= 0 ? '↑' : '↓'} ${Math.abs(trendPct)}%`}
            unit="vs. proš."
            color={trend >= 0 ? 'var(--green)' : 'var(--red)'}
          />
        </div>

        {/* Monthly bar chart */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Mjesečno (zadnjih 6 mjeseci)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, padding: '0 4px' }}>
            {monthly.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700 }}>{m}</div>
                <div style={{
                  width: '100%',
                  height: `${(m / maxM) * 70}px`,
                  minHeight: 6,
                  background: i === monthly.length - 1 ? 'var(--red)' : 'var(--dark)',
                  borderRadius: '4px 4px 0 0',
                  opacity: i === monthly.length - 1 ? 1 : 0.75,
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-location breakdown */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Po lokacijama (ovaj mjesec)
          </div>
          {locStats.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Nema lokacija.</div>
          ) : locStats.map((l, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{l.adresa}</span>
                <span style={{ color: 'var(--text2)' }}>{l.count} naloga</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ width: `${(l.count / maxLoc) * 100}%`, height: '100%', background: 'var(--blue)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Najčešći vozač</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{topDriver}</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Stopa nepravilnosti</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: irregularitiesPct > 5 ? 'var(--red)' : 'var(--green)' }}>{irregularitiesPct}%</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Zatvori</Btn>
          <Btn variant="outline">📥 Izvoz</Btn>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, color }: { label: string; value: number | string; unit?: string; color?: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color ?? 'inherit' }}>{value}</div>
      {unit && <div style={{ fontSize: 9, color: 'var(--text2)' }}>{unit}</div>}
    </div>
  )
}

// ─── Lokacija editor modal ───────────────────────────────
function LokacijaModal({ initial, onClose, onSave }: {
  initial: Lokacija | null
  onClose: () => void
  onSave: (l: Lokacija) => void
}) {
  const [adresa, setAdresa] = useState(initial?.adresa ?? '')
  const [naziv, setNaziv] = useState(initial?.naziv ?? '')
  const [dana, setDana] = useState(initial?.dana ?? '')
  const [variant, setVariant] = useState<Lokacija['variant']>(initial?.variant ?? 'blue')

  const canSave = adresa.trim().length > 2 && naziv.trim().length > 0 && dana.trim().length > 0

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid var(--border)', fontSize: 12, fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 12, padding: 20, width: 'min(440px, 92vw)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: 'inherit' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            {initial ? 'Uredi lokaciju' : 'Nova lokacija'}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text2)', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Adresa">
            <input style={inputStyle} value={adresa} onChange={e => setAdresa(e.target.value)} placeholder="npr. Ilica 242, Zagreb" autoFocus />
          </Field>
          <Field label="Naziv / opis">
            <input style={inputStyle} value={naziv} onChange={e => setNaziv(e.target.value)} placeholder="npr. Superm. 1 · 3 kante, 1 kontejner" />
          </Field>
          <Field label="Dani odvoza">
            <input style={inputStyle} value={dana} onChange={e => setDana(e.target.value)} placeholder="npr. Pon, Sri, Pet" />
          </Field>
          <Field label="Boja oznake">
            <select style={inputStyle} value={variant} onChange={e => setVariant(e.target.value as Lokacija['variant'])}>
              <option value="blue">Plava (česti odvoz)</option>
              <option value="amber">Žuta (povremeno)</option>
              <option value="green">Zelena (svaki dan)</option>
              <option value="grey">Siva (rijetko)</option>
            </select>
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <Btn variant="outline" onClick={onClose}>Odustani</Btn>
          <Btn
            variant={canSave ? 'red' : 'outline'}
            onClick={() => canSave && onSave({ adresa: adresa.trim(), naziv: naziv.trim(), dana: dana.trim(), variant })}
          >
            {initial ? 'Spremi' : 'Dodaj'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      {children}
    </label>
  )
}
