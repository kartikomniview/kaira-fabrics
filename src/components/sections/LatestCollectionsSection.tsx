import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FabricCategoriesSection from './FabricCategoriesSection'

gsap.registerPlugin(ScrollTrigger)

const LatestCollectionsSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const desktopCtaRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current!

      /* ── Header timeline ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      // Eyebrow label fades in
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      )
      // Headline slides up
      .fromTo(
        headlineRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
        '<0.1',
      )
      // Subtitle fades in
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '<0.15',
      )
      /* ── Grid reveal (scrub fade+rise) ── */
      gsap.fromTo(
        gridRef.current,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        },
      )

      /* ── CTA fade+rise ── */
      gsap.fromTo(
        desktopCtaRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: desktopCtaRef.current,
            start: 'top bottom',
            toggleActions: 'play none none none',
          },
        },
      )

      // Refresh ScrollTrigger after dynamic content (FabricCategoriesSection) finishes loading

    }, sectionRef)

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 600)

    return () => { ctx.revert(); clearTimeout(refreshTimer) }
  }, [])

  return (
    <section
      id="collections"
      ref={sectionRef}
      className="border-b border-stone-200 bg-stone-50 pt-16 md:pt-28 pb-16 md:pb-24 relative overflow-hidden"
    >
      {/* Arabesque texture overlay */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Section Header ── */}
        <div className="mb-12 md:mb-16 flex flex-col items-center text-center gap-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center justify-center">
            <span ref={eyebrowRef} style={{ opacity: 0 }} className="text-[11px] font-bold uppercase tracking-[0.35em] text-secondary">
              Shop by Category
            </span>
          </div>
          <h2 ref={headlineRef} style={{ opacity: 0 }} className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.15]">
            <span className="text-stone-900 font-serif">Our </span><span className="text-primary font-serif">Collections</span>
          </h2>
          <p ref={subtitleRef} style={{ opacity: 0 }} className="text-stone-500 text-[15px] max-w-sm leading-relaxed">
            Premium fabrics and leathers, curated for the finest interiors and upholstery.
          </p>
        </div>

        {/* ── Category Cards Grid ── */}
        <div ref={gridRef} style={{ opacity: 0 }}>
          <FabricCategoriesSection />
        </div>

        {/* ── CTA ── */}
        <div ref={desktopCtaRef} style={{ opacity: 0 }} className="flex justify-center mt-12">
          <Link
            to="/collections"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-secondary text-white hover:bg-primary/90 transition-all duration-300 text-sm font-bold uppercase tracking-widest shadow-md"
          >
            Explore All Collections
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default LatestCollectionsSection
