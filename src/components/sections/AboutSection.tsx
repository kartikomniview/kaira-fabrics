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

const SOFT = [0.25, 0.46, 0.45, 0.94] as const

// ── Animated stat counter ─────────────────────────────────────
const Counter = ({ to, suffix = '' }: { to: number; suffix?: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const count   = useMotionValue(0)
  const inView  = useInView(nodeRef, { once: true })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(count, to, {
      duration: 2.0,
      ease: 'easeOut',
      onUpdate(v) {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v) + suffix
      },
    })
    return ctrl.stop
  }, [inView, count, to, suffix])

  return <span ref={nodeRef}>0{suffix}</span>
}

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({
  value, suffix, label, delay,
}: { value: number; suffix: string; label: string; delay: number }) => {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-1.5 px-5 py-4 bg-white/70 rounded-2xl shadow-sm border border-stone-100/80"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: SOFT }}
    >
      <p className="font-serif text-3xl sm:text-4xl text-stone-800">
        <Counter to={value} suffix={suffix} />
      </p>
      <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium text-center">{label}</p>
    </motion.div>
  )
}

// ── Component ─────────────────────────────────────────────────
const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const rightRef   = useRef<HTMLDivElement>(null)

  const rightInView = useInView(rightRef, { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #fdf9f5 0%, #f7ede0 55%, #faf6f0 100%)' }}
    >
      {/* ── Parallax background image ── */}
      <motion.div
        className="absolute inset-[-6%] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background2.webp')",
          y: bgY,
          opacity: 0.55,
        }}
      />

      {/* Warm overlay to soften the background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(150deg, rgba(253,249,245,0.45) 0%, rgba(247,237,224,0.38) 55%, rgba(250,246,240,0.45) 100%)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">

          {/* ── Content ── */}
          <div ref={rightRef} className="space-y-6 text-center flex flex-col items-center">

            {/* Eyebrow label */}
            <motion.p
              className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={rightInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: SOFT }}
            >
              Our Story
            </motion.p>

            {/* Logo */}
            <motion.img
              src="https://supoassets.s3.ap-south-1.amazonaws.com/public/assets/clientLogos/KairaFabrics.png"
              alt="Kaira Fabrics"
              className="h-16 sm:h-20 w-auto object-contain"
              initial={{ opacity: 0, y: 18 }}
              animate={rightInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.1, ease: SOFT }}
            />

            {/* Soft divider */}
            <motion.div
              className="h-px w-24 bg-gradient-to-r from-secondary/20 via-secondary/50 to-secondary/20"
              initial={{ scaleX: 0 }}
              animate={rightInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: SOFT }}
            />

            {/* Body */}
            <motion.p
              className="text-stone-500 text-base sm:text-lg leading-relaxed font-light"
              initial={{ opacity: 0, y: 14 }}
              animate={rightInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25, ease: SOFT }}
            >
              Kaira is an entity under the{' '}
              <strong className="font-semibold text-stone-700">Kurikkal Group</strong>, specializing
              in premium sofa fabrics and leathers — delivering remarkable quality right to your doorstep.
            </motion.p>

            {/* Pull quote */}
            <motion.blockquote
              className="max-w-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={rightInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.35, ease: SOFT }}
            >
              <p className="text-stone-400 text-sm sm:text-base leading-relaxed italic font-light">
                "A perfect blend of form and function with an uncompromising emphasis on quality and style."
              </p>
            </motion.blockquote>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-3 pt-1 w-full max-w-xs"
              initial={{ opacity: 0, y: 18 }}
              animate={rightInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: SOFT }}
            >
              <StatCard value={20} suffix="+" label="Years of Heritage" delay={0.5} />
              <StatCard value={10} suffix="k+" label="Fabric Varieties" delay={0.6} />
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={rightInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.55, ease: SOFT }}
            >
              <Link
                to="/about"
                className="group inline-flex items-center gap-3 text-secondary font-semibold text-sm"
              >
                <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-secondary after:transition-all after:duration-300 group-hover:after:w-full transition-all duration-300">
                  Discover Our Story
                </span>
                <span className="w-8 h-8 rounded-full border border-secondary/40 flex items-center justify-center transition-all duration-300 group-hover:bg-secondary group-hover:border-secondary">
                  <svg className="w-3.5 h-3.5 transition-colors duration-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

