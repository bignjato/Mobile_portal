import type { ReactNode } from 'react'
import type { Page } from '../App'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import './Layout.css'

interface Props {
  page: Page
  onNavigate: (p: Page) => void
  children: ReactNode
}

export default function Layout({ page, onNavigate, children }: Props) {
  return (
    <div className="app-layout">
      <Sidebar page={page} onNavigate={onNavigate} />
      <div className="main-content">
        <TopHeader page={page} onNavigate={onNavigate} />
        <div className="content-body">
          {children}
        </div>
      </div>
    </div>
  )
}
