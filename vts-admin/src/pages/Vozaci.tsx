import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Card, Badge, Avatar, Plate, Table, Tr, Td, Btn, StatRow, ProgBar, TabBar } from '../components/ui'

// Fix Leaflet default marker icon (Vite asset issue)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const truckIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));line-height:1;">🚛</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
})

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:18px;line-height:1;">📍</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -22],
})

type Vozac = {
  id: string
  initials: string
  name: string
  idx: number
  done: number
  total: number
  variant: 'amber' | 'green' | 'red'
  status: 'Na terenu' | 'Završio' | 'Nepravilnost' | 'Slobodan'
  pos: [number, number]
  stops: [number, number][]
  voziloId: string | null
}

type Vozilo = {
  id: string
  reg: string
  model: string
  godina: number
  tehnicki: string
  kmUkupno: number
  statusVozila: 'U pogonu' | 'Slobodno' | 'Servis'
}

const VOZACI: Vozac[] = [
  { id: 'D1', initials: 'IH', name: 'Ivan Horvat',    idx: 0, done: 5, total: 8, variant: 'amber', status: 'Na terenu',    pos: [45.8150, 15.9819], stops: [[45.8120, 15.9750],[45.8190, 15.9900]], voziloId: 'V1' },
  { id: 'D2', initials: 'MB', name: 'Marko Babić',    idx: 1, done: 7, total: 7, variant: 'green', status: 'Završio',      pos: [45.8080, 16.0010], stops: [[45.8060, 15.9960],[45.8100, 16.0050]], voziloId: 'V2' },
  { id: 'D3', initials: 'AK', name: 'Ana Knežević',   idx: 2, done: 2, total: 6, variant: 'amber', status: 'Na terenu',    pos: [45.8220, 15.9700], stops: [[45.8200, 15.9650],[45.8240, 15.9760]], voziloId: 'V3' },
  { id: 'D4', initials: 'JP', name: 'Josip Perić',    idx: 3, done: 0, total: 5, variant: 'red',   status: 'Nepravilnost', pos: [45.8050, 15.9600], stops: [[45.8030, 15.9560],[45.8070, 15.9640]], voziloId: 'V4' },
  { id: 'D5', initials: 'TM', name: 'Tomislav Matić', idx: 4, done: 3, total: 5, variant: 'amber', status: 'Na terenu',    pos: [45.8280, 16.0100], stops: [[45.8260, 16.0060],[45.8300, 16.0140]], voziloId: 'V5' },
  { id: 'D6', initials: 'LK', name: 'Luka Kovač',     idx: 5, done: 0, total: 0, variant: 'green', status: 'Slobodan',     pos: [45.8120, 15.9780], stops: [], voziloId: null },
]

const VOZILA: Vozilo[] = [
  { id: 'V1', reg: 'ZG 1234 AB', model: 'MAN TGS 26.440',         godina: 2019, tehnicki: '✓ 12/2026', kmUkupno: 184_320, statusVozila: 'U pogonu' },
  { id: 'V2', reg: 'ZG 5678 CD', model: 'Mercedes Econic 2630',   godina: 2021, tehnicki: '✓ 03/2027', kmUkupno: 92_540,  statusVozila: 'U pogonu' },
  { id: 'V3', reg: 'ZG 9012 EF', model: 'Volvo FE 320',           godina: 2020, tehnicki: '✓ 09/2026', kmUkupno: 131_870, statusVozila: 'U pogonu' },
  { id: 'V4', reg: 'ZG 3456 GH', model: 'Iveco Stralis X-Way',    godina: 2018, tehnicki: '✓ 06/2026', kmUkupno: 218_410, statusVozila: 'U pogonu' },
  { id: 'V5', reg: 'ZG 7890 IJ', model: 'MAN TGM 18.290',         godina: 2022, tehnicki: '✓ 11/2026', kmUkupno: 51_200,  statusVozila: 'U pogonu' },
  { id: 'V6', reg: 'ZG 2468 KL', model: 'Mercedes Antos 1830',    godina: 2017, tehnicki: '⚠ 04/2026', kmUkupno: 276_800, statusVozila: 'Servis' },
  { id: 'V7', reg: 'ZG 1357 MN', model: 'Volvo FL 280',           godina: 2023, tehnicki: '✓ 02/2027', kmUkupno: 18_640,  statusVozila: 'Slobodno' },
]

type TabKey = 'vozaci' | 'vozila' | 'dodjele'
const TABS_DEF: { key: TabKey; label: string }[] = [
  { key: 'vozaci',  label: `Vozači (${VOZACI.length})` },
  { key: 'vozila',  label: `Vozila (${VOZILA.length})` },
  { key: 'dodjele', label: `Dodjele (${VOZACI.filter(v => v.voziloId).length})` },
]

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, 14, { duration: 1 }) }, [center, map])
  return null
}

