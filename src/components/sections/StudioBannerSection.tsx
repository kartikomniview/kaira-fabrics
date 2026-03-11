import Button from '../ui/Button'

const StudioBannerSection = () => {
  return (
    <section className="bg-stone-50 py-14 lg:py-20 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-gold" />
              <span className="text-xs tracking-[0.25em] uppercase text-stone-400 font-medium">3D Visualization Studio</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight mb-4">
              Preview Fabrics in 3D<br />Before You Order
            </h2>
            <p className="text-stone-500 text-base leading-relaxed mb-8">
              Our 3D Visualization Studio lets you preview how KAIRA fabrics
              will look on real furniture models—eliminating guesswork and reducing sample costs.
            </p>
            <ul className="space-y-0 mb-10">
              {[
                { num: '01', text: 'Real-time rotation and zoom on 3D furniture models' },
                { num: '02', text: 'Instant fabric swaps across 20+ furniture shapes' },
                { num: '03', text: 'Export photorealistic renders for client presentations' },
              ].map((feature) => (
                <li key={feature.num} className="flex items-start gap-5 py-4 border-t border-stone-200 last:border-b">
                  <span className="text-xs font-bold text-gold tracking-wider shrink-0 pt-0.5">{feature.num}</span>
                  <span className="text-stone-500 text-sm leading-relaxed">{feature.text}</span>
                </li>
              ))}
            </ul>
            <Button to="/3d-visualizer" variant="primary" size="md">
              Launch Visualizer
            </Button>
          </div>

          {/* Visual */}
          <div>
            <div className="aspect-[4/3] relative overflow-hidden bg-white border border-stone-200">
              <img
                src="https://placehold.co/800x600/EDE9E4/74623C?text=3D+Fabric+Visualization"
                alt="3D Fabric Visualization Studio"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white border border-stone-200 px-3 py-1.5 shadow-sm">
                <span className="text-xs tracking-widest uppercase text-stone-600 font-medium">Live Preview</span>
              </div>
            </div>
            {/* Stats bar */}
            <div className="bg-white border border-t-0 border-stone-200 flex divide-x divide-stone-200">
              {[
                { value: '200+', label: 'Fabric Options' },
                { value: '20+', label: 'Furniture Shapes' },
                { value: '100%', label: 'Real-Time' },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 px-5 py-4">
                  <p className="font-serif text-xl font-bold text-stone-900">{stat.value}</p>
                  <p className="text-xs text-stone-400 tracking-wider uppercase mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StudioBannerSection
