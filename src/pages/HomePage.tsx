import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/sections/HeroSection'
import FabricDiscoverySection from '../components/sections/FabricDiscoverySection'
import AIVisualizerSection from '../components/sections/AIVisualizerSection'
import CTASection from '../components/sections/CTASection'
import CollectionCard from '../components/ui/CollectionCard'
import { collections } from '../data/collections'

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
  return (
    <>
      {/* 1. Hero + Interactive 3D Banner */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="bg-stone-50 border-b border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-3 divide-x divide-stone-200">
            <div className="text-center px-4">
              <p className="font-serif text-2xl md:text-3xl text-secondary">
                <Counter end={500} suffix="+" />
              </p>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">Fabric Varieties</p>
            </div>
            <div className="text-center px-4">
              <p className="font-serif text-2xl md:text-3xl text-secondary">
                <Counter end={30} suffix="+" />
              </p>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">Years Heritage</p>
            </div>
            <div className="text-center px-4">
              <p className="font-serif text-2xl md:text-3xl text-secondary">
                <Counter end={120} suffix="+" />
              </p>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">Global Designers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Collections Grid */}
      <section className="bg-white py-12 lg:py-16 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900">
              Latest <span className="text-secondary font-medium">Collections</span>
            </h2>
            <p className="mt-2 text-stone-400 text-xs md:text-sm max-w-lg mx-auto font-normal tracking-wide leading-relaxed">
              Explore our curated selection of premium fabrics
            </p>
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
              <span className="w-1 h-1 rotate-45 bg-secondary inline-block" />
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {collections.slice(0, 4).map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-sm text-stone-600 border-b border-stone-400 pb-0.5 hover:text-stone-900 hover:border-stone-700 transition-colors duration-200"
            >
              Explore all collections
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner — Explore Fabrics */}
      <section className="bg-stone-900 py-8 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-1">500+ Varieties</p>
            <h3 className="font-serif text-lg md:text-xl text-white">
              Discover fabrics by color, texture &amp; material
            </h3>
          </div>
          <Link to="/materials" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-widest hover:bg-secondary-dark transition-colors duration-200">
            Browse All Fabrics
          </Link>
        </div>
      </section>

      {/* 4. Fabric Discovery */}
      <FabricDiscoverySection />

      {/* CTA Banner — Consultation */}
      <section className="relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-300 mb-1">Bespoke Service</p>
            <h3 className="font-serif text-xl md:text-2xl text-white">Not sure where to start?</h3>
            <p className="text-stone-300 text-sm mt-1 max-w-md">Our consultants help you find the perfect fabric for your space.</p>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-8 py-3 bg-white text-secondary text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors duration-200">
            Book a Consultation
          </Link>
        </div>
      </section>

      {/* 5. AI Visualizer Section */}
      <AIVisualizerSection />

      {/* CTA Banner — AI / 3D */}
      <section className="bg-stone-900 py-10 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-1">New Feature</p>
            <h3 className="font-serif text-xl md:text-2xl text-white">
              Visualize fabrics in your room — <span className="text-primary">powered by AI</span>
            </h3>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/ai-visualizer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-stone-900 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-colors duration-200">
              Try AI
            </Link>
            <Link to="/3d-visualizer" className="inline-flex items-center gap-2 px-6 py-3 border border-stone-600 text-stone-300 text-xs font-bold uppercase tracking-widest hover:border-stone-400 hover:text-white transition-colors duration-200">
              Try 3D
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Gallery */}
      <section className="bg-stone-100 py-12 lg:py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900">
              KAIRA <span className="text-secondary font-medium">Gallery</span>
            </h2>
            <p className="mt-2 text-stone-400 text-xs md:text-sm max-w-lg mx-auto font-normal tracking-wide leading-relaxed">
              Showcasing the world's most exquisite interiors powered by KAIRA
            </p>
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
              <span className="w-1 h-1 rotate-45 bg-secondary inline-block" />
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
            </div>
          </div>

          {/* Mosaic Grid — explicit placement, zero gaps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ gridTemplateRows: 'repeat(3, 200px)' }}>
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className={`group relative overflow-hidden rounded-xl border border-stone-200/50 shadow-sm transition-all duration-500 hover:shadow-xl ${img.cls}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">{img.alt.split(' — ')[0]}</p>
                    <p className="text-stone-300 text-[10px] italic">{img.alt.split(' — ')[1]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-3 px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold text-stone-600 border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 rounded-full"
            >
              Explore Full Gallery
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
