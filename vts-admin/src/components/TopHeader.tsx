import type { Page } from '../App'
import './TopHeader.css'

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dobro jutro, Maja 👋',
  nalozi:    'Radni nalozi',
  vozaci:    'Vozači i vozila',
  partneri:  'Partneri i klijenti',
}

const PAGE_ACTIONS: Record<Page, { label: string }> = {
  dashboard: { label: '+ Novi nalog' },
  nalozi:    { label: '+ Novi nalog' },
  vozaci:    { label: '+ Dodaj vozača' },
  partneri:  { label: '+ Novi partner' },
}

interface Props {
  page: Page
  onNavigate: (p: Page) => void
}

export default function TopHeader({ page }: Props) {
  return (
    <header className="top-header">
      <h1 className="top-title">{PAGE_TITLES[page]}</h1>
      <div className="top-spacer" />
      <div className="search-box">
        <span>🔍</span>
        <span className="search-placeholder">Pretraži...</span>
      </div>
      <div className="top-chip">📅 Uto, 13. 5. 2025.</div>
      <button className="notif-btn" aria-label="Obavijesti">
        🔔
        <span className="notif-dot" />
      </button>
      <button className="top-btn-red">{PAGE_ACTIONS[page].label}</button>
    </header>
  )
}
