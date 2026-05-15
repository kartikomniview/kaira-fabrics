import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion'

const pillars = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Uncompromising Quality",
    description: "Every fabric is carefully sourced and selected for texture, durability, and finish — performing beautifully in everyday living while maintaining elegance over time."
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
    description: "With years in the upholstery and fabric industry, our team understands what works for different homes, furniture, and lifestyles — guiding you to choose with confidence."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: "Spaces of Comfort",
    description: "We go beyond selling fabrics — we help create spaces that feel like a personal retreat. A place to relax, recharge, and enjoy everyday moments with lasting beauty."
  }
]

// ── PillarCard: Framer Motion 3D tilt card ────────────────────────────────
type PillarCardProps = {
  pillar: (typeof pillars)[0]
  index: number
  visible: boolean
}

const PillarCard = ({ pillar, index, visible }: PillarCardProps) => {
  const ref = useRef<HTMLDivElement>(null)

  // Raw mouse position relative to card centre (-0.5 → 0.5)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring-smooth the raw values
  const springCfg = { stiffness: 220, damping: 22, mass: 0.6 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springCfg)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springCfg)

  // Spotlight follows cursor — reactive gradient via motion template
  const spotX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const spotY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])
  const spotGradient = useMotionTemplate`radial-gradient(180px circle at ${spotX} ${spotY}, rgba(151,196,30,0.12), transparent 80%)`

  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    mouseX.set((e.clientX - left) / width - 0.5)
    mouseY.set((e.clientY - top) / height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        transitionDelay: visible ? `${index * 80}ms` : '0ms',
      }}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, boxShadow: '0 24px 52px -8px rgba(0,0,0,0.16)' }}
      className="relative bg-white border border-stone-200 p-7 overflow-hidden shadow-sm cursor-default"
    >
      {/* Cursor-following spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: spotGradient }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Top accent bar — sweeps left → right */}
      <motion.div
        className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-primary to-primary/50"
        initial={{ width: '0%' }}
        animate={{ width: hovered ? '100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Icon — floats up + glows */}
      <motion.div
        className="w-12 h-12 bg-stone-100 flex items-center justify-center text-stone-600 mb-6"
        animate={hovered
          ? { scale: 1.12, y: -3, backgroundColor: 'rgb(151 196 30 / 0.15)', color: '#5a7a0f', boxShadow: '0 0 18px rgba(151,196,30,0.30)' }
          : { scale: 1, y: 0, backgroundColor: 'rgb(245 245 244)', color: 'rgb(87 83 78)', boxShadow: 'none' }
        }
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformStyle: 'preserve-3d', translateZ: 12 }}
      >
        {pillar.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="font-serif text-base md:text-lg color-secondary-dark mb-3 leading-snug"
        animate={hovered ? { x: 2 } : { x: 0 }}
        transition={{ duration: 0.3 }}
        style={{ translateZ: 8 }}
      >
        {pillar.title}
      </motion.h3>

      {/* Accent divider — grows */}
      <motion.div
        className="h-px bg-primary mb-4"
        animate={{ width: hovered ? '3rem' : '1.5rem' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Description */}
      <p className="color-secondary-dark leading-relaxed text-xs md:text-sm font-light">
        {pillar.description}
      </p>
    </motion.div>
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
        className="relative pt-24 pb-12 overflow-hidden"
        style={{
          backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/banner/banner1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-stone-950/55" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:border-white/60 hover:bg-white/20 transition-all text-[11px] font-medium tracking-wide"
            >
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          <p className="text-[11px] tracking-[0.35em] uppercase font-semibold text-white/50 mb-2">Calicut · South India</p>
          <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight mb-3">About Us</h1>
          <p className="text-white/60 text-sm font-light max-w-xl leading-relaxed">
            A premium destination for sofa fabrics and upholstery materials — where elegance, durability, and comfort meet.
          </p>
        </div>
      </div>

      {/* ── Page wrapper ── */}
      <div style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle, #97c41e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* ── About Us Intro ─────────────────────────────────────── */}
        <section ref={introRef} className="border-b border-stone-200 py-14 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/BackgroundImages/b4.webp), radial-gradient(circle, #97c41e 1px, transparent 1px)', backgroundSize: 'cover' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-stone-100/60 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* Left: headline */}
              <div className={`transition-all duration-700 ${introVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 shadow-sm mb-5">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">Who We Are</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl color-primary leading-[1.15] mb-6">
                  Kaira Fabrics<br />& Leather
                </h2>
                <p className="color-secondary-dark text-sm font-light leading-relaxed mb-6">
                  A premium destination for sofa fabrics and upholstery materials in <strong className="color-secondary-dark font-medium">Calicut</strong>, offering a thoughtfully curated collection that blends elegance, durability, and comfort.
                </p>
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
                  <div>
                    <p className="font-serif text-2xl color-secondary-dark mb-0.5">South India</p>
                    <p className="text-[11px] uppercase tracking-widest color-secondary-dark font-bold">Serving Region</p>
                  </div>
                  <div>
                    <p className="font-serif text-2xl color-secondary-dark mb-0.5">Since 1991</p>
                    <p className="text-[11px] uppercase tracking-widest color-secondary-dark font-bold">Group Legacy</p>
                  </div>
                </div>
              </div>

              {/* Right: body text */}
              <div className={`space-y-5 transition-all duration-700 delay-150 ${introVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <p className="color-secondary-dark text-base md:text-lg leading-relaxed font-light">
                  While rooted in Calicut, Kaira Fabrics & Leather proudly serves customers across South India — homeowners, interior designers, and furniture makers who seek refined fabrics that elevate living spaces.
                </p>
                <p className="color-secondary-dark text-base md:text-lg leading-relaxed font-light">
                  Our collections are designed to enhance modern and classic interiors alike, ensuring long-lasting performance along with refined aesthetics.
                </p>
                <div className="flex items-start gap-3 p-5 bg-white border border-stone-200 shadow-sm">
                  <div className="shrink-0 w-1 h-full min-h-[40px] bg-primary" />
                  <p className="color-secondary-dark text-sm leading-relaxed font-light">
                    With a commitment to consistency and trust, Kaira makes it easier for customers to choose the right materials for their spaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── More Than Fabrics ───────────────────────────────────── */}
        <section ref={philosophyRef} className="py-14 md:py-24 border-b border-stone-200 relative overflow-hidden bg-secondary">
          <div className="absolute inset-0 opacity-[0.2] bg-[url('https://kairafabrics.s3.ap-south-1.amazonaws.com/site/BackgroundImages/background-dark-1.webp')]" style={{ backgroundSize: "cover" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10">
            <div className={`text-center mb-12 transition-all duration-700 ${philosophyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400">Our Philosophy</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-[1.15]">
                More Than Fabrics —<br className="hidden sm:block" /> A Better <span className="text-primary">Living Experience</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  label: "01",
                  heading: "Spaces That Matter",
                  body: "The spaces we return to matter more than we realise. Every space — home, office, or commercial — should feel as good as it looks. Upholstered furniture shapes how people relax, work, and connect every day."
                },
                {
                  label: "02",
                  heading: "Where Trust Begins",
                  body: "Choosing the right fabric should never feel uncertain. Every fabric we offer is carefully selected to deliver on comfort, durability, and lasting performance — not just design."
                },
                {
                  label: "03",
                  heading: "A Space That Feels Right",
                  body: "It's not just about choosing a fabric. It's about creating a space that feels right, every single day — a place to unwind, recharge, and truly call your own."
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`border border-secondary-light/30 p-7 hover:border-primary/50 transition-all duration-500 group ${philosophyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: philosophyVisible ? `${i * 120}ms` : '0ms' }}
                >
                  <span className="font-serif text-4xl text-primary group-hover:text-white transition-colors duration-300 block mb-4">{item.label}</span>
                  <h3 className="font-serif text-lg text-white mb-3">{item.heading}</h3>
                  <div className="w-6 h-px bg-primary mb-4" />
                  <p className="text-stone-400 text-sm font-light leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Kaira (4 Pillars) ───────────────────────────────── */}
        <section ref={pillarsRef} className="border-b border-stone-200 py-14 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/BackgroundImages/b4.webp)', backgroundSize: 'cover' }} />
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-white/50 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/2" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
            <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 shadow-sm mb-4">
                <span className="w-1.5 h-1.5 bg-primary" />
                <span className="text-[10px] text-secondary uppercase tracking-widest font-semibold">What Sets Us Apart</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary leading-[1.2]">Why Kaira</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {pillars.map((pillar, index) => (
                <PillarCard
                  key={index}
                  pillar={pillar}
                  index={index}
                  visible={pillarsVisible}
                />
              ))}
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
                <h2 className="font-serif text-3xl sm:text-4xl color-secondary-dark leading-[1.2] mb-8">Brand Story</h2>

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
                      <p className="font-serif text-xl text-white">Kurikkal Group</p>
                    </div>
                  </div>
                  <div className="w-6 h-px bg-primary mb-4" />
                  <p className="text-stone-400 text-xs font-light leading-relaxed">
                    A trusted name with a legacy dating back to <strong className="text-stone-200 font-normal">1991</strong>. Decades of reliability, quality, and long-standing customer relationships.
                  </p>
                </div>
              </div>

              {/* Right: story paragraphs */}
              <div className={`space-y-6 transition-all duration-700 delay-150 ${storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <p className="color-secondary-dark text-base md:text-lg leading-relaxed font-light">
                  Kaira Fabrics & Leather was created with a clear purpose — to simplify the way people choose fabrics for their spaces. In today's market, customers face countless options, textures, and quality variations. While variety is valuable, it often makes it difficult to identify which materials truly offer the durability, comfort, and performance required.
                </p>
                <p className="color-secondary-dark text-base md:text-lg leading-relaxed font-light">
                  Recognising this gap, Kaira was introduced as a brand customers can rely on with confidence. Built on the Kurikkal Group's strong foundation, Kaira brings together carefully curated sofa fabrics and upholstery materials under one trusted brand — each collection selected to meet high standards of design, durability, and performance.
                </p>

                {/* Pull quote */}
                <div className="bg-white border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-1 self-stretch bg-primary" />
                    <p className="font-serif text-xl md:text-2xl color-secondary-dark leading-snug">
                      "Our goal is simple to make it easier for customers to choose the right fabric for any space, with complete confidence in its quality and long-term value."
                    </p>
                  </div>
                </div>

                <p className="color-secondary-dark text-base leading-relaxed font-light">
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
              <h2 className="font-serif text-3xl text-white mb-2">Ready to Find Your Perfect Fabric?</h2>
              <p className="text-stone-400 text-base font-light max-w-lg">Browse our curated collections or visit our showroom to experience premium quality firsthand.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 shrink-0 w-full md:w-auto">
              <Link
                to="/collections"
                className="group inline-flex items-center justify-center gap-3 px-10 py-4 md:px-12 md:py-5 bg-primary text-stone-900 hover:bg-white transition-all duration-500 overflow-hidden shadow-lg font-bold text-xs md:text-sm uppercase tracking-widest w-full sm:w-auto"
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
