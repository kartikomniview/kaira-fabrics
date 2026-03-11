import Button from '../ui/Button'

const AIVisualizerSection = () => {
  return (
    <section className="bg-white py-14 lg:py-20 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-gold" />
              <span className="text-xs tracking-[0.25em] uppercase text-stone-400 font-medium">AI-Powered Design Tool</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight mb-4">
              See Your Space With<br />KAIRA Fabrics Applied
            </h2>
            <p className="text-stone-500 text-base leading-relaxed mb-8">
              Upload a photograph of your space and our AI generates photorealistic previews
              with KAIRA fabrics applied to your existing furniture.
              Present results to clients with confidence.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                'Upload any room photograph',
                'Select from 500+ KAIRA fabric textures',
                'Receive photorealistic results in seconds',
                'Download and present directly to clients',
              ].map((feature, i) => (
                <li key={feature} className="flex items-center gap-4">
                  <span className="w-6 h-6 shrink-0 bg-gold/10 border border-gold/40 flex items-center justify-center text-[10px] font-bold text-charcoal">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-stone-500 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button to="/ai-visualizer" variant="primary" size="md">
              Try AI Visualizer
            </Button>
          </div>

          {/* Right: Before / After */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="aspect-[3/4] overflow-hidden bg-stone-100 border border-stone-200 relative">
                <img
                  src="https://placehold.co/400x533/EAE8E5/9C8B7E?text=Before"
                  alt="Room before AI visualization"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-stone-200 py-2 px-3">
                  <p className="text-xs text-stone-600 tracking-widest uppercase font-medium">Original</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="aspect-[3/4] overflow-hidden bg-stone-100 border border-gold/40 relative">
                <img
                  src="https://placehold.co/400x533/E5EDDB/74623C?text=AI+Result"
                  alt="Room with AI visualization applied"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gold/10 border-t border-gold/30 py-2 px-3">
                  <p className="text-xs text-charcoal tracking-widest uppercase font-medium">AI Result</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIVisualizerSection
