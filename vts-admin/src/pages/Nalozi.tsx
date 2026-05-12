import { useMemo, useState } from 'react'
import { Card, Badge, Avatar, Plate, Table, Tr, Td, Btn, TabBar, FilterChip } from '../components/ui'

type StatusKey = 'planiran' | 'u_tijeku' | 'potpisan' | 'nepravilnost'

type Nalog = {
  br: string
  partner: string
  adresa: string
  initials: string
  name: string
  idx: number
  reg: string
  status: string
  statusKey: StatusKey
  variant: 'amber' | 'green' | 'red' | 'blue'
  time: string
  daysAgo: number
}

const NALOZI: Nalog[] = [
  { br: 'RN-2025-0342', partner: 'SPAR Hrvatska d.o.o.',  adresa: 'Ozaljska 105, Zagreb',   initials: 'IH', name: 'Ivan Horvat',    idx: 0, reg: 'ZG 1234 AB', status: '⏳ U tijeku',     statusKey: 'u_tijeku',     variant: 'amber', time: '08:30', daysAgo: 0 },
  { br: 'RN-2025-0341', partner: 'KONZUM d.o.o.',         adresa: 'Ilica 242, Zagreb',     initials: 'IH', name: 'Ivan Horvat',    idx: 0, reg: 'ZG 1234 AB', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '07:45', daysAgo: 0 },
  { br: 'RN-2025-0340', partner: 'TOMMY d.o.o.',          adresa: 'Bauerova 12, Zagreb',   initials: 'AK', name: 'Ana Knežević',   idx: 2, reg: 'ZG 9012 EF', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '09:20', daysAgo: 0 },
  { br: 'RN-2025-0339', partner: 'INTERSPAR d.o.o.',      adresa: 'Heinzelova 60, Zagreb', initials: 'JP', name: 'Josip Perić',    idx: 3, reg: 'ZG 3456 GH', status: '⚠ Nepravilnost', statusKey: 'nepravilnost', variant: 'red',   time: '08:55', daysAgo: 0 },
  { br: 'RN-2025-0338', partner: 'STUDENAC d.o.o.',       adresa: 'Vlaška 78, Zagreb',     initials: 'MB', name: 'Marko Babić',    idx: 1, reg: 'ZG 5678 CD', status: '📅 Planiran',     statusKey: 'planiran',     variant: 'blue',  time: '10:15', daysAgo: 0 },
  { br: 'RN-2025-0337', partner: 'LIDL Hrvatska d.o.o.',  adresa: 'Žitnjak bb, Zagreb',    initials: 'MB', name: 'Marko Babić',    idx: 1, reg: 'ZG 5678 CD', status: '📅 Planiran',     statusKey: 'planiran',     variant: 'blue',  time: '11:30', daysAgo: 0 },
  { br: 'RN-2025-0336', partner: 'KAUFLAND d.o.o.',       adresa: 'Avenija Dubrovnik 16',  initials: 'TM', name: 'Tomislav Matić', idx: 4, reg: 'ZG 7890 IJ', status: '⏳ U tijeku',     statusKey: 'u_tijeku',     variant: 'amber', time: '08:10', daysAgo: 0 },
  { br: 'RN-2025-0335', partner: 'PLODINE d.o.o.',        adresa: 'Slavonska av. 24',      initials: 'AK', name: 'Ana Knežević',   idx: 2, reg: 'ZG 9012 EF', status: '📅 Planiran',     statusKey: 'planiran',     variant: 'blue',  time: '12:00', daysAgo: 0 },
  { br: 'RN-2025-0334', partner: 'BILLA d.o.o.',          adresa: 'Vukovarska 271',        initials: 'IH', name: 'Ivan Horvat',    idx: 0, reg: 'ZG 1234 AB', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '13:45', daysAgo: 1 },
  { br: 'RN-2025-0333', partner: 'SPAR Hrvatska d.o.o.',  adresa: 'Radnička 80',           initials: 'JP', name: 'Josip Perić',    idx: 3, reg: 'ZG 3456 GH', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '11:20', daysAgo: 2 },
  { br: 'RN-2025-0332', partner: 'KONZUM d.o.o.',         adresa: 'Maksimirska 120',       initials: 'MB', name: 'Marko Babić',    idx: 1, reg: 'ZG 5678 CD', status: '⚠ Nepravilnost', statusKey: 'nepravilnost', variant: 'red',   time: '14:30', daysAgo: 3 },
  { br: 'RN-2025-0331', partner: 'TOMMY d.o.o.',          adresa: 'Savska 41',             initials: 'TM', name: 'Tomislav Matić', idx: 4, reg: 'ZG 7890 IJ', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '09:55', daysAgo: 4 },
  { br: 'RN-2025-0330', partner: 'INTERSPAR d.o.o.',      adresa: 'Branimirova 29',        initials: 'AK', name: 'Ana Knežević',   idx: 2, reg: 'ZG 9012 EF', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '10:40', daysAgo: 5 },
  { br: 'RN-2025-0329', partner: 'STUDENAC d.o.o.',       adresa: 'Selska 90',             initials: 'IH', name: 'Ivan Horvat',    idx: 0, reg: 'ZG 1234 AB', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '12:15', daysAgo: 6 },
  { br: 'RN-2025-0328', partner: 'LIDL Hrvatska d.o.o.',  adresa: 'Slavonska av. 100',     initials: 'JP', name: 'Josip Perić',    idx: 3, reg: 'ZG 3456 GH', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '08:25', daysAgo: 7 },
  { br: 'RN-2025-0327', partner: 'KAUFLAND d.o.o.',       adresa: 'Zagrebačka av. 145',    initials: 'MB', name: 'Marko Babić',    idx: 1, reg: 'ZG 5678 CD', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '15:00', daysAgo: 9 },
  { br: 'RN-2025-0326', partner: 'PLODINE d.o.o.',        adresa: 'Aleja Bologne 7',       initials: 'TM', name: 'Tomislav Matić', idx: 4, reg: 'ZG 7890 IJ', status: '⚠ Nepravilnost', statusKey: 'nepravilnost', variant: 'red',   time: '13:10', daysAgo: 11 },
  { br: 'RN-2025-0325', partner: 'BILLA d.o.o.',          adresa: 'Heinzelova 33',         initials: 'AK', name: 'Ana Knežević',   idx: 2, reg: 'ZG 9012 EF', status: '✅ Potpisan',     statusKey: 'potpisan',     variant: 'green', time: '11:50', daysAgo: 14 },
]

type TabKey = 'danas' | 'tjedan' | 'svi'
type FilterKey = 'svi' | 'planiran' | 'u_tijeku' | 'potpisan' | 'nepravilnost'

const PAGE_SIZE = 6

export default function Nalozi() {
  const [tab, setTab] = useState<TabKey>('danas')
  const [filter, setFilter] = useState<FilterKey>('svi')
  const [vozac, setVozac] = useState<string>('')
  const [vozilo, setVozilo] = useState<string>('')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<Nalog | null>(null)

  const vozaciOptions = useMemo(() => Array.from(new Set(NALOZI.map(n => n.name))).sort(), [])
  const vozilaOptions = useMemo(() => Array.from(new Set(NALOZI.map(n => n.reg))).sort(), [])

  const byTab = useMemo(() => NALOZI.filter(n => {
    if (tab === 'danas') return n.daysAgo === 0
    if (tab === 'tjedan') return n.daysAgo <= 7
    return true
  }), [tab])

  const counts = useMemo(() => ({
    danas: NALOZI.filter(n => n.daysAgo === 0).length,
    tjedan: NALOZI.filter(n => n.daysAgo <= 7).length,
    svi: NALOZI.length,
    planiran: byTab.filter(n => n.statusKey === 'planiran').length,
    u_tijeku: byTab.filter(n => n.statusKey === 'u_tijeku').length,
    potpisan: byTab.filter(n => n.statusKey === 'potpisan').length,
    nepravilnost: byTab.filter(n => n.statusKey === 'nepravilnost').length,
  }), [byTab])

  const filtered = useMemo(() => byTab.filter(n => {
    if (filter !== 'svi' && n.statusKey !== filter) return false
    if (vozac && n.name !== vozac) return false
    if (vozilo && n.reg !== vozilo) return false
    return true
  }), [byTab, filter, vozac, vozilo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  const resetPage = () => setPage(1)

  const TABS_DEF: { key: TabKey; label: string }[] = [
    { key: 'danas',  label: `Danas (${counts.danas})` },
    { key: 'tjedan', label: `Tjedan (${counts.tjedan})` },
    { key: 'svi',    label: `Svi nalozi (${counts.svi})` },
  ]
  const FILTERS_DEF: { key: FilterKey; label: string }[] = [
    { key: 'svi',          label: 'Svi' },
    { key: 'planiran',     label: `Planirani (${counts.planiran})` },
    { key: 'u_tijeku',     label: `U tijeku (${counts.u_tijeku})` },
    { key: 'potpisan',     label: `Potpisani (${counts.potpisan})` },
    { key: 'nepravilnost', label: `Nepravilnost (${counts.nepravilnost})` },
  ]

  const activeTabLabel = TABS_DEF.find(t => t.key === tab)!.label
  const activeFilterLabel = FILTERS_DEF.find(f => f.key === filter)!.label

  return (
    <>
      <TabBar
        tabs={TABS_DEF.map(t => t.label)}
        active={activeTabLabel}
        onChange={(label) => {
          const next = TABS_DEF.find(t => t.label === label)
          if (next) { setTab(next.key); resetPage() }
        }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS_DEF.map(f => (
          <FilterChip
            key={f.key}
            active={filter === f.key}
            onClick={() => { setFilter(f.key); resetPage() }}
          >
            {f.label}
          </FilterChip>
        ))}
        <div style={{ flex: 1 }} />
        <select
          value={vozac}
          onChange={e => { setVozac(e.target.value); resetPage() }}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}
        >
          <option value="">Svi vozači</option>
          {vozaciOptions.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select
          value={vozilo}
          onChange={e => { setVozilo(e.target.value); resetPage() }}
          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', fontFamily: 'inherit' }}
        >
          <option value="">Sva vozila</option>
          {vozilaOptions.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <Btn variant="outline">📥 Izvoz</Btn>
      </div>

      <Card noPad>
        <Table head={['Broj RN', 'Partner', 'Adresa', 'Vozač', 'Vozilo', 'Status', 'Vrijeme', '']}>
          {pageItems.length === 0 ? (
            <Tr>
              <Td first>
                <div style={{ padding: '20px 0', color: 'var(--text2)', textAlign: 'center' }}>
                  Nema naloga za odabrane filtere
                </div>
              </Td>
              <Td><></></Td><Td><></></Td><Td><></></Td><Td><></></Td><Td><></></Td><Td><></></Td><Td><></></Td>
            </Tr>
          ) : pageItems.map(n => (
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
                <Btn
                  variant={n.variant === 'red' ? 'red' : 'outline'}
                  onClick={() => setDetail(n)}
                >
                  {n.variant === 'red' ? 'Pregled' : 'Otvori'}
                </Btn>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />

      {detail && (
        <NalogModal
          nalog={detail}
          onClose={() => setDetail(null)}
          subtitle={`${activeTabLabel} · filter: ${activeFilterLabel}`}
        />
      )}
    </>
  )
}

function Pagination({
  page, totalPages, totalItems, pageSize, onChange,
}: { page: number; totalPages: number; totalItems: number; pageSize: number; onChange: (p: number) => void }) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const btnStyle = (active: boolean, disabled: boolean) => ({
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    background: active ? 'var(--dark)' : 'white',
    color: active ? 'white' : disabled ? 'var(--text2)' : 'var(--text)',
    border: '1px solid var(--border)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
  } as const)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)' }}>
      <span>Prikazano {from}–{to} od {totalItems}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          style={btnStyle(false, page <= 1)}
        >‹</button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)} style={btnStyle(p === page, false)}>{p}</button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          style={btnStyle(false, page >= totalPages)}
        >›</button>
      </div>
    </div>
  )
}

function NalogModal({ nalog, onClose, subtitle }: { nalog: Nalog; onClose: () => void; subtitle?: string }) {
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
          background: 'white', borderRadius: 12, padding: 20, width: 'min(520px, 92vw)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {nalog.variant === 'red' ? 'Pregled naloga' : 'Detalji naloga'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{nalog.br}</div>
            {subtitle && <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 20, color: 'var(--text2)', lineHeight: 1, padding: 4,
            }}
            aria-label="Zatvori"
          >✕</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Badge variant={nalog.variant}>{nalog.status}</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 8, columnGap: 12, fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>Partner</span>
          <span style={{ fontWeight: 700 }}>{nalog.partner}</span>

          <span style={{ color: 'var(--text2)' }}>Adresa</span>
          <span>{nalog.adresa}</span>

          <span style={{ color: 'var(--text2)' }}>Vozač</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar initials={nalog.initials} index={nalog.idx} />
            {nalog.name}
          </span>

          <span style={{ color: 'var(--text2)' }}>Vozilo</span>
          <span><Plate reg={nalog.reg} /></span>

          <span style={{ color: 'var(--text2)' }}>Vrijeme</span>
          <span>{nalog.time}</span>

          <span style={{ color: 'var(--text2)' }}>Datum</span>
          <span>{nalog.daysAgo === 0 ? 'Danas' : nalog.daysAgo === 1 ? 'Jučer' : `Prije ${nalog.daysAgo} dana`}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <Btn variant="outline" onClick={onClose}>Zatvori</Btn>
          {nalog.variant === 'red'
            ? <Btn variant="red" onClick={onClose}>Riješi nepravilnost</Btn>
            : <Btn variant="outline" onClick={onClose}>Preuzmi PDF</Btn>}
        </div>
      </div>
    </div>
  )
}
