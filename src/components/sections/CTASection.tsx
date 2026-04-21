import { Link } from 'react-router-dom'

const KURIKKAL_LOGO = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/landing/KurikalLogo.webp'

const CTASection = () => {
  return (
    <section className="bg-secondary py-12 md:py-32 relative overflow-hidden border-t border-secondary-dark">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')]" />
      <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/90 to-secondary-dark" />

      {/* Abstract geometric accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center z-10">
        
        {/* Kurikkal Logo Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-sm shadow-md inline-flex">
            <img
              src={KURIKKAL_LOGO}
              alt="Kurikkal Group"
              className="h-24 md:h-36 w-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Centered Eyebrow */}
        <div className="inline-flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
          <span className="text-[9px] md:text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Kurikkal Group</span>
        </div>

        {/* Main Heading */}
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary font-medium mb-3 md:mb-6 leading-[1.1]">
          Keeping your trust <br className="hidden sm:block" />
          <span className="text-stone-900">since 1991.</span>
        </h2>

        {/* Description */}
        <p className="text-white/75 text-xs md:text-sm max-w-2xl mx-auto mb-6 md:mb-8 font-sans font-light leading-relaxed">
          Connect with our interior consultants to explore bespoke fabric solutions, request premium samples, or discuss your upcoming luxury projects.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
          <Link
            to="/contact"
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 md:px-10 md:py-4 bg-primary text-secondary overflow-hidden w-full sm:w-auto transition-all duration-300 shadow-xl"
          >
            <span className="text-xs font-bold uppercase tracking-widest relative z-10">Contact Us</span>
            <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-primary-dark translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          </Link>

          <Link
            to="/materials"
            className="group inline-flex items-center justify-center px-8 py-3.5 md:px-10 md:py-4 bg-transparent border-2 border-primary hover:bg-primary text-primary hover:text-secondary w-full sm:w-auto transition-all duration-300"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Browse Catalog</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTASection
