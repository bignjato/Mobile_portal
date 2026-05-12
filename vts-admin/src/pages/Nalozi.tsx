import { useState } from 'react'
import { Card, Badge, Avatar, Plate, Table, Tr, Td, Btn, TabBar, FilterChip } from '../components/ui'

const NALOZI = [
  { br: 'RN-2025-0342', partner: 'SPAR Hrvatska d.o.o.',  adresa: 'Ozaljska 105, Zagreb',   initials: 'IH', name: 'Ivan Horvat',   idx: 0, reg: 'ZG 1234 AB', status: '⏳ U tijeku',      variant: 'amber' as const, time: '08:30' },
  { br: 'RN-2025-0341', partner: 'KONZUM d.o.o.',         adresa: 'Ilica 242, Zagreb',       initials: 'IH', name: 'Ivan Horvat',   idx: 0, reg: 'ZG 1234 AB', status: '✅ Potpisan',      variant: 'green' as const, time: '07:45' },
  { br: 'RN-2025-0340', partner: 'TOMMY d.o.o.',          adresa: 'Bauerova 12, Zagreb',     initials: 'AK', name: 'Ana Knežević',  idx: 2, reg: 'ZG 9012 EF', status: '✅ Potpisan',      variant: 'green' as const, time: '09:20' },
  { br: 'RN-2025-0339', partner: 'INTERSPAR d.o.o.',      adresa: 'Heinzelova 60, Zagreb',   initials: 'JP', name: 'Josip Perić',   idx: 3, reg: 'ZG 3456 GH', status: '⚠ Nepravilnost',  variant: 'red'   as const, time: '08:55' },
  { br: 'RN-2025-0338', partner: 'STUDENAC d.o.o.',       adresa: 'Vlaška 78, Zagreb',       initials: 'MB', name: 'Marko Babić',   idx: 1, reg: 'ZG 5678 CD', status: '📅 Planiran',      variant: 'blue'  as const, time: '10:15' },
  { br: 'RN-2025-0337', partner: 'LIDL Hrvatska d.o.o.',  adresa: 'Žitnjak bb, Zagreb',      initials: 'MB', name: 'Marko Babić',   idx: 1, reg: 'ZG 5678 CD', status: '📅 Planiran',      variant: 'blue'  as const, time: '11:30' },
]

const TABS = ['Danas (47)', 'Tjedan (262)', 'Svi nalozi']
const FILTERS = ['Svi', 'Planirani (16)', 'U tijeku (8)', 'Potpisani (19)', 'Nepravilnost (4)']

export default function Nalozi() {
  const [tab, setTab] = useState(TABS[0])
  const [filter, setFilter] = useState('Svi')

  return (
    <>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map(f => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterChip>
        ))}
        <div style={{ flex: 1 }} />
        <select style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}>
          <option>Svi vozači</option>
        </select>
        <select style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}>
          <option>Sva vozila</option>
        </select>
        <Btn variant="outline">📥 Izvoz</Btn>
      </div>

      <Card noPad>
        <Table head={['Broj RN', 'Partner', 'Adresa', 'Vozač', 'Vozilo', 'Status', 'Vrijeme', '']}>
          {NALOZI.map(n => (
            <Tr key={n.br}>
              <Td first><strong>{n.br}</strong></Td>
              <Td>{n.partner}</Td>
              <Td muted>{n.adresa}</Td>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials={n.initials} index={n.idx} />
                  {n.name}
                </div>
              </Td>
              <Td><Plate reg={n.reg} /></Td>
              <Td><Badge variant={n.variant}>{n.status}</Badge></Td>
              <Td muted>{n.time}</Td>
              <Td>
                <Btn variant={n.variant === 'red' ? 'red' : 'outline'}>
                  {n.variant === 'red' ? 'Pregled' : 'Otvori'}
                </Btn>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)' }}>
        <span>Prikazano 1–6 od 47</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['‹', '1', '2', '3', '›'].map((p, i) => (
            <button key={i} style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: p === '1' ? 'var(--dark)' : 'white',
              color: p === '1' ? 'white' : 'var(--text)',
              border: '1px solid var(--border)', cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
      </div>
    </>
  )
}
