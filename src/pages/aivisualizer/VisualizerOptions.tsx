import { Link } from 'react-router-dom'

const BG_BEFORE_IMG = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/before_v2.webp'
const BG_AFTER_IMG = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/after_v2.webp'

/** Landing banner for /ai-visualizer — the studio itself lives at /ai-visualizer/studio (VisualizerStudioPage). */
const VisualizerOptions = () => {
  return (
    <div
      className="relative flex flex-col w-full min-h-svh"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle, #97c41e 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* ── 3D Visualizer Banner ── */}
      <div
        className="relative overflow-hidden w-full min-h-svh flex flex-col pt-20 lg:pt-24"
      >
        {/* Background — before (left half) / after (right half) */}
        {/* Blurred fill so the zoomed-out images have no empty edges */}
        <img src={BG_AFTER_IMG} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl" draggable={false} />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full lg:w-[85%]">
          <img src={BG_AFTER_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          <img
            src={BG_BEFORE_IMG}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
            draggable={false}
          />
        </div>

        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-secondary-dark/60" />

        {/* Go back — in flow (not absolute) so it can never overlap the content on short screens */}
        <button
          onClick={() => window.history.back()}
          className="group relative z-20 self-start ml-5 sm:ml-8 lg:ml-10 py-1 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-[11px] font-medium tracking-wide uppercase"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Go Back</span>
        </button>

        {/* Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl px-5 sm:px-10 pt-6 pb-10 sm:py-16 [@media(max-height:500px)]:py-6 flex flex-col items-center text-center gap-4 sm:gap-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-secondary text-white px-3 sm:px-4 py-1.5 sm:py-2 shadow-md w-fit">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Interactive 3D</span>
            </div>
            <div className="flex items-center gap-2 bg-primary color-secondary-dark px-3 sm:px-4 py-1.5 sm:py-2 shadow-md w-fit">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">AI Rendering Built In</span>
            </div>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            See Your <span className="text-primary">Fabric</span> Come to Life
          </h2>

          <p className="text-[13px] sm:text-sm text-white/80 font-light leading-relaxed">
            Rotate, zoom and inspect every weave on real furniture in interactive 3D. Like what you see? Turn that exact fabric and product into a photorealistic AI room render without leaving the studio or picking anything again.
          </p>

          {/* Check marks instead of · separators, so wrapping never leaves a dangling dot */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-1">
            {['360° Rotation', 'Real Fabric Detail', 'One-Tap AI Render'].map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/70 tracking-wide uppercase whitespace-nowrap">
                <svg className="w-3 h-3 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </span>
            ))}
          </div>

          <Link
            to="/ai-visualizer/studio"
            className="group mt-4 sm:mt-5 w-full max-w-xs sm:max-w-none sm:w-fit flex items-center justify-center gap-2.5 px-7 sm:px-10 py-4 sm:py-5 bg-primary color-secondary-dark font-black uppercase tracking-wider text-xs sm:text-sm shadow-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <span>Start Visualizing</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        </div>
      </div>

    </div>
  )
}

export default VisualizerOptions
