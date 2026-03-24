import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const values = [
  {
    title: "Ethics",
    icon: "⚖️",
    description: "We believe that keeping the right business ethics ensures trust with customers, employees, and stakeholders — following moral principles and doing the right things at the right time."
  },
  {
    title: "Professionalism",
    icon: "🤝",
    description: "By conducting with responsibility, integrity, accountability and excellence; we communicate appropriately and always find solutions to be efficient."
  },
  {
    title: "Timely Delivery",
    icon: "🚚",
    description: "We ensure timely delivery of each product to build customers' trust and loyalty. Keeping our valued customers satisfied is key to the success of our brand."
  },
  {
    title: "Transparency",
    icon: "🔍",
    description: "We understand the importance of disclosing all relevant information so that everyone can make confident, informed decisions."
  },
  {
    title: "Responsibility",
    icon: "🌿",
    description: "A responsible business builds greater trust and bonds its relationships at every level — generating greater values and impact over time."
  },
  {
    title: "Adaptability",
    icon: "🔄",
    description: "We are always adaptable — adjusting and responding to the changes brought about by the ever-evolving, dynamic environment."
  }
]

const stats = [
  { value: "20+", label: "Years Heritage" },
  { value: "10k+", label: "Fabric Variants" },
  { value: "500+", label: "Happy Clients" },
  { value: "Pan-India", label: "Delivery" },
]

const AboutPage = () => {
  const [whoVisible, setWhoVisible] = useState(false)
  const [missionVisible, setMissionVisible] = useState(false)
  const [valuesVisible, setValuesVisible] = useState(false)

  const whoRef = useRef<HTMLDivElement>(null)
  const missionRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

  useEffect(() => {
    const makeObserver = (setter: (v: boolean) => void) =>
      new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true) }, { threshold: 0.15 })

    const o1 = makeObserver(setWhoVisible)
    const o2 = makeObserver(setMissionVisible)
    const o3 = makeObserver(setValuesVisible)

    if (whoRef.current) o1.observe(whoRef.current)
    if (missionRef.current) o2.observe(missionRef.current)
    if (valuesRef.current) o3.observe(valuesRef.current)

    return () => { o1.disconnect(); o2.disconnect(); o3.disconnect() }
  }, [])

  return (
    <>
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="bg-stone-900 pt-24 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-3 py-1.5 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 transition-all rounded-sm"
            >
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-[9px] uppercase font-bold tracking-widest">Back to Home</span>
            </button>
          </div>
          <p className="text-[9px] tracking-[0.4em] uppercase font-bold text-primary mb-2">The House of Sofa Fabrics</p>
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-1">About Us</h1>
          <p className="text-stone-400 text-sm font-light mt-2 max-w-md">Born from a deep understanding of the furniture industry — crafting comfort, quality & style.</p>
        </div>
      </div>

      {/* ── Stats Strip ────────────────────────────────────────── */}
      <div className="bg-stone-900 border-t border-stone-800 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-800">
            {stats.map((s) => (
              <div key={s.label} className="py-6 px-6 text-center">
                <p className="font-serif text-2xl md:text-3xl text-white">{s.value}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Who We Are ─────────────────────────────────────────── */}
      <section ref={whoRef} className="bg-white border-b border-stone-200 py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-6 bg-primary" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 transition-all duration-700 ${whoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Our Story
            </span>
            <span className="h-px w-6 bg-primary" />
          </div>
          
          <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-[1.2] mb-8 transition-all duration-700 delay-100 ${whoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Who We Are
          </h2>
          
          <div className={`space-y-6 text-stone-600 text-lg leading-relaxed font-light transition-all duration-700 delay-200 ${whoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p>
              Kaira is an entity under the <strong className="text-stone-800 font-medium">Kurikkal Group</strong>, specializing in a wide range of premium sofa fabrics and leathers. Kaira ensures enhanced remarkable quality and availability right to your doorsteps.
            </p>
            <p>
              With our physical presence, Kaira focuses on the best sofa fabrics and leather solutions which bring affordability, design, and comfort. Born by understanding the changes in the furniture industry over the last few years, we are a perfect blend of form and function with an emphasis on quality and style.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ───────────────────────────────────── */}
      <section ref={missionRef} className="py-20 md:py-28 bg-stone-50 border-b border-stone-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-6 bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">Purpose & Direction</span>
              <span className="h-px w-6 bg-primary" />
            </div>
            <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-[1.2] transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Mission & Vision
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <div className={`bg-stone-50 border border-stone-200 p-10 md:p-12 text-center rounded-sm transition-all duration-700 delay-100 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold block mb-4">Our Mission</span>
              <h3 className="font-serif text-2xl md:text-3xl text-stone-900 mb-6">Market Leadership Through Quality</h3>
              <p className="text-stone-500 leading-relaxed font-light text-sm md:text-base">
                To be the market leader by providing enhanced quality materials with an affordable price — making premium fabrics accessible to every home and interior.
              </p>
            </div>

            {/* Vision */}
            <div className={`bg-stone-50 border border-stone-200 p-10 md:p-12 text-center rounded-sm transition-all duration-700 delay-200 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold block mb-4">Our Vision</span>
              <h3 className="font-serif text-2xl md:text-3xl text-stone-900 mb-6">A Brand Valued by People</h3>
              <p className="text-stone-500 leading-relaxed font-light text-sm md:text-base">
                To be the most valued brand among people & creating an opportunity to grow together — fostering partnerships, inspiring interiors, and enriching lives through design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ─────────────────────────────────────────── */}
      <section ref={valuesRef} className="bg-white border-b border-stone-200 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-6 bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">What We Stand For</span>
              <span className="h-px w-6 bg-primary" />
            </div>
            <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-[1.2] transition-all duration-700 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Our Values
            </h2>
            <p className="mt-4 text-stone-500 text-sm font-light max-w-md mx-auto leading-relaxed">
              The principles that guide every thread we weave and every relationship we build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className={`group bg-stone-50 border border-stone-200 p-8 rounded-sm hover:bg-stone-900 hover:border-stone-900 transition-all duration-500 relative overflow-hidden ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: valuesVisible ? `${index * 80}ms` : '0ms' }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <div className="text-2xl mb-4">{value.icon}</div>
                <h3 className="font-serif text-lg text-stone-900 group-hover:text-white mb-3 transition-colors duration-300">{value.title}</h3>
                <div className="w-8 h-px bg-primary mb-4" />
                <p className="text-stone-500 group-hover:text-stone-400 leading-relaxed text-sm font-light transition-colors duration-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ──────────────────────────────────────────── */}
      <section className="bg-stone-900 py-14 md:py-16 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-300 font-bold">Explore Kaira</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-2">Ready to Find Your Perfect Fabric?</h2>
            <p className="text-stone-400 text-sm font-light max-w-lg">Browse our curated collections or visit our showroom to experience premium quality firsthand.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              to="/collections"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-stone-900 hover:bg-white transition-all duration-500 rounded-sm overflow-hidden shadow-lg font-bold text-[11px] uppercase tracking-widest"
            >
              Browse Collections
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-stone-700 text-stone-300 hover:border-primary hover:text-white transition-all duration-300 rounded-sm font-bold text-[11px] uppercase tracking-widest"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutPage