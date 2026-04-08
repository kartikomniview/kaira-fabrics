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
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [visibleCount, setVisibleCount] = useState(4)
  const x = useMotionValue(0)
  const isDragging = useRef(false)
  // Stable refs to avoid stale closures in event listeners
  const activeIndexRef = useRef(0)
  const cardWidthRef = useRef(0)
  const visibleCountRef = useRef(4)

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

  // Wheel scroll: moving over the carousel scrolls cards horizontally
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let accumulated = 0
    let rafId = 0

    const onWheel = (e: WheelEvent) => {
      const maxS = Math.max(0, categories.length - visibleCountRef.current)
      const scrollingForward = e.deltaY > 0
      const atStart = activeIndexRef.current === 0 && !scrollingForward
      const atEnd   = activeIndexRef.current === maxS && scrollingForward

      // At boundaries let the event reach Lenis so the page scrolls normally
      if (atStart || atEnd) return

      e.preventDefault()
      e.stopPropagation()
      accumulated += e.deltaY
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (Math.abs(accumulated) >= 40) {
          const direction = accumulated > 0 ? 1 : -1
          const next = Math.max(0, Math.min(activeIndexRef.current + direction, maxS))
          setActiveIndex(next)
          activeIndexRef.current = next
          animate(x, -(next * (cardWidthRef.current + GAP)), {
            type: 'spring',
            damping: 32,
            stiffness: 260,
          })
          accumulated = 0
        }
      })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(rafId)
    }
  }, [categories.length, x])

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
    <div id="fabric-collections" className="scroll-mt-24 select-none">

      {/* Carousel track */}
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
          {categories.map(([name, count]) => {
            const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
            const { label, desc, features, usedFor } = categoryMeta[name] ?? { label: name, desc: '', features: [], usedFor: '' }
            return (
              <div
                key={name}
                className="flex-shrink-0"
                style={{ width: cardWidth > 0 ? cardWidth : undefined }}
              >
                <Link
                  to={`/collections?category=${name}`}
                  className="group flex flex-col h-full w-full"
                  draggable={false}
                  onClick={(e) => { if (isDragging.current) e.preventDefault() }}
                >
                  <div className="aspect-[3/4] relative overflow-hidden rounded-md shadow-md mb-4 bg-stone-100">
                    <img
                      src={imgUrl}
                      alt={label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      draggable={false}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-white/90 backdrop-blur-sm text-stone-900 text-xs uppercase tracking-widest px-3 py-1.5 rounded shadow-sm font-medium">
                        {count} {count === 1 ? 'Collection' : 'Collections'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow">
                    <h3 className="font-serif text-xl text-stone-900 group-hover:text-primary transition-colors">{label}</h3>
                    <p className="text-xs text-stone-600 font-light mt-2 leading-relaxed flex-grow">{desc}</p>

                    <div className="mt-3 space-y-1.5">
                      {features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-stone-400 uppercase tracking-widest font-medium">
                      Ideal for: <span className="text-stone-700 normal-case font-medium">{usedFor}</span>
                    </p>

                    <div className="mt-4 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-stone-900 uppercase tracking-[0.2em] font-bold border-b border-stone-900/30 pb-px">
                        Browse Collection
                      </span>
                      <svg className="w-4 h-4 text-stone-900 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Progress dots + arrows */}
      {maxSteps > 0 && (
        <div className="flex items-center justify-center mt-10 gap-4">
          <button
            onClick={() => snapTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: maxSteps + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => snapTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-7 bg-stone-900' : 'w-1.5 bg-stone-300 hover:bg-stone-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => snapTo(activeIndex + 1)}
            disabled={activeIndex === maxSteps}
            aria-label="Next"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

    </div>
  )
}

export default FabricCategoriesSection
