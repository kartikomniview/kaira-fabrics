import { useEffect, useRef, useState } from 'react'
import AboutSection from '../components/sections/AboutSection'
import CTASection from '../components/sections/CTASection'
import HeroSection from '../components/sections/HeroSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import GallerySection from '../components/sections/GallerySection'
import SmartCatalogSection from '../components/sections/SmartCatalogSection'
import WhoWeServeSection from '../components/sections/WhoWeServeSection'
import WhyKairaSection from '../components/sections/WhyKairaSection'
import ClientsScrollbar from '../components/sections/ClientsScrollbar'
import AIVisualizerBanner from '../components/sections/AIVisualizerBanner'
import LatestCollectionsSection from '../components/sections/LatestCollectionsSection'



const HomePage = () => {
  // Toggle to show/hide extra sections
  const SHOW_EXTRA_SECTIONS = false

  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === aboutRef.current && entry.isIntersecting) {
          setIsAboutVisible(true)
        }
      })
    }, { threshold: 0.2 })

    if (aboutRef.current) observer.observe(aboutRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Quick Connect — fixed left strip */}
      <div className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 flex-col items-start">
        {/* Call */}
        <a
          href="tel:+918589925111"
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
          href="https://wa.me/918589925111"
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

      {/* Why Kaira Section */}
      <WhyKairaSection />

      {/* AI & 3D Visualizer Banner Strip */}
      <AIVisualizerBanner />

      {/* Latest Collections Section */}
      <LatestCollectionsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Gallery */}
      <GallerySection />

      {/* Clients Scrollbar | About | Who We Serve | Smart Catalog — toggle SHOW_EXTRA_SECTIONS to enable */}
      {SHOW_EXTRA_SECTIONS && (
        <>
          <ClientsScrollbar />

          {/* About Us Section */}
          <AboutSection isAboutVisible={isAboutVisible} aboutRef={aboutRef} />

          {/* Who We Serve */}
          <WhoWeServeSection />

          {/* Smart Catalog */}
          <SmartCatalogSection />
        </>
      )}

      {/* CTA */}
      <CTASection />
    </>
  )
}

export default HomePage
