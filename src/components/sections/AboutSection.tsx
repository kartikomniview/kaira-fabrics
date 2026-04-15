import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  animate,
} from 'framer-motion'

const EXPO_OUT   = [0.16, 1, 0.3, 1]   as const
const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const

// ── Animated stat counter ─────────────────────────────────────
const Counter = ({ to, suffix = '' }: { to: number; suffix?: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const count   = useMotionValue(0)
  const inView  = useInView(nodeRef, { once: true })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(count, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate(v) {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v) + suffix
      },
    })
    return ctrl.stop
  }, [inView, count, to, suffix])

  return <span ref={nodeRef}>0{suffix}</span>
}

// ── Stat pill ─────────────────────────────────────────────────
const Stat = ({
  value, suffix, label, delay,
}: { value: number; suffix: string; label: string; delay: number }) => {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: EXPO_OUT }}
    >
      <p className="font-serif text-3xl sm:text-4xl text-stone-900">
        <Counter to={value} suffix={suffix} />
      </p>
      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">{label}</p>
    </motion.div>
  )
}

// ── Component ─────────────────────────────────────────────────
const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)

  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const bodyInView   = useInView(bodyRef,   { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden border-b border-stone-200"
      style={{
        background: '#faf8f5',
        backgroundImage: [
          'repeating-linear-gradient(0deg,rgba(0,0,0,0.018) 0px,rgba(0,0,0,0.018) 1px,transparent 1px,transparent 8px)',
          'repeating-linear-gradient(90deg,rgba(0,0,0,0.018) 0px,rgba(0,0,0,0.018) 1px,transparent 1px,transparent 8px)',
        ].join(','),
      }}
    >
      {/* ── Top accent bar ── */}
      <motion.div
        className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-secondary to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: EXPO_OUT }}
      />

      {/* ── Subtle warm halo ── */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, var(--color-secondary) 0%, transparent 70%)', opacity: 0.04 }}
      />

      {/* ── Parallax background texture ── */}
      <motion.div
        className="absolute inset-[-6%] bg-cover bg-left bg-no-repeat"
        style={{
          backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background2.webp')",
          y: bgY,
          opacity: 0.35,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">

        {/* ══ Header ══ */}
        <div ref={headerRef} className="text-center mb-12">

          {/* Label — lines grow outward */}
          <motion.div
            className="inline-flex items-center justify-center gap-3 mb-5"
            initial={{ opacity: 0, y: -14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EXPO_OUT }}
          >
            <motion.span
              className="h-px bg-secondary"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '2rem' } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: SMOOTH_OUT }}
            />
            <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">About Us</span>
            <motion.span
              className="h-px bg-secondary"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '2rem' } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: SMOOTH_OUT }}
            />
          </motion.div>

          {/* Heading — masked reveal */}
          <div className="overflow-hidden mb-5">
            <motion.h2
              className="font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-stone-900 leading-tight"
              initial={{ y: '115%', skewY: 2 }}
              animate={headerInView ? { y: '0%', skewY: 0 } : {}}
              transition={{ duration: 1.0, delay: 0.18, ease: EXPO_OUT }}
            >
              Kaira:{' '}
              <span className="text-secondary italic">Design for Life</span>
            </motion.h2>
          </div>

          {/* Decorative divider */}
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <motion.span
              className="h-px bg-stone-300"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '3rem' } : {}}
              transition={{ duration: 0.7, delay: 0.6, ease: SMOOTH_OUT }}
            />
            <span className="w-1.5 h-1.5 rotate-45 bg-secondary/50 inline-block" />
            <motion.span
              className="h-px bg-stone-300"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '3rem' } : {}}
              transition={{ duration: 0.7, delay: 0.6, ease: SMOOTH_OUT }}
            />
          </motion.div>
        </div>

        {/* ══ Body copy ══ */}
        <div ref={bodyRef} className="text-center">
          <motion.p
            className="text-stone-500 text-base sm:text-lg leading-relaxed font-light mb-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 22 }}
            animate={bodyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EXPO_OUT }}
          >
            Kaira is an entity under the{' '}
            <strong className="font-semibold text-stone-700">Kurikkal Group</strong>, specializing
            in premium sofa fabrics and leathers — delivering remarkable quality right to your doorstep.
          </motion.p>

          <motion.p
            className="text-stone-400 text-sm sm:text-base leading-relaxed font-light italic max-w-xl mx-auto mb-10"
            initial={{ opacity: 0, y: 18 }}
            animate={bodyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: EXPO_OUT }}
          >
            "A perfect blend of form and function with an uncompromising emphasis on quality and style."
          </motion.p>

          {/* ── Stats row ── */}
          <div className="flex items-center justify-center gap-8 sm:gap-14 mb-10">
            <Stat value={20} suffix="+" label="Years Heritage" delay={0.15} />
            <motion.div
              className="w-px h-12 bg-stone-200"
              initial={{ scaleY: 0 }}
              animate={bodyInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.25, ease: SMOOTH_OUT }}
            />
            <Stat value={10} suffix="k+" label="Fabrics" delay={0.25} />
            <motion.div
              className="w-px h-12 bg-stone-200"
              initial={{ scaleY: 0 }}
              animate={bodyInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3, ease: SMOOTH_OUT }}
            />
            <Stat value={33} suffix="+" label="Group Legacy" delay={0.35} />
          </div>

          {/* ── CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={bodyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.4, ease: EXPO_OUT }}
          >
            <Link
              to="/about"
              className="group relative inline-flex items-center justify-center px-10 py-3.5 bg-stone-900 text-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="absolute inset-0 bg-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-widest group-hover:text-stone-900 transition-colors duration-300">
                Know More
                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  )
}

export default AboutSection

