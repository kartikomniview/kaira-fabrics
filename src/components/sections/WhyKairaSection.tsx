import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const
const EXPO_OUT   = [0.16, 1, 0.3, 1] as const

const KURIKKAL_LOGO = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/landing/KurikalLogo.webp'

const FabricIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    {/* sofa body */}
    <path d="M4 13h16v5H4z" />
    {/* sofa back */}
    <path d="M4 13V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4" />
    {/* armrests */}
    <path d="M2 12h2v6H2zM20 12h2v6h-2z" />
    {/* legs */}
    <path d="M6 18v2M18 18v2" />
    {/* fabric texture lines on back cushion */}
    <path d="M8 10h2M12 10h4" strokeWidth="1" />
  </svg>
)

const VisualizationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    {/* room walls & floor */}
    <path d="M2 20h20" />
    <path d="M4 20V8l8-5 8 5v12" />
    {/* window */}
    <rect x="9" y="9" width="6" height="5" rx="0.5" />
    <line x1="12" y1="9" x2="12" y2="14" />
    <line x1="9"  y1="11.5" x2="15" y2="11.5" />
    {/* door */}
    <path d="M10 20v-4h4v4" />
  </svg>
)

const TrustedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    {/* centre person */}
    <circle cx="12" cy="7" r="2.2" />
    <path d="M8.5 19v-2a3.5 3.5 0 0 1 7 0v2" />
    {/* left person */}
    <circle cx="5" cy="8.5" r="1.8" />
    <path d="M2 19v-1.5A2.8 2.8 0 0 1 7.5 17" />
    {/* right person */}
    <circle cx="19" cy="8.5" r="1.8" />
    <path d="M22 19v-1.5A2.8 2.8 0 0 0 16.5 17" />
  </svg>
)

const LegacyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M3 21h18M9 21V7l3-4 3 4v14M4 21V11l4-2M20 21V11l-4-2" />
    <path d="M9 12h6" />
  </svg>
)

const S3_WHY = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/WhyKaira/v1'

const advantages = [
  {
    title: '35+ Year Legacy',
    desc:  "Backed by the Kurikkal Group trusted since 1991.",
    Icon:  LegacyIcon,
    bgImg: `${S3_WHY}/Kurikkal Group Legacy.webp`,
  },
  {
    title: 'Premium Fabrics & Leather',
    desc:  'Wide range of curated textures, weaves & leathers.',
    Icon:  FabricIcon,
    bgImg: `${S3_WHY}/Premium Fabrics & Leather.webp`,
  },
  {
    title: 'Smart Visualization',
    desc:  'Preview your space with AI before you commit.',
    Icon:  VisualizationIcon,
    bgImg: `${S3_WHY}/Smart Visualization.webp`,
  },
  {
    title: 'Dealer & Designer Trusted',
    desc:  'Preferred quality partner across South India.',
    Icon:  TrustedIcon,
    bgImg: `${S3_WHY}/Trusted by Dealers & Designers.webp`,
  },
]

// ── Card entrance variants ─────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: 0.15 + i * 0.10, ease: EXPO_OUT },
  }),
}

// ─────────────────────────────────────────────────────────────
const WhyKairaSection = () => {
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef  = useRef<HTMLDivElement>(null)

  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const cardsInView  = useInView(cardsRef,  { once: true, margin: '-80px' })

  return (
    <section
      id="why-kaira"
      className="relative overflow-hidden border-b border-stone-200 bg-[#f5ede0]"
    >
      {/* Arabesque texture overlay */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none" />

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
            className="inline-flex items-center justify-center mb-4"
            initial={{ opacity: 0, y: -16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EXPO_OUT }}
          >
            <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">The Kaira Advantage</span>
          </motion.div>
          <div className="overflow-hidden">
            <motion.h2
              className="font-serif text-4xl sm:text-5xl md:text-[3.2rem] color-secondary-dark leading-tight"
              initial={{ y: '115%', skewY: 2 }}
              animate={headerInView ? { y: '0%', skewY: 0 } : {}}
              transition={{ duration: 1.0, delay: 0.18, ease: EXPO_OUT }}
            >
              Why <span className="text-primary">Kaira?</span>
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
              <span className="text-[14px] uppercase tracking-[0.35em] text-secondary font-bold">Est. 1991</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 leading-snug">
              Keeping your{' '}
              <span className="text-secondary">trust since 1991.</span>
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
              className="inline-flex flex-col gap-3 p-5 sm:p-6 border border-stone-200 bg-white shadow-md shadow-stone-100/80"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(116,98,60,0.14)' }}
            >
              <img
                src={KURIKKAL_LOGO}
                alt="Kurikkal Group"
                className="h-20 sm:h-28 w-auto object-contain"
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
              <span className="text-[14px] uppercase tracking-[0.35em] text-secondary font-bold">A Legacy Brand</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed font-sans">
              Three decades of crafting spaces and building relationships powered by a relentless commitment to quality.
            </p>
          </motion.div>

        </div>

        {/* ══ ADVANTAGE CARDS ══ */}
        <div ref={cardsRef}>
          <div className="overflow-x-auto -mx-6 px-6 sm:overflow-visible sm:mx-0 sm:px-0 pb-3 sm:pb-0">
            <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 w-max sm:w-auto">
              {advantages.map((adv, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={cardsInView ? 'visible' : 'hidden'}
                  whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.28)' }}
                  transition={{ duration: 0.32, ease: SMOOTH_OUT }}
                  className="group relative w-56 flex-shrink-0 sm:w-auto sm:flex-shrink aspect-[4/3] overflow-hidden shadow-lg cursor-pointer"
                >
                  {/* Background image */}
                  <img
                    src={adv.bgImg}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Base scrim — warm dark, not pure black */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-800/25 to-transparent pointer-events-none" />

                  {/* Icon — top-right, secondary tinted */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                      <adv.Icon />
                    </div>
                  </div>

                  {/* Bottom content panel */}
                  <div className="absolute bottom-0 inset-x-0 z-10 px-4 pb-4 pt-10 bg-gradient-to-t from-stone-900/85 via-stone-900/50 to-transparent">
                    <p className="font-serif text-[15px] font-semibold text-primary leading-snug mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                      {adv.title}
                    </p>
                    <p className="text-stone-200 text-[11px] leading-relaxed">{adv.desc}</p>
                  </div>

                  {/* Secondary bottom border — slides in on hover */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-[3px] bg-secondary"
                    initial={{ width: '0%' }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.4, ease: SMOOTH_OUT }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default WhyKairaSection