import Button from '../ui/Button'

const steps = [
  { n: '01', label: 'Upload Room' },
  { n: '02', label: 'Pick Fabric' },
  { n: '03', label: 'AI Renders' },
]

const AIVisualizerSection = () => {
  return (
    <section className="bg-white py-12 lg:py-16 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-stone-900">
            AI-Powered Room <span className="text-secondary font-medium">Visualization</span>
          </h2>
          <p className="mt-2 text-stone-400 text-xs md:text-sm max-w-lg mx-auto tracking-wide leading-relaxed">
            See any KAIRA fabric in your actual room before you buy.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
            <span className="w-1 h-1 rotate-45 bg-secondary inline-block" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
          </div>
        </div>

        {/* Main visual block */}
        <div className="grid lg:grid-cols-5 gap-6 items-stretch">

          {/* Before image */}
          <div className="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-md border border-stone-200">
            <img
              src="https://supoassets.s3.ap-south-1.amazonaws.com/public/stich/Before.jpg"
              alt="Original room"
              className="w-full h-full object-cover min-h-[320px] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-bold text-stone-700 shadow-sm rounded">
              Your Room
            </div>
          </div>

          {/* Middle: Steps + CTA */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center gap-6 py-6">
            {steps.map((s, i) => (
              <div key={s.n} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
                  {s.n}
                </div>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider text-center">{s.label}</p>
                {i < steps.length - 1 && <div className="w-px h-6 bg-stone-200" />}
              </div>
            ))}
            <div className="mt-4 flex flex-col gap-3 w-full">
              <Button to="/ai-visualizer" variant="secondary" size="md">Try AI</Button>
              <Button to="/3d-visualizer" variant="outline" size="md">Try 3D</Button>
            </div>
          </div>

          {/* After image */}
          <div className="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-lg border-2 border-secondary/30">
            <img
              src="https://supoassets.s3.ap-south-1.amazonaws.com/public/stich/after.jpg"
              alt="AI rendered room"
              className="w-full h-full object-cover min-h-[320px] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-bold shadow-sm rounded">
              AI Rendered
            </div>
            {/* Fabric chip overlay */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md flex items-center gap-2">
              <div className="w-5 h-5 rounded-sm bg-stone-400" />
              <div>
                <p className="text-[9px] font-bold text-stone-800 uppercase tracking-wide">Royal Velvet</p>
                <p className="text-[8px] text-stone-400">Midnight — #1A0A2E</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIVisualizerSection
