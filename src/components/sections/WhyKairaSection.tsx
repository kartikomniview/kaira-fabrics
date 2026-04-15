import { useRef, useState, useCallback, type ReactNode, type MouseEvent } from 'react'
import {
  motion, useInView, useMotionValue, useTransform, useSpring, useMotionTemplate,
} from 'framer-motion'

const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const
const EXPO_OUT   = [0.16, 1, 0.3, 1] as const

const KURIKKAL_LOGO = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/landing/KirikalLogo.webp'

// ── Inline SVG illustrations ───────────────────────────────────
const FabricIcon = () => (
  <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 text-secondary">
    <rect x="5" y="11" width="30" height="22" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9" y="16" width="32" height="22" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="13" y="21" width="34" height="22" rx="2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="13" y1="28" x2="47" y2="28" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2" strokeOpacity="0.55"/>
    <line x1="13" y1="33" x2="47" y2="33" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2" strokeOpacity="0.55"/>
    <line x1="13" y1="38" x2="47" y2="38" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2" strokeOpacity="0.55"/>
  </svg>
)

const VisualizerIcon = () => (
  <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 text-secondary">
    <path d="M6 26C10 17 17 13 26 13C35 13 42 17 46 26C42 35 35 39 26 39C17 39 10 35 6 26z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="26" cy="26" r="5.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="26" cy="26" r="2" fill="currentColor" fillOpacity="0.6"/>
    <path d="M39 10l1.2 3.8L44 15l-3.8 1.2L39 20l-1.2-3.8L34 15l3.8-1.2z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
)

const TrustIcon = () => (
  <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 text-secondary">
    <path d="M26 5l17 6.5v15C43 37 35.5 45 26 48C16.5 45 9 37 9 26.5V11.5z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M17 26l7 7 11-12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const LegacyIcon = () => (
  <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 text-secondary">
    <path d="M26 8l4 10h10l-8 6 3 10-9-6-9 6 3-10-8-6h10z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <line x1="26" y1="34" x2="26" y2="44" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="18" y1="44" x2="34" y2="44" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const TeamIcon = () => (
  <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 text-secondary">
    <circle cx="17" cy="17" r="5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7 37c0-6 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    <circle cx="35" cy="17" r="5" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M27 37c0-4 3.6-7 8-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    <path d="M42 6l1.3 4 4 1.3-4 1.3L42 17l-1.3-4.7L36 11l4.7-1.3z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
)

const advantages = [
  { title: 'Premium Fabrics & Leather',      desc: 'Curated wide range of textures, weaves & leathers for every design vision.',                  Icon: FabricIcon },
  { title: 'Smart Visualization',             desc: 'See your space transformed with our AI-powered tool before you buy.',                         Icon: VisualizerIcon },
  { title: 'Trusted by Dealers & Designers', desc: 'Preferred partner across South India for quality and reliability.',                            Icon: TrustIcon },
  { title: 'Kurikkal Group Legacy',           desc: "Backed by 33+ years of excellence from one of South India's trusted conglomerates.",          Icon: LegacyIcon },
  { title: 'Passionate & Driven Team',        desc: 'An ambitious team pushing the boundaries of fabric innovation every day.',                    Icon: TeamIcon },
]

// ── Card entrance variants ─────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, delay: 0.18 + i * 0.10, ease: EXPO_OUT },
  }),
}

