import { useState } from 'react'
import Button from '../components/ui/Button'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    interest: 'general',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production this would submit to an API
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      {/* Page Hero */}
      <div className="bg-charcoal pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            We'd Love To Hear From You
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
            Contact Us
          </h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            Whether you have a project in mind or simply wish to explore our range,
            our team of textile experts are ready to assist.
          </p>
        </div>
      </div>

      {/* Contact Grid */}
      <div className="bg-cream py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_400px] gap-16">

            {/* Form */}
            <div>
              {submitted ? (
                <div className="text-center py-20 border border-gold/30 bg-gold/5">
                  <div className="w-16 h-16 border-2 border-gold mx-auto flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-3xl text-charcoal mb-3">Message Sent</h2>
                  <p className="text-stone-500 max-w-sm mx-auto mb-6">
                    Thank you for reaching out. A member of our team will be in touch within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '', interest: 'general' }) }}
                    className="text-sm tracking-widest uppercase text-gold underline"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-charcoal transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-charcoal transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                      Area of Interest
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors"
                    >
                      <option value="general">General Enquiry</option>
                      <option value="trade">Trade & Designer Account</option>
                      <option value="samples">Request Samples</option>
                      <option value="custom">Custom Weave Commission</option>
                      <option value="project">Project Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-charcoal transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-charcoal transition-colors resize-none"
                      placeholder="Tell us about your project or enquiry…"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full justify-center">
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <aside className="space-y-8">
              <div className="bg-charcoal text-cream p-8">
                <h3 className="font-serif text-2xl mb-6">Get In Touch</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Showroom', value: 'Via della Seta 12\nMilan, 20121 — Italy' },
                    { label: 'Phone', value: '+39 02 1234 5678' },
                    { label: 'Email', value: 'studio@kairafabrics.com' },
                    { label: 'Hours', value: 'Mon–Fri: 9am–6pm\nSat: 10am–4pm' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-gold text-xs tracking-widest uppercase mb-1">{item.label}</p>
                      <p className="text-stone-300 text-sm whitespace-pre-line">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-stone-200 p-6">
                <h4 className="font-serif text-lg text-charcoal mb-3">Global Showrooms</h4>
                <div className="space-y-4">
                  {[
                    { city: 'Milan', address: 'Via della Seta 12' },
                    { city: 'London', address: '42 Chelsea Harbour' },
                    { city: 'New York', address: '511 W 25th St, Chelsea' },
                    { city: 'Dubai', address: 'Design District, Blk B' },
                  ].map((loc) => (
                    <div key={loc.city} className="flex justify-between text-sm">
                      <span className="font-medium text-charcoal">{loc.city}</span>
                      <span className="text-stone-400">{loc.address}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gold/10 border border-gold/20 p-6">
                <h4 className="font-serif text-lg text-charcoal mb-2">Trade Programme</h4>
                <p className="text-stone-500 text-sm leading-relaxed mb-4">
                  Interior designers and architects qualify for exclusive trade pricing,
                  priority sampling, and dedicated account management.
                </p>
                <a
                  href="mailto:trade@kairafabrics.com"
                  className="text-xs tracking-widest uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-gold hover:border-gold transition-colors"
                >
                  Apply for Trade Account →
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
