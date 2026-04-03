import { useState } from 'react'
import { Link } from 'react-router-dom'

const S3_BG = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/roomBackgrounds/thumbnails/realisticBackgrounds'
const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'

const features = [
  {
    label: 'Any Fabric, Any Room',
    desc: 'Preview 500+ KAIRA fabrics in curated interior scenes.',
  },
  {
    label: 'AI-Powered Rendering',
    desc: 'Photorealistic results in seconds — no design skills needed.',
  },
  {
    label: '3D Product Placement',
    desc: 'Drag curtains, sofas & upholstery to match your layout.',
  },
]

const swatches = [
  { name: 'Midnight Velvet',  color: '#2D1B4E' },
  { name: 'Ivory Linen',      color: '#F0E6D0' },
  { name: 'Slate Weave',      color: '#7B8794' },
  { name: 'Ember Silk',       color: '#B45309' },
  { name: 'Forest Boucle',    color: '#166534' },
  { name: 'Blush Cashmere',   color: '#D4A5A5' },
]

const previewRooms = [
  { id: 'bg-10', label: 'Living Room', src: `${S3_BG}/Large_Background_10.webp` },
  { id: 'bg-12', label: 'Bedroom',     src: `${S3_BG}/Large_Background_12.webp` },
  { id: 'bg-26', label: 'Study',       src: `${S3_BG}/Large_Background_26.webp` },
]

