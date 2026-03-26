import { useEffect, useRef, useState } from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Rohan Kapoor',
    title: 'Interior Designer, Mumbai',
    quote: 'KAIRA has completely transformed how I source fabrics for my clients across Mumbai and Pune. The quality is unmatched — every thread feels intentional and luxurious.',
    rating: 5,
    initials: 'RK',
  },
  {
    id: 2,
    name: 'Priya Nair',
    title: 'Principal Architect, Kochi',
    quote: 'From the moment I explored their collection, I knew this was different. The AI visualizer alone saved us hours on our last hospitality project in Bengaluru.',
    rating: 5,
    initials: 'PN',
  },
  {
    id: 3,
    name: 'Vikram Singhania',
    title: 'Furniture Manufacturer, Jodhpur',
    quote: "Sourcing premium upholstery fabric used to be a pain point for our Jodhpur workshop. With KAIRA's smart catalog and seamless delivery, it's the easiest part of our process now.",
    rating: 5,
    initials: 'VS',
  },
  {
    id: 4,
    name: 'Ananya Sharma',
    title: 'Creative Director, New Delhi',
    quote: 'The breadth of textures and the consistency of quality across every order is remarkable. My clients in Delhi and NCR always notice the difference.',
    rating: 5,
    initials: 'AS',
  },
  {
    id: 5,
    name: 'Suresh Iyer',
    title: 'Design Consultant, Chennai',
    quote: 'Coming from Tamil Nadu where craftsmanship is deeply valued, I can say KAIRA perfectly balances Indian textile heritage with modern innovation. Truly exceptional.',
    rating: 5,
    initials: 'HT',
  },
]

const StarRating = ({ count }: { count: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-3 h-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
        const cardWidth = el.querySelector('div')?.offsetWidth ?? 340
        el.scrollBy({ left: cardWidth + 24, behavior: 'smooth' })
      }
    }, 3500)
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [isPaused])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.querySelector('div')?.offsetWidth ?? 340
    scrollRef.current.scrollBy({ left: direction === 'right' ? cardWidth + 24 : -(cardWidth + 24), behavior: 'smooth' })
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 8000)
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 border-b border-stone-200 relative overflow-hidden"
      style={{ backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background2.webp')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-[2px]" />

      {/* Decorative blurred orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-stone-200/50 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/80 blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-5 sm:w-6 bg-primary" />
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Client Stories</p>
            <span className="h-px w-5 sm:w-6 bg-primary" />
          </div>
          <h2 className="font-serif text-2xl md:text-4xl text-stone-900">
            What our clients say
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
            <span className="h-px w-6 md:w-8 bg-stone-200" />
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span className="h-px w-6 md:w-8 bg-stone-200" />
          </div>
        </div>

        {/* Horizontal Scroll Strip with overlaid controls */}
        <div className="relative">
          {/* Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 bg-white/80 backdrop-blur-sm text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200 shadow-sm"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 bg-white/80 backdrop-blur-sm text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200 shadow-sm"
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
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="snap-start shrink-0 w-[85vw] sm:w-[420px] lg:w-[400px] relative bg-stone-50 border border-stone-200 rounded-xl p-7 shadow-sm flex flex-col"
              >
                {/* Large quotation mark */}
                <span className="absolute top-4 right-6 font-serif text-8xl text-stone-100 leading-none select-none pointer-events-none">
                  "
                </span>

                <StarRating count={t.rating} />

                <blockquote className="mt-4 font-serif text-[13px] md:text-md text-stone-800 leading-relaxed relative z-10 flex-1">
                  "{t.quote}"
                </blockquote>

                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-[11px] font-bold text-primary tracking-wider shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{t.name}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}

export default TestimonialsSection
