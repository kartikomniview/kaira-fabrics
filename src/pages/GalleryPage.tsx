import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Seo, { pageTitle } from '../components/seo/Seo'
import { finalProducts, inaugurations, getVideoThumbnail, type GalleryItem } from '../data/galleryItems'

const EXPO_OUT = [0.16, 1, 0.3, 1] as const

type Category = 'Fabric Stories' | 'Inaugurations & Exhibitions'

interface DisplayItem extends GalleryItem {
  category: Category
}

const rows: Array<{ label: string; title: string; items: DisplayItem[] }> = [
  {
    label: 'From Our Studio',
    title: 'Fabric Stories',
    items: finalProducts.map((item) => ({ ...item, category: 'Fabric Stories' as Category })),
  },
  {
    label: 'Milestones & Moments',
    title: 'Inaugurations & Exhibitions',
    items: inaugurations.map((item) => ({ ...item, category: 'Inaugurations & Exhibitions' as Category })),
  },
]

interface GalleryRowProps {
  label: string
  title: string
  items: DisplayItem[]
  onPreview: (item: DisplayItem) => void
}

const GalleryRow = ({ label, title, items, onPreview }: GalleryRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null)
  const rowInView = useInView(rowRef, { once: true, margin: '-60px' })

  return (
    <div ref={rowRef} className="mb-16 last:mb-0">
      <motion.div
        className="flex items-center gap-4 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={rowInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: EXPO_OUT }}
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold mb-1">{label}</span>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal leading-tight">{title}</h2>
        </div>
        <motion.div
          className="flex-1 h-px bg-gradient-to-r from-gold/40 to-transparent ml-2"
          initial={{ scaleX: 0, originX: 0 }}
          animate={rowInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const isVideo = item.type === 'video'
          return (
            <div
              key={item.id}
              className="group relative overflow-hidden cursor-pointer border border-stone-200 hover:border-gold/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-xl aspect-[3/4]"
              onClick={() => onPreview(item)}
            >
              {/* gold accent bar on hover */}
              <span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full bg-gold z-20 transition-all duration-300" />

              {isVideo ? (
                <img
                  src={getVideoThumbnail(item.asset_url)}
                  alt={item.title ?? 'Video thumbnail'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <img
                  src={item.asset_url}
                  alt={item.title ?? 'Gallery image'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/65 transition-all duration-300 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 z-10">
                <span className="text-gold text-xs tracking-widest uppercase font-medium">{item.category}</span>
                <p className="text-stone-400 text-xs mt-0.5">Tap to view</p>
              </div>

              {/* Video Badge (Visible when not hovered) */}
              {isVideo && (
                <div className="absolute top-3 right-3 opacity-100 group-hover:opacity-0 transition-opacity z-10">
                  <div className="p-2 rounded-full bg-stone-900/50 backdrop-blur-sm border border-white/20">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const GalleryPage = () => {
  const [lightbox, setLightbox] = useState<DisplayItem | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <div className="min-h-screen bg-cream">
      <Seo
        title={pageTitle('Gallery')}
        description="See KAIRA fabrics and leathers styled in real interiors — living rooms, bedrooms, dining spaces, and more, organized by room and material."
      />

      {/* ── Gallery ──────────────────────────────────────────────── */}
      <div className="pt-28 pb-14 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* Section header */}
          <div ref={headerRef} className="text-center mb-14">
            <motion.div
              className="inline-flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: -16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EXPO_OUT }}
            >
              <span className="text-[11px] uppercase tracking-[0.35em] text-gold font-bold font-serif">Woven Stories</span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                className="font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-charcoal leading-tight"
                initial={{ y: '115%', skewY: 2 }}
                animate={headerInView ? { y: '0%', skewY: 0 } : {}}
                transition={{ duration: 1.0, delay: 0.18, ease: EXPO_OUT }}
              >
                Our <span className="text-gold">Gallery</span>
              </motion.h1>
            </div>

            <motion.p
              className="mt-5 text-stone-500 text-sm leading-relaxed max-w-lg mx-auto font-sans"
              initial={{ opacity: 0, y: 12 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.35, ease: EXPO_OUT }}
            >
              Every thread tells a story. A glimpse into the spaces, celebrations, and craftsmanship that define the KAIRA journey.
            </motion.p>
          </div>

          {/* ROW 1 — Fabric Stories */}
          <GalleryRow
            label={rows[0].label}
            title={rows[0].title}
            items={rows[0].items}
            onPreview={setLightbox}
          />

          {/* Divider */}
          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            <div className="flex gap-1.5 items-center">
              <div className="w-1 h-1 rounded-full bg-gold/40" />
              <div className="w-2 h-2 rounded-full bg-gold/60" />
              <div className="w-1 h-1 rounded-full bg-gold/40" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
          </div>

          {/* ROW 2 — Inaugurations & Exhibitions */}
          <GalleryRow
            label={rows[1].label}
            title={rows[1].title}
            items={rows[1].items}
            onPreview={setLightbox}
          />
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-gold transition-colors text-2xl leading-none"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            &times;
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.type === 'video' ? (
              <video
                src={lightbox.asset_url}
                autoPlay
                controls
                playsInline
                className="w-full max-h-[78vh] object-contain rounded-t-xl bg-black"
              />
            ) : (
              <img
                src={lightbox.asset_url}
                alt={lightbox.title ?? 'Gallery image'}
                className="w-full max-h-[78vh] object-contain rounded-t-xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
