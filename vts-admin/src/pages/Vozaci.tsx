import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Card, Badge, Avatar, Plate, Table, Tr, Td, StatRow, ProgBar, TabBar } from '../components/ui'

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

const VOZACI = [
  { initials: 'IH', name: 'Ivan Horvat',    reg: 'ZG 1234 AB', done: 5, total: 8,  variant: 'amber' as const, status: 'Na terenu',    idx: 0, pos: [45.8150, 15.9819] as [number,number], stops: [[45.8120, 15.9750],[45.8190, 15.9900]] as [number,number][] },
  { initials: 'MB', name: 'Marko Babić',    reg: 'ZG 5678 CD', done: 7, total: 7,  variant: 'green' as const, status: 'Završio',      idx: 1, pos: [45.8080, 16.0010] as [number,number], stops: [[45.8060, 15.9960],[45.8100, 16.0050]] as [number,number][] },
  { initials: 'AK', name: 'Ana Knežević',   reg: 'ZG 9012 EF', done: 2, total: 6,  variant: 'amber' as const, status: 'Na terenu',    idx: 2, pos: [45.8220, 15.9700] as [number,number], stops: [[45.8200, 15.9650],[45.8240, 15.9760]] as [number,number][] },
  { initials: 'JP', name: 'Josip Perić',    reg: 'ZG 3456 GH', done: 0, total: 5,  variant: 'red'   as const, status: 'Nepravilnost', idx: 3, pos: [45.8050, 15.9600] as [number,number], stops: [[45.8030, 15.9560],[45.8070, 15.9640]] as [number,number][] },
  { initials: 'TM', name: 'Tomislav Matić', reg: 'ZG 7890 IJ', done: 3, total: 5,  variant: 'amber' as const, status: 'Na terenu',    idx: 4, pos: [45.8280, 16.0100] as [number,number], stops: [[45.8260, 16.0060],[45.8300, 16.0140]] as [number,number][] },
]

const TABS = ['Vozači (18)', 'Vozila (14)', 'Dodjele']

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, 14, { duration: 1 }) }, [center, map])
  return null
}

export default function Vozaci() {
  const [tab, setTab] = useState(TABS[0])
  const [selected, setSelected] = useState(0)
  const v = VOZACI[selected]

  return (
    <>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Lista vozača */}
        <Card noPad>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Aktivni vozači</div>
            <Badge variant="green">14 aktivnih</Badge>
          </div>
          <Table head={['Vozač', 'Vozilo', 'Nalozi', 'Status']}>
            {VOZACI.map((vz, i) => (
              <Tr key={vz.name} highlight={i === selected}>
                <Td first>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setSelected(i)}>
                    <Avatar initials={vz.initials} index={vz.idx} />
                    {vz.name}
                  </div>
                </Td>
                <Td><Plate reg={vz.reg} /></Td>
                <Td>{vz.done}/{vz.total}</Td>
                <Td><Badge variant={vz.variant}>{vz.status}</Badge></Td>
              </Tr>
            ))}
          </Table>
        </Card>

        {/* Desna kolona */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Vozilo detalj */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Vozilo – {v.reg}</div>
            <StatRow label="Registracija" value={v.reg} />
            <StatRow label="Model" value="MAN TGS 26.440" />
            <StatRow label="Godina" value="2019." />
            <StatRow label="Vozač danas" value={v.name} />
            <StatRow label="Tehnički pregled" value="✓ 12/2025" valueColor="var(--green)" />
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dnevni napredak</span>
                <span style={{ fontWeight: 800, color: 'var(--green)' }}>{Math.round(v.done / v.total * 100)}%</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{v.done} od {v.total} naloga</div>
              <ProgBar pct={Math.round(v.done / v.total * 100)} />
            </div>
          </Card>

          {/* Leaflet karta */}
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Lokacija vozila</div>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', height: 220 }}>
              <MapContainer
                center={v.pos}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter center={v.pos} />
                <Marker position={v.pos} icon={truckIcon}>
                  <Popup>
                    <strong>{v.name}</strong><br />{v.reg}<br />
                    <span style={{ color: v.variant === 'green' ? '#16A34A' : v.variant === 'red' ? '#DC2626' : '#D97706' }}>{v.status}</span>
                  </Popup>
                </Marker>
                {v.stops.map((stop, i) => (
                  <Marker key={i} position={stop} icon={pinIcon}>
                    <Popup>Stanica {i + 1}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 6 }}>
              🚛 {v.reg} · Ažurirano: 09:41
            </div>
          </Card>

        </div>
      </div>
    </>
  )
}
