import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const pillars = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Uncompromising Quality",
    description: "Every fabric is carefully sourced and selected for texture, durability, and finish performing beautifully in everyday living while maintaining elegance over time."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 8h12M14.5 21L6 13h4a4.5 4.5 0 0 0 0-9" />
      </svg>
    ),
    title: "Thoughtful Pricing",
    description: "Great fabrics should be accessible. Our collections balance quality and value, ensuring customers find options that suit both their style and budget."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Experience That Guides",
    description: "With years in the upholstery and fabric industry, our team understands what works for different homes, furniture, and lifestyles guiding you to choose with confidence."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: "Spaces of Comfort",
    description: "We go beyond selling fabrics, we help create spaces that feel like a personal retreat. A place to relax, recharge, and enjoy everyday moments with lasting beauty."
  }
]

// ── PillarCard: Framer Motion 3D tilt card ────────────────────────────────
type PillarCardProps = {
  pillar: (typeof pillars)[0]
  index: number
  visible: boolean
}

const PillarCard = ({ pillar, index, visible }: PillarCardProps) => {
  return (
    <div
      className={`relative bg-white p-6 md:p-7 flex flex-col group transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl border border-stone-100 overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: visible ? `${index * 150}ms` : '0ms' }}
    >
      {/* Top Hover Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />

      {/* Decorative Watermark Number */}
      <div className="absolute -bottom-2 -right-1 text-7xl font-serif text-stone-50 group-hover:text-stone-100 transition-colors duration-700 select-none z-0">
        0{index + 1}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <h3 className="font-serif text-lg md:text-xl color-secondary-dark mb-3 group-hover:text-primary transition-colors duration-500">
          {pillar.title}
        </h3>

        {/* Animated Divider */}
        <div className="w-10 h-px bg-stone-300 mb-4 group-hover:bg-primary group-hover:w-16 transition-all duration-500" />

        <p className="text-stone-600 text-sm font-light leading-relaxed flex-grow">
          {pillar.description}
        </p>
      </div>
    </div>
  )
}

const AboutPage = () => {
  const [introVisible, setIntroVisible] = useState(false)
  const [philosophyVisible, setPhilosophyVisible] = useState(false)
  const [pillarsVisible, setPillarsVisible] = useState(false)
  const [storyVisible, setStoryVisible] = useState(false)

  const introRef = useRef<HTMLDivElement>(null)
  const philosophyRef = useRef<HTMLDivElement>(null)
  const pillarsRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const makeObserver = (setter: (v: boolean) => void) =>
      new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true) }, { threshold: 0.12 })

    const o1 = makeObserver(setIntroVisible)
    const o2 = makeObserver(setPhilosophyVisible)
    const o3 = makeObserver(setPillarsVisible)
    const o4 = makeObserver(setStoryVisible)

    if (introRef.current) o1.observe(introRef.current)
    if (philosophyRef.current) o2.observe(philosophyRef.current)
    if (pillarsRef.current) o3.observe(pillarsRef.current)
    if (storyRef.current) o4.observe(storyRef.current)

    return () => { o1.disconnect(); o2.disconnect(); o3.disconnect(); o4.disconnect() }
  }, [])

  return (
    <>
      {/* ── Page Header ──────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center py-36 md:py-46 overflow-hidden"
        style={{
          backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/banner/prints/banner1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-stone-950/20" />

        <div className="relative z-10 px-6 text-center">
          <div className="inline-flex items-center justify-center gap-6">
            <span className="w-12 md:w-16 h-px bg-white/50 drop-shadow-sm" />
            <h1 className="text-xs md:text-sm font-light uppercase tracking-[0.3em] text-white drop-shadow-md">
              About Us
            </h1>
            <span className="w-12 md:w-16 h-px bg-white/50 drop-shadow-sm" />
          </div>
        </div>
      </div>

      {/* ── Page wrapper ── */}
      <div style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle, #97c41e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* ── About Us Intro ─────────────────────────────────────── */}
        <section ref={introRef} className="border-b border-stone-200 py-12 md:py-16 relative overflow-hidden bg-cream">
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/BackgroundImages/b4.webp)', backgroundSize: 'cover' }} />

          <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <div className={`flex flex-col items-center transition-all duration-1000 ease-out ${introVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

              <div className="mb-2">
                <span className="text-sm text-stone-500 font-serif">Welcome to Kaira</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-primary leading-tight mb-5">
                Kaira Fabrics & Leather
              </h2>

              <div className="space-y-4 text-stone-600 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-10">
                <p>
                  A premium destination for sofa fabrics and upholstery materials in <strong className="color-secondary-dark font-medium">Calicut</strong>, offering a thoughtfully curated collection that blends elegance, durability, and comfort.
                </p>
                <p>
                  While rooted in Calicut, we proudly serve customers across South India, homeowners, interior designers, and furniture makers who seek refined fabrics that elevate living spaces.
                </p>
              </div>

              {/* Stats row */}
              <div className="flex flex-row items-center justify-center gap-6 sm:gap-16 mb-10">
                <div className="group cursor-default">
                  <p className="font-serif text-xl sm:text-2xl md:text-3xl color-secondary-dark mb-1 group-hover:text-primary transition-colors duration-500">South India</p>
                  <p className="text-sm text-stone-500 font-light">Serving Region</p>
                </div>

                <div className="group cursor-default">
                  <p className="font-serif text-xl sm:text-2xl md:text-3xl color-secondary-dark mb-1 group-hover:text-primary transition-colors duration-500">Since 1991</p>
                  <p className="text-sm text-stone-500 font-light">Group Legacy</p>
                </div>
              </div>

              {/* Quote */}
              <div className="max-w-xl mx-auto pt-2">
                <svg className="w-6 h-6 text-primary/30 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <p className="color-secondary-dark text-sm sm:text-base md:text-lg leading-relaxed font-serif">
                  "With a commitment to consistency and trust, Kaira makes it easier for customers to choose the right materials for their spaces."
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── More Than Fabrics ───────────────────────────────────── */}
        <section ref={philosophyRef} className="py-24 md:py-32 border-b border-stone-200 relative overflow-hidden bg-stone-50">
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Left: Image */}
              <div className={`relative h-[450px] lg:h-[650px] w-full transition-all duration-1000 ease-out ${philosophyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                <div className="absolute inset-0 bg-stone-100 overflow-hidden shadow-sm">
                  <img
                    src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/WhyKaira/v2/Premium Fabrics & Leather.webp"
                    alt="Kaira Fabrics Philosophy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right: Content */}
              <div className={`flex flex-col transition-all duration-1000 delay-300 ease-out ${philosophyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

                <div className="mb-14">
                  <div className="mb-4">
                    <span className="text-sm text-stone-500 font-serif">Our Philosophy</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl color-secondary-dark leading-[1.15]">
                    More Than Fabrics <br /> A Better <span className="text-primary">Living Experience</span>
                  </h2>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      label: "01",
                      heading: "Spaces That Matter",
                      body: "The spaces we return to matter more than we realise. Every space, home, office, or commercial, should feel as good as it looks. Upholstered furniture shapes how people relax, work, and connect every day."
                    },
                    {
                      label: "02",
                      heading: "Where Trust Begins",
                      body: "Choosing the right fabric should never feel uncertain. Every fabric we offer is carefully selected to deliver on comfort, durability, and lasting performance not just design."
                    },
                    {
                      label: "03",
                      heading: "A Space That Feels Right",
                      body: "It's not just about choosing a fabric. It's about creating a space that feels right, every single day, a place to unwind, recharge, and truly call your own."
                    }
                  ].map((item, i) => (
                    <div key={i} className="group">
                      <h3 className="font-serif text-base sm:text-lg color-secondary-dark mb-1 group-hover:text-primary transition-colors duration-300">
                        <span className="text-stone-400 text-sm mr-3">{item.label}.</span>
                        {item.heading}
                      </h3>
                      <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed pl-[34px]">{item.body}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Why Kaira (4 Pillars) ───────────────────────────────── */}
        <section
          ref={pillarsRef}
          className="py-16 md:py-20 relative overflow-hidden"
          style={{
            backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/banner/prints/banner2.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-secondary-dark/90" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
            <div className={`text-center mb-10 md:mb-14 transition-all duration-1000 ease-out ${pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="mb-2">
                <span className="text-sm text-white font-serif">What Sets Us Apart</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-primary leading-tight">Why You Should Choose KAIRA</h2>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 sm:overflow-visible pb-6 sm:pb-0 hide-scrollbar">
              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-max sm:w-auto">
                {pillars.map((pillar, index) => (
                  <div key={index} className="w-[280px] shrink-0 sm:w-auto sm:shrink">
                    <PillarCard
                      pillar={pillar}
                      index={index}
                      visible={pillarsVisible}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Brand Story ────────────────────────────────────────── */}
        <section ref={storyRef} className="py-14 md:py-24 border-b border-stone-200 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/BackgroundImages/b2.webp)', backgroundSize: 'cover' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/70 blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
            <div className="grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">

              {/* Left: label + heritage badge */}
              <div className={`transition-all duration-700 ${storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] color-secondary-dark">Our Origin</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl color-secondary-dark leading-[1.2] mb-8">Brand Story</h2>

                {/* Heritage badge */}
                <div className="bg-secondary text-white p-7 inline-block w-full max-w-xs border border-secondary-dark/40">
                  <div className="flex flex-col gap-4 mb-4">
                    <img
                      src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/KurikalLogoPlainLight.webp"
                      alt="Kurikkal Group"
                      className="h-20 w-auto object-contain self-start"
                      loading="lazy"
                    />
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-1 font-bold">Part of</div>
                      <p className="font-serif text-lg sm:text-xl text-white">Kurikkal Group</p>
                    </div>
                  </div>
                  <div className="w-6 h-px bg-primary mb-4" />
                  <p className="text-stone-400 text-[11px] sm:text-xs font-light leading-relaxed">
                    A trusted name with a legacy dating back to <strong className="text-stone-200 font-normal">1991</strong>. Decades of reliability, quality, and long-standing customer relationships.
                  </p>
                </div>
              </div>

              {/* Right: story paragraphs */}
              <div className={`space-y-6 transition-all duration-700 delay-150 ${storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <p className="color-secondary-dark text-sm sm:text-base md:text-lg leading-relaxed font-light">
                  Kaira Fabrics & Leather was created with a clear purpose — to simplify the way people choose fabrics for their spaces. In today's market, customers face countless options, textures, and quality variations. While variety is valuable, it often makes it difficult to identify which materials truly offer the durability, comfort, and performance required.
                </p>
                <p className="color-secondary-dark text-sm sm:text-base md:text-lg leading-relaxed font-light">
                  Recognising this gap, Kaira was introduced as a brand customers can rely on with confidence. Built on the Kurikkal Group's strong foundation, Kaira brings together carefully curated sofa fabrics and upholstery materials under one trusted brand — each collection selected to meet high standards of design, durability, and performance.
                </p>

                {/* Pull quote */}
                <div className="bg-white border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-1 self-stretch bg-primary" />
                    <p className="text-lg sm:text-xl color-secondary-dark leading-snug">
                      "Our goal is simple to make it easier for customers to choose the right fabric for any space, with complete confidence in its quality and long-term value."
                    </p>
                  </div>
                </div>

                <p className="color-secondary-dark text-sm sm:text-base leading-relaxed font-light">
                  At Kaira, the journey goes beyond offering fabrics. It is about helping create spaces that are comfortable, functional, and built to be experienced every day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Strip ──────────────────────────────────────────── */}
        <section className="bg-secondary-dark py-14 md:py-16 border-b border-stone-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Explore Kaira</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2">Ready to Find Your Perfect Fabric?</h2>
              <p className="text-stone-400 text-sm sm:text-base font-light max-w-lg">Browse our curated collections or visit our showroom to experience premium quality firsthand.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 shrink-0 w-full md:w-auto">
              <Link
                to="/collections"
                className="group inline-flex items-center justify-center gap-3 px-10 py-4 md:px-12 md:py-5 bg-primary color-secondary-dark hover:bg-white transition-all duration-500 overflow-hidden shadow-lg font-bold text-xs md:text-sm uppercase tracking-widest w-full sm:w-auto"
              >
                Browse Collections
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 px-10 py-4 md:px-12 md:py-5 border border-stone-700 text-stone-300 hover:border-primary hover:text-white transition-all duration-300 font-bold text-xs md:text-sm uppercase tracking-widest w-full sm:w-auto"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AboutPage
