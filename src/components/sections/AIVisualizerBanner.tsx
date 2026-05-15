import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { BeforeAfterSlider } from '../ui/BeforeAfterSlider'

const EXPO_OUT = [0.16, 1, 0.3, 1] as const
const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const

const proofPoints = [
  { value: 'Any', label: 'Fabric Brand' },
  { value: 'No', label: 'Sign-up Needed' },
  { value: '~10s', label: 'To Preview' },
]

// ─────────────────────────────────────────────────────────────
const AIVisualizerBanner = () => {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="ai-visualizer-banner"
      className="relative overflow-hidden border-y-2 border-primary"
      style={{
        backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/BackgroundImages/b3.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Light overlay for readability */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]" />

      {/* Atmospheric glows */}
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] bg-primary/8  blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-secondary/6  blur-3xl pointer-events-none" />

      {/* Floating attention tag */}
      <motion.div
        className="hidden sm:flex absolute top-5 right-5 sm:top-7 sm:right-8 z-10 items-center gap-2 px-4 py-2 bg-primary  shadow-lg shadow-primary/25"
        initial={{ opacity: 0, y: -12, scale: 0.85 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: EXPO_OUT }}
      >
        {/* Pulse dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full  bg-white opacity-60" />
          <span className="relative inline-flex  h-2 w-2 bg-white" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.32em] text-stone-900 font-bold whitespace-nowrap">
          AI Visualizer
        </span>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 md:py-20 lg:py-28">

        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* ── LEFT: Image ── */}
          <motion.div
            className="w-full lg:w-[54%] shrink-0"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EXPO_OUT }}
          >
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute -inset-3  border border-primary/30 pointer-events-none" />
              <div className="absolute -inset-[22px] border border-primary/12 pointer-events-none" />

              <BeforeAfterSlider />
            </div>
          </motion.div>

          {/* ── RIGHT: Text ── */}
          <div className="flex-1 flex flex-col items-start">

            {/* Headline */}
            <div className="overflow-hidden mb-1 font-serif">
              <motion.h2
                className="font-primary font-serif text-3xl sm:text-4xl md:text-[3.2rem] color-secondary-dark leading-tight"
                initial={{ y: '110%' }}
                animate={inView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, delay: 0.15, ease: EXPO_OUT }}
              >
                See it in your
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-4">
              <motion.h2
                className="font-primary font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-primary leading-tight"
                initial={{ y: '110%' }}
                animate={inView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, delay: 0.27, ease: EXPO_OUT }}
              >
                space first.
              </motion.h2>
            </div>

            {/* Divider */}
            <motion.div
              className="w-12 h-[2px] bg-primary/50 mb-4"
              initial={{ scaleX: 0, originX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.42, ease: SMOOTH_OUT }}
            />

            {/* Description */}
            <motion.p
              className="color-secondary-dark text-base sm:text-[16px] leading-relaxed mb-6 max-w-[400px]"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.45, ease: SMOOTH_OUT }}
            >
              Upload a photo of your room and watch any fabric come alive on your furniture in seconds, with zero guesswork.
            </motion.p>

            {/* Proof points */}
            <motion.div
              className="flex gap-8 mb-6"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.56, ease: SMOOTH_OUT }}
            >
              {proofPoints.map((p, i) => (
                <div key={i} className="flex flex-col items-start">
                  <span className="font-serif text-2xl text-primary leading-none mb-1">{p.value}</span>
                  <span className="color-secondary-dark text-[11px] uppercase tracking-widest leading-snug border-t border-stone-200 pt-1">{p.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.68, ease: SMOOTH_OUT }}
            >
              <Link
                to="/ai-visualizer"
                className="group relative inline-flex items-center gap-4 px-12 py-5 bg-secondary text-white font-bold text-sm sm:text-lg shadow-2xl shadow-secondary/30 hover:bg-secondary/90 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                Try the Visualizer — It's Free
                <svg className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                {/* Shimmer */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default AIVisualizerBanner

