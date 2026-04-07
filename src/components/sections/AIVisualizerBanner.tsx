import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'

const EXPO_OUT   = [0.16, 1, 0.3, 1]        as const
const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const

// Feature list — staggered reveal
const featureListVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.52 } },
}
const featureItemVariants = {
  hidden:  { opacity: 0, x: -22 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EXPO_OUT } },
}

// CTA card — staggered internal reveal
const ctaCardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.9, delay: 0.44, ease: EXPO_OUT, staggerChildren: 0.11, delayChildren: 0.62 },
  },
}
const ctaItemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SMOOTH_OUT } },
}

const features = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 text-secondary">
        <rect x="3" y="8" width="34" height="24" rx="3" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08"/>
        <path d="M3 15h34" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.35"/>
        <rect x="6" y="19" width="12" height="9" rx="1.5" fill="currentColor" fillOpacity="0.18"/>
        <circle cx="29" cy="26" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.10"/>
        <path d="M27 26l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Room Visualization',
    desc: 'Upload a photo of your room and instantly preview any fabric on your furniture or walls.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 text-secondary">
        <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08"/>
        <ellipse cx="20" cy="20" rx="6" ry="13" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.4"/>
        <path d="M7 20h26M20 7v26" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.4" strokeLinecap="round"/>
        <path d="M31 9l1.5 4 4 1.5-4 1.5L31 20l-1.5-4-4-1.5 4-1.5z" fill="currentColor" fillOpacity="0.9"/>
      </svg>
    ),
    label: 'Any Fabric Source',
    desc: "Not just our catalogue — bring samples from any brand and our AI handles them the same way.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 text-secondary">
        <path d="M20 4l12 4.5v10c0 7-5 13-12 15C8 31.5 8 21 8 18.5V8.5z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08" strokeLinejoin="round"/>
        <path d="M14 20l4.5 4.5 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Free & Open Access',
    desc: 'No password, no account. Open to dealers, designers, and homeowners alike.',
  },
]

// ─────────────────────────────────────────────────────────────
const AIVisualizerBanner = () => {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-stone-50 border-y border-stone-200"
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Soft secondary halo — gentle breathe loop */}
      <motion.div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(116,98,60,0.07) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-20">

        {/* ── Layout: left text + right CTA ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-16">

          {/* LEFT */}
          <div className="flex-1 max-w-lg">

            {/* Eyebrow */}
            <motion.div
              className="inline-flex items-center gap-2 mb-5"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: EXPO_OUT }}
            >
              <motion.span
                className="h-px bg-secondary"
                initial={{ width: 0 }}
                animate={inView ? { width: '2rem' } : {}}
                transition={{ duration: 0.7, delay: 0.1, ease: SMOOTH_OUT }}
              />
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary" />
                </span>
                <span className="text-[10px] uppercase tracking-[0.32em] text-secondary font-bold">AI-Powered · Free to Try</span>
              </span>
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden mb-1">
              <motion.h2
                className="font-serif text-4xl sm:text-5xl text-stone-900 leading-[1.06]"
                initial={{ y: '110%', skewY: 1.5 }}
                animate={inView ? { y: '0%', skewY: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.15, ease: EXPO_OUT }}
              >
                See your space
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-5">
              <motion.h2
                className="font-serif text-4xl sm:text-5xl text-secondary italic leading-[1.06]"
                initial={{ y: '110%', skewY: 1.5 }}
                animate={inView ? { y: '0%', skewY: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.26, ease: EXPO_OUT }}
              >
                before you buy.
              </motion.h2>
            </div>

            {/* Description */}
            <motion.p
              className="text-stone-500 text-sm sm:text-[15px] leading-relaxed mb-8"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.38, ease: SMOOTH_OUT }}
            >
              Our AI Visualizer drapes any fabric directly onto your room photo in seconds — no guesswork, no samples, no surprises.
            </motion.p>

            {/* Feature pills — stagger container */}
            <motion.div
              className="flex flex-col gap-3"
              variants={featureListVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  variants={featureItemVariants}
                >
                  {/* Icon container with hover interaction */}
                  <motion.div
                    className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center"
                    whileHover={{ scale: 1.22, backgroundColor: 'rgba(116,98,60,0.22)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  >
                    {f.icon}
                  </motion.div>
                  <div>
                    <p className="text-stone-800 font-semibold text-sm leading-snug">{f.label}</p>
                    <p className="text-stone-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: CTA card — stagger variant propagation */}
          <motion.div
            className="shrink-0 flex justify-center lg:justify-end"
            variants={ctaCardVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="relative w-full max-w-xs sm:max-w-sm bg-white border border-stone-200 rounded-2xl shadow-lg shadow-stone-100 p-7 sm:p-8 flex flex-col items-center text-center gap-5 overflow-hidden">

              {/* Top accent — animates in as a scaleX sweep */}
              <motion.div
                className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-secondary to-transparent rounded-t-2xl"
                variants={{
                  hidden:  { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: 0.9, ease: SMOOTH_OUT } },
                }}
              />

              {/* Icon with float loop after appearing */}
              <motion.div
                className="w-14 h-14 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center"
                variants={ctaItemVariants}
              >
                <motion.svg
                  viewBox="0 0 48 48" fill="none" className="w-7 h-7 text-secondary"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                >
                  <path d="M6 24C11 14 17 10 24 10C31 10 37 14 42 24C37 34 31 38 24 38C17 38 11 34 6 24z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6"/>
                  <circle cx="24" cy="24" r="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="24" cy="24" r="2" fill="currentColor" fillOpacity="0.7"/>
                  <path d="M37 8l1.4 4.6 4.6 1.4-4.6 1.4L37 20l-1.4-5.6L31 13l5.6-1.4z" fill="currentColor" fillOpacity="0.85"/>
                </motion.svg>
              </motion.div>

              {/* Text block */}
              <motion.div variants={ctaItemVariants}>
                <p className="text-[10px] uppercase tracking-[0.3em] text-secondary font-bold mb-1.5">AI Visualizer</p>
                <h3 className="font-serif text-2xl text-stone-900 leading-snug mb-2">
                  Transform your room <span className="text-secondary italic">instantly.</span>
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Upload a room photo, pick a fabric, and see the result in real-time — free, fast, and open to all.
                </p>
              </motion.div>

              {/* CTA button */}
              <motion.div
                variants={ctaItemVariants}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="w-full"
              >
                <Link
                  to="/ai-visualizer"
                  className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary text-white rounded-full font-semibold text-sm shadow-md shadow-secondary/20 hover:bg-secondary/90 transition-colors duration-300 overflow-hidden"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Try AI Visualizer
                  {/* shine sweep */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </Link>
              </motion.div>

              {/* Footer note */}
              <motion.p variants={ctaItemVariants} className="text-stone-400 text-[10px]">
                No sign-up required &nbsp;·&nbsp; Works with any fabric
              </motion.p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default AIVisualizerBanner

