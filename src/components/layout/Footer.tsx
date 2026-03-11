import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-charcoal text-cream/70">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex mb-5">
              <img
                src="https://supoassets.s3.ap-south-1.amazonaws.com/public/assets/clientLogos/KairaFabrics.png"
                alt="Kaira Fabrics & Leather"
                className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
            <p className="text-sm leading-relaxed text-cream/50 mb-6">
              Crafting extraordinary textiles since 1992. Every thread tells a story of heritage,
              precision, and uncompromising luxury.
            </p>
            <div className="flex gap-4">
              {['Instagram', 'Pinterest', 'LinkedIn'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-xs text-cream/40 hover:border-gold hover:text-gold transition-all duration-200"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-serif text-cream text-base mb-5">Collections</h4>
            <ul className="space-y-3">
              {['Royal Velvet', 'Linen Masters', 'Silk Heritage', 'Cashmere Touch', 'Outdoor Luxe', 'Italian Leather'].map((item) => (
                <li key={item}>
                  <Link
                    to="/collections"
                    className="text-sm hover:text-gold transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-cream text-base mb-5">Services</h4>
            <ul className="space-y-3">
              {[
                { label: '3D Visualizer', to: '/3d-visualizer' },
                { label: 'AI Visualizer', to: '/ai-visualizer' },
                { label: 'Materials Guide', to: '/materials' },
                { label: 'Gallery', to: '/gallery' },
                { label: 'Contact Us', to: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm hover:text-gold transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-serif text-cream text-base mb-5">Get In Touch</h4>
            <address className="not-italic space-y-2 text-sm mb-6">
              <p>Via della Seta 12, Milan, Italy</p>
              <p>
                <a href="tel:+390212345678" className="hover:text-gold transition-colors">
                  +39 02 1234 5678
                </a>
              </p>
              <p>
                <a href="mailto:studio@kairafabrics.com" className="hover:text-gold transition-colors">
                  studio@kairafabrics.com
                </a>
              </p>
            </address>
            <h5 className="text-cream text-xs tracking-widest uppercase mb-3">Newsletter</h5>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-gold text-charcoal px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-gold-dark transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/30">
            &copy; {new Date().getFullYear()} KAIRA Fabrics &amp; Leather. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-xs text-cream/30 hover:text-gold transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
