import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/sections/HeroSection'
import CTASection from '../components/sections/CTASection'
import WhyKairaSection from '../components/sections/WhyKairaSection'
import FabricCategoriesSection from '../components/sections/FabricCategoriesSection'

// Counter Component to handle the numeric increment effect
const Counter = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasStarted) {
        setHasStarted(true)
      }
    }, { threshold: 0.1 })

    if (countRef.current) observer.observe(countRef.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [hasStarted, end, duration])

  return <span ref={countRef}>{count}{suffix}</span>
}

// Gallery images — 7 items with explicit grid placement for gap-free 4-col mosaic
const galleryImages = [
  { id: 1, src: 'https://placehold.co/600x800/D5D2CC/74623C?text=Gallery+1', alt: 'Living Room — Royal Velvet',        cls: 'md:col-start-1 md:col-end-3 md:row-start-1 md:row-end-3' },
  { id: 2, src: 'https://placehold.co/300x400/DADADD/74623C?text=Gallery+2', alt: 'Bedroom Suite — Cashmere Touch',    cls: 'md:col-start-3 md:row-start-1' },
  { id: 3, src: 'https://placehold.co/300x400/D8D5D0/74623C?text=Gallery+3', alt: 'Dining Room — Italian Leather',     cls: 'md:col-start-4 md:row-start-1' },
  { id: 4, src: 'https://placehold.co/600x400/DCDBD8/74623C?text=Gallery+4', alt: 'Study Library — Contemporary Weave', cls: 'md:col-start-3 md:col-end-5 md:row-start-2' },
  { id: 5, src: 'https://placehold.co/300x400/D3D0CB/74623C?text=Gallery+5', alt: 'Lounge Area — Silk Heritage',       cls: 'md:col-start-1 md:row-start-3' },
  { id: 6, src: 'https://placehold.co/300x400/D8D8D5/74623C?text=Gallery+6', alt: 'Master Suite — Linen Masters',      cls: 'md:col-start-2 md:row-start-3' },
  { id: 7, src: 'https://placehold.co/600x400/D5D2CC/74623C?text=Gallery+7', alt: 'Modern Office — Urban Slate',       cls: 'md:col-start-3 md:col-end-5 md:row-start-3' },
]

