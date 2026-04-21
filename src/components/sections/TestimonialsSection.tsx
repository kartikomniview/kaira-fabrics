import { useEffect, useRef, useState } from 'react'

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

const TestimonialCard = ({ item, onPlay }: { item: GalleryItem; onPlay: (url: string) => void }) => {
  const videoName = item.asset_url.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
  const thumbnail = `https://kairafabrics.s3.ap-south-1.amazonaws.com/thumbnails/Testimonial/${videoName}.webp`
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      onClick={() => onPlay(item.asset_url)}
      className="snap-start shrink-0 w-[70vw] sm:w-[260px] lg:w-[240px] relative bg-black border border-primary/20 overflow-hidden shadow-lg hover:shadow-primary/20 hover:shadow-xl group flex flex-col h-[340px] cursor-pointer transition-shadow duration-300"
    >
      <div className="relative flex-1 overflow-hidden bg-stone-900">
        {/* Thumbnail image or dark gradient placeholder */}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title ?? 'Testimonial'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-950" />
        )}

        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-stone-900/60 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-black/95 backdrop-blur-md px-5 pt-4 pb-6 translate-y-[calc(100%-3.5rem)] group-hover:translate-y-0 transition-transform duration-500 ease-out border-t border-primary/30">
          {item.title && (
            <p className="text-base font-bold text-primary mb-3 tracking-wide">{item.title}</p>
          )}
          {item.description && (
            <div className="relative">
              <span className="absolute -left-2 -top-2 text-2xl text-primary/50 font-serif">"</span>
              <p className="text-[13px] md:text-sm text-white/80 leading-relaxed pr-2">
                {item.description}
              </p>
              <span className="absolute -bottom-2 right-0 text-2xl text-primary/50 font-serif">"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    console.log(`${API}/gallery/homepage?type=testimonial`)
    fetch(`${API}/gallery/homepage?type=testimonial`)
      .then(r => {
        console.log('Fetch testimonials response:', r)
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(data => setItems(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => setFetchFailed(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isPaused) return
    autoScrollRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const cardWidth = el.querySelector('div')?.offsetWidth ?? 280
        el.scrollBy({ left: cardWidth + 24, behavior: 'smooth' })
      }
    }, 3500)
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [isPaused])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.querySelector('div')?.offsetWidth ?? 280
    scrollRef.current.scrollBy({ left: direction === 'right' ? cardWidth + 24 : -(cardWidth + 24), behavior: 'smooth' })
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 8000)
  }

  if (!loading && !fetchFailed && items.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 border-b border-stone-200 relative overflow-hidden"
      style={{ backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background2.webp')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px]" />

      {/* Decorative blurred orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center justify-center mb-4 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          >
            <span className="text-[11px] uppercase tracking-[0.35em] text-primary font-bold">What They Say</span>
          </div>
          <div className="overflow-hidden">
            <h2
              className={`font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-stone-900 leading-tight transition-all duration-700 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-[115%]'}`}
            >
              Client <span className="text-primary">Stories</span>
            </h2>
          </div>
          <p className={`mt-4 text-sm md:text-base text-stone-500 font-light tracking-wide max-w-md mx-auto transition-all duration-700 delay-200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Homes and studios transformed by Kaira fabrics
          </p>
        </div>

        {/* Horizontal Scroll Strip with overlaid controls */}
        <div className="relative max-w-[70vw] sm:max-w-[1112px] lg:max-w-[1032px] mx-auto">
          {/* Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-5 sm:-left-12 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full border border-primary/30 bg-white/90 backdrop-blur-sm text-stone-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-md"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-5 sm:-right-12 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full border border-primary/30 bg-white/90 backdrop-blur-sm text-stone-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-md"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
            className={`flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="snap-start shrink-0 w-[70vw] sm:w-[260px] lg:w-[240px] bg-stone-200 animate-pulse aspect-[3/4.5]"
                  />
                ))
              : fetchFailed
              ? (
                  <div className="w-full py-10 text-center text-sm text-stone-400">
                    Could not load testimonials.
                  </div>
                )
              : items.map(item => (
                  <TestimonialCard key={item.id} item={item} onPlay={setPreviewUrl} />
                ))
            }
          </div>
        </div>

      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Video Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2 shrink-0">
              <button
                onClick={() => setPreviewUrl(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <video
              src={previewUrl}
              autoPlay
              controls
              playsInline
              className="w-full rounded-2xl shadow-2xl bg-black min-h-0"
              style={{ maxHeight: 'calc(100vh - 6rem)' }}
            />
          </div>
        </div>
      )}
    </section>
  )
}

export default TestimonialsSection
