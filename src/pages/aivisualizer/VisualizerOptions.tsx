import { useState, useCallback, useRef, useEffect } from 'react'
import AiVisualizerEngine from './AiVisualizerEngine'
import ThreeDVisualizerEngine, { type SelectedMaterial } from '../threedvisualizer/ThreeDVisualizerEngine'
import ThreeDVisualizerPageMobile from '../ThreeDVisualizerPageMobile'
import { kairaProducts } from '../../data/products'
import type { KairaProduct } from '../../data/products'

type Mode = 'ai' | '3d' | null

interface OriginRect {
  top: number
  left: number
  width: number
  height: number
}

const VisualizerOptions = () => {
  const [mode, setMode] = useState<Mode>(null)
  const [originRect, setOriginRect] = useState<OriginRect | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const [currentProduct, setCurrentProduct] = useState<KairaProduct>(
    kairaProducts.find((p) => p.product_name === 'Luna') ?? kairaProducts[0]
  )
  const [selected3d, setSelected3d] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  const [isEngineReady, setIsEngineReady] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const engineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkIsMobile = () => {
    const isTouch = navigator.maxTouchPoints > 0
    const isPortrait = window.innerHeight > window.innerWidth
    return window.innerWidth < 1024 || (isTouch && isPortrait)
  }

  const [isMobile, setIsMobile] = useState(checkIsMobile)
  useEffect(() => {
    const handler = () => setIsMobile(checkIsMobile())
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])

  const handleOpen = useCallback((selected: Mode, e: React.MouseEvent) => {
    const card = (e.currentTarget as HTMLElement).closest('[data-card]') as HTMLElement | null
    const el = card ?? (e.currentTarget as HTMLElement)
    const r = el.getBoundingClientRect()
    setOriginRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    setMode(selected)
    setIsEngineReady(false)
    setIsVisible(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true)
        if (engineTimerRef.current) clearTimeout(engineTimerRef.current)
        engineTimerRef.current = setTimeout(() => setIsEngineReady(true), 1500)
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    if (engineTimerRef.current) clearTimeout(engineTimerRef.current)
    setTimeout(() => {
      setIsVisible(false)
      setMode(null)
      setOriginRect(null)
      setIsEngineReady(false)
      setIsClosing(false)
    }, 600)
  }, [])

  const handleGoBack = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => handleClose(), 600)
  }, [handleClose])

  const overlayStyle: React.CSSProperties = originRect
    ? {
      position: 'fixed',
      top: isOpen ? 0 : originRect.top,
      left: isOpen ? 0 : originRect.left,
      width: isOpen ? '100vw' : originRect.width,
      height: isOpen ? '100vh' : originRect.height,
      borderRadius: isOpen ? '0px' : '24px',
      transition: [
        'top 0.44s cubic-bezier(0.4,0,0.2,1)',
        'left 0.44s cubic-bezier(0.4,0,0.2,1)',
        'width 0.44s cubic-bezier(0.4,0,0.2,1)',
        'height 0.44s cubic-bezier(0.4,0,0.2,1)',
        'border-radius 0.44s cubic-bezier(0.4,0,0.2,1)',
      ].join(', '),
      overflow: 'hidden',
      zIndex: 9998,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
    }
    : { display: 'none' }

  const contentStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    transition: `opacity 0.22s ease ${isOpen ? '0.28s' : '0s'}`,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  }

  const closeStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    transition: `opacity 0.22s ease ${isOpen ? '0.32s' : '0s'}`,
    pointerEvents: isOpen ? 'auto' : 'none',
  }

  return (
    <div
      className="relative flex flex-col w-full min-h-screen"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle, #97c41e 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* ── 3D Visualizer Banner ── */}
      <div
        data-card
        className="relative overflow-hidden w-full min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/ThreeDEngine.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-secondary-dark/60" />

        {/* Go back */}
        <button
          onClick={() => window.history.back()}
          className="group absolute top-20 lg:top-24 left-5 sm:left-8 lg:left-10 z-20 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-[11px] font-medium tracking-wide uppercase"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Go Back</span>
        </button>

        {/* Content */}
        <div className="relative z-10 w-full max-w-2xl px-5 sm:px-10 py-16 flex flex-col items-center text-center gap-4 sm:gap-5">
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

          <p className="text-[12px] sm:text-sm text-white/75 font-light leading-relaxed">
            Rotate, zoom and inspect every weave on real furniture in interactive 3D. Like what you see? Turn that exact fabric and product into a photorealistic AI room render without leaving the studio or picking anything again.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-1">
            {['360° Rotation', 'Real Fabric Detail', 'One-Tap AI Render'].map((f, i, arr) => (
              <span key={f} className="flex items-center gap-3">
                <span className="text-[10px] sm:text-[11px] text-white/70 tracking-wide uppercase">{f}</span>
                {i < arr.length - 1 && <span className="text-white/30 text-xs select-none">·</span>}
              </span>
            ))}
          </div>

          <button
            onClick={(e) => handleOpen('3d', e)}
            className="group mt-4 sm:mt-5 w-full sm:w-fit flex items-center justify-center gap-2.5 px-7 sm:px-10 py-4 sm:py-5 bg-primary color-secondary-dark font-black uppercase tracking-wider text-xs sm:text-sm shadow-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <span>Start Visualizing</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Expanding Overlay ── */}
      {isVisible && (
        <>
          {/* Expanding panel */}
          <div style={overlayStyle}>

            {/* ── Closing loader ── */}
            {isClosing && (
              <div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white"
                style={{ animation: 'kaira-exit-fade 0.2s ease forwards' }}
              >
                <div className="w-10 h-10 border-2 border-stone-200 border-t-secondary-dark rounded-full animate-spin mb-4" />
                <p className="color-secondary-dark text-[12px] font-bold tracking-[0.3em] uppercase">Closing</p>
              </div>
            )}

            {/* ── Overlay Header ── */}
            <div
              style={closeStyle}
              className="h-12 shrink-0 bg-secondary-dark border-b border-stone-800 flex items-center px-5 gap-4"
            >
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-2 h-8 px-3.5 bg-white border border-white/20 hover:bg-white/80 hover:border-white/100 color-secondary-dark transition-all"
              >
                <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Go Back</span>
              </button>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isEngineReady ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                <span className="text-[11px] text-white font-bold tracking-[0.2em] uppercase">
                  {mode === 'ai' ? 'AI Visualizer' : '3D Fabric Studio'}
                </span>
              </div>
            </div>

            <div style={contentStyle}>
              {/* Loader — shown until engine is ready */}
              {!isEngineReady && (
                <div className="flex flex-col items-center justify-center min-h-screen gap-5 bg-white">
                  <div className={`w-14 h-14 flex items-center justify-center mb-1 ${mode === '3d' ? 'bg-secondary-dark' : 'bg-primary/10 border border-primary/20'}`}>
                    {mode === 'ai' ? (
                      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div className="w-9 h-9 border-2 border-stone-100 border-t-secondary-dark rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-[10px] color-secondary-dark uppercase tracking-[0.35em] font-semibold">Preparing</p>
                    <p className="text-2xl font-serif color-secondary-dark mt-1.5">
                      {mode === 'ai' ? 'AI Visualizer' : '3D Studio'}
                    </p>
                    <p className="text-[11px] color-secondary-dark mt-2 font-light tracking-wide">
                      {mode === 'ai' ? 'Loading fabric inventory…' : 'Initialising 3D engine…'}
                    </p>
                  </div>
                </div>
              )}

              {/* AI engine */}
              {isEngineReady && mode === 'ai' && <AiVisualizerEngine />}

              {/* 3D engine */}
              {isEngineReady && mode === '3d' && isMobile && (
                <ThreeDVisualizerPageMobile embedded />
              )}
              {isEngineReady && mode === '3d' && !isMobile && (
                <div className="flex flex-col bg-stone-50 font-sans h-full">
                  {/* Studio sub-toolbar — product / texture / status only (branding is in the overlay header) */}
                  <div style={{ display: "none" }} className="h-10 shrink-0 bg-stone-800 border-b border-stone-700 flex items-center px-5 gap-3">
                    <div className="flex items-center gap-2 bg-stone-700/60 border border-stone-600 px-3 py-1 ">
                      <svg className="w-3 h-3 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-[10px] color-secondary-dark font-medium tracking-[0.1em] uppercase">{currentProduct.product_name}</span>
                    </div>
                    <div className="flex-1" />
                    {selected3d && (
                      <div className="flex items-center gap-2 bg-stone-700/60 border border-stone-600 px-3 py-1 ">
                        <img
                          src={selected3d.textureUrl}
                          alt=""
                          className="w-4 h-4 object-cover border border-stone-600 shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                        <span className="text-[10px] color-secondary-dark font-medium tracking-wide truncate max-w-[160px]">{selected3d.fabricName}</span>
                        {isApplying && (
                          <div className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${modelLoaded ? 'bg-emerald-500' : 'bg-stone-400 animate-pulse'}`} />
                      <span className="text-[10px] color-secondary-dark font-bold tracking-[0.2em] uppercase">{modelLoaded ? 'Ready' : 'Loading'}</span>
                    </div>
                  </div>
                  <ThreeDVisualizerEngine
                    currentProduct={currentProduct}
                    setCurrentProduct={setCurrentProduct}
                    selected={selected3d}
                    setSelected={setSelected3d}
                    isApplying={isApplying}
                    setIsApplying={setIsApplying}
                    modelLoaded={modelLoaded}
                    setModelLoaded={setModelLoaded}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default VisualizerOptions
