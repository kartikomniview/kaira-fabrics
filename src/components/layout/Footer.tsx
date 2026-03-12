import { Link } from 'react-router-dom'

const footerColumns = [
  {
    heading: 'About',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Mission', to: '/about' },
      { label: 'Team', to: '/about' },
    ],
  },
  {
    heading: 'Collections',
    links: [
      { label: 'New Arrivals', to: '/collections' },
      { label: 'Featured', to: '/collections' },
      { label: 'Archive', to: '/collections' },
    ],
  },
  {
    heading: 'Materials',
    links: [
      { label: 'Fabrics', to: '/materials' },
      { label: 'Leather', to: '/materials' },
      { label: 'Sustainable', to: '/materials' },
    ],
  },
  {
    heading: 'Gallery',
    links: [
      { label: 'Residential', to: '/gallery' },
      { label: 'Commercial', to: '/gallery' },
      { label: 'Hospitality', to: '/gallery' },
    ],
  },
  {
    heading: 'Technology',
    links: [
      { label: '3D Visualizer', to: '/3d-visualizer' },
      { label: 'AI Visualizer', to: '/ai-visualizer' },
      { label: 'Tools', to: '/3d-visualizer' },
    ],
  },
  {
    heading: 'Contact',
    links: [
      { label: 'Get in Touch', to: '/contact' },
      { label: 'Support', to: '/contact' },
      { label: 'Locations', to: '/contact' },
    ],
  },
]

const socialIcons = [
  { label: 'FB', abbr: 'FB' },
  { label: 'Instagram', abbr: 'IG' },
  { label: 'Twitter', abbr: 'TW' },
  { label: 'LinkedIn', abbr: 'LI' },
  { label: 'Pinterest', abbr: 'PT' },
]

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs tracking-[0.15em] uppercase font-semibold text-stone-300 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-stone-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social icons */}
          <div className="flex gap-2">
            {socialIcons.map((s) => (
              <a
                key={s.abbr}
                href="#"
                aria-label={s.label}
                className="w-8 h-8 border border-white/15 flex items-center justify-center text-[10px] text-stone-500 hover:border-white/40 hover:text-white transition-all duration-200"
              >
                {s.abbr}
              </a>
            ))}
          </div>
          <p className="text-xs text-stone-600">
            &copy; {new Date().getFullYear()} KAIRA Fabrics &amp; Leather. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
