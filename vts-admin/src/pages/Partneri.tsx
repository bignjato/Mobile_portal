import { useState } from 'react'
import { Card, Badge, Table, Tr, Td, Btn, FilterChip, StatRow } from '../components/ui'

const PARTNERI = [
  { name: 'KONZUM d.o.o.',          kat: 'Maloprodaja', grad: 'Zagreb', mtd: 124, variant: 'green' as const, status: 'Aktivan',   lokacije: 18 },
  { name: 'SPAR Hrvatska d.o.o.',   kat: 'Maloprodaja', grad: 'Zagreb', mtd: 98,  variant: 'green' as const, status: 'Aktivan',   lokacije: 12 },
  { name: 'TOMMY d.o.o.',           kat: 'Maloprodaja', grad: 'Zagreb', mtd: 76,  variant: 'green' as const, status: 'Aktivan',   lokacije: 9  },
  { name: 'LIDL Hrvatska d.o.o.',   kat: 'Maloprodaja', grad: 'Zagreb', mtd: 62,  variant: 'green' as const, status: 'Aktivan',   lokacije: 8  },
  { name: 'STUDENAC d.o.o.',        kat: 'Maloprodaja', grad: 'Zagreb', mtd: 54,  variant: 'green' as const, status: 'Aktivan',   lokacije: 6  },
  { name: 'Pekarnica Mlinar d.o.o.', kat: 'Prehrana',   grad: 'Zagreb', mtd: 8,   variant: 'grey'  as const, status: 'Neaktivan', lokacije: 3  },
]

const LOKACIJE = [
  { adresa: 'Ilica 242, Zagreb',         naziv: 'Superm. 1 · 3 kante, 1 kontejner', dana: 'Uto, Pet',      variant: 'amber' as const },
  { adresa: 'Heinzelova 33, Zagreb',     naziv: 'Superm. 2 · 5 kanti',              dana: 'Pon, Sri, Pet', variant: 'blue'  as const },
  { adresa: 'Avenija Dubrovnik 16',      naziv: 'Superm. 3 · 2 kante',              dana: 'Čet',           variant: 'grey'  as const },
]

const FILTERS = ['Svi (84)', 'Aktivni (71)', 'Neaktivni (13)']

export default function Partneri() {
  const [filter, setFilter] = useState('Svi (84)')
  const [selected, setSelected] = useState(0)
  const p = PARTNERI[selected]

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterChip>
        ))}
        <div style={{ flex: 1 }} />
        <select style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}>
          <option>Sve kategorije</option>
        </select>
        <Btn variant="outline">📥 Izvoz</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Lista partnera */}
        <Card noPad>
          <Table head={['Partner', 'Grad', 'Nalozi MTD', 'Status', '']}>
            {PARTNERI.map((pr, i) => (
              <Tr key={pr.name} highlight={i === selected}>
                <Td first>
                  <div style={{ cursor: 'pointer' }} onClick={() => setSelected(i)}>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{pr.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>{pr.kat}</div>
                  </div>
                </Td>
                <Td>{pr.grad}</Td>
                <Td>
                  <Badge variant={pr.mtd > 20 ? 'blue' : 'grey'}>{pr.mtd}</Badge>
                </Td>
                <Td><Badge variant={pr.variant}>{pr.status}</Badge></Td>
                <Td><Btn>Otvori</Btn></Td>
              </Tr>
            ))}
          </Table>
        </Card>

        {/* Detalj partnera */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{p.kat} · {p.lokacije} lokacija</div>
              </div>
              <Badge variant={p.variant} >{p.status}</Badge>
            </div>
            <StatRow label="OIB" value="12345678901" />
            <StatRow label="Kontakt" value="Ana Šimić" />
            <StatRow label="Telefon" value={<span style={{ color: 'var(--blue)' }}>+385 1 234 5678</span>} />
            <StatRow label="Ugovor do" value="31.12.2025." valueColor="var(--green)" />
            <StatRow label="Nalozi ovaj mj." value={p.mtd} />
          </Card>

          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 10 }}>
              Lokacije ({p.lokacije})
            </div>
            {LOKACIJE.map((l, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'white',
                marginBottom: 6, cursor: 'pointer',
              }}>
                <div style={{ fontSize: 16 }}>📍</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{l.adresa}</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{l.naziv}</div>
                </div>
                <Badge variant={l.variant}>{l.dana}</Badge>
              </div>
            ))}
          </Card>

        </div>
      </div>
    </>
  )
}
