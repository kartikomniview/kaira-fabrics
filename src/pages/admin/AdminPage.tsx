import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLoginPage from './AdminLoginPage'
import LeadsPanel from './LeadsPanel'
import VisualizerLogsPanel from './VisualizerLogsPanel'
import GalleryPanel from './GalleryPanel'
import CollectionsPanel from './CollectionsPanel'

type Module = 'leads' | 'visualizer-logs' | 'gallery' | 'collections'

const NAV_ITEMS: { id: Module; label: string; icon: React.ReactNode; isShow: boolean }[] = [
  {
    id: 'leads',
    label: 'Leads',
    isShow: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'visualizer-logs',
    label: 'Visualizer Logs',
    isShow: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'gallery',
    label: 'Gallery',
    isShow: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'collections',
    label: 'Collections',
    isShow: false,
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
    <div className="h-screen w-full bg-stone-100 font-sans grid grid-cols-[14rem_1fr] grid-rows-[auto_1fr] overflow-hidden">
      {/* Top bar */}
      <header className="col-span-2 bg-white text-stone-900 px-6 py-4 flex items-center justify-between border-b border-stone-200 shadow-sm z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/kaira.webp"
            alt="Kaira"
            className="h-8 w-auto object-contain group-hover:opacity-80 transition-opacity"
          />
          <span className="text-stone-300 text-sm">|</span>
          <span className="text-stone-500 text-sm uppercase tracking-widest mt-1 font-medium">Admin</span>
        </Link>
        <button
          onClick={() => { localStorage.removeItem('adminToken'); setIsAuthenticated(false) }}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-xs uppercase tracking-widest text-red-600 transition-colors rounded font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </header>

      {/* Left sidebar */}
      <aside className="col-start-1 row-start-2 bg-white border-r border-secondary-dark/10 flex flex-col pt-6 pb-4 shadow-sm overflow-y-auto hide-scrollbar z-10">
        <p className="px-5 mb-3 text-[9px] uppercase tracking-[0.2em] font-bold text-secondary-dark/60">Modules</p>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.filter((item) => item.isShow).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeModule === item.id
                ? 'bg-primary text-secondary-dark shadow-sm'
                : 'text-secondary-dark/70 hover:text-secondary-dark hover:bg-secondary-dark/5'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="col-start-2 row-start-2 overflow-y-auto p-0 bg-stone-100 relative">
        <div className="bg-white p-6 md:p-4 min-h-full">
          {activeModule === 'leads' && <LeadsPanel />}
          {activeModule === 'visualizer-logs' && <VisualizerLogsPanel />}
          {activeModule === 'gallery' && <GalleryPanel />}
          {activeModule === 'collections' && <CollectionsPanel />}
        </div>
      </main>
    </div>
  )
}

export default AdminPage
