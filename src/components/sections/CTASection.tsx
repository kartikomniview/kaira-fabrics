import { Link } from 'react-router-dom'

const CTASection = () => {
  return (
    <section className="bg-stone-900 py-12 md:py-32 relative overflow-hidden border-t border-stone-800">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')]" />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-900/50 to-stone-950" />
      
      {/* Abstract geometric accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center z-10">
        
        {/* Centered Eyebrow */}
        <div className="inline-flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-8">
          <span className="h-px w-6 md:w-8 bg-stone-700" />
          <span className="text-[9px] md:text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary font-bold">Start Your Journey</span>
          <span className="h-px w-6 md:w-8 bg-stone-700" />
        </div>
        
        {/* Main Heading */}
        <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl text-white font-medium mb-3 md:mb-6 leading-[1.1]">
          Ready to Elevate <br className="hidden sm:block" />
          <span className="italic text-stone-400">Your Space?</span>
        </h2>
        
        {/* Description */}
        <p className="text-stone-400 text-xs md:text-sm max-w-2xl mx-auto mb-6 md:mb-8 font-sans font-light leading-relaxed">
          Connect with our interior consultants to explore bespoke fabric solutions, request premium samples, or discuss your upcoming luxury projects.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
          <Link
            to="/contact"
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 md:px-10 md:py-4 bg-white text-stone-900 rounded-sm overflow-hidden w-full sm:w-auto transition-all duration-300 shadow-xl"
          >
            <span className="text-xs font-bold uppercase tracking-widest relative z-10">Contact Us</span>
            <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          </Link>
          
          <Link
            to="/materials"
            className="group inline-flex items-center justify-center px-8 py-3.5 md:px-10 md:py-4 bg-transparent border border-stone-700 hover:border-white text-stone-300 hover:text-white rounded-sm w-full sm:w-auto transition-all duration-500"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Browse Catalog</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTASection
