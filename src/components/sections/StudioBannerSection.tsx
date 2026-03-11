import Button from '../ui/Button'

const StudioBannerSection = () => {
  return (
    <section className="bg-charcoal py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">
              Exclusive Feature
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight mb-6">
              Visualize Fabrics in{' '}
              <span className="text-gold italic">3D</span>
            </h2>
            <p className="text-stone-300 text-lg leading-relaxed mb-4">
              Our industry-first 3D Visualization Studio lets you preview how KAIRA fabrics
              will look on real furniture models—before you order a single metre.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'Rotate and zoom on real-time 3D furniture models',
                'Swap fabrics across 20+ furniture shapes instantly',
                'Share photorealistic renders with your clients',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-stone-400 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button to="/3d-visualizer" variant="primary" size="lg">
              Try Our Visualizer
            </Button>
          </div>

          {/* Visual placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] relative overflow-hidden border border-white/10">
              <img
                src="https://placehold.co/800x600/1C1917/C5A552?text=3D+Fabric+Visualization+Studio"
                alt="3D Fabric Visualization Studio"
                className="w-full h-full object-cover"
              />
              {/* Overlay badge */}
              <div className="absolute top-5 right-5 bg-gold text-charcoal px-3 py-1.5 text-xs tracking-widest uppercase font-medium">
                Live 3D Preview
              </div>
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold" />
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-5 -left-5 bg-stone-900 border border-white/10 p-5 shadow-2xl">
              <p className="font-serif text-gold text-2xl">200+</p>
              <p className="text-cream/50 text-xs tracking-widest uppercase mt-0.5">
                Fabric selections
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StudioBannerSection
