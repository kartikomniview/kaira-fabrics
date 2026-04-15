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
    label: 'Works with Any Fabric',
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
                <span className="relative inline-block px-2 py-0.5">
                  <span className="absolute inset-0 bg-stone-200/70 rounded-md -skew-x-1" />
                  <span className="relative">See your space</span>
                </span>
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-5">
              <motion.h2
                className="font-serif text-4xl sm:text-5xl text-secondary italic leading-[1.06]"
                initial={{ y: '110%', skewY: 1.5 }}
                animate={inView ? { y: '0%', skewY: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.26, ease: EXPO_OUT }}
              >
                <span className="relative inline-block px-2 py-0.5">
                  <span className="absolute inset-0 bg-secondary/10 rounded-md -skew-x-1" />
                  <span className="relative">before you buy.</span>
                </span>
              </motion.h2>
            </div>

            {/* Description */}
            <motion.p
              className="text-stone-500 text-sm sm:text-[15px] leading-relaxed mb-8"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.38, ease: SMOOTH_OUT }}
            >
              Our Visualizer drapes any fabric directly onto your room photo in seconds — no guesswork, no samples, no surprises.
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

          {/* RIGHT: Image and CTA */}
          <motion.div
            className="shrink-0 flex flex-col items-center lg:items-end lg:justify-center lg:w-1/2 gap-6"
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: EXPO_OUT }}
          >
            <div className="relative w-full max-w-lg lg:max-w-xl rounded-2xl overflow-hidden shadow-2xl shadow-stone-200/50">
              <img 
                src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/landing/previewAI.webp" 
                alt="AI Visualizer Preview" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Action button */}
            <motion.div
              className="w-full max-w-lg lg:max-w-xl"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7, ease: SMOOTH_OUT }}
            >
              <Link
                to="/ai-visualizer"
                className="group relative flex items-center justify-center gap-3 px-8 py-5 bg-secondary text-white rounded-full font-bold text-lg shadow-xl shadow-secondary/30 hover:bg-secondary/90 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Try Visualizer Now
                {/* shine sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default AIVisualizerBanner

