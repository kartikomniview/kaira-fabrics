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

        {/* Description */}
        <p
          className={`font-sans text-white/85 text-xs sm:text-sm md:text-base lg:text-lg font-light leading-relaxed tracking-wide text-center max-w-xl transition-all duration-700 delay-[350ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          Premium fabrics and leather for interiors and furniture.
          Discover our curated collection of luxury textiles designed to elevate your spaces.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 transition-all duration-700 delay-[500ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button
            onClick={() => {
              const section = document.getElementById('collections') || document.getElementById('fabric-collections')
              if (section) section.scrollIntoView({ behavior: 'smooth' })
            }}
            variant="primary"
            className="w-full sm:w-auto text-xs sm:text-sm md:text-base font-bold !px-10 sm:!px-12 md:!px-14 !py-3.5 sm:!py-4 md:!py-5 rounded-full shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 tracking-widest uppercase"
          >
            Explore Collections
          </Button>
          <Button
            to="/ai-visualizer"
            variant="outline"
            className="w-full sm:w-auto text-xs sm:text-sm md:text-base font-bold !px-10 sm:!px-12 md:!px-14 !py-3.5 sm:!py-4 md:!py-5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 tracking-widest uppercase !border-white/50 !text-white hover:!bg-white/10 hover:!text-white"
          >
            Try AI Fabric Visualizer
          </Button>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div
        className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 transition-all duration-700 delay-[800ms] ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-0.5 animate-bounce">
          <span className="w-px h-4 sm:h-5 bg-gradient-to-b from-white/50 to-transparent" />
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

    </section>
  )
}

export default HeroSection
