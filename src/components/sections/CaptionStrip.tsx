import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface CaptionStripProps {
  /** Plain text before the highlighted part */
  before: string
  /** Highlighted / accented text */
  highlight: string
  /** Plain text after the highlighted part */
  after?: string
  /** Optional small label above the caption */
  eyebrow?: string
}

const CaptionStrip = ({ before, highlight, after = '', eyebrow }: CaptionStripProps) => {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative bg-stone-950 overflow-hidden py-14 md:py-20 border-y border-stone-800/60"
    >
      {/* subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[200px] rounded-full bg-[#A2EF0F]/5 blur-[80px]" />
      </div>

      {/* decorative left accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-24 md:w-40 bg-gradient-to-r from-[#A2EF0F]/60 to-transparent"
      />
      {/* decorative right accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 1 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-24 md:w-40 bg-gradient-to-l from-[#A2EF0F]/60 to-transparent"
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center z-10">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#A2EF0F] font-semibold mb-4"
            style={{ fontFamily: '"LEMON MILK", sans-serif' }}
          >
            {eyebrow}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: eyebrow ? 0.2 : 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-2xl md:text-4xl lg:text-[2.6rem] leading-snug font-light text-stone-200 tracking-tight"
          style={{ fontFamily: '"ITC Avant Garde Gothic BT", "Century Gothic", sans-serif' }}
        >
          {before}
          <span className="italic font-normal text-[#A2EF0F]"> {highlight}</span>
          {after && <span> {after}</span>}
        </motion.p>

        {/* bottom decorative dot row */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <span className="block w-8 h-px bg-stone-600" />
          <span className="block w-1.5 h-1.5 rounded-full bg-[#A2EF0F]" />
          <span className="block w-8 h-px bg-stone-600" />
        </motion.div>
      </div>
    </section>
  )
}

export default CaptionStrip