function RouteFitBounds({ route }: { route: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (route.length < 2) return
    map.fitBounds(route, { padding: [30, 30], maxZoom: 15 })
  }, [route, map])
  return null
}

type OsrmResult = { geometry: [number, number][]; distanceKm: number; durationMin: number }

async function fetchOsrmRoute(points: [number, number][]): Promise<OsrmResult | null> {
  try {
    const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';')
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const r = json?.routes?.[0]
    const line = r?.geometry?.coordinates
    if (!Array.isArray(line)) return null
    return {
      geometry: line.map((c: [number, number]) => [c[1], c[0]]),
      distanceKm: (r.distance ?? 0) / 1000,
      durationMin: (r.duration ?? 0) / 60,
    }
  } catch { return null }
}

function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0]); const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}
function polylineKm(line: [number, number][]) {
  let sum = 0
  for (let i = 1; i < line.length; i++) sum += haversineKm(line[i - 1], line[i])
  return sum
}

export default function Vozaci() {
  const [tab, setTab] = useState<TabKey>('vozaci')

  const activeLabel = TABS_DEF.find(t => t.key === tab)!.label

  return (
    <>
      <TabBar
        tabs={TABS_DEF.map(t => t.label)}
        active={activeLabel}
        onChange={(label) => {
          const next = TABS_DEF.find(t => t.label === label)
          if (next) setTab(next.key)
        }}
      />

      {tab === 'vozaci'  && <VozaciTab />}
      {tab === 'vozila'  && <VozilaTab />}
      {tab === 'dodjele' && <DodjeleTab />}
    </>
  )
}

