import Button from '../ui/Button'

const FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    title: 'Real-Time Preview',
    desc: 'Apply fabrics to 3D furniture models and see instant results.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    title: 'True-to-Life Textures',
    desc: 'Accurate grain, sheen, and drape — exactly as it looks in person.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
    title: '500+ Fabric Varieties',
    desc: 'Explore the full Kaira collection mapped across dozens of models.',
  },
]

const StudioBannerSection = () => {
  return (
    <section className="relative bg-stone-950 overflow-hidden">
      {/* Fabric texture underlay */}
      <div className="absolute inset-0 opacity-[0.035] bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')]" />
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-amber-400/50" />
            <p className="text-[10px] tracking-[0.32em] font-semibold text-amber-400/80 uppercase">3D Studio</p>
            <span className="w-8 h-px bg-amber-400/50" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-5 leading-[1.1]">
            See It Before You <em className="not-italic text-amber-100/90">Commit</em>
          </h2>
          <p className="text-stone-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Apply our premium fabrics to furniture models in real time and explore how
            textures transform your designs before making a decision.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-800 border border-stone-800 mb-14">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="p-8 lg:p-10 flex flex-col gap-4 group hover:bg-white/[0.02] transition-colors duration-300">
              <div className="w-12 h-12 flex items-center justify-center border border-stone-700 text-amber-400/70 group-hover:border-amber-400/40 group-hover:text-amber-300 transition-colors duration-300">
                {feature.icon}
              </div>
              <div>
                <p className="text-white text-sm font-semibold tracking-wide mb-2">{feature.title}</p>
                <p className="text-stone-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/3d-visualizer" variant="secondary" size="lg">
            Launch 3D Studio
          </Button>
          <a
            href="/ai-visualizer"
            className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200 tracking-wide"
          >
            Or try our AI Visualizer
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}

export default StudioBannerSection
