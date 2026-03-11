import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled || isMobileOpen
          ? 'bg-charcoal shadow-2xl'
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="https://supoassets.s3.ap-south-1.amazonaws.com/public/assets/clientLogos/KairaFabrics.png"
              alt="Kaira Fabrics & Leather"
              className="h-12 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-xs tracking-widest uppercase transition-colors duration-200 ${
                    isActive
                      ? 'text-gold'
                      : 'text-cream/80 hover:text-gold'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/collections"
              className="hidden lg:inline-flex items-center justify-center px-5 py-2 text-xs tracking-widest uppercase border border-gold text-gold hover:bg-gold hover:text-charcoal transition-all duration-300"
            >
              Shop Now
            </Link>

            {/* Hamburger */}
            <button
              aria-label="Toggle navigation"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="lg:hidden flex flex-col gap-1.5 p-2"
            >
              <span
                className={`block w-6 h-px bg-cream transition-all duration-300 ${
                  isMobileOpen ? 'rotate-45 translate-y-2.5' : ''
                }`}
              />
              <span
                className={`block w-6 h-px bg-cream transition-all duration-300 ${
                  isMobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-px bg-cream transition-all duration-300 ${
                  isMobileOpen ? '-rotate-45 -translate-y-2.5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ${
          isMobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'
        }`}
      >
        <nav className="bg-charcoal px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase ${
                  isActive ? 'text-gold' : 'text-cream/80 hover:text-gold'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/collections"
            onClick={() => setIsMobileOpen(false)}
            className="mt-2 text-center border border-gold text-gold py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-charcoal transition-all"
          >
            Shop Now
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
