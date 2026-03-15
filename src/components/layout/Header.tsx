import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/collections', label: 'Collections' },
  { to: '/materials', label: 'Materials' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/3d-visualizer', label: '3D Visualizer' },
  { to: '/ai-visualizer', label: 'AI Visualizer' },
  { to: '/contact', label: 'Contact' },
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

  return (
    <>
      {/* Brand accent stripe */}
      <div className="fixed top-0 left-0 right-0 z-[51] h-[3px] bg-primary" />

      <header
        className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-500 ${
          transparent
            ? 'bg-transparent border-b border-white/10'
            : 'bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 group">
              <img
                src="https://supoassets.s3.ap-south-1.amazonaws.com/public/assets/clientLogos/KairaFabrics.png"
                alt="Kaira Fabrics & Leather"
                className={`h-9 w-auto object-contain transition-all duration-500 group-hover:opacity-75 ${
                  transparent ? 'brightness-0 invert' : ''
                }`}
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-200 group/nav pb-0.5 ${
                      transparent
                        ? isActive
                          ? 'text-primary'
                          : 'text-white/75 hover:text-white'
                        : isActive
                          ? 'text-secondary'
                          : 'text-stone-500 hover:text-stone-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={`absolute bottom-0 left-0 h-px bg-primary transition-all duration-300 ${
                          isActive ? 'w-full' : 'w-0 group-hover/nav:w-full'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-4">
              <Link
                to="/materials"
                className={`hidden lg:inline-flex items-center justify-center px-5 py-2.5 text-[10px] tracking-[0.22em] uppercase font-medium transition-all duration-300 ${
                  transparent
                    ? 'bg-primary text-stone-900 hover:bg-primary-light'
                    : 'bg-stone-900 text-white hover:bg-secondary'
                }`}
              >
                Explore Fabrics
              </Link>

              {/* Hamburger */}
              <button
                aria-label="Toggle navigation"
                onClick={() => setIsMobileOpen((prev) => !prev)}
                className="lg:hidden flex flex-col gap-[5px] p-2 -mr-1"
              >
                <span
                  className={`block w-5 h-px transition-all duration-300 ${
                    isMobileOpen
                      ? 'rotate-45 translate-y-[6px] bg-stone-800'
                      : transparent ? 'bg-white' : 'bg-stone-700'
                  }`}
                />
                <span
                  className={`block w-5 h-px transition-all duration-300 ${
                    isMobileOpen
                      ? 'opacity-0 scale-x-0'
                      : transparent ? 'bg-white' : 'bg-stone-700'
                  }`}
                />
                <span
                  className={`block w-5 h-px transition-all duration-300 ${
                    isMobileOpen
                      ? '-rotate-45 -translate-y-[6px] bg-stone-800'
                      : transparent ? 'bg-white' : 'bg-stone-700'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

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
              src="https://supoassets.s3.ap-south-1.amazonaws.com/public/assets/clientLogos/KairaFabrics.png"
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
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3.5 border-b border-stone-50 text-[11px] tracking-[0.15em] uppercase transition-colors duration-200 ${
                    isActive
                      ? 'text-secondary font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-primary transition-opacity duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile CTA */}
          <div className="px-6 py-6 border-t border-stone-100">
            <Link
              to="/materials"
              onClick={() => setIsMobileOpen(false)}
              className="block w-full text-center bg-stone-900 text-white py-3.5 text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-secondary transition-colors duration-300"
            >
              Explore Fabrics
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
