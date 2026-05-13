import { useEffect, useMemo, useState } from 'react'
import { Card, Badge, Avatar, Plate, Table, Tr, Td, Btn, TabBar, FilterChip } from '../components/ui'
import { api, statusUi, initials, timeFromIso, todayIso, type RadniNalog, type Vozilo, type Vozac } from '../api'

const TABS = ['Danas', 'Tjedan', 'Svi nalozi']
const FILTERS = ['Svi', 'Planirani', 'U tijeku', 'Potpisani', 'Nepravilnost'] as const
type Filter = typeof FILTERS[number]

const STATUS_FILTER: Record<Filter, RadniNalog['status'] | null> = {
  'Svi': null,
  'Planirani': 'PLANIRAN',
  'U tijeku': 'NA_LOKACIJI',
  'Potpisani': 'POTPISAN',
  'Nepravilnost': 'NEPRAVILNOST',
}

function inTab(rn: RadniNalog, tab: string): boolean {
  if (tab === 'Svi nalozi') return true
  const d = new Date(rn.datumUsluge)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (tab === 'Danas') return rn.datumUsluge === todayIso()
  if (tab === 'Tjedan') {
    const diff = (today.getTime() - d.getTime()) / 86400000
    return diff >= 0 && diff < 7
  }
  return true
}

export default function Nalozi() {
  const [tab, setTab] = useState(TABS[0])
  const [filter, setFilter] = useState<Filter>('Svi')
  const [nalozi, setNalozi] = useState<RadniNalog[]>([])
  const [vozila, setVozila] = useState<Vozilo[]>([])
  const [vozaci, setVozaci] = useState<Vozac[]>([])
  const [voziloFilter, setVoziloFilter] = useState<string>('')
  const [vozacFilter, setVozacFilter] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [n, v, d] = await Promise.all([api.nalozi(), api.vozila(), api.vozaci()])
        if (!mounted) return
        setNalozi(n)
        setVozila(v)
        setVozaci(d)
        setLastUpdate(new Date())
        setErr(null)
      } catch (e) {
        if (mounted) setErr((e as Error).message)
      }
    }
    load()
    const t = setInterval(load, 3000)
    return () => { mounted = false; clearInterval(t) }
  }, [])

  const voziloById = useMemo(() => Object.fromEntries(vozila.map(v => [v.id, v])), [vozila])
  const vozacById = useMemo(() => Object.fromEntries(vozaci.map(v => [v.id, v])), [vozaci])

  const counts = useMemo(() => ({
    danas: nalozi.filter(n => inTab(n, 'Danas')).length,
    tjedan: nalozi.filter(n => inTab(n, 'Tjedan')).length,
    svi: nalozi.length,
    PLANIRAN: nalozi.filter(n => n.status === 'PLANIRAN').length,
    NA_LOKACIJI: nalozi.filter(n => n.status === 'NA_LOKACIJI').length,
    POTPISAN: nalozi.filter(n => n.status === 'POTPISAN').length,
    NEPRAVILNOST: nalozi.filter(n => n.status === 'NEPRAVILNOST').length,
  }), [nalozi])

  const filteredTabs = [
    `Danas (${counts.danas})`,
    `Tjedan (${counts.tjedan})`,
    `Svi nalozi (${counts.svi})`,
  ]
  const tabKey = filteredTabs.indexOf(tab) >= 0 ? TABS[filteredTabs.indexOf(tab)] : TABS[0]

  const filterCounts: Record<Filter, number> = {
    'Svi': counts.svi,
    'Planirani': counts.PLANIRAN,
    'U tijeku': counts.NA_LOKACIJI,
    'Potpisani': counts.POTPISAN,
    'Nepravilnost': counts.NEPRAVILNOST,
  }

  const view = nalozi
    .filter(n => inTab(n, tabKey))
    .filter(n => {
      const s = STATUS_FILTER[filter]
      return s ? n.status === s : true
    })
    .filter(n => (voziloFilter ? n.voziloId === voziloFilter : true))
    .filter(n => (vozacFilter ? n.vozacId === vozacFilter : true))
    .sort((a, b) => (b.datumUsluge + (b.vrijemeDolaska || '')).localeCompare(a.datumUsluge + (a.vrijemeDolaska || '')))

  return (
    <>
      <TabBar tabs={filteredTabs} active={tab} onChange={setTab} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map(f => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}{f !== 'Svi' ? ` (${filterCounts[f]})` : ''}
          </FilterChip>
        ))}
        <div style={{ flex: 1 }} />
        <select
          value={vozacFilter}
          onChange={e => setVozacFilter(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}>
          <option value="">Svi vozači</option>
          {vozaci.map(d => <option key={d.id} value={d.id}>{d.ime} {d.prezime}</option>)}
        </select>
        <select
          value={voziloFilter}
          onChange={e => setVoziloFilter(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}>
          <option value="">Sva vozila</option>
          {vozila.map(v => <option key={v.id} value={v.id}>{v.registracija}</option>)}
        </select>
        <Btn variant="outline">📥 Izvoz</Btn>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text2)' }}>
        {err
          ? <span style={{ color: 'var(--red)' }}>⚠ API ne odgovara: {err}</span>
          : <span>🔄 Live (svake 3s) · zadnje: {lastUpdate?.toLocaleTimeString('hr-HR') || '—'} · {view.length} prikazano</span>
        }
      </div>

      <Card noPad>
        <Table head={['Broj RN', 'Partner', 'Adresa', 'Vozač', 'Vozilo', 'Status', 'Vrijeme', '']}>
          {view.map((n, i) => {
            const v = voziloById[n.voziloId]
            const d = vozacById[n.vozacId]
            const ime = d ? `${d.ime} ${d.prezime}`.trim() : '—'
            const ui = statusUi(n.status)
            const vrijeme = timeFromIso(n.vrijemePotpisa || n.vrijemeDolaska) !== '—'
              ? timeFromIso(n.vrijemePotpisa || n.vrijemeDolaska)
              : n.datumUsluge
            return (
              <Tr key={n.id}>
                <Td first><strong>{n.brojRN}</strong></Td>
                <Td>{n.partner?.naziv || '—'}</Td>
                <Td muted>{[n.lokacija?.adresa, n.lokacija?.mjesto].filter(Boolean).join(', ')}</Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar initials={initials(d?.ime || '?', d?.prezime)} index={i % 4} />
                    {ime}
                  </div>
                </Td>
                <Td>{v ? <Plate reg={v.registracija} /> : '—'}</Td>
                <Td><Badge variant={ui.variant}>{ui.label}</Badge></Td>
                <Td muted>{vrijeme}</Td>
                <Td>
                  <Btn variant={ui.variant === 'red' ? 'red' : 'outline'}>
                    {ui.variant === 'red' ? 'Pregled' : 'Otvori'}
                  </Btn>
                </Td>
              </Tr>
            )
          })}
          {view.length === 0 && (
            <Tr><Td first>Nema naloga za odabrane filtere.</Td></Tr>
          )}
        </Table>
      </Card>
    </>
  )
}
