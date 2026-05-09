import { Link } from 'react-router-dom'

const KURIKKAL_LOGO = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/KurikalLogoPlainLight.webp'

const CTASection = () => {
  return (
    <section
      className="py-20 md:py-36 relative overflow-hidden"
      style={{backgroundColor: 'var(--color-secondary, #2e2b25)' }}
    >
      {/* Heavy overlay to fade the background image */}
      <div className="absolute inset-0 bg-secondary/90" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="p-4 inline-flex">
            <img
              src={KURIKKAL_LOGO}
              alt="Kurikkal Group"
              className="h-28 md:h-48 w-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Eyebrow */}
        <p className="text-[10px] uppercase tracking-[0.35em] text-primary/80 font-semibold mb-6">
          Kurikkal Group · Est. 1991
        </p>

        {/* Main Heading */}
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] text-white mb-6">
          Keeping your trust<br />
          <span className="text-primary">since 1991.</span>
        </h2>

        {/* Description */}
        <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-10 font-sans font-light leading-relaxed">
          Connect with our interior consultants to explore bespoke fabric solutions, request premium samples, or discuss your upcoming luxury projects.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            to="/contact"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-secondary overflow-hidden w-full sm:w-auto transition-all duration-300 shadow-lg shadow-black/30"
          >
            <span className="text-xs font-bold uppercase tracking-widest relative z-10">Contact Us</span>
            <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-primary-dark translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          </Link>

          <Link
            to="/materials"
            className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-transparent border border-white/40 hover:border-primary hover:bg-primary/10 text-white/80 hover:text-primary w-full sm:w-auto transition-all duration-300"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Browse Catalog</span>
          </Link>
        </div>

        {/* Bottom trust note */}
        <p className="mt-10 text-white/35 text-[10px] uppercase tracking-[0.25em]">
          Carpet · Furnishing · Décor
        </p>
      </div>
    </section>
  )
}

export default CTASection
