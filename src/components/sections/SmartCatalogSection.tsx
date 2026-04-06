import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const Counter = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasStarted) {
        setHasStarted(true)
      }
    }, { threshold: 0.1 })

    if (countRef.current) observer.observe(countRef.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [hasStarted, end, duration])

  return <span ref={countRef}>{count}{suffix}</span>
}

const SmartCatalogSection = () => {
  return (
    <section className="bg-stone-900 py-7 md:py-10 border-y border-stone-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/woven-light.png')]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">

          {/* Left: label + title + description */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold mb-2">Explore & Discover</p>
            <h2 className="font-serif text-2xl md:text-4xl text-white font-medium tracking-tight leading-snug mb-3">
              Find Your Perfect Fabric
            </h2>
            <p className="text-stone-400 text-sm md:text-base font-light leading-relaxed max-w-md">
              Browse <strong className="text-stone-200 font-medium">500+ premium fabrics</strong> — filter by color, texture, and category.
            </p>
          </div>

          {/* Center: stats */}
          <div className="flex items-center gap-0 shrink-0 border border-stone-800 rounded-sm overflow-hidden">
            {[
              { end: 500, suffix: '+', label: 'Materials' },
              { end: 100, suffix: '+', label: 'Collections' },
              { end: 50, suffix: '+', label: 'Clients' },
            ].map((stat, i) => (
              <div key={stat.label} className={`flex flex-col items-center justify-center px-6 py-4 md:px-9 md:py-5 ${i > 0 ? 'border-l border-stone-800' : ''}`}>
                <span className="text-2xl md:text-4xl font-serif text-white leading-none">
                  <Counter end={stat.end} suffix={stat.suffix} />
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500 font-bold mt-1.5">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Right: CTA */}
          <div className="shrink-0">
            <Link
              to="/materials"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-stone-900 hover:bg-primary transition-colors duration-300 rounded-sm text-sm font-bold uppercase tracking-widest"
            >
              Browse Catalog
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default SmartCatalogSection
