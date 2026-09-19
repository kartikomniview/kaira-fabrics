/**
 * Former "choose your experience" cards (AI Visualizer + 3D Studio) from VisualizerOptions.
 * Superseded by a single 3D Visualizer banner (AI rendering now lives inside the 3D Studio
 * itself), kept here for reference / in case the two-card layout is wanted again.
 */
interface VisualizerOptionsCardsOldUIProps {
  onOpen: (mode: 'ai' | '3d', e: React.MouseEvent) => void
}

const VisualizerOptionsCardsOldUI = ({ onOpen }: VisualizerOptionsCardsOldUIProps) => {
  return (
    <div className="relative z-10 max-w-6xl mx-auto w-full px-2 sm:px-8 pb-8 mt-6">
      <p className="text-center text-[11px] color-secondary-dark uppercase tracking-[0.3em] font-semibold mb-8">
        Choose Your Experience
      </p>

      <div className="flex flex-col gap-4 lg:gap-5">

        {/* ── AI Visualizer Banner ── */}
        <div data-card className="flex flex-col sm:flex-row sm:h-[220px] lg:h-[240px] overflow-hidden bg-white ring-1 ring-stone-200 shadow-sm mx-4 sm:mx-0">

          {/* Image */}
          <div className="relative h-[220px] sm:h-auto w-full sm:w-[230px] lg:w-[310px] shrink-0">
            <img
              src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/after.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* mobile: fade bottom → desktop: fade right */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 sm:hidden" />
            <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-transparent via-white/10 to-white" />
            {/* tag */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 bg-primary color-secondary-dark px-3 sm:px-4 py-1.5 sm:py-2 shadow-md z-10">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">AI Visualizer</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 flex flex-col justify-center px-4 pt-4 pb-2 sm:px-7 sm:py-6 lg:px-8 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.35em] uppercase text-primary mb-1.5 sm:mb-3">
              Generative AI · Fabric Preview
            </p>
            <h2 className="font-serif text-xl sm:text-3xl lg:text-[2.25rem] color-secondary-dark leading-tight mb-1.5 sm:mb-3">
              AI Visualizer
            </h2>
            <p className="text-[11px] sm:text-[12px] color-secondary-dark font-light leading-relaxed hidden sm:block max-w-xs">
              AI-powered visualization that adapts to every style.
            </p>
            <div className="hidden sm:flex items-center gap-2 mt-3">
              {['Browse Inventory', 'Upload Fabric', 'AI Preview'].map((f, i) => (
                <span key={f} className="flex items-center gap-2">
                  <span className="text-[9px] color-secondary-dark tracking-wide">{f}</span>
                  {i < 2 && <span className="color-secondary-dark text-xs select-none">·</span>}
                </span>
              ))}
            </div>
            {/* mobile CTA — full width, inside text section */}
            <button
              onClick={(e) => onOpen('ai', e)}
              className="sm:hidden mt-3 mb-1 w-full flex items-center justify-center gap-2.5 py-3 bg-primary color-secondary-dark font-black uppercase tracking-wider text-[10px] shadow-md active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch AI Visualizer
            </button>
          </div>

          {/* Desktop-only right CTA */}
          <div className="hidden sm:flex shrink-0 items-center px-5 sm:px-6 lg:px-8 border-l border-stone-100">
            <button
              onClick={(e) => onOpen('ai', e)}
              className="flex items-center gap-3 px-5 sm:px-7 py-3.5 sm:py-4 bg-primary color-secondary-dark font-black uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Launch AI Visualizer</span>
            </button>
          </div>
        </div>

        {/* ── 3D Engine Banner ── */}
        <div data-card className="flex flex-col sm:flex-row sm:h-[220px] lg:h-[240px] overflow-hidden bg-white ring-1 ring-stone-200 shadow-sm mx-4 sm:mx-0">

          {/* Image */}
          <div className="relative h-[220px] sm:h-auto w-full sm:w-[230px] lg:w-[310px] shrink-0">
            <img
              src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/ThreeDEngine.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 sm:hidden" />
            <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-transparent via-white/10 to-white" />
            {/* tag */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 bg-secondary text-white px-3 sm:px-4 py-1.5 sm:py-2 shadow-md z-10">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">3D Engine</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 flex flex-col justify-center px-4 pt-4 pb-2 sm:px-7 sm:py-6 lg:px-8 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.35em] uppercase text-secondary mb-1.5 sm:mb-3">
              Interactive 3D · Real-time
            </p>
            <h2 className="font-serif text-xl sm:text-3xl lg:text-[2.25rem] color-secondary-dark leading-tight mb-1.5 sm:mb-3">
              3D Studio
            </h2>
            <p className="text-[11px] sm:text-[12px] color-secondary-dark font-light leading-relaxed hidden sm:block max-w-xs">
              Explore fabrics in an immersive 3D environment. Rotate, zoom and inspect every weave in detail.
            </p>
            <div className="hidden sm:flex items-center gap-2 mt-3">
              {['360° Rotation', 'Real-time Preview', 'Finish Options'].map((f, i) => (
                <span key={f} className="flex items-center gap-2">
                  <span className="text-[9px] color-secondary-dark tracking-wide">{f}</span>
                  {i < 2 && <span className="color-secondary-dark text-xs select-none">·</span>}
                </span>
              ))}
            </div>
            {/* mobile CTA */}
            <button
              onClick={(e) => onOpen('3d', e)}
              className="sm:hidden mt-3 mb-1 w-full flex items-center justify-center gap-2.5 py-3 bg-secondary text-white font-black uppercase tracking-wider text-[10px] shadow-md active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Explore 3D Studio
            </button>
          </div>

          {/* Desktop-only right CTA */}
          <div className="hidden sm:flex shrink-0 items-center px-5 sm:px-6 lg:px-8 border-l border-stone-100">
            <button
              onClick={(e) => onOpen('3d', e)}
              className="flex items-center gap-3 px-5 sm:px-7 py-3.5 sm:py-4 bg-secondary text-white font-black uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Explore 3D Studio</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default VisualizerOptionsCardsOldUI