// ─── Tab: Vozači ─────────────────────────────────────────
function VozaciTab() {
  const [selected, setSelected] = useState(0)
  const [search, setSearch] = useState('')

  const list = useMemo(
    () => VOZACI.filter(v => v.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  )
  const v = list[selected] ?? VOZACI[0]
  const vozilo = VOZILA.find(vz => vz.id === v.voziloId) ?? null

  const waypoints: [number, number][] = [v.pos, ...v.stops]
  const [route, setRoute] = useState<[number, number][]>(waypoints)
  const [routing, setRouting] = useState(false)
  const [stats, setStats] = useState<{ km: number; min: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    setRouting(true)
    setRoute(waypoints)
    setStats({ km: polylineKm(waypoints), min: 0 })
    if (waypoints.length < 2) { setRouting(false); return }
    fetchOsrmRoute(waypoints).then(r => {
      if (cancelled) return
      if (r && r.geometry.length > 1) {
        setRoute(r.geometry)
        setStats({ km: r.distanceKm, min: r.durationMin })
      }
      setRouting(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.id])

  const totalKm = stats?.km ?? 0
  const ratio = v.total > 0 ? v.done / v.total : 0
  const doneKm = totalKm * ratio
  const remainingKm = totalKm - doneKm
  const remainingMin = (stats?.min ?? 0) * (1 - ratio)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Card noPad>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Aktivni vozači</div>
          <input
            placeholder="🔍 Traži vozača…"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(0) }}
            style={{ flex: 1, maxWidth: 200, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, fontFamily: 'inherit' }}
          />
          <Badge variant="green">{VOZACI.filter(x => x.status === 'Na terenu' || x.status === 'Završio').length} aktivnih</Badge>
        </div>
        <Table head={['Vozač', 'Vozilo', 'Nalozi', 'Status']}>
          {list.length === 0 ? (
            <Tr><Td first><div style={{ padding: '14px 0', color: 'var(--text2)' }}>Nema rezultata</div></Td><Td><></></Td><Td><></></Td><Td><></></Td></Tr>
          ) : list.map((vz, i) => {
            const veh = VOZILA.find(x => x.id === vz.voziloId)
            return (
              <Tr key={vz.id} highlight={i === selected}>
                <Td first>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setSelected(i)}>
                    <Avatar initials={vz.initials} index={vz.idx} />
                    {vz.name}
                  </div>
                </Td>
                <Td>{veh ? <Plate reg={veh.reg} /> : <span style={{ color: 'var(--text2)', fontSize: 11 }}>—</span>}</Td>
                <Td>{vz.done}/{vz.total}</Td>
                <Td><Badge variant={vz.variant}>{vz.status}</Badge></Td>
              </Tr>
            )
          })}
        </Table>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>
            {vozilo ? `Vozilo – ${vozilo.reg}` : 'Vozilo nije dodijeljeno'}
          </div>
          {vozilo ? (
            <>
              <StatRow label="Registracija" value={vozilo.reg} />
              <StatRow label="Model" value={vozilo.model} />
              <StatRow label="Godina" value={`${vozilo.godina}.`} />
              <StatRow label="Vozač danas" value={v.name} />
              <StatRow label="Tehnički pregled" value={vozilo.tehnicki} valueColor={vozilo.tehnicki.startsWith('⚠') ? 'var(--red)' : 'var(--green)'} />
              <StatRow label="Kilometraža" value={`${vozilo.kmUkupno.toLocaleString('hr-HR')} km`} />
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dnevni napredak</span>
                  <span style={{ fontWeight: 800, color: 'var(--green)' }}>{v.total ? Math.round(v.done / v.total * 100) : 0}%</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{v.done} od {v.total} naloga</div>
                <ProgBar pct={v.total ? Math.round(v.done / v.total * 100) : 0} />
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Ovaj vozač trenutno nema dodijeljeno vozilo.</div>
          )}
        </Card>

        {v.stops.length > 0 && (
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Lokacija vozila</div>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', height: 220 }}>
              <MapContainer center={v.pos} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapRecenter center={v.pos} />
                <RouteFitBounds route={route} />
                <Polyline positions={route} pathOptions={{ color: '#EF0C0C', weight: 4, opacity: 0.85 }} />
                <Marker position={v.pos} icon={truckIcon}>
                  <Popup>
                    <strong>{v.name}</strong><br />{vozilo?.reg ?? '—'}<br />
                    <span style={{ color: v.variant === 'green' ? '#16A34A' : v.variant === 'red' ? '#DC2626' : '#D97706' }}>{v.status}</span>
                  </Popup>
                </Marker>
                {v.stops.map((stop, i) => (
                  <Marker key={i} position={stop} icon={pinIcon}><Popup>Stanica {i + 1}</Popup></Marker>
                ))}
              </MapContainer>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>🚛 {vozilo?.reg ?? '—'} · Ažurirano: 09:41</span>
              <span>{routing ? 'Učitavam rutu…' : `Ruta: ${v.stops.length} stanica`}</span>
            </div>

            <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kilometraža</span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{stats?.min ? `~${Math.round(stats.min)} min ukupno` : '—'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Ukupno</div><div style={{ fontSize: 16, fontWeight: 800 }}>{totalKm.toFixed(1)} <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)' }}>km</span></div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Prijeđeno</div><div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>{doneKm.toFixed(1)} <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)' }}>km</span></div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Preostalo</div><div style={{ fontSize: 16, fontWeight: 800, color: 'var(--red)' }}>{remainingKm.toFixed(1)} <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)' }}>km</span></div></div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(ratio * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--green) 0%, #22C55E 100%)', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>
                <span>{v.done}/{v.total} naloga · {Math.round(ratio * 100)}%</span>
                <span>ETA preostalo: ~{Math.round(remainingMin)} min</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Vozila ─────────────────────────────────────────
function VozilaTab() {
  const [selected, setSelected] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'svi' | 'U pogonu' | 'Slobodno' | 'Servis'>('svi')

  const list = useMemo(() => VOZILA.filter(vz => {
    if (statusFilter !== 'svi' && vz.statusVozila !== statusFilter) return false
    const q = search.toLowerCase()
    return vz.reg.toLowerCase().includes(q) || vz.model.toLowerCase().includes(q)
  }), [search, statusFilter])

  const vz = list[selected] ?? VOZILA[0]
  const vozac = VOZACI.find(d => d.voziloId === vz?.id) ?? null

  const statusVariant = (s: Vozilo['statusVozila']) =>
    s === 'U pogonu' ? 'green' : s === 'Servis' ? 'red' : 'blue'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Card noPad>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Vozni park</div>
          <input
            placeholder="🔍 Reg. ili model…"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(0) }}
            style={{ flex: 1, maxWidth: 180, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, fontFamily: 'inherit' }}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as any); setSelected(0) }}
            style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}
          >
            <option value="svi">Svi statusi</option>
            <option value="U pogonu">U pogonu</option>
            <option value="Slobodno">Slobodno</option>
            <option value="Servis">Servis</option>
          </select>
        </div>
        <Table head={['Reg.', 'Model', 'Godina', 'Status']}>
          {list.length === 0 ? (
            <Tr><Td first><div style={{ padding: '14px 0', color: 'var(--text2)' }}>Nema rezultata</div></Td><Td><></></Td><Td><></></Td><Td><></></Td></Tr>
          ) : list.map((veh, i) => (
            <Tr key={veh.id} highlight={i === selected}>
              <Td first>
                <div style={{ cursor: 'pointer' }} onClick={() => setSelected(i)}>
                  <Plate reg={veh.reg} />
                </div>
              </Td>
              <Td>{veh.model}</Td>
              <Td>{veh.godina}.</Td>
              <Td><Badge variant={statusVariant(veh.statusVozila)}>{veh.statusVozila}</Badge></Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <Card>
        {vz ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Detalji vozila – {vz.reg}</div>
            <StatRow label="Registracija" value={vz.reg} />
            <StatRow label="Model" value={vz.model} />
            <StatRow label="Godina proizvodnje" value={`${vz.godina}.`} />
            <StatRow label="Tehnički pregled" value={vz.tehnicki} valueColor={vz.tehnicki.startsWith('⚠') ? 'var(--red)' : 'var(--green)'} />
            <StatRow label="Ukupna kilometraža" value={`${vz.kmUkupno.toLocaleString('hr-HR')} km`} />
            <StatRow label="Status" value={vz.statusVozila} valueColor={vz.statusVozila === 'Servis' ? 'var(--red)' : vz.statusVozila === 'U pogonu' ? 'var(--green)' : 'var(--text)'} />
            <StatRow label="Vozač danas" value={vozac ? vozac.name : '— (nije dodijeljen)'} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Btn variant="outline">📋 Servisni nalog</Btn>
              <Btn variant="outline">📊 Historija</Btn>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Odaberi vozilo iz tablice.</div>
        )}
      </Card>
    </div>
  )
}

