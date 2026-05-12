import type { Page } from '../App'
import './Sidebar.css'

interface NavItem {
  id: Page | null
  label: string
  icon: string
  badge?: number
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'nalozi',    label: 'Radni nalozi', icon: '📋', badge: 12 },
  { id: 'vozaci',    label: 'Vozači i vozila', icon: '🚛' },
  { id: 'partneri',  label: 'Partneri', icon: '🏢' },
]

const NAV2: NavItem[] = [
  { id: null, label: 'Statistike', icon: '📊' },
  { id: null, label: 'Izvozi', icon: '📁' },
]

const NAV3: NavItem[] = [
  { id: null, label: 'Postavke', icon: '⚙️' },
  { id: null, label: 'Korisnici', icon: '👥' },
]

interface Props {
  page: Page
  onNavigate: (p: Page) => void
}

export default function Sidebar({ page, onNavigate }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">OT</div>
        <div>
          <div className="logo-text">VTS Admin</div>
          <div className="logo-sub">EKO-FLOR PLUS</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigacija</div>
        {NAV.map(item => (
          <div
            key={item.label}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => item.id && onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}

        <div className="nav-section-label">Izvještaji</div>
        {NAV2.map(item => (
          <div key={item.label} className="nav-item disabled">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}

        <div className="nav-section-label">Sustav</div>
        {NAV3.map(item => (
          <div key={item.label} className="nav-item disabled">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">MK</div>
        <div>
          <div className="user-name">Maja Kovač</div>
          <div className="user-role">Dispečer</div>
        </div>
        <button className="user-logout" title="Odjava">⏏</button>
      </div>
    </aside>
  )
}
