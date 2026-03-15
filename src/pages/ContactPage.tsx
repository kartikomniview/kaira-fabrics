import { useState } from 'react'
import Button from '../components/ui/Button'

/* ── Fabric weave pattern as inline SVG data-URI ── */
const weaveBg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A2EF0F' stroke-width='0.4' opacity='0.18'%3E%3Cpath d='M0 10h40M0 20h40M0 30h40M10 0v40M20 0v40M30 0v40'/%3E%3C/g%3E%3C/svg%3E")`

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
    <div className="min-h-screen bg-cream">

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="pt-28 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_420px] gap-14 xl:gap-20 items-start">

            {/* ── Contact Form ────────────────────────────────────── */}
            <div>
              {/* section label */}
              <div className="flex items-center gap-3 mb-8">
                <span className="h-px flex-1 bg-stone-200" />
                <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium whitespace-nowrap">Send A Message</p>
                <span className="h-px flex-1 bg-stone-200" />
              </div>

              {submitted ? (
                <div className="relative text-center py-20 border border-gold/30 bg-gold/5 overflow-hidden">
                  {/* weave overlay */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: weaveBg }} />
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-gold mx-auto flex items-center justify-center mb-6 bg-charcoal">
                      <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="font-serif text-3xl text-charcoal mb-3">Message Received</h2>
                    <p className="text-stone-500 max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                      Thank you for reaching out to Kaira Fabrics. A member of our team will
                      be in touch within 24 business hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', mobile: '', email: '', message: '' }) }}
                      className="text-xs tracking-widest uppercase text-gold border border-gold/40 px-6 py-2 hover:bg-charcoal hover:text-cream transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="name" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                        Name <span className="text-gold">*</span>
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
                        className="w-full border border-stone-200 bg-white px-4 py-3.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="group">
                      <label htmlFor="mobile" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                        Mobile <span className="text-gold">*</span>
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
                        className="w-full border border-stone-200 bg-white px-4 py-3.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                      Email <span className="normal-case text-stone-300 text-xs">(Optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-stone-200 bg-white px-4 py-3.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                      Message <span className="normal-case text-stone-300 text-xs">(Optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-stone-200 bg-white px-4 py-3.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Tell us about your project, fabric requirements or enquiry…"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm border border-red-200 bg-red-50 px-4 py-3">{error}</p>
                  )}

                  <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={loading}>
                    {loading ? 'Sending…' : 'Send Enquiry'}
                  </Button>

                  <p className="text-center text-xs text-stone-400 tracking-wide">
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
                  <div key={label} className="text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <p className="text-xs font-medium text-charcoal tracking-wide uppercase">{label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Sidebar ────────────────────────────────── */}
            <aside className="space-y-6">

              {/* Contact Info Card */}
              <div
                className="relative bg-charcoal text-cream p-8 overflow-hidden"
                style={{ backgroundImage: weaveBg }}
              >
                {/* accent bar */}
                <span className="absolute top-0 left-0 w-full h-1 bg-gold" />

                <div className="relative">
                  {/* brand mark */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 border border-gold flex items-center justify-center">
                      <span className="text-gold text-xs font-serif font-bold">K</span>
                    </div>
                    <div>
                      <p className="text-cream text-sm font-medium tracking-wider uppercase leading-none">Kaira Fabrics</p>
                      <p className="text-gold text-xs tracking-widest mt-0.5">Calicut Showroom</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-9 h-9 bg-gold/10 border border-gold/30 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-gold text-xs tracking-widest uppercase mb-1">Address</p>
                        <p className="text-stone-300 text-sm leading-relaxed">
                          Hira Arcade, Opp. Crescent King Spear,<br />
                          Mini Bypass Road, Govindhapuram,<br />
                          Mankavu, Calicut
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-9 h-9 bg-gold/10 border border-gold/30 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-gold text-xs tracking-widest uppercase mb-1">Phone</p>
                        <a href="tel:+918589925111" className="block text-stone-300 text-sm hover:text-gold transition-colors">+91 8589925111</a>
                        <a href="tel:+918589925222" className="block text-stone-300 text-sm hover:text-gold transition-colors mt-0.5">+91 8589925222</a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-9 h-9 bg-gold/10 border border-gold/30 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-gold text-xs tracking-widest uppercase mb-1">Email</p>
                        <a href="mailto:info@kairafabrics.in" className="text-stone-300 text-sm hover:text-gold transition-colors">info@kairafabrics.in</a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-9 h-9 bg-gold/10 border border-gold/30 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-gold text-xs tracking-widest uppercase mb-1">Showroom Hours</p>
                        <p className="text-stone-300 text-sm">Mon – Sat: 10:00 AM – 7:30 PM</p>
                        <p className="text-stone-400 text-xs mt-0.5">Sunday: By appointment only</p>
                      </div>
                    </div>
                  </div>

                  {/* fabric colour palette row */}
                  <div className="mt-7 pt-6 border-t border-white/10">
                    <p className="text-gold text-xs tracking-widest uppercase mb-3">Our Fabric Range</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { name: 'Silk', color: '#c9a96e' },
                        { name: 'Cotton', color: '#e8dcc8' },
                        { name: 'Linen', color: '#b5a68a' },
                        { name: 'Velvet', color: '#6b3fa0' },
                        { name: 'Brocade', color: '#c0392b' },
                        { name: 'Chiffon', color: '#d4e8f0' },
                      ].map(({ name, color }) => (
                        <div key={name} className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-stone-400 text-xs">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/918589925111"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-4 transition-colors group"
              >
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <p className="text-sm font-medium tracking-wide">Chat on WhatsApp</p>
                  <p className="text-xs text-white/80">Quick replies during business hours</p>
                </div>
                <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

            </aside>
          </div>
        </div>
      </div>

      {/* ── Google Map ──────────────────────────────────────────────── */}
      <div className="border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px flex-1 bg-stone-200" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium whitespace-nowrap">Find Us</p>
            <span className="h-px flex-1 bg-stone-200" />
          </div>
          <div className="relative overflow-hidden border border-stone-200 shadow-sm" style={{ height: '420px' }}>
            {/* accent corner marks */}
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold z-10" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold z-10" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold z-10" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold z-10" />
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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-stone-500 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="text-xs tracking-widest uppercase text-gold border border-gold/40 px-4 py-2 hover:bg-charcoal hover:text-cream transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ContactPage