const HomePage = () => {
  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsAboutVisible(true)
      }
    }, { threshold: 0.2 })

    if (aboutRef.current) observer.observe(aboutRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* 1. Hero + Interactive 3D Banner */}
      <HeroSection />

      {/* Clients Scrollbar */}
      <section className="bg-stone-50 border-b border-stone-200 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Trusted by Global Brands</p>
        </div>
        
        {/* Infinite Scroll Container */}
        <div className="relative w-full flex overflow-hidden group border-y border-stone-200/50 bg-white/50 py-5">
          {/* Fading Edges */}
          <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-[scroll_30s_linear_infinite] group-hover:[animation-play-state:paused]">
            {/* First set of logos */}
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div key={`logo-1-${num}`} className="w-32 sm:w-40 mx-6 sm:mx-10 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0">
                <img src={`https://placehold.co/200x80/e7e5e4/a8a29e?text=BRAND+${num}`} alt={`Brand ${num}`} className="w-full h-auto object-contain" />
              </div>
            ))}
            {/* Duplicated set for seamless loop */}
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div key={`logo-2-${num}`} className="w-32 sm:w-40 mx-6 sm:mx-10 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0">
                <img src={`https://placehold.co/200x80/e7e5e4/a8a29e?text=BRAND+${num}`} alt={`Brand ${num}`} className="w-full h-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* Unified About & Categories Section */}
      <section id="collections" className="bg-white border-b border-stone-200 pt-8 md:pt-14 pb-6 md:pb-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Centered About / Intro Area */}
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16">
            <div className="inline-flex items-center justify-center gap-3 mb-3 sm:mb-4">
              <span className="h-px w-5 sm:w-6 bg-primary" />
              <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500">
                The Luxe Comfort
              </h2>
              <span className="h-px w-5 sm:w-6 bg-primary" />
            </div>
            
            <h3 ref={aboutRef} className="font-serif text-xl sm:text-2xl md:text-4xl lg:text-5xl text-stone-900 leading-[1.2] mb-4 md:mb-6 overflow-hidden flex flex-col items-center">
              <span className={`block transition-all duration-1000 ease-out transform ${isAboutVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
                Redefining luxury and
              </span>
              <span className={`block transition-all duration-1000 ease-out delay-100 transform ${isAboutVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
                comfort in <span className="italic text-stone-400">every thread.</span>
              </span>
            </h3>
            
            <p className="text-xs sm:text-sm md:text-base text-stone-600 font-sans font-light leading-relaxed mb-6 md:mb-8 max-w-2xl mx-auto px-2 md:px-0">
              Welcome to <strong className="font-medium text-stone-900 uppercase tracking-widest text-[10px] sm:text-xs">KAIRA</strong>. Our passion for creating exquisite sofa fabrics has led us on a journey to redefine the way you experience your living spaces. Step into a world of sophistication, style, and unparalleled quality.
            </p>

            {/* Centered Interactive CTA Button */}
            <div className="flex justify-center w-full sm:w-auto px-4 sm:px-0">
              <button 
                onClick={() => document.getElementById('fabric-collections')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-500 rounded-sm overflow-hidden"
              >
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest relative z-10">Explore Our Collections</span>
                <svg className="w-3.5 h-3.5 relative z-10 group-hover:translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {/* Hover Reveal Effect */}
                <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              </button>
            </div>
          </div>

          <FabricCategoriesSection />
        </div>
      </section>

      {/* AI & 3D Visualizer Banner Strip */}
      <section className="bg-stone-900 py-8 md:py-16 border-y border-stone-800 relative overflow-hidden">
        {/* Subtle motion background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-10">
          <div className="flex-1 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 mb-2 sm:mb-4">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-primary"></span>
              </span>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-300 font-bold">Cutting-Edge Tech</span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl md:text-4xl text-white mb-2 sm:mb-4 leading-tight">
              Experience Fabrics in <span className="text-primary italic">Real-Time</span>
            </h2>
            <p className="text-stone-400 text-[11px] sm:text-sm md:text-base max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed px-2 lg:px-0">
              Visualize our premium collection in your space using AI or explore every thread in 3D.
            </p>
          </div>

          <div className="flex flex-row gap-2 sm:gap-4 w-full lg:w-auto shrink-0 mt-1 sm:mt-0">
            <Link 
              to="/ai-visualizer" 
              className="flex-1 sm:flex-none group relative flex flex-col items-center justify-center min-w-0 sm:min-w-[200px] px-2 py-3 sm:px-8 sm:py-6 bg-primary hover:bg-white transition-all duration-500 rounded-sm text-center"
            >
              <span className="text-stone-900 text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1">Room View</span>
              <span className="text-stone-900 text-[11px] sm:text-lg font-serif leading-tight whitespace-nowrap">Try AI Visualizer</span>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-stone-900 transition-all duration-500 group-hover:w-full" />
            </Link>

            <Link 
              to="/3d-visualizer" 
              className="flex-1 sm:flex-none group relative flex flex-col items-center justify-center min-w-0 sm:min-w-[200px] px-2 py-3 sm:px-8 sm:py-6 bg-transparent border border-stone-700 hover:border-primary transition-all duration-500 rounded-sm text-center"
            >
              <span className="text-stone-500 text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1 group-hover:text-primary">Macro View</span>
              <span className="text-white text-[11px] sm:text-lg font-serif leading-tight whitespace-nowrap group-hover:text-primary">Explore in 3D</span>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </Link>
          </div>
        </div>
      </section>

      {/* Unified Advantage & Specialties Section */}
      <WhyKairaSection />

      {/* Smart Catalog Banner Component */}
      <section className="bg-stone-900 py-10 md:py-20 border-y border-stone-800 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/woven-light.png')]" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
            <div className="inline-flex items-center justify-center p-2.5 md:p-3 bg-stone-800 rounded-full mb-4 md:mb-6 border border-stone-700 shadow-2xl">
              <svg className="w-5 h-5 md:w-8 md:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            
            <div className="text-center mb-4 md:mb-6">
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2 md:mb-3">Smart Discovery</p>
              <h2 className="font-serif text-2xl md:text-5xl text-white font-medium tracking-tight">
                Smart Catalog
              </h2>
            </div>
            
            <p className="text-stone-300 text-xs md:text-lg max-w-2xl mx-auto mb-6 md:mb-10 font-sans font-light leading-relaxed">
              Explore our comprehensive catalog of <strong className="text-white font-medium">premium fabrics</strong>. Easily filter by color, texture, and material category to find the exact match for your project.
            </p>

            <div className="grid grid-cols-3 gap-2 md:gap-4 border-y border-stone-800 py-5 md:py-8 mb-6 md:mb-10 max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-1 md:mb-2">
                  <Counter end={500} suffix="+" />
                </span>
                <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] text-stone-400 font-bold">Materials</span>
              </div>
              <div className="flex flex-col items-center border-l border-stone-800/50">
                <span className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-1 md:mb-2">
                  <Counter end={100} suffix="+" />
                </span>
                <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] text-stone-400 font-bold">Collections</span>
              </div>
              <div className="flex flex-col items-center border-l border-stone-800/50">
                <span className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-1 md:mb-2">
                  <Counter end={50} suffix="+" />
                </span>
                <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] text-stone-400 font-bold">Clients</span>
              </div>
            </div>
            
            <Link 
              to="/materials" 
              className="group inline-flex flex-col items-center justify-center gap-1.5 px-6 py-3 md:px-8 md:py-4 bg-white text-stone-900 border border-transparent hover:bg-transparent hover:border-white hover:text-white transition-all duration-300 rounded-sm shadow-xl"
            >
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Open Smart Catalog</span>
              <span className="text-[8px] md:text-[9px] text-stone-500 group-hover:text-stone-300 transition-colors uppercase tracking-widest">View Full Collection</span>
            </Link>
        </div>
      </section>

      {/* 6. Portfolio */}
      <section id="portfolio" className="bg-stone-50 py-10 md:py-24 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-2">Showcase</p>
            <h2 className="font-serif text-2xl md:text-4xl text-stone-900">
              Our Portfolio
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
              <span className="h-px w-6 md:w-8 bg-stone-200" />
              <span className="w-1 h-1 bg-stone-300 rounded-full" />
              <span className="h-px w-6 md:w-8 bg-stone-200" />
            </div>
            <p className="mt-4 md:mt-6 text-stone-600 text-xs md:text-sm max-w-lg mx-auto font-normal tracking-wide leading-relaxed">
              Showcasing the world's most exquisite interiors powered by KAIRA
            </p>
          </div>

          {/* Mosaic Grid — explicit placement, zero gaps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 md:[grid-template-rows:repeat(3,200px)]">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className={`h-28 sm:h-36 md:h-auto group relative overflow-hidden rounded-xl border border-stone-200/50 shadow-sm transition-all duration-500 hover:shadow-xl ${img.cls}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 md:p-5">
                  <div className="translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1">{img.alt.split(' — ')[0]}</p>
                    <p className="text-stone-300 text-[8px] md:text-[10px] italic">{img.alt.split(' — ')[1]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center gap-3 px-6 md:px-8 py-2.5 md:py-3 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-stone-900 border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 rounded-sm"
            >
              Explore Full Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <CTASection />
    </>
  )
}

export default HomePage