// ─── Tab: Dodjele ────────────────────────────────────────
function DodjeleTab() {
  const dodjele = VOZACI.filter(v => v.voziloId).map(v => ({
    vozac: v,
    vozilo: VOZILA.find(vz => vz.id === v.voziloId)!,
  }))
  const slobodniVozaci = VOZACI.filter(v => !v.voziloId)
  const assignedVoziloIds = new Set(VOZACI.map(v => v.voziloId).filter(Boolean) as string[])
  const slobodnaVozila = VOZILA.filter(vz => !assignedVoziloIds.has(vz.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card noPad>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Današnje dodjele</div>
          <Badge variant="blue">{dodjele.length} aktivnih</Badge>
        </div>
        <Table head={['Vozač', 'Vozilo', 'Model', 'Napredak', 'Status', '']}>
          {dodjele.map(({ vozac, vozilo }) => {
            const pct = vozac.total ? Math.round(vozac.done / vozac.total * 100) : 0
            return (
              <Tr key={vozac.id}>
                <Td first>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar initials={vozac.initials} index={vozac.idx} />
                    {vozac.name}
                  </div>
                </Td>
                <Td><Plate reg={vozilo.reg} /></Td>
                <Td muted>{vozilo.model}</Td>
                <Td>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ fontSize: 11, marginBottom: 2 }}>{vozac.done}/{vozac.total} ({pct}%)</div>
                    <ProgBar pct={pct} />
                  </div>
                </Td>
                <Td><Badge variant={vozac.variant}>{vozac.status}</Badge></Td>
                <Td><Btn variant="outline">↺ Preraspodijeli</Btn></Td>
              </Tr>
            )
          })}
        </Table>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card noPad>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Slobodni vozači</div>
            <Badge variant="green">{slobodniVozaci.length}</Badge>
          </div>
          {slobodniVozaci.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--text2)' }}>Svi vozači su dodijeljeni.</div>
          ) : (
            <Table head={['Vozač', '']}>
              {slobodniVozaci.map(vz => (
                <Tr key={vz.id}>
                  <Td first>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar initials={vz.initials} index={vz.idx} />
                      {vz.name}
                    </div>
                  </Td>
                  <Td><Btn variant="outline">+ Dodijeli vozilo</Btn></Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Card noPad>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Slobodna vozila</div>
            <Badge variant="green">{slobodnaVozila.length}</Badge>
          </div>
          {slobodnaVozila.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--text2)' }}>Sva vozila su u uporabi.</div>
          ) : (
            <Table head={['Vozilo', 'Status', '']}>
              {slobodnaVozila.map(vz => (
                <Tr key={vz.id}>
                  <Td first><Plate reg={vz.reg} /></Td>
                  <Td>
                    <Badge variant={vz.statusVozila === 'Servis' ? 'red' : 'blue'}>{vz.statusVozila}</Badge>
                  </Td>
                  <Td>
                    <Btn variant={vz.statusVozila === 'Servis' ? 'outline' : 'outline'}>
                      {vz.statusVozila === 'Servis' ? '🔧 Servis' : '+ Dodijeli vozača'}
                    </Btn>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  )
}
