import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/#collections', label: 'Collections' },
  { to: '/#why-kaira', label: 'Why KAIRA' },
  { to: '/#gallery', label: 'Our Portfolio' },
]

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  const isHeroPage = location.pathname === '/'
  const transparent = isHeroPage && !isScrolled

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  // When navigating from another page to a hash section (e.g. /#collections),
  // React Router won't auto-scroll — handle it here.
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const timer = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, location.hash])

  return (
    <>
      {/* Brand accent stripe */}
      <div className="fixed top-0 left-0 right-0 z-[51] h-[2px] bg-primary" />

      <div className="flex justify-center w-full">
        <header
          className={`fixed z-50 transition-all duration-300 ease-in-out ${isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${isHeroPage && isScrolled
              ? 'top-0 lg:top-5 w-full lg:w-[calc(100%-2rem)] max-w-[1400px] bg-white/95 backdrop-blur-md border-b lg:border border-stone-200 shadow-[0_4px_20px_rgb(0,0,0,0.05)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.08)] lg:rounded-xl'
              : `top-[2px] w-full ${transparent
                ? 'bg-transparent border-b border-white/10'
                : 'bg-white/95 backdrop-blur-md border-b border-stone-200'
              }`
            }`}
        >
          <div className={`${(isHeroPage && isScrolled) ? 'px-6 sm:px-8' : 'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12'}`}>
            <div className={`flex items-center justify-between transition-all duration-300 ${(isHeroPage && isScrolled) ? 'h-16' : 'h-16 lg:h-[76px]'}`}>

              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0 group">
                <img
                  src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/kaira.webp"
                  alt="Kaira Fabrics & Leather"
                  className={`h-14 lg:h-12 w-auto object-contain transition-all duration-500 group-hover:opacity-75 ${transparent && !isScrolled ? '' : ''
                    }`}
                />
              </Link>

              {/* Right Side: Nav & CTA */}
              <div className="flex items-center justify-end flex-1 gap-6 lg:gap-10">
                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={(e) => {
                        if (link.to.includes('#') && location.pathname === '/') {
                          const hash = link.to.split('#')[1]
                          const el = document.getElementById(hash)
                          if (el) {
                            e.preventDefault()
                            el.scrollIntoView({ behavior: 'smooth' })
                            window.history.pushState(null, '', link.to)
                          }
                        } else if (link.to === '/' && location.pathname === '/') {
                          e.preventDefault()
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                      className={`relative text-[13px] tracking-[0.06em] font-semibold transition-colors duration-200 group/nav py-1.5 ${transparent && !isScrolled
                          ? 'text-white/85 hover:text-white drop-shadow-sm'
                          : 'text-stone-600 hover:text-stone-950'
                        }`}
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 w-0 group-hover/nav:w-full" />
                    </Link>
                  ))}

                  {/* Visualizer — chip nav item */}
                  <Link
                    to="/#ai-visualizer-banner"
                    onClick={(e) => {
                      if (location.pathname === '/') {
                        const el = document.getElementById('ai-visualizer-banner')
                        if (el) {
                          e.preventDefault()
                          el.scrollIntoView({ behavior: 'smooth' })
                          window.history.pushState(null, '', '/#ai-visualizer-banner')
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 text-[13px] tracking-[0.12em] font-bold uppercase px-3 py-1 transition-all duration-200 bg-primary text-white hover:bg-primary/80"
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                    Start Visualizing
                  </Link>
                </nav>

                {/* CTA + Mobile Toggle */}
                <div className="flex items-center gap-4">
                  <Link
                    to="/contact"
                    className="hidden lg:inline-flex items-center justify-center px-7 py-3 text-[11px] tracking-[0.2em] uppercase font-bold transition-all duration-300 border bg-secondary border-secondary text-white hover:bg-secondary/80 hover:shadow-lg"
                  >
                    Contact Us
                  </Link>

                  {/* Hamburger */}
                  <button
                    aria-label="Toggle navigation"
                    onClick={() => setIsMobileOpen((prev) => !prev)}
                    className="lg:hidden flex flex-col gap-[5px] p-2.5 -mr-2 touch-manipulation"
                  >
                    <span
                      className={`block w-5 h-px transition-all duration-300 ${isMobileOpen
                          ? 'rotate-45 translate-y-[6px] bg-stone-800'
                          : (transparent && !isScrolled) ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'bg-stone-700'
                        }`}
                    />
                    <span
                      className={`block w-5 h-px transition-all duration-300 ${isMobileOpen
                          ? 'opacity-0 scale-x-0'
                          : (transparent && !isScrolled) ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'bg-stone-700'
                        }`}
                    />
                    <span
                      className={`block w-5 h-px transition-all duration-300 ${isMobileOpen
                          ? '-rotate-45 -translate-y-[6px] bg-stone-800'
                          : (transparent && !isScrolled) ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'bg-stone-700'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Slide-in drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-[min(300px,82vw)] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Drawer accent stripe */}
          <div className="h-[3px] bg-primary w-full flex-shrink-0" />

          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <img
              src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/kaira.webp"
              alt="Kaira Fabrics"
              className="h-12 w-auto object-contain"
            />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center border border-stone-200 hover:border-secondary hover:text-secondary transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">
            <div className="flex flex-col mb-10">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => {
                    setIsMobileOpen(false)
                    if (link.to.includes('#') && location.pathname === '/') {
                      const hash = link.to.split('#')[1]
                      const el = document.getElementById(hash)
                      if (el) {
                        e.preventDefault()
                        el.scrollIntoView({ behavior: 'smooth' })
                        window.history.pushState(null, '', link.to)
                      }
                    } else if (link.to === '/' && location.pathname === '/') {
                      e.preventDefault()
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  className="group flex items-center justify-between py-4 border-b border-stone-100 text-[13px] tracking-[0.15em] uppercase transition-all duration-300 text-stone-600 hover:text-stone-900"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  <svg className="w-4 h-4 text-stone-300 group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Mobile CTAs (Moved below nav links) */}
            <div className="flex flex-col gap-3 pb-6">
              <Link
                to="/#ai-visualizer-banner"
                onClick={(e) => {
                  setIsMobileOpen(false)
                  if (location.pathname === '/') {
                    const el = document.getElementById('ai-visualizer-banner')
                    if (el) {
                      e.preventDefault()
                      el.scrollIntoView({ behavior: 'smooth' })
                      window.history.pushState(null, '', '/#ai-visualizer-banner')
                    }
                  }
                }}
                className="group flex items-center justify-center gap-3 w-full bg-primary text-white py-4 text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-[#861219] hover:shadow-lg transition-all duration-300"
              >
                <span>Visualizer</span>
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="group flex items-center justify-center gap-3 w-full bg-secondary text-white py-4 text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-[#b8943f] hover:shadow-lg transition-all duration-300"
              >
                <span>Contact Us</span>
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </nav>

          {/* Mobile Footer */}
          <div className="px-6 py-8 mt-auto bg-stone-50 border-t border-stone-100">
            <p className="text-[9px] text-stone-500 uppercase tracking-[0.2em] font-semibold mb-5">Reach Out</p>
            <div className="space-y-4">
              <a href="mailto:info@kairafabrics.in" className="flex items-center gap-3 text-[13px] text-stone-700 hover:text-primary transition-colors font-medium">
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                info@kairafabrics.in
              </a>
              <a href="tel:+918589925222" className="flex items-center gap-3 text-[13px] text-stone-700 hover:text-primary transition-colors font-medium">
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +91 8589925222
              </a>
            </div>
            <div className="mt-8 pt-5 border-t border-stone-200 flex items-center justify-between">
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.15em]">© {new Date().getFullYear()} Kaira</p>
              <div className="flex gap-4">
                <a href="#" className="text-stone-400 hover:text-primary transition-colors"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
                <a href="#" className="text-stone-400 hover:text-primary transition-colors"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
