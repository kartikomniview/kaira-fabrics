import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLoginPage from './AdminLoginPage'
import LeadsPanel from './LeadsPanel'
import VisualizerLogsPanel from './VisualizerLogsPanel'
import GalleryPanel from './GalleryPanel'
import CollectionsPanel from './CollectionsPanel'

type Module = 'leads' | 'visualizer-logs' | 'gallery' | 'collections'

const NAV_ITEMS: { id: Module; label: string; icon: React.ReactNode }[] = [
  {
    id: 'leads',
    label: 'Leads',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'visualizer-logs',
    label: 'Visualizer Logs',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'collections',
    label: 'Collections',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('adminToken'))
  const [activeModule, setActiveModule] = useState<Module>('leads')

  if (!isAuthenticated) {
    return <AdminLoginPage onSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-stone-100 font-sans flex flex-col">
      {/* Top bar */}
      <header className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="font-serif text-xl tracking-wide text-amber-400 group-hover:text-amber-300 transition-colors">KAIRA</span>
          <span className="text-stone-600 text-sm">|</span>
          <span className="text-stone-300 text-sm uppercase tracking-widest">Admin</span>
        </Link>
        <button
          onClick={() => { localStorage.removeItem('adminToken'); setIsAuthenticated(false) }}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800 text-xs uppercase tracking-widest text-red-300 transition-colors rounded"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-56 shrink-0 bg-stone-900 border-r border-stone-800 flex flex-col pt-6 pb-4">
          <p className="px-5 mb-3 text-[9px] uppercase tracking-[0.2em] font-bold text-stone-500">Modules</p>
          <nav className="flex flex-col gap-1 px-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  activeModule === item.id
                    ? 'bg-amber-400 text-stone-900'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeModule === 'leads' && <LeadsPanel />}
          {activeModule === 'visualizer-logs' && <VisualizerLogsPanel />}
          {activeModule === 'gallery' && <GalleryPanel />}
          {activeModule === 'collections' && <CollectionsPanel />}
        </main>
      </div>
    </div>
  )
}

export default AdminPage
