import { useState, useEffect, useRef } from 'react'
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
    <section className="bg-stone-900 py-10 md:py-20 border-y border-stone-800 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/woven-light.png')]" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent" />
      
      <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center justify-center p-2.5 md:p-3 bg-stone-800 rounded-full mb-4 md:mb-6 border border-stone-700 shadow-2xl">
            <svg className="w-5 h-5 md:w-8 md:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          
          <div className="text-center mb-4 md:mb-6">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2 md:mb-3">Explore & Discover</p>
            <h2 className="font-serif text-2xl md:text-5xl text-white font-medium tracking-tight">
              Find Your Perfect Fabric
            </h2>
          </div>
          
          <p className="text-stone-300 text-xs md:text-lg max-w-2xl mx-auto mb-6 md:mb-10 font-sans font-light leading-relaxed">
            Explore our comprehensive catalog of <strong className="text-white font-medium">premium fabrics</strong>. Easily filter by color, texture, and material category to find the exact match for your project.
          </p>

          <div className="grid grid-cols-3 gap-2 md:gap-4 border-y border-stone-800 py-5 md:py-8 mb-6 md:mb-10 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-1 md:mb-2">
                <Counter end={500} suffix="+" />
              </span>
              <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] text-stone-400 font-bold">Materials</span>
            </div>
            <div className="flex flex-col items-center border-l border-stone-800/50">
              <span className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-1 md:mb-2">
                <Counter end={100} suffix="+" />
              </span>
              <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] text-stone-400 font-bold">Collections</span>
            </div>
            <div className="flex flex-col items-center border-l border-stone-800/50">
              <span className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-1 md:mb-2">
                <Counter end={50} suffix="+" />
              </span>
              <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] text-stone-400 font-bold">Clients</span>
            </div>
          </div>
          
          <Link 
            to="/materials" 
            className="group inline-flex flex-col items-center justify-center gap-1.5 px-6 py-3 md:px-8 md:py-4 bg-white text-stone-900 border border-transparent hover:bg-transparent hover:border-white hover:text-white transition-all duration-300 rounded-sm shadow-xl"
          >
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Browse the Catalog</span>
            <span className="text-[8px] md:text-[9px] text-stone-500 group-hover:text-stone-300 transition-colors uppercase tracking-widest">View Full Collection</span>
          </Link>
      </div>
    </section>
  )
}

export default SmartCatalogSection
