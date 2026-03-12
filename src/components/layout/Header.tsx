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
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 transition-shadow duration-300 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="https://supoassets.s3.ap-south-1.amazonaws.com/public/assets/clientLogos/KairaFabrics.png"
              alt="Kaira Fabrics & Leather"
              className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300"
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
                  `text-xs tracking-wider transition-colors duration-200 ${
                    isActive
                      ? 'text-stone-900 underline underline-offset-4'
                      : 'text-stone-600 hover:text-stone-900'
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
              to="/materials"
              className="hidden lg:inline-flex items-center justify-center px-5 py-2 text-xs tracking-widest uppercase bg-stone-900 text-white hover:bg-stone-700 transition-all duration-300"
            >
              Explore Fabrics
            </Link>

            {/* Hamburger */}
            <button
              aria-label="Toggle navigation"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="lg:hidden flex flex-col gap-1.5 p-2"
            >
              <span
                className={`block w-6 h-px bg-stone-700 transition-all duration-300 ${
                  isMobileOpen ? 'rotate-45 translate-y-2.5' : ''
                }`}
              />
              <span
                className={`block w-6 h-px bg-stone-700 transition-all duration-300 ${
                  isMobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-px bg-stone-700 transition-all duration-300 ${
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
          isMobileOpen ? 'max-h-screen border-t border-stone-200' : 'max-h-0'
        }`}
      >
        <nav className="bg-white px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `text-sm ${
                  isActive ? 'text-stone-900 font-medium' : 'text-stone-600 hover:text-stone-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/materials"
            onClick={() => setIsMobileOpen(false)}
            className="mt-2 text-center bg-stone-900 text-white py-3 text-xs tracking-widest uppercase hover:bg-stone-700 transition-all"
          >
            Explore Fabrics
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
