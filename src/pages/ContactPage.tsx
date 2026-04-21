import { useEffect, useState } from 'react'

/* ── Fabric weave pattern as inline SVG data-URI ── */
const weaveBg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2397c41e' stroke-width='0.4' opacity='0.18'%3E%3Cpath d='M0 10h40M0 20h40M0 30h40M10 0v40M20 0v40M30 0v40'/%3E%3C/g%3E%3C/svg%3E")`

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
        window.scrollTo(0, 0)
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email || 'not provided',
          message: formData.message || 'not provided',
        }),
      })
      if (!res.ok) throw new Error('Failed to send message. Please try again.')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div
        className="relative pt-24 pb-12 overflow-hidden"
        style={{
          backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/stripsbg/strip1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-stone-950/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:border-white/60 hover:bg-white/20 transition-all rounded-full text-[11px] font-medium tracking-wide"
            >
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          <p className="text-[11px] tracking-[0.35em] uppercase font-semibold text-white/50 mb-2">Get In Touch</p>
          <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight">Contact Us</h1>
          <p className="mt-3 text-sm text-white/60 font-light max-w-md leading-relaxed">
            Reach out to us for fabric enquiries, custom orders, or to visit our showroom.
          </p>
        </div>
      </div>

      {/* ── Main content area ────────────────────────────────────── */}
      <section className="border-b border-stone-200 py-12 md:py-16 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/70 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-stone-200/50 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-[1fr_420px] gap-14 xl:gap-20 items-start">

            {/* ── Contact Form ────────────────────────────────────── */}
            <div>
              {/* section label */}
              <div className="mb-10">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">Enquiry Form</p>
                <h3 className="font-serif text-2xl md:text-3xl text-stone-900 font-medium">Send a Message</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="h-px w-8 bg-stone-300" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="h-px w-8 bg-stone-300" />
                </div>
              </div>

              {submitted ? (
                <div className="relative text-center py-20 border border-primary/30 bg-primary/5 overflow-hidden shadow-sm rounded-sm">
                  {/* weave overlay */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: weaveBg }} />
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-primary mx-auto flex items-center justify-center mb-6 bg-stone-900 rounded-sm">
                      <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="font-serif text-3xl text-stone-900 mb-3">Message Received</h2>
                    <p className="text-stone-500 max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                      Thank you for reaching out to Kaira Fabrics. A member of our team will
                      be in touch within 24 business hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', mobile: '', email: '', message: '' }) }}
                      className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-500 rounded-sm overflow-hidden"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest relative z-10 w-max">Send Another Message</span>
                      <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="name" className="block text-[10px] tracking-[0.2em] font-bold uppercase text-stone-400 mb-2">
                        Name <span className="text-primary">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        minLength={2}
                        maxLength={50}
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all rounded-sm shadow-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="group">
                      <label htmlFor="mobile" className="block text-[10px] tracking-[0.2em] font-bold uppercase text-stone-400 mb-2">
                        Mobile <span className="text-primary">*</span>
                      </label>
                      <input
                        id="mobile"
                        type="tel"
                        name="mobile"
                        required
                        pattern="^[0-9\-\+\s]{10,15}$"
                        title="Please enter a valid mobile number (10-15 digits)"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all rounded-sm shadow-sm"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[10px] tracking-[0.2em] font-bold uppercase text-stone-400 mb-2">
                      Email <span className="normal-case tracking-normal font-normal text-stone-400 text-[10px] ml-1">(Optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all rounded-sm shadow-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[10px] tracking-[0.2em] font-bold uppercase text-stone-400 mb-2">
                      Message <span className="normal-case tracking-normal font-normal text-stone-400 text-[10px] ml-1">(Optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all resize-none rounded-sm shadow-sm"
                      placeholder="Tell us about your project, fabric requirements or enquiry…"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-[11px] font-medium border border-red-200 bg-red-50 px-4 py-3 rounded-sm shadow-sm">{error}</p>
                  )}

                  <button 
                    type="submit" 
                    className="group relative inline-flex w-full items-center justify-center gap-3 px-8 py-4 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-500 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest relative z-10">{loading ? 'Sending…' : 'Send Enquiry'}</span>
                    {!loading && (
                      <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                    <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                  </button>

                  <p className="text-center text-[10px] text-stone-400 tracking-[0.1em] uppercase">
                    We typically respond within 24 business hours
                  </p>
                </form>
              )}

              {/* ── Why choose Kaira strip ─────────────────────── */}
              <div className="mt-14 grid grid-cols-3 gap-4 border-t border-stone-200 pt-10">
                {[
                  { icon: '🧵', label: 'Premium Fabrics', sub: '1000+ curated materials' },
                  { icon: '✂️', label: 'Custom Tailoring', sub: 'Bespoke to your specs' },
                  { icon: '🚚', label: 'Swift Delivery', sub: 'Pan-India shipping' },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="text-center bg-white p-4 border border-stone-200 rounded-sm shadow-sm">
                    <div className="text-2xl mb-2">{icon}</div>
                    <p className="text-[10px] font-bold text-stone-900 tracking-[0.2em] uppercase">{label}</p>
                    <p className="text-[11px] text-stone-500 mt-1">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Sidebar ────────────────────────────────── */}
            <aside className="space-y-6">

              {/* Contact Info Card */}
              <div
                className="relative bg-stone-900 text-white p-8 overflow-hidden rounded-sm shadow-sm"
                style={{ backgroundImage: weaveBg }}
              >
                {/* accent bar */}
                <span className="absolute top-0 left-0 w-full h-1 bg-primary" />

                <div className="relative">
                  {/* brand mark */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 border border-primary flex items-center justify-center rounded-sm">
                      <span className="text-primary text-sm font-serif font-bold">K</span>
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold tracking-[0.2em] uppercase leading-none">Kaira Fabrics</p>
                      <p className="text-primary text-xs tracking-[0.2em] uppercase font-bold mt-1.5 opacity-90">Calicut Showroom</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-5">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center mt-0.5 rounded-sm">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase leading-none mb-2">Address</p>
                        <p className="text-stone-300 text-sm md:text-base leading-relaxed">
                          Hira Arcade, Opp. Crescent King Spear,<br />
                          Mini Bypass Road, Govindhapuram,<br />
                          Mankavu, Calicut
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-5">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center mt-0.5 rounded-sm">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase leading-none mb-2">Phone</p>
                        <a href="tel:+918589925111" className="block text-stone-300 text-sm md:text-base hover:text-primary transition-colors">+91 8589925111</a>
                        <a href="tel:+918589925222" className="block text-stone-300 text-sm md:text-base hover:text-primary transition-colors mt-1">+91 8589925222</a>
                      </div>
                    </div>

                    <div className="flex gap-5">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center mt-0.5 rounded-sm">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase leading-none mb-2">Email</p>
                        <a href="mailto:info@kairafabrics.in" className="text-stone-300 text-sm md:text-base hover:text-primary transition-colors">info@kairafabrics.in</a>
                      </div>
                    </div>

                    <div className="flex gap-5">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center mt-0.5 rounded-sm">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase leading-none mb-2">Showroom Hours</p>
                        <p className="text-stone-300 text-sm md:text-base">Mon – Sat: 10:00 AM – 7:30 PM</p>
                        <p className="text-stone-400 text-xs md:text-sm mt-1">Sunday: By appointment only</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/918589925111"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-4 transition-colors group rounded-sm shadow-sm"
              >
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <p className="text-[12px] font-bold tracking-[0.1em] uppercase leading-none">Chat on WhatsApp</p>
                  <p className="text-[10px] text-white/80 mt-1">Quick replies during business hours</p>
                </div>
                <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

            </aside>
          </div>
        </div>
      </section>

      {/* ── Google Map ──────────────────────────────────────────────── */}
      <section className="bg-stone-50 py-16 md:py-24 border-b border-stone-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-3 mb-4 justify-center">
              <span className="w-1 h-1 bg-primary rounded-full" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Location</span>
              <span className="w-1 h-1 bg-primary rounded-full" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 font-medium leading-tight mb-4">
              Visit Our <span className="text-stone-400">Showroom</span>
            </h2>
            <p className="text-sm md:text-base text-stone-500 leading-relaxed font-sans max-w-lg mx-auto">
              Experience our premium fabrics in person. Our experts are ready to guide you through our extensive collection.
            </p>
          </div>
          
          <div className="relative overflow-hidden border border-stone-200 shadow-sm" style={{ height: '420px' }}>
            {/* accent corner marks */}
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary z-10" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary z-10" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary z-10" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary z-10" />
            <iframe
              title="Kaira Fabrics Showroom Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.013447053!2d75.7764!3d11.2588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba65938563f1c3f%3A0x3d8e55ace2aa8bd5!2sMankavu%2C%20Kozhikode%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(20%) contrast(1.05)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Hira Arcade, Mini Bypass Road, Govindhapuram, Mankavu, Calicut
            </p>
            <a
              href="https://maps.google.com/?q=Mankavu+Calicut+Kerala"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-300 rounded-sm overflow-hidden"
            >
              <span className="text-xs font-bold uppercase tracking-widest relative z-10 w-max">Open in Maps</span>
              <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}

export default ContactPage
