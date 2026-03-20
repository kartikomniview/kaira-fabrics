import { Link } from 'react-router-dom'

const footerColumns = [
  {
    heading: 'Explore',
    links: [
      { label: 'Materials Inventory', to: '/materials' },
      { label: 'Collections', to: '/collections' },
      { label: 'Project Gallery', to: '/gallery' },
    ],
  },
  {
    heading: 'Technology',
    links: [
      { label: '3D Visualizer', to: '/3d-visualizer' },
      { label: 'AI Visualizer', to: '/ai-visualizer' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact Us', to: '/contact' },
    ],
  },
]

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
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
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 text-center">
          <p className="text-xs text-stone-500 tracking-wider">
            &copy; {new Date().getFullYear()} KAIRA Fabrics & Leather. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
