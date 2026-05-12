import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Nalozi from './pages/Nalozi'
import Vozaci from './pages/Vozaci'
import Partneri from './pages/Partneri'

export type Page = 'dashboard' | 'nalozi' | 'vozaci' | 'partneri'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  const content = {
    dashboard: <Dashboard />,
    nalozi: <Nalozi />,
    vozaci: <Vozaci />,
    partneri: <Partneri />,
  }[page]

  return (
    <Layout page={page} onNavigate={setPage}>
      {content}
    </Layout>
  )
}
