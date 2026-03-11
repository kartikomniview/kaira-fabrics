import Button from '../ui/Button'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-stone-900 to-[#2A1A10]" />

      {/* Decorative texture overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #C5A552 0px,
            #C5A552 1px,
            transparent 1px,
            transparent 40px
          )`,
        }}
      />

      {/* Hero image placeholder */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 opacity-20 lg:opacity-30">
          <img
            src="https://placehold.co/1200x900/3B2A1A/C5A552?text=KAIRA+Luxury+Textiles"
            alt="Luxury fabric"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full pt-20">
        <div className="max-w-2xl">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-6">
            Premium Luxury Textiles Since 1992
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05] mb-6">
            Elegance,{' '}
            <span className="italic text-gold">Woven</span>
            <br />
            in Every Stitch
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed mb-10 max-w-lg">
            Discover KAIRA's curated range of premium fabrics and fine leather—
            crafted for the discerning interior designer, architect, and homeowner
            who demands nothing less than perfection.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button to="/materials" variant="primary" size="lg">
              Explore Fabrics
            </Button>
            <Button to="/collections" variant="outline" size="lg">
              View Collections
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap gap-10">
            {[
              { value: '500+', label: 'Fabric Varieties' },
              { value: '30+', label: 'Years Heritage' },
              { value: '60+', label: 'Countries Served' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl text-gold">{stat.value}</p>
                <p className="text-xs text-stone-400 tracking-widest uppercase mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-cream/30 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent animate-pulse" />
      </div>
    </section>
  )
}

export default HeroSection
