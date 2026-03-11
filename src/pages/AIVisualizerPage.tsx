import { useState, useRef } from 'react'

const fabricSwatches = [
  { id: 'gold-velvet',    label: 'Gold Velvet',      hex: '#C5A552', collection: 'Royal Velvet' },
  { id: 'midnight-blue',  label: 'Midnight Blue Silk',hex: '#1A2C5B', collection: 'Silk Heritage' },
  { id: 'ivory-linen',   label: 'Ivory Linen',       hex: '#F5F0E8', collection: 'Linen Masters' },
  { id: 'forest-green',  label: 'Forest Cashmere',   hex: '#2D4A35', collection: 'Cashmere Touch' },
  { id: 'blush-velvet',  label: 'Blush Velvet',      hex: '#D4A0A0', collection: 'Royal Velvet' },
  { id: 'cognac-leather',label: 'Cognac Leather',    hex: '#8B4A2A', collection: 'Italian Leather' },
  { id: 'charcoal-wool', label: 'Charcoal Merino',   hex: '#2C2C2C', collection: 'Contemporary Weave' },
  { id: 'terracotta',    label: 'Terracotta Linen',  hex: '#C4704A', collection: 'Linen Masters' },
  { id: 'emerald',       label: 'Emerald Jacquard',  hex: '#1A5440', collection: 'Contemporary Weave' },
  { id: 'blush-silk',    label: 'Pearl Silk',        hex: '#E8D5C4', collection: 'Silk Heritage' },
  { id: 'cobalt',        label: 'Cobalt Velvet',     hex: '#1A3A6B', collection: 'Royal Velvet' },
  { id: 'sand',          label: 'Sand Cashmere',     hex: '#D4C0A0', collection: 'Cashmere Touch' },
]

const AIVisualizerPage = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFabric, setSelectedFabric] = useState(fabricSwatches[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string)
      setGeneratedImage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string)
      setGeneratedImage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = () => {
    if (!uploadedImage) return
    setIsGenerating(true)
    // Simulate AI generation delay (in a real app this would call an API)
    setTimeout(() => {
      setGeneratedImage(`https://placehold.co/800x600/${selectedFabric.hex.replace('#', '')}/FAF8F5?text=AI+Generated+Preview`)
      setIsGenerating(false)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Page Hero */}
      <div className="bg-charcoal pt-20 pb-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            Powered by AI
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
            AI Interior Visualizer
          </h1>
          <p className="text-stone-400 text-lg max-w-xl">
            Upload a photograph of your space, choose a KAIRA fabric, and let our AI
            generate a photorealistic preview of your transformed interior.
          </p>
        </div>
      </div>

      {/* Tool UI */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid lg:grid-cols-[1fr_360px] gap-10">

          {/* Left: Upload + Result */}
          <div className="space-y-6">
            {/* Step 1: Upload */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-gold text-charcoal text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <h2 className="font-serif text-xl text-charcoal">Upload Your Room</h2>
              </div>
              <div
                className={`border-2 border-dashed transition-colors duration-200 cursor-pointer rounded-none ${
                  uploadedImage
                    ? 'border-gold/40 bg-gold/5'
                    : 'border-stone-300 bg-stone-50 hover:border-gold hover:bg-gold/5'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label="Upload room image"
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded room"
                      className="w-full max-h-[400px] object-contain"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 text-cream text-xs px-2 py-1">
                      Click to change
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-2 border-stone-300 flex items-center justify-center">
                      <svg className="w-7 h-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-stone-500 mb-1">Drag &amp; drop or click to upload</p>
                    <p className="text-stone-400 text-sm">PNG, JPG, WEBP — max 10 MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </div>

            {/* Step 3: Generate & Result */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-gold text-charcoal text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <h2 className="font-serif text-xl text-charcoal">Generate Preview</h2>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!uploadedImage || isGenerating}
                className={`w-full py-4 text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                  !uploadedImage || isGenerating
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-gold text-charcoal hover:bg-gold-dark active:scale-[0.99]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Preview…
                  </>
                ) : (
                  'Generate AI Preview'
                )}
              </button>

              {generatedImage && (
                <div className="mt-6">
                  <p className="text-xs text-stone-400 tracking-widest uppercase mb-3">
                    AI Generated Result — {selectedFabric.label}
                  </p>
                  <div className="relative border border-gold/30">
                    <img
                      src={generatedImage}
                      alt="AI generated interior preview"
                      className="w-full"
                    />
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent p-4">
                      <span className="text-gold text-xs tracking-widest uppercase font-medium">
                        AI Generated Preview
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 border border-charcoal text-charcoal py-2.5 text-xs tracking-widest uppercase hover:bg-charcoal hover:text-cream transition-all">
                      Download
                    </button>
                    <button
                      className="flex-1 border border-stone-300 text-stone-500 py-2.5 text-xs tracking-widest uppercase hover:border-gold hover:text-gold transition-all"
                      onClick={() => setGeneratedImage(null)}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Fabric Selector */}
          <aside>
            <div className="sticky top-28">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-gold text-charcoal text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <h2 className="font-serif text-xl text-charcoal">Select Fabric</h2>
              </div>

              <div className="bg-white border border-stone-200 p-5">
                {/* Selected fabric preview */}
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-stone-100">
                  <div
                    className="w-14 h-14 shrink-0 border border-stone-200"
                    style={{ backgroundColor: selectedFabric.hex }}
                  />
                  <div>
                    <p className="font-medium text-charcoal text-sm">{selectedFabric.label}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{selectedFabric.collection}</p>
                  </div>
                </div>

                {/* Swatch grid */}
                <div className="grid grid-cols-4 gap-2">
                  {fabricSwatches.map((swatch) => (
                    <button
                      key={swatch.id}
                      onClick={() => setSelectedFabric(swatch)}
                      title={swatch.label}
                      className={`aspect-square transition-all duration-200 border-2 ${
                        selectedFabric.id === swatch.id
                          ? 'border-gold scale-110 shadow-md'
                          : 'border-transparent hover:border-stone-400'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  ))}
                </div>

                <p className="text-stone-400 text-xs mt-4 text-center">
                  {fabricSwatches.length} fabrics available
                </p>
              </div>

              {/* Info cards */}
              <div className="mt-6 space-y-3">
                {[
                  { icon: '⚡', title: 'Instant Results', desc: 'AI preview generated in under 5 seconds' },
                  { icon: '🎨', title: '500+ Fabrics', desc: 'Full KAIRA catalogue available' },
                  { icon: '📐', title: 'True-to-scale', desc: 'Fabric textures rendered at real scale' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-4 bg-stone-50 border border-stone-200">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-charcoal text-sm font-medium">{item.title}</p>
                      <p className="text-stone-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default AIVisualizerPage
