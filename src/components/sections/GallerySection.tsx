import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

interface GalleryItem {
  id: string
  asset_url: string
  type: 'image' | 'video'
  title?: string
  description?: string
}

const EXPO_OUT   = [0.16, 1, 0.3, 1] as const
const SMOOTH_OUT = [0.25, 0.46, 0.45, 0.94] as const

const finalProducts: GalleryItem[] = [
  { id: 'fp1', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621465753-BOUCLE%203D%20VIDEO.mp4', type: 'video' },
  { id: 'fp2', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/compressed_teak%20age%20video.mp4', type: 'video' },
  { id: 'fp3', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621503852-COMPLETED%20PROJECT.mp4', type: 'video' },
  { id: 'fp4', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621483840-PRINTED%20FABRIC%20VIDEO.mp4', type: 'video' },
]

const inaugurations: GalleryItem[] = [
  { id: 'in1', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621478129-KFK%20NILAMBUR.mp4', type: 'video' },
  { id: 'in2', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/ex2.mp4', type: 'video' },
  { id: 'in3', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/ex1.mp4', type: 'video' },
  { id: 'in4', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/ex3.mp4', type: 'video' },
]

// Card entrance variants
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, delay: 0.08 + i * 0.07, ease: EXPO_OUT },
  }),
}

interface GalleryRowProps {
  label: string
  title: string
  items: GalleryItem[]
  onPreview: (item: GalleryItem) => void
}

const GalleryRow = ({ label, title, items, onPreview }: GalleryRowProps) => {
  const rowRef    = useRef<HTMLDivElement>(null)
  const rowInView = useInView(rowRef, { once: true, margin: '-60px' })

  return (
    <div ref={rowRef} className="mb-16 last:mb-0">
      {/* Row header */}
      <motion.div
        className="flex items-center gap-4 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={rowInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: EXPO_OUT }}
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.35em] text-secondary font-bold mb-1">{label}</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 leading-tight">{title}</h3>
        </div>
        <motion.div
          className="flex-1 h-px bg-gradient-to-r from-secondary/40 to-transparent ml-2"
          initial={{ scaleX: 0, originX: 0 }}
          animate={rowInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: SMOOTH_OUT }}
        />
      </motion.div>

      {/* Cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, i) => {
          const video = item.type === 'video'
          return (
            <motion.div
              key={item.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={rowInView ? 'visible' : 'hidden'}
              onClick={() => onPreview(item)}
              className="group relative overflow-hidden rounded-2xl border border-stone-200/60 shadow-sm cursor-pointer aspect-[3/4]"
              whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(116,98,60,0.18)' }}
              transition={{ duration: 0.3, ease: SMOOTH_OUT }}
            >
              {video ? (
                <div className="w-full h-full relative bg-stone-100">
                  <video
                    src={`${item.asset_url}#t=0.1`}
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onLoadedData={e => { (e.currentTarget as HTMLVideoElement).currentTime = 0.1 }}
                    onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseLeave={e => {
                      const v = e.currentTarget as HTMLVideoElement
                      v.pause()
                      v.currentTime = 0.1
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-stone-100">
                  <img
                    src={item.asset_url}
                    alt={item.title ?? 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/45 transition-all duration-500 flex flex-col items-center justify-end pb-5">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 flex flex-col items-center px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-2">
                    {video
                      ? <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      : <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                    }
                  </div>
                  {item.title && (
                    <p className="text-white text-xs font-bold tracking-tight mb-0.5">{item.title}</p>
                  )}
                  {item.description && (
                    <p className="text-white/60 text-[9px] uppercase tracking-widest hidden md:block">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Video badge */}
              {video && (
                <div className="absolute top-3 right-3 opacity-100 group-hover:opacity-0 transition-opacity">
                  <div className="p-1.5 rounded-full bg-stone-900/50 backdrop-blur-sm border border-white/20">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Bottom secondary accent */}
              <motion.div
                className="absolute bottom-0 left-0 h-[2.5px] bg-secondary"
                initial={{ width: '0%' }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.35, ease: SMOOTH_OUT }}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const GallerySection = () => {
  const headerRef    = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  const [preview, setPreview] = useState<GalleryItem | null>(null)

  return (
    <section
      id="gallery"
      className="relative overflow-hidden border-b border-stone-200"
      style={{
        background: '#faf8f5',
        backgroundImage: [
          'repeating-linear-gradient(0deg,rgba(0,0,0,0.018) 0px,rgba(0,0,0,0.018) 1px,transparent 1px,transparent 8px)',
          'repeating-linear-gradient(90deg,rgba(0,0,0,0.018) 0px,rgba(0,0,0,0.018) 1px,transparent 1px,transparent 8px)',
        ].join(','),
      }}
    >

      {/* Subtle secondary halo */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)', opacity: 0.04 }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">

        {/* SECTION HEADER */}
        <div ref={headerRef} className="text-center mb-14">
          <motion.div
            className="inline-flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, y: -16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EXPO_OUT }}
          >
            <motion.span
              className="h-px bg-secondary"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '2rem' } : {}}
              transition={{ duration: 0.7, delay: 0.12, ease: SMOOTH_OUT }}
            />
            <span className="text-[11px] uppercase tracking-[0.35em] text-secondary font-bold">Proof of Work</span>
            <motion.span
              className="h-px bg-secondary"
              initial={{ width: 0 }}
              animate={headerInView ? { width: '2rem' } : {}}
              transition={{ duration: 0.7, delay: 0.12, ease: SMOOTH_OUT }}
            />
          </motion.div>

          <div className="overflow-hidden">
            <motion.h2
              className="font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-stone-900 leading-tight"
              initial={{ y: '115%', skewY: 2 }}
              animate={headerInView ? { y: '0%', skewY: 0 } : {}}
              transition={{ duration: 1.0, delay: 0.18, ease: EXPO_OUT }}
            >
              Our <span className="text-secondary italic">Gallery</span>
            </motion.h2>
          </div>

          <motion.p
            className="mt-5 text-stone-500 text-sm leading-relaxed max-w-lg mx-auto font-sans"
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: EXPO_OUT }}
          >
            Real work. Real spaces. A living showcase of everything KAIRA has brought to life.
          </motion.p>
        </div>

        {/* ROW 1 — Final Products */}
        <GalleryRow
          label="Category 01"
          title="Final Products"
          items={finalProducts}
          onPreview={setPreview}
        />

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-stone-200" />
          <div className="w-1.5 h-1.5 rounded-full bg-secondary/50" />
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* ROW 2 — Inaugurations & Exhibitions */}
        <GalleryRow
          label="Category 02"
          title="Inaugurations & Exhibitions"
          items={inaugurations}
          onPreview={setPreview}
        />

      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setPreview(null)}
          >
            <div className="absolute inset-0 bg-stone-950/88 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 w-full max-w-3xl flex flex-col"
              style={{ maxHeight: 'calc(100vh - 2rem)' }}
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 16, opacity: 0 }}
              transition={{ duration: 0.3, ease: EXPO_OUT }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-3 shrink-0 px-1">
                <div>
                  {preview.title && (
                    <p className="text-white text-sm font-semibold tracking-tight">{preview.title}</p>
                  )}
                  {preview.description && (
                    <p className="text-secondary text-[10px] uppercase tracking-[0.25em] mt-0.5">{preview.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors ml-4 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-secondary to-transparent mb-3 shrink-0 opacity-40" />

              {preview.type === 'video' ? (
                <video
                  src={preview.asset_url}
                  autoPlay
                  controls
                  playsInline
                  className="w-full rounded-2xl shadow-2xl bg-black min-h-0"
                  style={{ maxHeight: 'calc(100vh - 7rem)' }}
                />
              ) : (
                <img
                  src={preview.asset_url}
                  alt={preview.title ?? 'Gallery image'}
                  className="w-full rounded-2xl shadow-2xl object-contain min-h-0"
                  style={{ maxHeight: 'calc(100vh - 7rem)' }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default GallerySection

