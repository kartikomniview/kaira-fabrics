import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Button from '../ui/Button'

const KAIRA_LETTERS = 'KAIRA'.split('')

// Easing curves
const EXPO_OUT = [0.16, 1, 0.3, 1] as const
const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const

// ── Animated fabric-silk canvas background ────────────────────
const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // ── Silk threads (long gradient strokes drifting slowly) ──
    const THREAD_COUNT = 28
    const PALETTE = [
      '212,165,66',   // amber gold
      '245,235,210',  // warm cream
      '200,169,110',  // soft gold
      '255,215,130',  // light gold
      '180,140,80',   // deep amber
      '160,120,55',   // bronze
    ]
    const threads = Array.from({ length: THREAD_COUNT }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      len: 0.22 + Math.random() * 0.58,
      angle: (-32 + Math.random() * 64) * (Math.PI / 180),
      vx: (0.000022 + Math.random() * 0.000048) * (Math.random() < 0.5 ? 1 : -1),
      vy: (0.000010 + Math.random() * 0.000022) * (Math.random() < 0.5 ? 1 : -1),
      opacity: 0.10 + Math.random() * 0.26,
      width: 0.4 + Math.random() * 1.8,
      color: PALETTE[i % PALETTE.length],
      phase: Math.random() * Math.PI * 2,
    }))

    // ── Shimmer dewdrops (twinkling points on fabric surface) ──
    const SHIMMER_COUNT = 18
    const shimmers = Array.from({ length: SHIMMER_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.007 + Math.random() * 0.016,
      maxAlpha: 0.10 + Math.random() * 0.28,
    }))

    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // ── Warm central glow (spotlight on draped cloth) ──
      const cg = ctx.createRadialGradient(w * 0.5, h * 0.40, 0, w * 0.5, h * 0.40, Math.max(w, h) * 0.70)
      cg.addColorStop(0, 'rgba(200,130,40,0.38)')
      cg.addColorStop(0.3, 'rgba(160,95,22,0.20)')
      cg.addColorStop(0.6, 'rgba(100,58,12,0.10)')
      cg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = cg
      ctx.fillRect(0, 0, w, h)

      // ── Top warm bounce (light hitting fabric from above) ──
      const tg = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, h * 0.55)
      tg.addColorStop(0, 'rgba(220,155,50,0.14)')
      tg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = tg
      ctx.fillRect(0, 0, w, h)

      // ── Bottom-left loom light source ──
      const bg = ctx.createRadialGradient(w * 0.08, h * 0.88, 0, w * 0.08, h * 0.88, w * 0.60)
      bg.addColorStop(0, 'rgba(175,105,28,0.22)')
      bg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // ── Silk threads ──
      for (const t of threads) {
        const px = t.x * w
        const py = t.y * h
        const half = (t.len * Math.min(w, h)) * 0.5
        const dx = Math.cos(t.angle) * half
        const dy = Math.sin(t.angle) * half
        const alpha = (t.opacity * (0.72 + 0.28 * Math.sin(frame * 0.010 + t.phase))).toFixed(3)

        const g = ctx.createLinearGradient(px - dx, py - dy, px + dx, py + dy)
        g.addColorStop(0,   `rgba(${t.color},0)`)
        g.addColorStop(0.5, `rgba(${t.color},${alpha})`)
        g.addColorStop(1,   `rgba(${t.color},0)`)

        ctx.beginPath()
        ctx.moveTo(px - dx, py - dy)
        ctx.lineTo(px + dx, py + dy)
        ctx.strokeStyle = g
        ctx.lineWidth = t.width
        ctx.stroke()

        t.x += t.vx
        t.y += t.vy
        if (t.x > 1.15) t.x = -0.15
        if (t.x < -0.15) t.x = 1.15
        if (t.y > 1.15) t.y = -0.15
        if (t.y < -0.15) t.y = 1.15
      }

      // ── Shimmer dewdrops ──
      for (const s of shimmers) {
        const alpha = s.maxAlpha * (0.5 + 0.5 * Math.sin(frame * s.speed + s.phase))
        if (alpha < 0.005) continue
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,225,155,${alpha.toFixed(3)})`
        ctx.fill()
      }

      frame++
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ─────────────────────────────────────────────────────────────
const HeroSection = () => {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 700], [0, 60])
  const contentOpacity = useTransform(scrollY, [0, 380], [1, 0])
  const contentY = useTransform(scrollY, [0, 380], [0, -60])

  return (
    <section
      className="relative w-full h-[85dvh] sm:h-[100dvh] min-h-[500px] sm:min-h-[560px] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#1e1208 0%,#3b1f09 28%,#331a09 58%,#261508 100%)' }}
    >

      {/* ── Animated silk-thread canvas ── */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <FabricCanvas />
      </motion.div>

      {/* ── Warp & weft grid (woven fabric texture) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(0deg,rgba(212,165,66,0.032) 0px,rgba(212,165,66,0.032) 1px,transparent 1px,transparent 9px)',
            'repeating-linear-gradient(90deg,rgba(212,165,66,0.032) 0px,rgba(212,165,66,0.032) 1px,transparent 1px,transparent 9px)',
            'repeating-linear-gradient(45deg,rgba(212,165,66,0.016) 0px,rgba(212,165,66,0.016) 1px,transparent 1px,transparent 9px)',
            'repeating-linear-gradient(-45deg,rgba(212,165,66,0.016) 0px,rgba(212,165,66,0.016) 1px,transparent 1px,transparent 9px)',
          ].join(','),
        }}
      />

      {/* ── Film-grain texture (premium tactile feel) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.042,
        }}
      />

      {/* ── Vignette — warm edge depth ── */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#1e1208]/88 via-transparent to-[#1e1208]/40" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#1e1208]/28 via-transparent to-[#1e1208]/28" />

      {/* ── Centered Content ── */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center gap-5 sm:gap-6 mt-12 sm:mt-0"
        style={{ opacity: contentOpacity, y: contentY }}
      >

        {/* ── Brand: KAIRA letter-by-letter drop ── */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 sm:gap-4" style={{ perspective: '600px' }}>

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
                    transformOrigin: 'center top',
                  }}
                  initial={{ opacity: 0, y: 48, rotateX: -75 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.15 + i * 0.09,
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
            Elegance Woven <span className="text-amber-100 italic">in Every Stitch</span>
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
          Premium Fabrics &amp; Leather Solutions powered by smart visualization — helping you see your space before you buy.
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
              className="w-full sm:w-auto text-sm sm:text-base font-bold !px-10 sm:!px-12 !py-4 rounded-full shadow-lg tracking-widest uppercase !border-white/50 !text-white hover:!bg-white/10 hover:!text-white"
            >
              <span className="flex items-center justify-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
              to="/ai-visualizer"
              variant="primary"
              className="w-full sm:w-auto text-sm sm:text-base font-bold !px-10 sm:!px-12 !py-4 rounded-full shadow-lg hover:shadow-2xl tracking-widest uppercase"
            >
              <span className="flex items-center justify-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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
