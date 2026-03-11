import Button from '../ui/Button'

const CTASection = () => {
  return (
    <section className="bg-stone-900 py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Main CTA row */}
        <div className="grid lg:grid-cols-2 gap-10 items-center pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px bg-gold" />
              <span className="text-xs tracking-[0.25em] uppercase text-stone-500 font-medium">Get Started</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-3">
              Ready to Source Premium Textiles?
            </h2>
            <p className="text-stone-400 text-base leading-relaxed max-w-lg">
              Speak with our specification team to find the right fabric for your project,
              from single rooms to full commercial contracts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button to="/materials" variant="primary" size="lg">
              Browse Fabrics
            </Button>
            <Button to="/contact" variant="outline" size="lg">
              Speak to a Specialist
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 pt-10">
          {[
            { value: '500+', label: 'Fabric Varieties' },
            { value: '30+', label: 'Years in Business' },
            { value: '60+', label: 'Countries Served' },
            { value: '24h', label: 'Sample Dispatch' },
          ].map((stat) => (
            <div key={stat.label} className="px-6 first:pl-0 last:pr-0">
              <p className="font-serif text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-stone-500 tracking-widest uppercase mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CTASection
