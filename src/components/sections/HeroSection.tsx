import { useState, useEffect } from 'react'
import Button from '../ui/Button'

const SLIDES = [
  {
    url: 'https://supoassets.s3.ap-south-1.amazonaws.com/public/websites/KairaFabrics/Banner/1.jpg',
    label: 'Woven Excellence',
  },
  {
    url: 'https://supoassets.s3.ap-south-1.amazonaws.com/public/websites/KairaFabrics/Banner/2.jpg',
    label: 'Premium Textiles',
  }
]

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(loadTimer)
  }, [])

  return (
    <section className="relative w-full h-[85dvh] sm:h-[100dvh] min-h-[500px] sm:min-h-[560px] flex items-center justify-center overflow-hidden bg-stone-900">

      {/* ── Background Image ── */}
      <img
        src={SLIDES[0].url}
        alt={SLIDES[0].label}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ── Professional Elegant Overlays ── */}
      <div className="absolute inset-0 bg-stone-900/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-stone-900/40" />

      {/* ── Centered Content ── */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center gap-4 sm:gap-6 mt-8 sm:mt-0">

        {/* Heading */}
        <h1
          className={`font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] text-white leading-[1.08] tracking-tight transition-all duration-900 delay-150 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
        >
          Elegance, Woven<br />
          <em className="not-italic text-amber-100">in Every Stitch</em>
        </h1>

        {/* Decorative divider */}
        <div
          className={`flex items-center gap-2 sm:gap-3 transition-all duration-700 delay-[250ms] ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="w-8 sm:w-10 h-px bg-white/25" />
          <span className="w-1 h-1 rotate-45 bg-amber-400/70 inline-block" />
          <span className="w-8 sm:w-10 h-px bg-white/25" />
        </div>

        {/* AI Visualizer Promo Box & Description */}
        <div
          className={`mt-2 sm:mt-4 p-4 md:p-6 bg-stone-900/10 border border-white/5 rounded-2xl md:rounded-3xl shadow-xl flex flex-col items-center justify-center gap-4 sm:gap-5 transition-all duration-700 delay-[450ms] ease-out w-full max-w-2xl mx-auto hover:bg-stone-900/20 hover:border-white/10 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Description */}
          <p
            className="font-sans text-white/90 text-xs sm:text-sm md:text-lg lg:text-xl font-light leading-[1.5] tracking-wide text-center"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            Premium fabrics and leather for interiors and furniture.
            Discover our curated collection of luxury textiles designed to elevate your spaces.
          </p>

          <div className="w-full flex justify-center py-1 sm:py-2">
             <div className="w-12 sm:w-16 h-px bg-white/10" />
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center w-full">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
                <span className="absolute inset-0 bg-primary/20 animate-pulse"></span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-xs sm:text-sm md:text-lg lg:text-xl font-serif italic tracking-wide leading-tight">Experience in Real-Time</p>
              </div>
            </div>
            
            <Button 
              to="/ai-visualizer" 
              variant="primary" 
              className="w-full sm:w-auto text-[10px] sm:text-xs md:text-sm font-bold !px-6 sm:!px-10 md:!px-14 !py-3 sm:!py-3.5 md:!py-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 tracking-widest uppercase flex items-center justify-center text-center mt-0.5 sm:mt-1"
            >
              Try AI Fabric Visualizer
            </Button>
          </div>
        </div>
      </div>

    </section>
  )
}

export default HeroSection
