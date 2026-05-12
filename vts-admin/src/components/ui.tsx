import type { ReactNode, CSSProperties } from 'react'

// ── Card ─────────────────────────────────────────
export function Card({ children, style, noPad }: { children: ReactNode; style?: CSSProperties; noPad?: boolean }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      border: '1px solid var(--border)',
      padding: noPad ? 0 : '16px',
      overflow: noPad ? 'hidden' : undefined,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'blue' | 'red' | 'grey'
const BADGE_STYLES: Record<BadgeVariant, CSSProperties> = {
  green: { background: '#F0FDF4', color: '#16A34A' },
  amber: { background: '#FFFBEB', color: '#D97706' },
  blue:  { background: '#EFF6FF', color: '#2563EB' },
  red:   { background: '#FEF2F2', color: '#DC2626' },
  grey:  { background: '#F1F5F9', color: '#64748B' },
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
      ...BADGE_STYLES[variant],
    }}>
      {children}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────
const COLORS = ['#EF0C0C','#3B82F6','#8B5CF6','#10B981','#F59E0B','#EC4899']
export function Avatar({ initials, index = 0, size = 26 }: { initials: string; index?: number; size?: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: COLORS[index % COLORS.length],
      color: 'white', fontSize: size * 0.38, fontWeight: 800,
      flexShrink: 0, verticalAlign: 'middle',
    }}>
      {initials}
    </span>
  )
}

// ── Plate ─────────────────────────────────────────
export function Plate({ reg }: { reg: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 800,
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 5, padding: '2px 7px',
      whiteSpace: 'nowrap',
    }}>
      {reg}
    </span>
  )
}

// ── Section title row ─────────────────────────────
export function SectionRow({ title, link }: { title: string; link?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {title}
      </div>
      {link && <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>{link} →</span>}
    </div>
  )
}

// ── Table ─────────────────────────────────────────
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={h} style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text2)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              padding: i === 0 ? '0 10px 8px 16px' : '0 10px 8px',
              textAlign: 'left', borderBottom: '1px solid var(--border)',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

export function Tr({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return (
    <tr style={{ background: highlight ? '#F8FAFF' : undefined }}>
      {children}
    </tr>
  )
}

export function Td({ children, first, muted }: { children: ReactNode; first?: boolean; muted?: boolean }) {
  return (
    <td style={{
      padding: first ? '9px 10px 9px 16px' : '9px 10px',
      fontSize: 12,
      borderBottom: '1px solid var(--bg)',
      verticalAlign: 'middle',
      color: muted ? 'var(--text2)' : undefined,
    }}>
      {children}
    </td>
  )
}

// ── Btn ───────────────────────────────────────────
export function Btn({ variant = 'outline', children, onClick }: { variant?: 'outline' | 'red'; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 8,
        fontSize: 11, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: variant === 'red' ? 'var(--red)' : 'white',
        color: variant === 'red' ? 'white' : 'var(--text)',
        border: variant === 'outline' ? '1px solid var(--border)' : 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// ── ProgBar ───────────────────────────────────────
export function ProgBar({ pct, color = 'var(--green)' }: { pct: number; color?: string }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
    </div>
  )
}

// ── StatRow ───────────────────────────────────────
export function StatRow({ label, value, valueColor }: { label: string; value: ReactNode; valueColor?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 0', borderBottom: '1px solid var(--bg)',
      fontSize: 12,
    }}>
      <span style={{ color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: valueColor ?? 'var(--text)' }}>{value}</span>
    </div>
  )
}

// ── FilterChip ────────────────────────────────────
export function FilterChip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 20,
        fontSize: 11, fontWeight: 600,
        border: '1px solid var(--border)',
        background: active ? 'var(--dark)' : 'white',
        color: active ? 'white' : 'var(--text2)',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

// ── Tab ───────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: '8px 16px', fontSize: 12, fontWeight: 700,
            color: active === t ? 'var(--red)' : 'var(--text2)',
            borderBottom: active === t ? '2px solid var(--red)' : '2px solid transparent',
            background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: -1,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
