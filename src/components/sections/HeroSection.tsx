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
  },
  {
    url: 'https://media.istockphoto.com/id/1191254426/photo/modern-scandinavian-living-room-interior-3d-render.jpg?s=2048x2048&w=is&k=20&c=RnYRtDSBL1j3Mr3FN20EngWGNRpEPlXmF591DDGJFfw=',
    label: 'Artisan Craftsmanship',
  },
]

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    // Trigger entrance animation
    const loadTimer = setTimeout(() => setIsLoaded(true), 100)

    // Auto-advance slides every 5 seconds
    const slideTimer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SLIDES.length)
    }, 5000)

    return () => {
      clearTimeout(loadTimer)
      clearInterval(slideTimer)
    }
  }, [])

  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">

      {/* ── Background Slideshow ── */}
      {SLIDES.map((slide, i) => (
        <img
          key={slide.url}
          src={slide.url}
          alt={slide.label}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === activeSlide ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* ── Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/50 to-stone-900/70" />

      {/* ── Centered Content ── */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6">

        {/* Eyebrow */}
        <p
          className={`flex items-center gap-2 text-xs tracking-[0.25em] font-medium text-white/70 uppercase transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Premium Fabric House
        </p>

        {/* Heading */}
        <h1
          className={`font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] transition-all duration-900 delay-150 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Elegance, Woven<br />
          <span className="italic text-amber-100">in Every Stitch</span>
        </h1>

        {/* Sub-text */}
        <p
          className={`text-white/75 text-base md:text-base leading-relaxed max-w-xl transition-all duration-900 delay-300 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Premium fabrics and leather for interiors and furniture.
          Discover our curated collection of luxury textiles designed to elevate your spaces.
        </p>

        {/* Buttons — landscape row */}
        <div
          className={`flex flex-wrap justify-center items-center gap-3 pt-2 transition-all duration-700 delay-[450ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button to="/materials" variant="primary" size="lg">
            Explore Fabrics
          </Button>
          <Button to="/collections" variant="outline" size="lg">
            View Collections
          </Button>
        </div>

        {/* 3D Visualizer banner */}
        <div
          className={`mt-4 w-full max-w-3xl transition-all duration-700 delay-[600ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/25 px-6 py-4 md:px-8 md:py-5">
            {/* Subtle gold glow top-left */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-charcoal/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Icon block */}
              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-charcoal/40 border border-charcoal/60 text-gold">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>

              {/* Text */}
              <div className="text-left flex-1">
                <p className="text-xs tracking-[0.2em] uppercase font-medium text-gold mb-0.5">3D Studio</p>
                <p className="text-white text-base md:text-lg font-serif leading-snug">Visualize Fabrics in 3D</p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed max-w-sm">
                  Apply our fabrics to furniture models in real time. See how textures and colors transform your designs before committing.
                </p>
              </div>

              {/* CTA */}
              <a
                href="/3d-visualizer"
                className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-widest uppercase bg-charcoal text-cream hover:bg-stone-800 transition-colors duration-300 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                Try Fabrics in 3D
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide indicators ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`transition-all duration-500 rounded-full ${
              i === activeSlide
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

    </section>
  )
}

export default HeroSection
