import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AboutSection from '../components/sections/AboutSection'
import CTASection from '../components/sections/CTASection'
import FabricCategoriesSection from '../components/sections/FabricCategoriesSection'
import HeroSection from '../components/sections/HeroSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import SmartCatalogSection from '../components/sections/SmartCatalogSection'
import WhoWeServeSection from '../components/sections/WhoWeServeSection'
import WhyKairaSection from '../components/sections/WhyKairaSection'

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
  const [isAIBannerVisible, setIsAIBannerVisible] = useState(false)
  const [isCollectionsVisible, setIsCollectionsVisible] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)
  const aiBannerRef = useRef<HTMLDivElement>(null)
  const collectionsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === aboutRef.current && entry.isIntersecting) {
          setIsAboutVisible(true)
        }
        if (entry.target === aiBannerRef.current && entry.isIntersecting) {
          setIsAIBannerVisible(true)
        }
        if (entry.target === collectionsRef.current && entry.isIntersecting) {
          setIsCollectionsVisible(true)
        }
      })
    }, { threshold: 0.2 })

    if (aboutRef.current) observer.observe(aboutRef.current)
    if (aiBannerRef.current) observer.observe(aiBannerRef.current)
    if (collectionsRef.current) observer.observe(collectionsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Quick Connect — fixed left strip */}
      <div className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 flex-col items-start">
        {/* Call */}
        <a
          href="tel:+917593840075"
          title="Call us"
          className="group flex items-center bg-stone-900 border-b border-stone-700 hover:bg-primary transition-colors duration-200"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 text-[11px] font-bold uppercase tracking-widest text-stone-900 whitespace-nowrap pr-0 group-hover:pr-3">Call</span>
        </a>

        {/* Email */}
        <a
          href="mailto:info@kairafabrics.in"
          title="Email us"
          className="group flex items-center bg-stone-900 border-b border-stone-700 hover:bg-primary transition-colors duration-200"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 text-[11px] font-bold uppercase tracking-widest text-stone-900 whitespace-nowrap pr-0 group-hover:pr-3">Email</span>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/917593840075"
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
          className="group flex items-center bg-stone-900 border-b border-stone-700 hover:bg-primary transition-colors duration-200"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 text-[11px] font-bold uppercase tracking-widest text-stone-900 whitespace-nowrap pr-0 group-hover:pr-3">WhatsApp</span>
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com/kairafabrics"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
          className="group flex items-center bg-stone-900 hover:bg-primary transition-colors duration-200"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 text-[11px] font-bold uppercase tracking-widest text-stone-900 whitespace-nowrap pr-0 group-hover:pr-3">Instagram</span>
        </a>
      </div>

      {/* 1. Hero + Interactive 3D Banner */}
      <HeroSection />

      {/* Clients Scrollbar */}
      <section className="bg-stone-50 border-b border-stone-200 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 text-center">
          <p className="text-[14px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Trusted by Global Brands</p>
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
      <section 
        id="collections" 
        ref={collectionsRef}
        className="border-b border-stone-200 pt-14 md:pt-24 pb-12 md:pb-20 relative" 
        style={{ backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background1.webp')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        {/* Overlay to keep text readable */}
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Section Header */}
          <div className={`max-w-3xl mx-auto text-center mb-12 md:mb-16 transition-all duration-1000 transform ${isCollectionsVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="inline-flex items-center justify-center gap-3 mb-3 sm:mb-4">
              <span className={`h-px bg-primary transition-all duration-1000 delay-300 ${isCollectionsVisible ? 'w-5 sm:w-6' : 'w-0'}`} />
              <h2 className={`text-[14px] sm:text-[12px] font-bold uppercase tracking-[0.3em] text-stone-500 transition-all duration-1000 delay-300 ${isCollectionsVisible ? 'opacity-100' : 'opacity-0'}`}>
                Curated Selection
              </h2>
              <span className={`h-px bg-primary transition-all duration-1000 delay-300 ${isCollectionsVisible ? 'w-5 sm:w-6' : 'w-0'}`} />
            </div>
            <h3 className="font-serif text-2xl sm:text-2xl md:text-4xl lg:text-5xl text-stone-900 leading-[1.2]">
              Latest Collections
            </h3>
            <p className="mt-3 sm:mt-4 text-stone-500 text-base sm:text-base font-light max-w-md mx-auto leading-relaxed">
              Discover our newest arrivals — premium fabrics and leathers crafted for the finest interiors.
            </p>
          </div>

          <div className={`transition-all duration-1000 delay-300 transform ${isCollectionsVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <FabricCategoriesSection />
          </div>

          {/* Bottom CTA */}
          <div className={`flex justify-center mt-12 md:mt-16 transition-all duration-1000 delay-500 transform ${isCollectionsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Link
              to="/collections"
              className="group relative inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 sm:py-5 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-500 rounded-sm overflow-hidden shadow-lg"
            >
              <span className="text-sm md:text-base font-bold uppercase tracking-widest relative z-10">Explore All Collections</span>
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
      <section 
        ref={aiBannerRef}
        className="bg-stone-900 py-20 md:py-16 border-y border-stone-800 relative overflow-hidden"
      >
        {/* Subtle motion background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
        
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-10 transition-all duration-1000 transform ${isAIBannerVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex-1 text-center lg:text-left w-full">
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 mb-4 sm:mb-4 transition-all duration-700 delay-300 ${isAIBannerVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
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
              className={`flex-1 sm:flex-none group relative flex flex-col items-center justify-center min-w-0 sm:min-w-[200px] px-2 py-4 sm:px-8 sm:py-6 bg-primary hover:bg-white transition-all duration-500 rounded-sm text-center shadow-lg ${isAIBannerVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} delay-500`}
            >
              <span className="text-stone-900 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-1">Room View</span>
              <span className="text-stone-900 text-[15px] sm:text-lg font-serif leading-tight whitespace-nowrap text-nowrap">Try AI Visualizer</span>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-stone-900 transition-all duration-500 group-hover:w-full" />
            </Link>

            <Link 
              to="/3d-visualizer" 
              className={`flex-1 sm:flex-none group relative flex flex-col items-center justify-center min-w-0 sm:min-w-[200px] px-2 py-4 sm:px-8 sm:py-6 bg-transparent border border-stone-700 hover:border-primary transition-all duration-500 rounded-sm text-center ${isAIBannerVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} delay-700`}
            >
              <span className="text-stone-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-1 group-hover:text-primary">Macro View</span>
              <span className="text-white text-[15px] sm:text-lg font-serif leading-tight whitespace-nowrap group-hover:text-primary text-nowrap">Explore in 3D</span>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </Link>
          </div>
        </div>
      </section>

      <WhoWeServeSection />

      <SmartCatalogSection />

      {/* Unified Advantage & Specialties Section */}
      <WhyKairaSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* 6. Portfolio */}
      <section id="portfolio" className="py-10 md:py-24 border-t border-stone-200 relative" style={{ backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background3.webp')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        {/* Overlay to keep text readable */}
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
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
