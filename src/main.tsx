import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadNewMaterials } from './data/newmaterials.ts'

const STORAGE_KEY = 'kaira_app_version'
if (localStorage.getItem(STORAGE_KEY) !== __APP_VERSION__) {
  loadNewMaterials(true).catch(() => {})
  localStorage.setItem(STORAGE_KEY, __APP_VERSION__)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
