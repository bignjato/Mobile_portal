import { useState } from 'react'
import { Card, Badge, Avatar, Plate, Table, Tr, Td, StatRow, ProgBar, TabBar } from '../components/ui'

const VOZACI = [
  { initials: 'IH', name: 'Ivan Horvat',   reg: 'ZG 1234 AB', done: 5, total: 8,  variant: 'amber' as const, status: 'Na terenu',      idx: 0 },
  { initials: 'MB', name: 'Marko Babić',   reg: 'ZG 5678 CD', done: 7, total: 7,  variant: 'green' as const, status: 'Završio',         idx: 1 },
  { initials: 'AK', name: 'Ana Knežević',  reg: 'ZG 9012 EF', done: 2, total: 6,  variant: 'amber' as const, status: 'Na terenu',      idx: 2 },
  { initials: 'JP', name: 'Josip Perić',   reg: 'ZG 3456 GH', done: 0, total: 5,  variant: 'red'   as const, status: 'Nepravilnost',   idx: 3 },
  { initials: 'TM', name: 'Tomislav Matić',reg: 'ZG 7890 IJ', done: 3, total: 5,  variant: 'amber' as const, status: 'Na terenu',      idx: 4 },
]

const TABS = ['Vozači (18)', 'Vozila (14)', 'Dodjele']

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
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => setSelected(i)}
                  >
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
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>
              Vozilo – {v.reg}
            </div>
            <StatRow label="Registracija" value={v.reg} />
            <StatRow label="Model" value="MAN TGS 26.440" />
            <StatRow label="Godina" value="2019." />
            <StatRow label="Vozač danas" value={v.name} />
            <StatRow label="Tehnički pregled" value="✓ 12/2025" valueColor="var(--green)" />

            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dnevni napredak</span>
                <span style={{ fontWeight: 800, color: 'var(--green)' }}>
                  {Math.round(v.done / v.total * 100)}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
                {v.done} od {v.total} naloga
              </div>
              <ProgBar pct={Math.round(v.done / v.total * 100)} />
            </div>
          </Card>

          {/* Mapa */}
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Lokacija vozila</div>
            <div style={{
              background: 'linear-gradient(135deg, #e8f0e8 0%, #d4e4d4 50%, #e0eae0 100%)',
              borderRadius: 8, height: 130, position: 'relative', overflow: 'hidden',
              border: '1px solid #C7D9C7',
            }}>
              {/* Ceste */}
              {[38, 68].map(t => (
                <div key={t} style={{ position: 'absolute', background: 'rgba(255,255,255,0.7)', height: 6, width: '100%', top: `${t}%` }} />
              ))}
              {[28, 62].map(l => (
                <div key={l} style={{ position: 'absolute', background: 'rgba(255,255,255,0.7)', width: 6, height: '100%', left: `${l}%` }} />
              ))}
              {/* Grid linije */}
              {[22, 52].map(t => (
                <div key={t} style={{ position: 'absolute', background: 'rgba(0,0,0,0.06)', height: 1, width: '100%', top: `${t}%` }} />
              ))}
              {/* Pinovi */}
              <div style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%,-100%)', fontSize: 20, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }}>🚛</div>
              <div style={{ position: 'absolute', left: '28%', top: '70%', transform: 'translate(-50%,-100%)', fontSize: 16 }}>📍</div>
              <div style={{ position: 'absolute', left: '65%', top: '70%', transform: 'translate(-50%,-100%)', fontSize: 16 }}>📍</div>
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
