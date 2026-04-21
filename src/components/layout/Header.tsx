import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/#collections', label: 'Collections & Fabrics' },
  { to: '/#why-kaira', label: 'Why Kaira' },
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
          className={`fixed z-50 transition-all duration-300 ease-in-out ${isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${
            isHeroPage && isScrolled
              ? 'top-0 lg:top-5 w-full lg:w-[calc(100%-2rem)] max-w-[1400px] bg-white/95 backdrop-blur-md border-b lg:border border-stone-200 shadow-[0_4px_20px_rgb(0,0,0,0.05)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.08)] lg:rounded-xl'
              : `top-[2px] w-full ${
                  transparent
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
                  className={`h-12 w-auto object-contain transition-all duration-500 group-hover:opacity-75 ${
                    transparent && !isScrolled ? '' : ''
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
                      className={`relative text-[15px] tracking-[0.06em] font-semibold transition-colors duration-200 group/nav py-1.5 ${
                        transparent && !isScrolled
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
                    className="text-[13px] tracking-[0.12em] font-bold uppercase px-3 py-1 transition-all duration-200 bg-primary text-white hover:bg-primary/80"
                  >
                    Visualizer
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
                      className={`block w-5 h-px transition-all duration-300 ${
                        isMobileOpen
                          ? 'rotate-45 translate-y-[6px] bg-stone-800'
                          : (transparent && !isScrolled) ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'bg-stone-700'
                      }`}
                    />
                    <span
                      className={`block w-5 h-px transition-all duration-300 ${
                        isMobileOpen
                          ? 'opacity-0 scale-x-0'
                          : (transparent && !isScrolled) ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'bg-stone-700'
                      }`}
                    />
                    <span
                      className={`block w-5 h-px transition-all duration-300 ${
                        isMobileOpen
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
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Slide-in drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-[min(300px,82vw)] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer accent stripe */}
          <div className="h-[3px] bg-primary w-full flex-shrink-0" />

          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <img
              src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/kaira.webp"
              alt="Kaira Fabrics"
              className="h-8 w-auto object-contain"
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
          <nav className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
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
                className="flex items-center justify-between py-4 border-b border-stone-50 text-[13px] tracking-[0.12em] uppercase transition-colors duration-200 text-stone-500 hover:text-stone-900"
              >
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Visualizer — accent text in mobile */}
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
              className="flex items-center justify-between py-4 border-b border-stone-50 text-[13px] tracking-[0.12em] uppercase font-bold transition-colors duration-200"
              style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              <span>Visualizer</span>
            </Link>
          </nav>

          {/* Mobile CTA */}
          <div className="px-6 py-6 border-t border-stone-100 mt-auto">
            <Link
              to="/contact"
              onClick={() => setIsMobileOpen(false)}
              className="block w-full text-center bg-stone-900 text-white py-4 text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-stone-800 hover:shadow-lg transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
