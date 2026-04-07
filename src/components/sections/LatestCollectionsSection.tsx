import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FabricCategoriesSection from './FabricCategoriesSection'

gsap.registerPlugin(ScrollTrigger)

const LatestCollectionsSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLSpanElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const desktopCtaRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const mobileCtaRef = useRef<HTMLDivElement>(null)
  const blobTopRef = useRef<HTMLDivElement>(null)
  const blobBotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current!

      /* ── Parallax blobs ── */
      gsap.to(blobTopRef.current, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
      gsap.to(blobBotRef.current, {
        y: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      })

      /* ── Header timeline ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      // Decorative line grows from width 0
      tl.fromTo(
        lineRef.current,
        { width: 0 },
        { width: '2rem', duration: 0.6, ease: 'power2.out' },
      )
      // Eyebrow label fades in
      .fromTo(
        eyebrowRef.current,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
        '<0.1',
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
      // Desktop CTA slides in from right
      .fromTo(
        desktopCtaRef.current,
        { opacity: 0, x: 24 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
        '<0.1',
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

      /* ── Mobile CTA ── */
      gsap.fromTo(
        mobileCtaRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mobileCtaRef.current,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="collections"
      ref={sectionRef}
      className="border-b border-stone-100 bg-[#faf9f7] pt-16 md:pt-28 pb-16 md:pb-24 relative overflow-hidden"
    >
      {/* Subtle decorative blobs */}
      <div ref={blobTopRef} className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div ref={blobBotRef} className="pointer-events-none absolute bottom-0 -left-16 w-56 h-56 rounded-full bg-stone-200/60 blur-2xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Section Header ── */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Left — headline */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span ref={lineRef} style={{ width: 0 }} className="h-px bg-primary block" />
              <span ref={eyebrowRef} style={{ opacity: 0 }} className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary/80">
                Shop by Category
              </span>
            </div>
            <h2 ref={headlineRef} style={{ opacity: 0 }} className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-[1.15]">
              Our Collections
            </h2>
            <p ref={subtitleRef} style={{ opacity: 0 }} className="mt-3 text-stone-500 text-[15px] font-light max-w-sm leading-relaxed">
              Premium fabrics and leathers, curated for the finest interiors and upholstery.
            </p>
          </div>

          {/* Right — inline CTA (desktop only) */}
          <div ref={desktopCtaRef} style={{ opacity: 0 }} className="hidden md:block flex-shrink-0">
            <Link
              to="/collections"
              className="group inline-flex items-center gap-3 px-8 py-3.5 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all duration-400 rounded-sm text-sm font-bold uppercase tracking-widest"
            >
              All Collections
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Category Cards Grid ── */}
        <div ref={gridRef} style={{ opacity: 0 }}>
          <FabricCategoriesSection />
        </div>

        {/* ── Mobile CTA ── */}
        <div ref={mobileCtaRef} style={{ opacity: 0 }} className="flex justify-center mt-10 md:hidden">
          <Link
            to="/collections"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-400 rounded-sm text-sm font-bold uppercase tracking-widest shadow-md"
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
