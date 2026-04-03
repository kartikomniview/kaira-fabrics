import { useState } from 'react'

const weaveBg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A2EF0F' stroke-width='0.4' opacity='0.18'%3E%3Cpath d='M0 10h40M0 20h40M0 30h40M10 0v40M20 0v40M30 0v40'/%3E%3C/g%3E%3C/svg%3E")`

const galleryItems = [
  { id: 1, src: 'https://placehold.co/800x600/3B2A1A/C5A552?text=Living+Room+I', alt: 'Elegant living room with Royal Velvet sofa', category: 'Living Room', fabric: 'Royal Velvet' },
  { id: 2, src: 'https://placehold.co/600x800/1A2F4A/C5A552?text=Bedroom+I', alt: 'Luxury master bedroom', category: 'Bedroom', fabric: 'Cashmere Touch' },
  { id: 3, src: 'https://placehold.co/800x600/2C3E50/FAF8F5?text=Dining+Room+I', alt: 'Formal dining room with linen chairs', category: 'Dining Room', fabric: 'Linen Masters' },
  { id: 4, src: 'https://placehold.co/600x600/4A1942/C5A552?text=Study+I', alt: 'Private home library with leather chairs', category: 'Study', fabric: 'Italian Leather' },
  { id: 5, src: 'https://placehold.co/800x500/3D5A47/FAF8F5?text=Outdoor+I', alt: 'Luxury outdoor terrace', category: 'Outdoor', fabric: 'Outdoor Luxe' },
  { id: 6, src: 'https://placehold.co/700x500/1C1917/C5A552?text=Lounge+I', alt: 'Contemporary lounge area', category: 'Living Room', fabric: 'Contemporary Weave' },
  { id: 7, src: 'https://placehold.co/600x800/6B3A2A/FAF8F5?text=Bedroom+II', alt: 'Classic bedroom with silk drapery', category: 'Bedroom', fabric: 'Silk Heritage' },
  { id: 8, src: 'https://placehold.co/800x600/2A3020/C5A552?text=Living+Room+II', alt: 'Refined living room setting', category: 'Living Room', fabric: 'Belgian Linen' },
  { id: 9, src: 'https://placehold.co/600x600/5A3A2A/FAF8F5?text=Dining+Room+II', alt: 'Modern dining with velvet chairs', category: 'Dining Room', fabric: 'Royal Velvet' },
  { id: 10, src: 'https://placehold.co/800x500/1A1A3A/C5A552?text=Study+II', alt: 'Minimalist home office', category: 'Study', fabric: 'Merino Wool' },
  { id: 11, src: 'https://placehold.co/600x800/3A2A1A/C5A552?text=Bedroom+III', alt: 'Penthouse bedroom suite', category: 'Bedroom', fabric: 'Cashmere Touch' },
  { id: 12, src: 'https://placehold.co/800x600/4A3A2A/FAF8F5?text=Outdoor+II', alt: 'Resort-style outdoor lounge', category: 'Outdoor', fabric: 'Outdoor Luxe' },
]

const categories = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Study', 'Outdoor']

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<typeof galleryItems[0] | null>(null)

  const filtered =
    activeCategory === 'All'
      ? galleryItems
      : galleryItems.filter((g) => g.category === activeCategory)

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Gallery ──────────────────────────────────────────────── */}
      <div className="pt-28 pb-14 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* Section label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px flex-1 bg-stone-200" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium whitespace-nowrap">Browse By Space</p>
            <span className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-charcoal text-cream'
                    : 'border border-stone-200 text-stone-400 hover:border-gold hover:text-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filtered.map((item) => {
              const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(item.src)
              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden cursor-pointer border border-stone-200 hover:border-gold/50 transition-all duration-500 break-inside-avoid shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-xl"
                  onClick={() => setLightbox(item)}
                >
                  {/* gold accent bar on hover */}
                  <span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full bg-gold z-20 transition-all duration-300" />
                  
                  {isVideo ? (
                    <video
                      src={item.src + '#t=0.001'}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      onLoadedMetadata={e => { (e.currentTarget as HTMLVideoElement).currentTime = 0.001 }}
                      onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                      onMouseLeave={e => {
                        const v = e.currentTarget as HTMLVideoElement
                        v.pause()
                        v.currentTime = 0.001
                      }}
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/65 transition-all duration-300 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 z-10">
                    <span className="text-gold text-xs tracking-widest uppercase font-medium">{item.category}</span>
                    <p className="text-cream text-sm font-medium mt-1">{item.fabric}</p>
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

          {filtered.length === 0 && (
            <div className="text-center py-20 border border-dashed border-stone-200">
              <p className="font-serif text-2xl text-charcoal mb-3">No images in this category</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="text-xs uppercase tracking-widest text-gold border border-gold/40 px-5 py-2 hover:bg-charcoal hover:text-cream transition-colors"
              >
                View All
              </button>
            </div>
          )}
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
            {/\.(mp4|webm|mov|ogg)(\?|$)/i.test(lightbox.src) ? (
              <video
                src={lightbox.src}
                autoPlay
                controls
                playsInline
                className="w-full max-h-[78vh] object-contain rounded-t-xl bg-black"
              />
            ) : (
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="w-full max-h-[78vh] object-contain rounded-t-xl"
              />
            )}
            <div
              className="relative p-5 flex justify-between items-center overflow-hidden"
              style={{ backgroundImage: weaveBg, backgroundColor: 'rgb(116,98,60)' }}
            >
              <span className="absolute top-0 left-0 w-full h-0.5 bg-gold" />
              <div>
                <p className="text-gold text-xs tracking-widest uppercase font-medium">{lightbox.category}</p>
                <p className="text-cream text-sm mt-1 font-medium">{lightbox.alt}</p>
              </div>
              <div className="text-right">
                <p className="text-gold/70 text-xs tracking-widest uppercase">Fabric</p>
                <p className="text-cream/80 text-sm mt-0.5">{lightbox.fabric}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
