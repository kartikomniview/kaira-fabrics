import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const
const EXPO_OUT   = [0.16, 1, 0.3, 1] as const

const KURIKKAL_LOGO = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/landing/KirikalLogo.webp'

const BASE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/WhyKaira/v1/'

const advantages = [
  { title: 'Premium Fabrics & Leather',      desc: 'Curated wide range of textures, weaves & leathers for every design vision.',         image: `${BASE}Premium+Fabrics+%26+Leather.webp` },
  { title: 'Smart Visualization',             desc: 'See your space transformed with our AI-powered tool before you buy.',                image: `${BASE}Smart+Visualization.webp` },
  { title: 'Trusted by Dealers & Designers', desc: 'Preferred partner across South India for quality and reliability.',                   image: `${BASE}Trusted+by+Dealers+%26+Designers.webp` },
  { title: 'Kurikkal Group Legacy',           desc: "Backed by 33+ years of excellence from one of South India's trusted conglomerates.", image: `${BASE}Kurikkal+Group+Legacy.webp` },
  { title: 'Passionate & Driven Team',        desc: 'An ambitious team pushing the boundaries of fabric innovation every day.',           image: `${BASE}Passionate+%26+Driven+Team.webp` },
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
              className="font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-stone-900 leading-tight"
              initial={{ y: '115%', skewY: 2 }}
              animate={headerInView ? { y: '0%', skewY: 0 } : {}}
              transition={{ duration: 1.0, delay: 0.18, ease: EXPO_OUT }}
            >
              Why <span className="text-primary">Kaira Fabrics?</span>
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
              <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">Est. 1991</span>
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
              className="inline-flex flex-col gap-3 p-5 sm:p-6 border border-stone-200 rounded-2xl bg-white shadow-md shadow-stone-100/80"
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
              <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">Kurikkal Group</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed font-sans">
              Three decades of crafting spaces and building relationships — powered by a relentless commitment to quality.
            </p>
          </motion.div>

        </div>

        {/* ══ ADVANTAGE CARDS ══ */}
        <div ref={cardsRef}>
          {/* Scroll wrapper — horizontal scroll on mobile, grid on sm+ */}
          <div className="overflow-x-auto -mx-6 px-6 sm:overflow-visible sm:mx-0 sm:px-0 pb-3 sm:pb-0">
            <div className="flex gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 w-max sm:w-auto">
              {advantages.map((adv, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={cardsInView ? 'visible' : 'hidden'}
                  whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(116,98,60,0.13)' }}
                  transition={{ duration: 0.32, ease: SMOOTH_OUT }}
                  className="group relative flex flex-col w-52 flex-shrink-0 sm:w-auto sm:flex-shrink rounded-xl overflow-hidden bg-white border border-stone-200 shadow-sm"
                >
                  {/* Image area — 4:3 aspect ratio */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={adv.image}
                      alt={adv.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Warm golden wash on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Text */}
                  <div className="px-4 py-3 border-t border-stone-100">
                    <p className="font-sans font-semibold text-sm leading-snug mb-0.5 text-stone-800 group-hover:text-secondary transition-colors duration-300">
                      {adv.title}
                    </p>
                    <p className="text-stone-500 text-xs leading-relaxed">{adv.desc}</p>
                  </div>

                  {/* Thin bottom accent — grows on hover */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2px] bg-secondary/60 rounded-b-xl"
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