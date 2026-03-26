import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

function TiltCard({ className, children }: { className: string; children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardStyle, setCardStyle] = useState<CSSProperties>({
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  })
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      onMouseMove={(e) => {
        const el = cardRef.current
        if (!el) return
        const { left, top, width, height } = el.getBoundingClientRect()
        const x = (e.clientX - left) / width
        const y = (e.clientY - top) / height
        setCardStyle({
          transform: `perspective(900px) rotateX(${((0.5 - y) * 14).toFixed(2)}deg) rotateY(${((x - 0.5) * 14).toFixed(2)}deg) translateZ(10px)`,
          transition: 'transform 0.08s ease-out, box-shadow 0.08s ease-out',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        })
        if (!hovered) setHovered(true)
      }}
      onMouseLeave={() => {
        setCardStyle({
          transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: 'transform 0.6s ease-out, box-shadow 0.6s ease-out',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        })
        setHovered(false)
      }}
      style={cardStyle}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      />
      {children}
    </div>
  )
}

export default function WhoWeServeSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-28 border-b border-stone-200 overflow-hidden"
    >
      {/* Paisley texture background */}
      <div className="absolute inset-0 bg-[#f5ede0]" />
      <div className="absolute inset-0 opacity-[0.18] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat" />

      <div className={`relative max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}>

        {/* Left: Text */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-stone-900 leading-[1.1] mb-5">
            Designed for every<br />
            <em className="not-italic text-primary">need & style.</em>
          </h2>
          <div className="flex items-center gap-2 mb-5">
            <span className="h-px w-8 bg-stone-300" />
            <span className="w-1.5 h-1.5 rotate-45 bg-primary/70 inline-block" />
            <span className="h-px w-8 bg-stone-300" />
          </div>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-sm">
            From styling your home to designing hotels or making furniture—we have the perfect fabric for your project.
          </p>
        </div>

        {/* Right: Cards grid */}
        <div className={`grid grid-cols-2 gap-4 md:gap-5 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

        {/* Manufacturers — full width on mobile, spans 2 rows on desktop */}
        <TiltCard className="col-span-2 md:col-span-1 md:row-span-2 bg-stone-900 rounded-2xl p-6 md:p-7 flex flex-col justify-between border border-stone-800 min-h-[280px]">
          <div>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-serif text-xl md:text-2xl text-white italic leading-tight min-w-0 break-words">Manufacturers</h3>
              <div className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 ml-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-stone-400 text-[13px] leading-relaxed">
              Power your production with Kaira’s bulk supply and integrated logistics. Access wholesale pricing, consistent quality, and a reliable supply chain for large-scale furniture and curtain manufacturing.
            </p>
          </div>
          <a
            href="https://wa.me/919999999999?text=Hi%2C%20I%27m%20a%20manufacturer%20interested%20in%20Kaira%20fabrics."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-white hover:bg-primary transition-colors rounded-full px-4 py-2.5 text-stone-900 text-[12px] font-bold uppercase tracking-widest w-fit shadow-sm"
          >
            <svg className="w-4 h-4 text-[#25D366] shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Inquire now →
          </a>
        </TiltCard>

          {/* Designers & Studios */}
          <TiltCard className="bg-stone-900 rounded-2xl p-6 flex flex-col justify-between border border-stone-800">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif text-xl md:text-2xl text-white italic leading-tight">Designers<br/>&amp; Studios</h3>
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 ml-2">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <p className="text-stone-400 text-[12px] leading-relaxed">
                Bring every concept to life with fabrics that match your creative ambition — sourced, sampled, and delivered to spec.
              </p>
            </div>
            <a
              href="https://wa.me/919999999999?text=Hi%2C%20I%27m%20a%20designer%20interested%20in%20Kaira%20fabrics."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-white hover:bg-primary transition-colors rounded-full px-4 py-2 text-stone-900 text-[11px] font-bold uppercase tracking-widest w-fit shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-[#25D366] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Let's talk →
            </a>
          </TiltCard>

          {/* For Your Home */}
          <TiltCard className="bg-stone-900 rounded-2xl p-6 flex flex-col justify-between border border-stone-800">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif text-xl md:text-2xl text-white italic leading-tight">For Your<br/>Home</h3>
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 ml-2">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
                  </svg>
                </div>
              </div>
              <p className="text-stone-400 text-[12px] leading-relaxed">
                Reimagine your interiors with fabrics that speak luxury. Browse 500+ textures and find the perfect fit for your space.
              </p>
            </div>
            <Link
              to="/collections"
              className="mt-4 inline-flex items-center gap-2 bg-white hover:bg-primary transition-colors rounded-full px-4 py-2 text-stone-900 text-[11px] font-bold uppercase tracking-widest w-fit shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-stone-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Browse catalogue →
            </Link>
          </TiltCard>

        </div>
      </div>
    </section>
  )
}
