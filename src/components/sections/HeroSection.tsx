import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Button from '../ui/Button'

const VIDEOS = [
  'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/landing/HeroV1.mp4',
  'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/landing/HeroV2.mp4',
]

const KAIRA_LETTERS = 'KAIRA'.split('')

// Easing curves
const EXPO_OUT = [0.16, 1, 0.3, 1] as const
const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const

// ─────────────────────────────────────────────────────────────
const HeroSection = () => {
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoIndexRef = useRef(0)
  const prefetchedRef = useRef(false)

  const { scrollY } = useScroll()
  const contentOpacity = useTransform(scrollY, [0, 380], [1, 0])
  const contentY = useTransform(scrollY, [0, 380], [0, -60])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const startVideo = () => {
      const video = videoRef.current
      if (!video) return
      video.src = VIDEOS[0]
      video.load()
      video.play().catch(() => { /* autoplay blocked — image stays */ })
    }

    const setup = () => { timer = setTimeout(startVideo, 1500) }

    if (document.readyState === 'complete') {
      setup()
    } else {
      window.addEventListener('load', setup, { once: true })
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('load', setup)
    }
  }, [])

  const handleCanPlay = () => {
    setVideoReady(true)
    if (!prefetchedRef.current && videoIndexRef.current === 0) {
      prefetchedRef.current = true
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = VIDEOS[1]
      link.as = 'video'
      document.head.appendChild(link)
    }
  }

  const handleEnded = () => {
    const nextIndex = videoIndexRef.current + 1
    if (nextIndex < VIDEOS.length) {
      videoIndexRef.current = nextIndex
      const video = videoRef.current
      if (video) {
        video.src = VIDEOS[nextIndex]
        video.load()
        video.play().catch(() => {})
      }
    }
  }

  return (
    <section
      className="relative w-full h-[85dvh] sm:h-[100dvh] min-h-[500px] sm:min-h-[560px] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#1e1208 0%,#3b1f09 28%,#331a09 58%,#261508 100%)' }}
    >

      {/* ── Background Video — no src on mount, loaded lazily after page load ── */}
      <video
        ref={videoRef}
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
      />

      {/* ── Woven fabric texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(212,169,106,0.025) 3px, rgba(212,169,106,0.025) 4px)',
            'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(212,169,106,0.025) 3px, rgba(212,169,106,0.025) 4px)',
          ].join(', '),
        }}
      />

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-stone-900/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-stone-900/40" />

      {/* ── Centered Content ── */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center gap-5 sm:gap-6 mt-12 sm:mt-0"
        style={{ opacity: contentOpacity, y: contentY }}
      >

        {/* ── Brand: KAIRA letter-by-letter drop ── */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 sm:gap-4">

            {/* Left decorative line — expands from 0 */}
            <motion.span
              className="h-px bg-amber-400/55"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '2rem', opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.9, ease: SMOOTH_OUT }}
            />

            {/* Individual letters */}
            <div className="flex items-center">
              {KAIRA_LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-sans text-[32px] sm:text-[46px] uppercase text-primary font-black inline-block"
                  style={{
                    letterSpacing: '0.48em',
                    textShadow: '0 2px 20px rgba(0,0,0,0.9)',
                  }}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.15 + i * 0.12,
                    ease: EXPO_OUT,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Right decorative line */}
            <motion.span
              className="h-px bg-amber-400/55"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '2rem', opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.9, ease: SMOOTH_OUT }}
            />
          </div>

          {/* "Design for Life" — letter-spacing expands in */}
          <motion.span
            className="font-sans text-[9px] sm:text-[11px] uppercase text-amber-300/85 font-semibold"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.48em' }}
            transition={{ duration: 1.1, delay: 1.0, ease: SMOOTH_OUT }}
          >
            Design for Life
          </motion.span>
        </div>

        {/* ── Heading ── */}
        <div className="overflow-hidden pb-1">
          <motion.h1
            className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-[2.75rem] text-white leading-[1.1] tracking-tight whitespace-nowrap"
            style={{ textShadow: '0 2px 28px rgba(0,0,0,0.75)' }}
            initial={{ y: '115%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.0, delay: 0.85, ease: EXPO_OUT }}
          >
            Elegance Woven <span className="text-amber-100">in Every Stitch</span>
          </motion.h1>
        </div>

        {/* ── Tagline — each word staggers in ── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {['Visualize.', 'Choose.', 'Transform.'].map((word, i) => (
            <motion.span
              key={i}
              className="font-sans text-amber-300/90 text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-bold"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.25 + i * 0.14, ease: SMOOTH_OUT }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* ── Decorative divider — lines grow, diamond pops ── */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.65 }}
        >
          <motion.span
            className="h-px bg-white/22"
            initial={{ width: 0 }}
            animate={{ width: '2.5rem' }}
            transition={{ duration: 0.7, delay: 1.7, ease: SMOOTH_OUT }}
          />
          <motion.span
            className="w-1 h-1 rotate-45 bg-amber-400/65 inline-block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 1.9 }}
          />
          <motion.span
            className="h-px bg-white/22"
            initial={{ width: 0 }}
            animate={{ width: '2.5rem' }}
            transition={{ duration: 0.7, delay: 1.7, ease: SMOOTH_OUT }}
          />
        </motion.div>

        {/* ── Description ── */}
        <motion.p
          className="font-sans text-white/78 text-sm sm:text-sm md:text-base font-light leading-relaxed tracking-wide text-center max-w-lg"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 1.8, ease: SMOOTH_OUT }}
        >
          Premium Fabrics &amp; Leather, curated with artisanal craftsmanship — where every texture, weave, and hue tells a story of timeless elegance.
        </motion.p>

        {/* ── CTA Buttons ── */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-3 sm:mt-2"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0, ease: SMOOTH_OUT }}
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          >
            <Button
              onClick={() => {
                const section = document.getElementById('collections') || document.getElementById('fabric-collections')
                if (section) section.scrollIntoView({ behavior: 'smooth' })
              }}
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base font-bold !px-10 sm:!px-12 !py-4 rounded-none shadow-lg tracking-widest uppercase !border-white/50 !text-white hover:!bg-white/10 hover:!text-white"
            >
              <span className="flex items-center justify-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Explore Collection
              </span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          >
            <Button
              onClick={() => {
                const section = document.getElementById('ai-visualizer-banner')
                if (section) section.scrollIntoView({ behavior: 'smooth' })
              }}
              variant="primary"
              className="w-full sm:w-auto text-sm sm:text-base font-bold !px-10 sm:!px-12 !py-4 rounded-none shadow-lg hover:shadow-2xl tracking-widest uppercase"
            >
              <span className="flex items-center justify-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                AI Visualizer
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-0.5"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="w-px h-4 sm:h-5 bg-gradient-to-b from-white/45 to-transparent" />
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>

    </section>
  )
}

export default HeroSection
