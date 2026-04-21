import { useRef, useState, useCallback } from 'react'

const BEFORE_IMG = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/before.webp'
const AFTER_IMG  = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/after.webp'

export function BeforeAfterSlider() {
  const [pos, setPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100))
    setPos(pct)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    e.preventDefault()
    const onMove = (ev: MouseEvent) => { if (dragging.current) updatePos(ev.clientX) }
    const onUp   = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTouchStart = () => { dragging.current = true }
  const onTouchMove  = (e: React.TouchEvent) => { if (dragging.current) updatePos(e.touches[0].clientX) }
  const onTouchEnd   = () => { dragging.current = false }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)] select-none cursor-col-resize"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* After image (base layer — right side) */}
      <img src={AFTER_IMG} alt="After" className="w-full h-auto object-cover block" loading="lazy" draggable={false} />

      {/* Before image (clipped on left) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={BEFORE_IMG} alt="Before" className="w-full h-full object-cover block" loading="lazy" draggable={false} />

        {/* Fabric thumbnail */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2.5 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg pointer-events-none">
          <img
            src="https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics/Adelaide/16.webp"
            alt="Fabric sample"
            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-stone-200"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold">Fabric Applied</span>
            <span className="text-[11px] font-bold text-stone-700">See the change →</span>
          </div>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-bold text-white bg-black/45 px-2.5 py-1 rounded-full pointer-events-none">Before</span>
      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-bold text-white bg-black/45 px-2.5 py-1 rounded-full pointer-events-none">After</span>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-[2px] bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.4)] pointer-events-none"
        style={{ left: `calc(${pos}% - 1px)` }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-[0_2px_16px_rgba(0,0,0,0.28)] flex items-center justify-center z-10 touch-none"
        style={{ left: `${pos}%` }}
        onMouseDown={onMouseDown}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 5l-4 5 4 5M13 5l4 5-4 5" stroke="#78716c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
