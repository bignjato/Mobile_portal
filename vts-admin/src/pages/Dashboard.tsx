import { Card, Badge, Avatar, Plate, SectionRow, Table, Tr, Td } from '../components/ui'

const VOZACI = [
  { initials: 'IH', name: 'Ivan Horvat',    reg: 'ZG 1234 AB', done: 5, total: 8,  status: 'Na terenu', variant: 'amber' as const, idx: 0, time: '09:38' },
  { initials: 'MB', name: 'Marko Babić',    reg: 'ZG 5678 CD', done: 7, total: 7,  status: 'Završio',   variant: 'green' as const, idx: 1, time: '09:12' },
  { initials: 'AK', name: 'Ana Knežević',   reg: 'ZG 9012 EF', done: 2, total: 6,  status: 'Na terenu', variant: 'amber' as const, idx: 2, time: '09:41' },
  { initials: 'JP', name: 'Josip Perić',    reg: 'ZG 3456 GH', done: 0, total: 5,  status: '⚠ Nepravilnost', variant: 'red' as const, idx: 3, time: '08:55' },
]

const ACTIVITY = [
  { color: 'var(--green)', text: 'Ivan Horvat potpisao RN-0341', time: '08:47' },
  { color: 'var(--amber)', text: 'Nepravilnost prijavljena – ZG 5678 CD', time: '08:32' },
  { color: 'var(--blue)',  text: 'Novi nalog kreiran za KONZUM d.o.o.', time: '08:15' },
  { color: 'var(--green)', text: 'Marko Babić potpisao RN-0338', time: '07:58' },
]

const BARS = [
  { day: 'Pon', h: 55, active: false },
  { day: 'Uto', h: 70, active: true  },
  { day: 'Sri', h: 45, active: false },
  { day: 'Čet', h: 60, active: false },
  { day: 'Pet', h: 38, active: false },
]

export default function Dashboard() {
  return (
    <>
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { icon: '📋', bg: '#FEF2F2', value: 47, label: 'Naloga danas',   trend: '↑ 8%',  up: true },
          { icon: '✅', bg: '#F0FDF4', value: 31, label: 'Potpisano',       trend: '↑ 12%', up: true },
          { icon: '🚛', bg: '#EFF6FF', value: 14, label: 'Vozila aktiv.',   trend: '↑ 2',   up: true },
          { icon: '⚠️', bg: '#FFFBEB', value: 4,  label: 'Nepravilnosti',  trend: '↑ 3',   up: false },
        ].map(k => (
          <Card key={k.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                {k.icon}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 7px',
                background: k.up ? '#F0FDF4' : '#FEF2F2',
                color: k.up ? '#16A34A' : '#DC2626',
              }}>{k.trend}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <Card>
          <SectionRow title="Nalozi po danima – ovaj tjedan" link="Detalji" />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90, padding: '0 4px' }}>
            {BARS.map(b => (
              <div key={b.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: b.h,
                  background: 'var(--red)',
                  opacity: b.active ? 1 : 0.35,
                }} />
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>{b.day}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--bg)', fontSize: 11, color: 'var(--text2)' }}>
            <span>Prosječno: <strong style={{ color: 'var(--text)' }}>43 / dan</strong></span>
            <span>Tjedan: <strong style={{ color: 'var(--text)' }}>262</strong></span>
          </div>
        </Card>

        <Card>
          <SectionRow title="Aktivnost" />
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--bg)' : 'none' }}>
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
          {VOZACI.map(v => (
            <Tr key={v.name}>
              <Td first>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials={v.initials} index={v.idx} />
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
        </Table>
      </Card>
    </>
  )
}
