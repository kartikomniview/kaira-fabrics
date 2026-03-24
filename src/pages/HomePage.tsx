import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/sections/HeroSection'
import CTASection from '../components/sections/CTASection'
import WhyKairaSection from '../components/sections/WhyKairaSection'
import AboutSection from '../components/sections/AboutSection'
import FabricCategoriesSection from '../components/sections/FabricCategoriesSection'
import SmartCatalogSection from '../components/sections/SmartCatalogSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'

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
          <p className="text-[12px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Trusted by Global Brands</p>
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

      {/* Latest Collections Section */}
      <section id="collections" className="bg-stone-50 border-b border-stone-200 pt-14 md:pt-24 pb-12 md:pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center gap-3 mb-3 sm:mb-4">
              <span className="h-px w-5 sm:w-6 bg-primary" />
              <h2 className="text-[10px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500">
                Curated Selection
              </h2>
              <span className="h-px w-5 sm:w-6 bg-primary" />
            </div>
            <h3 className="font-serif text-2xl sm:text-2xl md:text-4xl lg:text-5xl text-stone-900 leading-[1.2]">
              Latest Collections
            </h3>
            <p className="mt-3 sm:mt-4 text-stone-500 text-sm sm:text-sm font-light max-w-md mx-auto leading-relaxed">
              Discover our newest arrivals — premium fabrics and leathers crafted for the finest interiors.
            </p>
          </div>

          <FabricCategoriesSection />

          {/* Bottom CTA */}
          <div className="flex justify-center mt-12 md:mt-16">
            <Link
              to="/collections"
              className="group relative inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 sm:py-5 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-500 rounded-sm overflow-hidden shadow-lg"
            >
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest relative z-10">Explore All Collections</span>
              <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <AboutSection isAboutVisible={isAboutVisible} aboutRef={aboutRef} />

      {/* AI & 3D Visualizer Banner Strip */}
      <section className="bg-stone-900 py-20 md:py-16 border-y border-stone-800 relative overflow-hidden">
        {/* Subtle motion background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-10">
          <div className="flex-1 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 mb-4 sm:mb-4">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-300 font-bold">Cutting-Edge Tech</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-3xl md:text-4xl text-white mb-4 sm:mb-4 leading-tight">
              Experience our Fabrics in <span className="text-primary italic">Real-Time</span>
            </h2>
            <p className="text-stone-400 text-sm sm:text-sm md:text-base max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed px-2 lg:px-0">
              Visualize our premium collection in your space using AI or explore every thread in 3D.
            </p>
          </div>

          <div className="flex flex-row gap-3 sm:gap-4 w-full lg:w-auto shrink-0 mt-2 sm:mt-0">
            <Link 
              to="/ai-visualizer" 
              className="flex-1 sm:flex-none group relative flex flex-col items-center justify-center min-w-0 sm:min-w-[200px] px-2 py-4 sm:px-8 sm:py-6 bg-primary hover:bg-white transition-all duration-500 rounded-sm text-center"
            >
              <span className="text-stone-900 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-1">Room View</span>
              <span className="text-stone-900 text-[15px] sm:text-lg font-serif leading-tight whitespace-nowrap">Try AI Visualizer</span>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-stone-900 transition-all duration-500 group-hover:w-full" />
            </Link>

            <Link 
              to="/3d-visualizer" 
              className="flex-1 sm:flex-none group relative flex flex-col items-center justify-center min-w-0 sm:min-w-[200px] px-2 py-4 sm:px-8 sm:py-6 bg-transparent border border-stone-700 hover:border-primary transition-all duration-500 rounded-sm text-center"
            >
              <span className="text-stone-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-1 group-hover:text-primary">Macro View</span>
              <span className="text-white text-[15px] sm:text-lg font-serif leading-tight whitespace-nowrap group-hover:text-primary">Explore in 3D</span>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </Link>
          </div>
        </div>
      </section>

      {/* Unified Advantage & Specialties Section */}
      <WhyKairaSection />

      {/* Smart Catalog Banner Component */}
      <SmartCatalogSection />

      {/* Testimonials */}
      <TestimonialsSection />

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
        </div>
      </section>

      {/* 7. CTA */}
      <CTASection />
    </>
  )
}

export default HomePage
