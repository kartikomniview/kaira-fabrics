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
    <section className="relative w-full h-[85dvh] sm:h-[100dvh] min-h-[480px] sm:min-h-[560px] flex items-center justify-center overflow-hidden bg-stone-900">

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
      <div className="relative z-10 text-center px-5 sm:px-6 max-w-4xl mx-auto flex flex-col items-center gap-5 sm:gap-6">

        {/* Heading */}
        <h1
          className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] text-white leading-[1.08] tracking-tight transition-all duration-900 delay-150 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
        >
          Elegance, Woven<br />
          <em className="not-italic text-amber-100">in Every Stitch</em>
        </h1>

        {/* Decorative divider */}
        <div
          className={`flex items-center gap-3 transition-all duration-700 delay-[250ms] ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="w-10 h-px bg-white/25" />
          <span className="w-1 h-1 rotate-45 bg-amber-400/70 inline-block" />
          <span className="w-10 h-px bg-white/25" />
        </div>

        {/* Description */}
        <p
          className={`font-sans text-stone-100 text-lg sm:text-xl font-light leading-[1.6] tracking-wide max-w-2xl transition-all duration-900 delay-300 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          Premium fabrics and leather for interiors and furniture.
          Discover our curated collection of luxury textiles designed to elevate your spaces.
        </p>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-8 transition-all duration-700 delay-[450ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button 
            onClick={() => document.getElementById('fabric-collections')?.scrollIntoView({ behavior: 'smooth' })} 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto text-xs sm:text-sm font-bold !px-10 sm:!px-14 !py-4 sm:!py-5 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 whitespace-nowrap tracking-widest uppercase"
          >
            Explore Collection
          </Button>
          <Button to="/ai-visualizer" variant="outline" size="lg" className="w-full sm:w-auto text-xs sm:text-sm font-bold !px-10 sm:!px-14 !py-4 sm:!py-5 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 whitespace-nowrap tracking-widest uppercase bg-black/30 backdrop-blur-md border border-white/60 text-white hover:bg-white hover:text-stone-900">
            Try Fabric Visualizer
          </Button>
        </div>
      </div>

      {/* ── Scroll Down Indicator ── */}
      <div 
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer group transition-all duration-1000 delay-[600ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="w-px h-16 bg-white/20 relative overflow-hidden group-hover:bg-white/40 transition-colors">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-white/80" 
            style={{ animation: 'scrollLine 2s cubic-bezier(0.65, 0, 0.35, 1) infinite' }} 
          />
        </div>
        <style>{`
          @keyframes scrollLine {
            0% { transform: translateY(-100%); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
          }
        `}</style>
      </div>

    </section>
  )
}

export default HeroSection
