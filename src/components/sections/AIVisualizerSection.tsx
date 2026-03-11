import Button from '../ui/Button'

const AIVisualizerSection = () => {
  return (
    <section className="bg-charcoal py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">
              AI-Powered Design
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight mb-6">
              See Your Room,{' '}
              <span className="italic text-gold">Transformed</span>
            </h2>
            <p className="text-stone-300 text-lg leading-relaxed mb-6">
              Upload a photo of your room and our AI instantly generates photorealistic previews
              with any KAIRA fabric applied to your existing furniture—no designer required.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'Upload any room photograph',
                'Choose from 500+ KAIRA fabric textures',
                'Generate photorealistic results in seconds',
                'Download and share with confidence',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-stone-300 text-sm">
                  <span className="text-gold mt-1">→</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button to="/ai-visualizer" variant="primary" size="lg">
              Try AI Visualizer
            </Button>
          </div>

          {/* Right: Before / After placeholders */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="aspect-[3/4] overflow-hidden border border-white/10 relative">
                <img
                  src="https://placehold.co/400x533/2A2520/9C8B7E?text=Before"
                  alt="Room before AI visualization"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 px-3">
                  <p className="text-xs text-cream/80 tracking-widest uppercase">Before</p>
                </div>
              </div>
              <p className="text-stone-500 text-xs text-center">Original Room</p>
            </div>
            <div className="space-y-3 mt-8">
              <div className="aspect-[3/4] overflow-hidden border border-gold/40 relative">
                <img
                  src="https://placehold.co/400x533/3B2A1A/C5A552?text=AI+Generated"
                  alt="Room after AI visualization"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gold/90 py-2 px-3">
                  <p className="text-xs text-charcoal tracking-widest uppercase font-medium">AI Generated</p>
                </div>
              </div>
              <p className="text-stone-400 text-xs text-center">With Royal Velvet</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIVisualizerSection
