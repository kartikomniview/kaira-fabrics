import { useState } from 'react'

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
    <div className="min-h-screen">
      {/* Page Hero */}
      <div className="bg-charcoal pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            Inspiration Portfolio
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
            KAIRA Gallery
          </h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            Real interiors. Real luxury. Browse our portfolio of spaces brought to life
            with KAIRA's premium fabrics and fine leather.
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-cream py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-charcoal text-cream'
                    : 'border border-stone-300 text-stone-500 hover:border-charcoal hover:text-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry-style grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid group relative overflow-hidden cursor-pointer"
                onClick={() => setLightbox(item)}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/60 transition-all duration-300 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100">
                  <span className="text-gold text-xs tracking-widest uppercase">{item.category}</span>
                  <p className="text-cream text-sm font-medium mt-1">{item.fabric}</p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-3xl text-charcoal">No images in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white text-4xl leading-none"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            &times;
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="bg-charcoal p-4 flex justify-between items-center">
              <div>
                <p className="text-gold text-xs tracking-widest uppercase">{lightbox.category}</p>
                <p className="text-cream text-sm mt-0.5">{lightbox.alt}</p>
              </div>
              <span className="text-cream/50 text-sm">{lightbox.fabric}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
