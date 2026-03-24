import { Link } from 'react-router-dom'

const footerColumns = [
  {
    heading: 'Explore',
    links: [
      { label: 'Materials', to: '/materials' },
      { label: 'Collections', to: '/collections' },
      { label: 'Gallery', to: '/gallery' },
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
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    heading: 'Follow Us',
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/kaira_fabrics_/?hl=en' },
      { label: 'Facebook', href: 'https://www.facebook.com/kairafabricsandleather/' },
    ],
  },
]

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs tracking-[0.15em] uppercase font-semibold text-stone-300 mb-4">
                {col.heading}
              </h4>
              <ul className={`${col.heading === 'Follow Us' ? 'flex items-center space-x-4' : 'space-y-2.5'}`}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link ? (
                      <Link
                        to={link.to}
                        className="text-sm text-stone-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-400 hover:text-white transition-colors duration-200"
                        title={link.label}
                      >
                        {link.label === 'Instagram' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        ) : link.label === 'Facebook' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                          </svg>
                        ) : (
                          link.label
                        )}
                      </a>
                    )}
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
