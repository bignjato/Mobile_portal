import { useEffect, useMemo, useState } from 'react'
import { Card, Badge, Avatar, Plate, SectionRow, Table, Tr, Td } from '../components/ui'
import { api, initials, timeFromIso, todayIso, type RadniNalog, type Vozilo, type Vozac } from '../api'

const DAY_LABELS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']

export default function Dashboard() {
  const [nalozi, setNalozi] = useState<RadniNalog[]>([])
  const [vozila, setVozila] = useState<Vozilo[]>([])
  const [vozaci, setVozaci] = useState<Vozac[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [n, v, d] = await Promise.all([api.nalozi(), api.vozila(), api.vozaci()])
        if (!mounted) return
        setNalozi(n); setVozila(v); setVozaci(d); setErr(null)
      } catch (e) { if (mounted) setErr((e as Error).message) }
    }
    load()
    const t = setInterval(load, 3000)
    return () => { mounted = false; clearInterval(t) }
  }, [])

  const today = todayIso()
  const naloziDanas = nalozi.filter(n => n.datumUsluge === today)
  const potpisanoDanas = naloziDanas.filter(n => n.status === 'POTPISAN').length
  const nepravilnostiDanas = naloziDanas.filter(n => n.status === 'NEPRAVILNOST').length
  const aktivnaVozila = new Set(naloziDanas.map(n => n.voziloId)).size

  // Bar chart — broj naloga zadnjih 7 dana
  const bars = useMemo(() => {
    const map = new Map<string, number>()
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      map.set(iso, 0)
    }
    for (const n of nalozi) {
      if (map.has(n.datumUsluge)) map.set(n.datumUsluge, (map.get(n.datumUsluge) || 0) + 1)
    }
    const entries = [...map.entries()]
    const max = Math.max(1, ...entries.map(([, v]) => v))
    return entries.map(([iso, v], i) => ({
      day: DAY_LABELS[new Date(iso).getDay() === 0 ? 6 : new Date(iso).getDay() - 1],
      h: (v / max) * 90,
      count: v,
      active: i === entries.length - 1,
    }))
  }, [nalozi])

  const prosjek = Math.round(bars.reduce((a, b) => a + b.count, 0) / Math.max(1, bars.length))
  const tjedan = bars.reduce((a, b) => a + b.count, 0)

  // Aktivnost — zadnjih 6 akcija (potpisi, dolasci, nepravilnosti)
  const activity = useMemo(() => {
    const evts: { color: string; text: string; time: string; sort: string }[] = []
    for (const n of nalozi) {
      if (n.vrijemePotpisa) evts.push({
        color: 'var(--green)',
        text: `Potpisan ${n.brojRN} – ${n.partner?.naziv?.slice(0, 30) || ''}`,
        time: timeFromIso(n.vrijemePotpisa),
        sort: n.vrijemePotpisa,
      })
      if (n.nepravilnost?.vrijeme) evts.push({
        color: 'var(--red)',
        text: `Nepravilnost ${n.brojRN}: ${n.nepravilnost.tip}`,
        time: timeFromIso(n.nepravilnost.vrijeme),
        sort: n.nepravilnost.vrijeme,
      })
      if (n.vrijemeDolaska && !n.vrijemePotpisa) evts.push({
        color: 'var(--amber)',
        text: `Dolazak na lokaciju ${n.brojRN}`,
        time: timeFromIso(n.vrijemeDolaska),
        sort: n.vrijemeDolaska,
      })
    }
    return evts.sort((a, b) => b.sort.localeCompare(a.sort)).slice(0, 6)
  }, [nalozi])

  // Vozači na terenu danas
  const voziloById = useMemo(() => Object.fromEntries(vozila.map(v => [v.id, v])), [vozila])
  const vozaciToday = vozaci.map(d => {
    const nalozi_v = naloziDanas.filter(n => n.vozacId === d.id)
    const done = nalozi_v.filter(n => n.status === 'POTPISAN').length
    const total = nalozi_v.length
    const hasNepravilnost = nalozi_v.some(n => n.status === 'NEPRAVILNOST')
    const aktivno = nalozi_v.some(n => n.status === 'NA_LOKACIJI')
    const status = hasNepravilnost ? '⚠ Nepravilnost'
                   : (total > 0 && done === total) ? 'Završio'
                   : aktivno ? 'Na terenu'
                   : total > 0 ? 'Planiran' : '—'
    const variant: 'red' | 'green' | 'amber' | 'blue' =
      hasNepravilnost ? 'red' : (total > 0 && done === total) ? 'green' : aktivno ? 'amber' : 'blue'
    const lastTime = nalozi_v
      .map(n => n.vrijemePotpisa || n.vrijemeDolaska || '')
      .sort()
      .reverse()[0]
    return {
      id: d.id,
      name: `${d.ime} ${d.prezime}`.trim(),
      initials: initials(d.ime, d.prezime),
      reg: voziloById[d.voziloId]?.registracija || '—',
      done, total, status, variant,
      time: timeFromIso(lastTime),
    }
  }).filter(v => v.total > 0)

  return (
    <>
      {err && (
        <Card>
          <div style={{ color: 'var(--red)', fontSize: 13 }}>⚠ API ne odgovara: {err}</div>
        </Card>
      )}
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { icon: '📋', bg: '#FEF2F2', value: naloziDanas.length, label: 'Naloga danas' },
          { icon: '✅', bg: '#F0FDF4', value: potpisanoDanas,     label: 'Potpisano' },
          { icon: '🚛', bg: '#EFF6FF', value: aktivnaVozila,      label: 'Vozila aktiv.' },
          { icon: '⚠️', bg: '#FFFBEB', value: nepravilnostiDanas, label: 'Nepravilnosti' },
        ].map(k => (
          <Card key={k.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                {k.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 7px', background: '#F0FDF4', color: '#16A34A' }}>
                LIVE
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <Card>
          <SectionRow title="Nalozi po danima – zadnjih 7 dana" link="Detalji" />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90, padding: '0 4px' }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div title={`${b.count} naloga`} style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: Math.max(2, b.h),
                  background: 'var(--red)',
                  opacity: b.active ? 1 : 0.35,
                }} />
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>{b.day}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--bg)', fontSize: 11, color: 'var(--text2)' }}>
            <span>Prosječno: <strong style={{ color: 'var(--text)' }}>{prosjek} / dan</strong></span>
            <span>Tjedan: <strong style={{ color: 'var(--text)' }}>{tjedan}</strong></span>
          </div>
        </Card>

        <Card>
          <SectionRow title="Aktivnost" />
          {activity.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text2)', padding: '8px 0' }}>Nema aktivnosti.</div>
          )}
          {activity.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < activity.length - 1 ? '1px solid var(--bg)' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: 4 }} />
              <div style={{ flex: 1, fontSize: 12 }}>{a.text}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', whiteSpace: 'nowrap' }}>{a.time}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Vozači */}
      <Card noPad>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Vozači na terenu danas</div>
          <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>Svi vozači →</span>
        </div>
        <Table head={['Vozač', 'Vozilo', 'Nalozi', 'Status', 'Zadnja aktiv.']}>
          {vozaciToday.map((v, i) => (
            <Tr key={v.id}>
              <Td first>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials={v.initials} index={i % 4} />
                  {v.name}
                </div>
              </Td>
              <Td><Plate reg={v.reg} /></Td>
              <Td>
                <Badge variant={v.done === v.total ? 'green' : 'blue'}>{v.done}/{v.total}</Badge>
              </Td>
              <Td><Badge variant={v.variant}>{v.status}</Badge></Td>
              <Td muted>{v.time}</Td>
            </Tr>
          ))}
          {vozaciToday.length === 0 && (
            <Tr><Td first>Nema aktivnih vozača danas.</Td></Tr>
          )}
        </Table>
      </Card>
    </>
  )
}
