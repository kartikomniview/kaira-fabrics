import { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { useMaterials } from '../../contexts/MaterialsContext'

const categoryImages: Record<string, string> = {
  'CHENILLE':     'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Ripple.webp',
  'DIGITALPRINT': 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/DigitalPrints2.webp',
  'LEATHERITE':   'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Adelaide.webp',
  'SUEDEFABRIC':  'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Krystal.webp',
  'SUEDELEATHER': 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Ivana.webp',
  'DEFAULT':      'https://placehold.co/400x500/e7e5e4/a8a29e?text=Fabric',
}

const categoryMeta: Record<string, { label: string; desc: string; features: string[]; usedFor: string }> = {
  'CHENILLE':     { label: 'Chenille',           desc: 'Soft, richly textured weaves for lasting comfort',      features: ['Velvety pile texture', 'Highly durable', 'Fade resistant'],    usedFor: 'Sofas & cushions' },
  'DIGITALPRINT': { label: 'Digital Print',      desc: 'Vibrant, bespoke patterns with razor-sharp clarity',    features: ['Custom artwork prints', 'Colorfast & sharp', 'Light & airy'],   usedFor: 'Drapes & accent chairs' },
  'LEATHERITE':   { label: 'Artificial Leather', desc: 'Premium vegan upholstery with a supple finish',         features: ['Easy to clean', 'Water resistant', 'Animal-free'],               usedFor: 'Office & dining chairs' },
  'SUEDEFABRIC':  { label: 'Suede Fabric',       desc: 'Plush matte finish with an ultra-soft hand feel',       features: ['Buttery soft touch', 'Rich color depth', 'Breathable weave'],   usedFor: 'Lounge & bedroom' },
  'SUEDELEATHER': { label: 'Suede Leather',      desc: 'Buttery smooth leather that ages beautifully',          features: ['100% genuine leather', 'Develops patina', 'Luxurious grip'],    usedFor: 'Luxury upholstery' },
}

const GAP = 24 // px (gap-6 equivalent)

function getVisibleCount() {
  if (typeof window === 'undefined') return 4
  if (window.innerWidth < 640) return 1
  if (window.innerWidth < 1024) return 2
  if (window.innerWidth < 1280) return 3
  return 4
}

const FabricCategoriesSection = () => {
  const { materials } = useMaterials()
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [visibleCount, setVisibleCount] = useState(4)
  const x = useMotionValue(0)
  const isDragging = useRef(false)
  // Stable refs to avoid stale closures in event listeners
  const activeIndexRef = useRef(0)
  const cardWidthRef = useRef(0)
  const visibleCountRef = useRef(4)
  const [sectionInView, setSectionInView] = useState(false)

  // Only reveal images for visible cards + 1 preload buffer; once revealed, stays revealed
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(() => new Set())

  const categories = useMemo(() => {
    const counts = materials.reduce((acc, m) => {
      const type = m.material_type?.toUpperCase().replace(/\s+/g, '') || 'OTHER'
      if (!acc[type]) acc[type] = new Set<string>()
      acc[type].add(m.collection_name)
      return acc
    }, {} as Record<string, Set<string>>)
    return Object.entries(
      Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v.size]))
    ).sort((a, b) => a[0].localeCompare(b[0]))
  }, [materials])

  const maxSteps = Math.max(0, categories.length - visibleCount)

  // Sync refs whenever state changes
  useEffect(() => { activeIndexRef.current = activeIndex }, [activeIndex])
  useEffect(() => { cardWidthRef.current = cardWidth }, [cardWidth])
  useEffect(() => { visibleCountRef.current = visibleCount }, [visibleCount])

  // Reveal images for the current window + 1 ahead as user navigates, but only once section is visible
  useEffect(() => {
    if (!sectionInView) return
    setRevealedIndices(prev => {
      const next = new Set(prev)
      for (let i = activeIndex; i <= activeIndex + visibleCount + 1; i++) next.add(i)
      return next
    })
  }, [activeIndex, visibleCount, sectionInView])

  // Observe section visibility — reveal initial images only when scrolled into view
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSectionInView(true); obs.disconnect() } },
      { rootMargin: '150px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Compute card width via ResizeObserver
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return
      const vc = getVisibleCount()
      setVisibleCount(vc)
      const cw = containerRef.current.offsetWidth
      setCardWidth((cw - (vc - 1) * GAP) / vc)
    }
    updateDimensions()
    const ro = new ResizeObserver(updateDimensions)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const snapTo = (index: number) => {
    const maxS = Math.max(0, categories.length - visibleCountRef.current)
    const clamped = Math.max(0, Math.min(index, maxS))
    setActiveIndex(clamped)
    activeIndexRef.current = clamped
    animate(x, -(clamped * (cardWidthRef.current + GAP)), {
      type: 'spring',
      damping: 32,
      stiffness: 260,
    })
  }

  const onDragStart = () => { isDragging.current = true }

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = cardWidthRef.current / 4
    if (info.offset.x < -threshold) snapTo(activeIndexRef.current + 1)
    else if (info.offset.x > threshold) snapTo(activeIndexRef.current - 1)
    else snapTo(activeIndexRef.current)
    setTimeout(() => { isDragging.current = false }, 0)
  }

  const dragMax = maxSteps * (cardWidth + GAP)

  return (
    <div id="fabric-collections" ref={sectionRef} className="scroll-mt-24 select-none">

      {/* Carousel track with side arrows */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => snapTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-stone-200 shadow-md text-stone-600 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          onClick={() => snapTo(activeIndex + 1)}
          disabled={activeIndex === maxSteps}
          aria-label="Next"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-stone-200 shadow-md text-stone-600 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div ref={containerRef} className="overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: -dragMax, right: 0 }}
          dragElastic={0.08}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="flex cursor-grab active:cursor-grabbing will-change-transform"
          style={{ x, columnGap: GAP }}
        >
          {categories.map(([name], cardIndex) => {
            const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
            const { label, desc, features, usedFor } = categoryMeta[name] ?? { label: name, desc: '', features: [], usedFor: '' }
            return (
              <motion.div
                key={name}
                className="flex-shrink-0 group"
                style={{ width: cardWidth > 0 ? cardWidth : undefined }}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <Link
                  to={`/collections?category=${name}`}
                  className="flex flex-col h-full w-full"
                  draggable={false}
                  onClick={(e) => { if (isDragging.current) e.preventDefault() }}
                >
                  {/* Image */}
                  <div className="aspect-[3/4] relative overflow-hidden rounded-md shadow-md mb-4 bg-stone-100">
                    {revealedIndices.has(cardIndex) ? (
                      <motion.img
                        src={imgUrl}
                        alt={label}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        draggable={false}
                        variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
                        transition={{ duration: 0.7, type: 'tween' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200 animate-pulse" />
                    )}

                    {/* Hover overlay: features + ideal for */}
                    <motion.div
                      variants={{ rest: { y: '100%', opacity: 0 }, hover: { y: 0, opacity: 1 } }}
                      transition={{ duration: 0.38, type: 'tween' }}
                      className="absolute inset-x-0 bottom-0 bg-stone-900/80 backdrop-blur-sm p-4 pointer-events-none"
                    >
                      <div className="space-y-1.5 mb-2">
                        {features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-xs text-white/85">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                      {usedFor && (
                        <p className="text-[10px] text-white/50 uppercase tracking-widest font-medium">
                          Ideal for: <span className="text-white/80 normal-case font-medium">{usedFor}</span>
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Always visible: label + desc */}
                  <h3 className="font-serif text-xl text-stone-900 group-hover:text-primary transition-colors duration-200">{label}</h3>
                  <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">{desc}</p>

                  {/* Always visible: CTA */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-stone-900 uppercase tracking-[0.2em] font-bold border-b border-stone-900/30 pb-px">
                      Browse Collection
                    </span>
                    <motion.svg
                      variants={{ rest: { x: 0, opacity: 0.6 }, hover: { x: 5, opacity: 1 } }}
                      transition={{ duration: 0.3, type: 'tween' }}
                      className="w-4 h-4 text-stone-900"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
        </div>
      </div>

    </div>
  )
}

export default FabricCategoriesSection
