import { useEffect, useState } from 'react'

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

interface GalleryItem {
  id: string
  asset_url: string
  asset_type: 'Gallery' | 'Image'
  type: 'testimonial' | 'other'
  isfeatured: boolean
  title?: string
  description?: string
}

const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)

const GallerySection = () => {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [preview, setPreview] = useState<GalleryItem | null>(null)

  useEffect(() => {
    fetch(`${API}/gallery/homepage?type=other`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(data => {
        const all: GalleryItem[] = Array.isArray(data) ? data : (data.items ?? [])
        setItems(all)
      })
      .catch(() => setFetchFailed(true))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && !fetchFailed && items.length === 0) return null

  return (
    <section
      id="gallery"
      className="py-10 md:py-24 border-t border-stone-200 relative"
      style={{
        backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background3.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white/80" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-10">

        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-2">Showcase</p>
          <h2 className="font-serif text-2xl md:text-4xl text-stone-900">Our Gallery</h2>
          <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
            <span className="h-px w-6 md:w-8 bg-stone-200" />
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span className="h-px w-6 md:w-8 bg-stone-200" />
          </div>
          <p className="mt-4 md:mt-6 text-stone-600 text-xs md:text-sm max-w-lg mx-auto font-normal tracking-wide leading-relaxed">
            Showcasing the world's most exquisite interiors powered by KAIRA
          </p>
        </div>

        {/* Dynamic Mosaic Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[150px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl bg-stone-200 animate-pulse ${
                  i % 7 === 0 ? 'md:col-span-2 md:row-span-2' : 
                  i % 5 === 0 ? 'md:row-span-2' : ''
                }`}
              />
            ))}
          </div>
        ) : fetchFailed ? (
          <p className="text-center text-sm text-stone-400 py-10">Could not load gallery.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[180px]">
            {items.map((item, index) => {
              const video = isVideo(item.asset_url)
              // Calculate spans based on index for a repeating "chaotic" pattern
              const isLarge = index % 10 === 0
              const isTall = index % 10 === 3 || index % 10 === 7
              const isWide = index % 10 === 5

              const spanClasses = `
                ${isLarge ? 'md:col-span-2 md:row-span-2 col-span-2 row-span-2' : ''}
                ${isTall ? 'md:row-span-2' : ''}
                ${isWide ? 'md:col-span-2 col-span-2' : ''}
              `.trim()

              return (
                <div
                  key={item.id}
                  onClick={() => setPreview(item)}
                  className={`group relative overflow-hidden rounded-2xl border border-stone-200/60 shadow-sm cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${spanClasses}`}
                >
                  {video ? (
                    <div className="w-full h-full relative bg-stone-100">
                      <video
                        src={item.asset_url}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                        onMouseLeave={e => {
                          const v = e.currentTarget as HTMLVideoElement
                          v.pause()
                          v.currentTime = 0
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

                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-all duration-500 flex flex-col items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 flex flex-col items-center px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-3">
                        {video
                          ? <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          : <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                        }
                      </div>
                      {item.title && (
                        <p className="text-white text-sm font-bold tracking-tight mb-1">{item.title}</p>
                      )}
                      {item.description && (
                        <p className="text-white/70 text-[10px] uppercase tracking-widest hidden md:block">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Video Badge (Visible when not hovered) */}
                  {video && (
                    <div className="absolute top-3 right-3 opacity-100 group-hover:opacity-0 transition-opacity">
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
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-3xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div>
                {preview.title && <p className="text-white text-sm font-semibold">{preview.title}</p>}
                {preview.description && <p className="text-stone-400 text-xs mt-0.5">{preview.description}</p>}
              </div>
              <button
                onClick={() => setPreview(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors ml-4 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {isVideo(preview.asset_url) ? (
              <video
                src={preview.asset_url}
                autoPlay
                controls
                playsInline
                className="w-full rounded-2xl shadow-2xl bg-black min-h-0"
                style={{ maxHeight: 'calc(100vh - 6rem)' }}
              />
            ) : (
              <img
                src={preview.asset_url}
                alt={preview.title ?? 'Gallery image'}
                className="w-full rounded-2xl shadow-2xl object-contain min-h-0"
                style={{ maxHeight: 'calc(100vh - 6rem)' }}
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default GallerySection
