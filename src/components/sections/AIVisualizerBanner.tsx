import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'

const EXPO_OUT   = [0.16, 1, 0.3, 1]        as const
const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const

const proofPoints = [
  { value: 'Any',  label: 'Fabric Brand' },
  { value: 'No',   label: 'Sign-up Needed' },
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
      className="relative overflow-hidden bg-white border-y-2 border-primary"
    >
      {/* Subtle warm texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none" />

      {/* Atmospheric glows */}
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-secondary/6 rounded-full blur-3xl pointer-events-none" />

      {/* Floating attention tag */}
      <motion.div
        className="absolute top-5 right-5 sm:top-7 sm:right-8 z-10 flex items-center gap-2 px-4 py-2 bg-primary rounded-full shadow-lg shadow-primary/25"
        initial={{ opacity: 0, y: -12, scale: 0.85 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: EXPO_OUT }}
      >
        {/* Pulse dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.32em] text-stone-900 font-bold whitespace-nowrap">
          AI Visualizer
        </span>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">

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
              <div className="absolute -inset-3 rounded-3xl border border-primary/30 pointer-events-none" />
              <div className="absolute -inset-[22px] rounded-[28px] border border-primary/12 pointer-events-none" />

              <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)]">
                <img
                  src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/Smart+Visualization.webp"
                  alt="AI Room Visualizer Preview"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {/* Cinematic gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Text ── */}
          <div className="flex-1 flex flex-col items-start">

            {/* Eyebrow */}
            <motion.div
              className="inline-flex items-center gap-3 mb-7"
              initial={{ opacity: 0, y: -16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EXPO_OUT }}
            >
              <span className="w-8 h-px bg-primary/70" />
              <span className="text-[10px] uppercase tracking-[0.42em] text-primary font-semibold">
                AI Visualizer · Free to Use
              </span>
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden mb-1">
              <motion.h2
                className="font-serif text-5xl sm:text-6xl lg:text-[3.75rem] text-stone-900 leading-[1.04]"
                initial={{ y: '110%' }}
                animate={inView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, delay: 0.15, ease: EXPO_OUT }}
              >
                See it in your
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h2
                className="font-serif text-5xl sm:text-6xl lg:text-[3.75rem] text-primary leading-[1.04]"
                initial={{ y: '110%' }}
                animate={inView ? { y: '0%' } : {}}
                transition={{ duration: 0.9, delay: 0.27, ease: EXPO_OUT }}
              >
                space first.
              </motion.h2>
            </div>

            {/* Divider */}
            <motion.div
              className="w-12 h-[2px] bg-primary/50 mb-7"
              initial={{ scaleX: 0, originX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.42, ease: SMOOTH_OUT }}
            />

            {/* Description */}
            <motion.p
              className="text-stone-500 text-base sm:text-[17px] leading-relaxed mb-10 max-w-[400px]"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.45, ease: SMOOTH_OUT }}
            >
              Upload a photo of your room and watch any fabric come alive on your furniture and walls — in seconds, with zero guesswork.
            </motion.p>

            {/* Proof points */}
            <motion.div
              className="flex gap-8 mb-10"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.56, ease: SMOOTH_OUT }}
            >
              {proofPoints.map((p, i) => (
                <div key={i} className="flex flex-col items-start">
                  <span className="font-serif text-2xl text-primary leading-none mb-1">{p.value}</span>
                  <span className="text-stone-400 text-[11px] uppercase tracking-widest leading-snug border-t border-stone-200 pt-1">{p.label}</span>
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
                className="group relative inline-flex items-center gap-3 px-9 py-4 bg-secondary text-white font-bold text-base rounded-xl shadow-xl shadow-secondary/20 hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                Try the Visualizer — It's Free
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