// ── 3-D tilt card with mouse-tracking spotlight ───────────────
const TiltCard = ({ children, isActive, isDimmed, onClick }: {
  children: ReactNode; isActive: boolean; isDimmed: boolean; onClick: () => void
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useMotionValue(50)
  const sy = useMotionValue(50)
  const glowOp = useMotionValue(0)

  const rotateX  = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 280, damping: 26 })
  const rotateY  = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 280, damping: 26 })
  const spotlight = useMotionTemplate`radial-gradient(circle at ${sx}% ${sy}%, rgba(116,98,60,0.15) 0%, transparent 62%)`

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width  - 0.5)
    my.set((e.clientY - r.top)  / r.height - 0.5)
    sx.set(((e.clientX - r.left) / r.width)  * 100)
    sy.set(((e.clientY - r.top)  / r.height) * 100)
    glowOp.set(1)
  }, [mx, my, sx, sy, glowOp])

  const onLeave = useCallback(() => {
    mx.set(0); my.set(0); glowOp.set(0)
  }, [mx, my, glowOp])

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      animate={{ opacity: isDimmed ? 0.35 : 1, scale: isActive ? 1.06 : 1 }}
      transition={{ duration: 0.3, ease: SMOOTH_OUT }}
      className={`group relative h-full rounded-xl overflow-hidden bg-white cursor-pointer border transition-shadow duration-300 ${
        isActive
          ? 'border-secondary shadow-xl ring-2 ring-secondary/20'
          : 'border-stone-200 shadow-sm hover:shadow-lg'
      }`}
    >
      {/* Mouse-tracking spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 rounded-xl"
        style={{ background: spotlight, opacity: glowOp }}
      />
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
const WhyKairaSection = () => {
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef  = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const cardsInView  = useInView(cardsRef,  { once: true, margin: '-80px' })

  return (
    <section
      id="why-kaira"
      className="relative overflow-hidden border-b border-stone-200"
      style={{
        background: '#faf8f5',
        backgroundImage: [
          'repeating-linear-gradient(0deg,rgba(0,0,0,0.018) 0px,rgba(0,0,0,0.018) 1px,transparent 1px,transparent 8px)',
          'repeating-linear-gradient(90deg,rgba(0,0,0,0.018) 0px,rgba(0,0,0,0.018) 1px,transparent 1px,transparent 8px)',
        ].join(','),
      }}
    >
      {/* ── Secondary top accent bar — draws in ── */}
      <motion.div
        className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-secondary to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: EXPO_OUT }}
      />

      {/* ── Subtle secondary halo ── */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)', opacity: 0.05 }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">

        {/* ══ CENTERED TOP HEADING ══ */}
        <div ref={headerRef} className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, y: -16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EXPO_OUT }}
          >
            <motion.span
              className="h-px bg-secondary"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '2rem' } : {}}
              transition={{ duration: 0.7, delay: 0.12, ease: SMOOTH_OUT }}
            />
            <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">The Kaira Advantage</span>
            <motion.span
              className="h-px bg-secondary"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '2rem' } : {}}
              transition={{ duration: 0.7, delay: 0.12, ease: SMOOTH_OUT }}
            />
          </motion.div>
          <div className="overflow-hidden">
            <motion.h2
              className="font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-stone-900 leading-tight"
              initial={{ y: '115%', skewY: 2 }}
              animate={headerInView ? { y: '0%', skewY: 0 } : {}}
              transition={{ duration: 1.0, delay: 0.18, ease: EXPO_OUT }}
            >
              Why <span className="text-secondary italic">Kaira Fabrics?</span>
            </motion.h2>
          </div>
        </div>

        {/* ══ COMPACT INFO ROW ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 mb-14 pb-10 border-b border-stone-200">

          {/* Left: Est badge + headline */}
          <motion.div
            className="flex flex-col items-center lg:items-end text-center lg:text-right"
            initial={{ opacity: 0, x: -32 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: EXPO_OUT }}
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <motion.span
                className="h-px bg-secondary"
                initial={{ width: 0 }}
                animate={headerInView ? { width: '2rem' } : {}}
                transition={{ duration: 0.7, delay: 0.45, ease: SMOOTH_OUT }}
              />
              <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">Est. 1991</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 leading-snug">
              Keeping your{' '}
              <span className="text-secondary italic">trust since 1991.</span>
            </h3>
          </motion.div>

          {/* Center: Kurikkal logo */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={headerInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.4, ease: EXPO_OUT }}
            className="flex justify-center"
          >
            <motion.div
              className="inline-flex flex-col gap-3 p-5 sm:p-6 border border-stone-200 rounded-2xl bg-white shadow-md shadow-stone-100/80"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(116,98,60,0.14)' }}
            >
              <img
                src={KURIKKAL_LOGO}
                alt="Kurikkal Group"
                className="h-16 sm:h-20 w-auto object-contain"
                loading="lazy"
              />
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-stone-100" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-stone-400 font-semibold whitespace-nowrap">Legacy Brand Since 1991</span>
                <span className="h-px flex-1 bg-stone-100" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right: tagline + descriptor */}
          <motion.div
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
            initial={{ opacity: 0, x: 32 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: EXPO_OUT }}
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">Kurikkal Group</span>
              <motion.span
                className="h-px bg-secondary"
                initial={{ width: 0 }}
                animate={headerInView ? { width: '2rem' } : {}}
                transition={{ duration: 0.7, delay: 0.45, ease: SMOOTH_OUT }}
              />
            </div>
            <p className="text-stone-500 text-sm leading-relaxed font-sans">
              Three decades of crafting spaces and building relationships — powered by a relentless commitment to quality.
            </p>
          </motion.div>

        </div>

        {/* ══ ADVANTAGE CARDS ══ */}
        <div ref={cardsRef}>
          {/* Cards */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
            style={{ perspective: '1200px' }}
          >
            {advantages.map((adv, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={cardsInView ? 'visible' : 'hidden'}
                className="h-full"
              >
                <TiltCard
                  isActive={activeIdx === i}
                  isDimmed={activeIdx !== null && activeIdx !== i}
                  onClick={() => setActiveIdx(prev => prev === i ? null : i)}
                >
                  {/* Illustration area */}
                  <div
                    className="relative flex flex-col items-center justify-center py-7 px-3"
                    style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-secondary) 10%, white), color-mix(in srgb, var(--color-secondary) 5%, #faf8f5))' }}
                  >
                    {/* Icon — springs in, wiggles when active */}
                    <motion.div
                      className="w-[52px] h-[52px] rounded-full bg-white border-2 border-secondary/30 flex items-center justify-center shadow-sm"
                      initial={{ scale: 0, rotate: -15 }}
                      animate={cardsInView
                        ? { scale: 1, rotate: activeIdx === i ? [0, -10, 10, -6, 6, 0] : 0 }
                        : {}}
                      transition={activeIdx === i
                        ? { duration: 0.55, ease: SMOOTH_OUT }
                        : { type: 'spring', stiffness: 280, damping: 16, delay: 0.3 + i * 0.10 }}
                    >
                      <adv.Icon />
                    </motion.div>

                    {/* Pulse ring expands out when card is activated */}
                    {activeIdx === i && (
                      <motion.div
                        className="absolute w-[52px] h-[52px] rounded-full border-2 border-secondary"
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 2.4, opacity: 0 }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className="px-4 py-3 border-t border-stone-100">
                    <p className={`font-sans font-semibold text-sm leading-snug mb-0.5 transition-colors duration-300 ${
                      activeIdx === i ? 'text-secondary' : 'text-stone-800 group-hover:text-secondary'
                    }`}>
                      {adv.title}
                    </p>
                    <p className="text-stone-500 text-xs leading-relaxed">{adv.desc}</p>
                  </div>

                  {/* Bottom accent line — active = full, hover = grows */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2.5px] bg-secondary rounded-b-xl"
                    animate={{ width: activeIdx === i ? '100%' : '0%' }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.35, ease: SMOOTH_OUT }}
                  />
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default WhyKairaSection