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
      <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'visualizer-logs',
    label: 'Visualizer Logs',
    isShow: true,
    icon: (
      <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'gallery',
    label: 'Gallery',
    isShow: false,
    icon: (
      <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'collections',
    label: 'Collections',
    isShow: true,
    icon: (
      <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="h-screen w-full bg-stone-100 font-sans flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 bg-white text-stone-900 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-stone-200 shadow-sm z-10">
        <Link to="/" className="flex items-center gap-2 md:gap-3 group">
          <img
            src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/kaira.webp"
            alt="Kaira"
            className="h-6 md:h-8 w-auto object-contain group-hover:opacity-80 transition-opacity"
          />
          <span className="text-stone-300 text-sm hidden sm:inline">|</span>
          <span className="text-stone-500 text-xs md:text-sm uppercase tracking-widest mt-0.5 md:mt-1 font-medium hidden sm:inline">Admin</span>
        </Link>
        <button
          onClick={() => { localStorage.removeItem('adminToken'); setIsAuthenticated(false) }}
          className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-50 hover:bg-red-100 text-[10px] md:text-xs uppercase tracking-widest text-red-600 transition-colors rounded font-medium"
        >
          <svg className="w-3 md:w-3.5 h-3 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </header>

      {/* Below-header row */}
      <div className="flex flex-col-reverse md:flex-row flex-1 min-h-0 overflow-hidden">

        {/* Sidebar / Bottom Nav */}
        <aside className="w-full md:w-56 shrink-0 bg-white border-t md:border-t-0 md:border-r border-secondary-dark/10 flex flex-col py-2 md:pt-6 md:pb-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:shadow-sm overflow-x-auto md:overflow-y-auto hide-scrollbar z-20 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-4">
          <p className="hidden md:block px-5 mb-3 text-[9px] uppercase tracking-[0.2em] font-bold text-secondary-dark/60">Modules</p>
          <nav className="flex flex-row md:flex-col gap-1 px-2 justify-around md:justify-start w-full">
            {NAV_ITEMS.filter((item) => item.isShow).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-4 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all text-center md:text-left flex-1 md:flex-none justify-center md:justify-start ${activeModule === item.id
                  ? 'bg-primary text-secondary-dark shadow-sm'
                  : 'text-secondary-dark/70 hover:text-secondary-dark hover:bg-secondary-dark/5'
                  }`}
              >
                {item.icon}
                <span className="text-[10px] md:text-sm leading-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-stone-100">
          <div className="bg-white p-4 md:p-6 min-h-full">
            {activeModule === 'leads' && <LeadsPanel />}
            {activeModule === 'visualizer-logs' && <VisualizerLogsPanel />}
            {activeModule === 'gallery' && <GalleryPanel />}
            {activeModule === 'collections' && <CollectionsPanel />}
          </div>
        </main>

      </div>
    </div>
  )
}

export default AdminPage
