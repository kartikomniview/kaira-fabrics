import { useState, useCallback, useRef, useEffect } from 'react'
import AiVisualizerEngine from './AiVisualizerEngine'
import ThreeDVisualizerEngine, { type SelectedMaterial } from '../threedvisualizer/ThreeDVisualizerEngine'
import ThreeDVisualizerPageMobile from '../ThreeDVisualizerPageMobile'
import { dummyProducts } from '../../data/products'
import type { Product } from '../../data/products'

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

  const [currentProduct, setCurrentProduct] = useState<Product>(dummyProducts[0])
  const [selected3d, setSelected3d] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  const [isEngineReady, setIsEngineReady] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const engineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
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

      {/* ── Page Header ── */}
      <div
        className="relative pt-24 sm:pt-20 lg:pt-24 pb-5 sm:pb-6 overflow-hidden"
        style={{
          backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/banner/v1/banner1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-secondary-dark/50" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:border-white/60 hover:bg-white/20 transition-all text-[11px] font-medium tracking-wide"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.35em] uppercase font-semibold text-white/50 mb-1.5 sm:mb-2">AI Fabric Visualizer</p>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl text-primary leading-tight">
            See Your Fabric Come to Life
          </h1>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/60 font-light max-w-xs sm:max-w-md leading-relaxed">
            Pick a fabric, choose a product, and let our AI show you exactly how it looks before you decide.
          </p>
        </div>
      </div>

      {/* ── Option Cards ── */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pb-16 mt-10">
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
                onClick={(e) => handleOpen('ai', e)}
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
                onClick={(e) => handleOpen('ai', e)}
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
                onClick={(e) => handleOpen('3d', e)}
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
                onClick={(e) => handleOpen('3d', e)}
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