const AIVisualizerSection = () => {
  const [activeRoom, setActiveRoom] = useState(0)

  return (
    <section className="bg-stone-950 text-white py-10 lg:py-20 overflow-hidden border-y border-stone-800">

      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Studio breadcrumb badge */}
        <div className="hidden md:flex items-center gap-2 mb-6 lg:mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552]" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-medium">Kaira</span>
          <span className="text-stone-700 text-xs">›</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A552] font-medium">AI Interior Studio</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-center">

          {/* ── LEFT: Copy + Features + CTAs ── */}
          <div>
            <p className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-stone-600 mb-3">New Feature</p>
            <h2 className="font-serif text-2xl md:text-4xl lg:text-[42px] text-white leading-[1.15] mb-4 md:mb-5">
              Visualize Fabrics<br />
              <span className="text-[#C5A552]">In Your Space</span>
            </h2>
            <p className="hidden md:block text-stone-400 text-sm leading-relaxed mb-6 lg:mb-10 max-w-[420px]">
              The KAIRA AI Interior Studio places any fabric into real room scenes
              so you know exactly how it looks before you order a single metre.
            </p>

            {/* Feature list */}
            <div className="space-y-3 md:space-y-4 mb-5 md:mb-6 lg:mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-center md:items-start gap-3 md:gap-4">
                  <div className="shrink-0 mt-0.5 w-6 h-6 md:w-7 md:h-7 rounded-full border border-[#C5A552]/30 bg-[#C5A552]/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552]" />
                  </div>
                  <div>
                    <p className="text-white text-xs md:text-sm font-semibold tracking-wide">{f.label}</p>
                    <p className="hidden md:block text-stone-500 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Swatch strip */}
            <div className="hidden md:block mb-6 lg:mb-10">
              <p className="text-[9px] uppercase tracking-[0.2em] text-stone-600 mb-3">Sample Fabrics</p>
              <div className="flex items-center gap-2.5 flex-wrap">
                {swatches.map((s) => (
                  <div key={s.name} title={s.name} className="group relative">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-stone-700 group-hover:border-[#C5A552] transition-all duration-200 cursor-pointer shadow-md group-hover:scale-110"
                      style={{ backgroundColor: s.color, boxShadow: s.color === '#F0E6D0' ? 'inset 0 0 0 1px #78716c' : undefined }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-stone-800 border border-stone-700 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {s.name}
                    </div>
                  </div>
                ))}
                <span className="text-[10px] text-stone-600 ml-1">+494 more</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/ai-visualizer"
                className="inline-flex items-center gap-2.5 px-7 py-3 bg-[#C5A552] text-stone-900 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#d4b86a] transition-colors duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Launch Studio
              </Link>
              <Link
                to="/3d-visualizer"
                className="inline-flex items-center gap-2 px-7 py-3 border border-stone-700 text-stone-400 text-xs font-bold uppercase tracking-[0.15em] hover:border-stone-500 hover:text-white transition-colors duration-200"
              >
                Try 3D Viewer
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Studio UI Mockup ── */}
          <div className="relative">

            {/* Floating swatch dots — left edge */}
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2.5 z-10">
              {['#2D1B4E', '#B45309', '#7B8794', '#166534', '#F0E6D0'].map((c) => (
                <div
                  key={c}
                  className="w-6 h-6 rounded-full border-2 border-stone-800 shadow-lg hover:scale-125 transition-transform cursor-pointer"
                  style={{ backgroundColor: c, boxShadow: c === '#F0E6D0' ? 'inset 0 0 0 1px #78716c' : undefined }}
                />
              ))}
            </div>

            {/* Studio window frame */}
            <div className="rounded-2xl border border-stone-700/60 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] bg-stone-900">

              {/* Title bar */}
              <div className="h-9 bg-stone-800/90 border-b border-stone-700/50 flex items-center px-3.5 gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-600/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-600/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-600/80" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 bg-stone-900/70 border border-stone-700/40 px-3 py-1 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552]" />
                    <span className="text-[9px] text-stone-400 tracking-[0.15em] uppercase">AI Interior Studio</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-stone-500 tracking-wide">Ready</span>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-950">
                {previewRooms.map((room, i) => (
                  <img
                    key={room.id}
                    src={room.src}
                    alt={room.label}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === activeRoom ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}

                {/* AI Rendered badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-[#C5A552]/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552] animate-pulse" />
                  <span className="text-[9px] text-[#C5A552] uppercase tracking-wider font-medium">AI Rendered</span>
                </div>

                {/* Fabric chip */}
                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm border border-stone-700/60 px-3 py-2 rounded-lg shadow-xl flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md overflow-hidden border border-stone-600/50 shrink-0 bg-stone-700">
                    <img
                      src={`${S3_THUMB}/APEX/APEX-B001.webp`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white uppercase tracking-wider">Royal Velvet</p>
                    <p className="text-[8px] text-stone-400">Midnight Collection</p>
                  </div>
                </div>
              </div>

              {/* Scene selector strip */}
              <div className="bg-stone-800/70 border-t border-stone-700/50 px-3.5 py-2.5 flex items-center gap-2 overflow-x-auto">
                <p className="text-[8px] uppercase tracking-[0.18em] text-stone-600 shrink-0 mr-2">Scene:</p>
                {previewRooms.map((room, i) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(i)}
                    className={`text-[9px] px-3 py-1 rounded-md transition-all duration-200 border ${
                      i === activeRoom
                        ? 'bg-[#C5A552]/15 text-[#C5A552] border-[#C5A552]/30'
                        : 'text-stone-500 hover:text-stone-300 border-transparent hover:border-stone-700'
                    }`}
                  >
                    {room.label}
                  </button>
                ))}

                {/* Material mini-grid teaser */}
                <div className="ml-auto hidden sm:flex items-center gap-1.5 shrink-0">
                  {['#2D1B4E', '#B45309', '#7B8794', '#166534'].map((c) => (
                    <div key={c} className="w-4 h-4 rounded-sm border border-stone-700" style={{ backgroundColor: c }} />
                  ))}
                  <span className="text-[8px] text-stone-600 ml-1">500+</span>
                </div>
              </div>
            </div>

            {/* Before/After strip below the frame */}
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl overflow-hidden border border-stone-800">
              <div className="relative overflow-hidden">
                <img
                  src="https://supoassets.s3.ap-south-1.amazonaws.com/public/stich/Before.jpg"
                  alt="Before"
                  className="w-full h-20 object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold">Before</span>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <img
                  src="https://supoassets.s3.ap-south-1.amazonaws.com/public/stich/after.jpg"
                  alt="After"
                  className="w-full h-20 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                  <span className="text-[8px] uppercase tracking-widest text-[#C5A552] font-bold">After — AI</span>
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
