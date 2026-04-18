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
  /** Background image URL for the strip */
  backgroundUrl?: string
}

const CaptionStrip = ({ before, highlight, after = '', eyebrow, backgroundUrl }: CaptionStripProps) => {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-10 md:py-14"
      style={
        backgroundUrl
          ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: '#0e0b09' }
      }
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-10 text-center z-10">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#97c41e] mb-5"
            style={{ fontFamily: '"LEMON MILK", sans-serif' }}
          >
            {eyebrow}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: eyebrow ? 0.2 : 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-2xl md:text-4xl lg:text-[2.75rem] leading-[1.35] font-light text-white tracking-wide"
          style={{ fontFamily: '"ITC Avant Garde Gothic BT", "Century Gothic", sans-serif' }}
        >
          {before}
          <span className="font-normal text-[#b8d96e]"> {highlight}</span>
          {after && <span className="text-white/90"> {after}</span>}
        </motion.p>


      </div>
    </section>
  )
}

export default CaptionStrip
