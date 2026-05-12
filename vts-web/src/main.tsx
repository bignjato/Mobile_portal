import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<div style="color:red;padding:20px">ERROR: #root not found</div>'
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
