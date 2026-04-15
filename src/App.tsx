import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Layout from './components/layout/Layout'
import PageLoader from './components/ui/PageLoader'
import { WhatsAppIcon } from './components/ui/WhatsAppIcon'
import { MaterialsProvider } from './contexts/MaterialsContext'

// Route-level code splitting — each page loads its own JS chunk on first visit
const HomePage             = lazy(() => import('./pages/HomePage'))
const CollectionsPage      = lazy(() => import('./pages/CollectionsPage'))
const AboutPage            = lazy(() => import('./pages/AboutPage'))
const MaterialsPage        = lazy(() => import('./pages/materialslist/MaterialsPage'))
const GalleryPage          = lazy(() => import('./pages/GalleryPage'))
const ThreeDVisualizerPage = lazy(() => import('./pages/ThreeDVisualizerPage'))
const AIVisualizerPage     = lazy(() => import('./pages/AIVisualizerPage'))
const ContactPage          = lazy(() => import('./pages/ContactPage'))
const AdminPage            = lazy(() => import('./pages/admin/AdminPage'))

// Disable smooth scroll on routes that manage their own scroll (e.g. 3D Studio)
const LENIS_DISABLED_PATHS = ['/3d-visualizer','/ai-visualizer','/collections','/materials']

function LenisManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (LENIS_DISABLED_PATHS.includes(pathname) || LENIS_DISABLED_PATHS.some(path => pathname.includes(path))) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [pathname])
  return null
}

function App() {

  // Show the branded PageLoader until all critical resources are ready.
  // `appReady` drives the fade-out; `showLoader` unmounts it after the transition.
  const [appReady, setAppReady]   = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const finish = () => {
      setAppReady(true)
      setTimeout(() => setShowLoader(false), 560) // matches PageLoader transition duration
    }

    if (document.readyState === 'complete') {
      // Already loaded — show loader briefly so it feels intentional
      const t = setTimeout(finish, 250)
      return () => clearTimeout(t)
    }

    // Wait for window.load (fonts, images) with a safety-net max of 3.5 s
    const max = setTimeout(finish, 3500)
    window.addEventListener('load', finish, { once: true })
    return () => {
      clearTimeout(max)
      window.removeEventListener('load', finish)
    }
  }, [])

  return (
    <>
      {/* Lazy-route Suspense — Layout is direct-imported so Header/Footer stay
          visible; the Outlet area shows SectionLoader (wired inside Layout). */}
      <MaterialsProvider>
        <BrowserRouter>
          <LenisManager />
          <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="materials" element={<MaterialsPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="3d-visualizer" element={<ThreeDVisualizerPage />} />
              <Route path="ai-visualizer" element={<AIVisualizerPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
            {/* Admin — rendered outside Layout (no header/footer) */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
        </BrowserRouter>
      </MaterialsProvider>

      {/* Full-screen branded loader — overlays everything on initial page load */}
      {showLoader && <PageLoader exiting={appReady} />}
      
      {/* WhatsApp icon for mobile view */}
      <WhatsAppIcon />
    </>
  )
}

export default App
