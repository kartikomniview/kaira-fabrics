import Button from '../ui/Button'

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-stretch bg-white">
      {/* Left: Content */}
      <div className="flex-1 flex items-center px-8 lg:px-16 xl:px-24 pt-24 pb-16">
        <div className="max-w-xl w-full">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-gold" />
            <span className="text-xs tracking-[0.25em] uppercase text-stone-400 font-medium">
              Premium Textile Manufacturer Since 1992
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 leading-[1.1] mb-6">
            Textile Solutions<br />
            for Design<br />
            Professionals
          </h1>

          {/* Subtext */}
          <p className="text-stone-500 text-lg leading-relaxed mb-10 max-w-md">
            KAIRA supplies premium fabrics and fine leather to interior designers,
            architects, and project specifiers across 60+ countries.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-14">
            <Button to="/materials" variant="primary" size="lg">
              Browse Fabrics
            </Button>
            <Button to="/collections" variant="secondary" size="lg">
              View Collections
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-stone-100">
            {[
              { value: '500+', label: 'Fabric Varieties' },
              { value: '30+', label: 'Years Heritage' },
              { value: '60+', label: 'Countries Served' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-400 tracking-widest uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden lg:block lg:w-[52%] relative bg-stone-100">
        <img
          src="https://placehold.co/1000x1000/EDE9E4/74623C?text=KAIRA+Textiles"
          alt="KAIRA premium textiles"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
      </div>
    </section>
  )
}

export default HeroSection
