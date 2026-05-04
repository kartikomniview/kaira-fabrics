import { useState, useCallback, useRef } from 'react'
import AiVisualizerEngine from './AiVisualizerEngine'
import ThreeDVisualizerEngine, { type SelectedMaterial } from '../threedvisualizer/ThreeDVisualizerEngine'
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
        className="relative pt-20 lg:pt-24 pb-6 overflow-hidden"
        style={{
          backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/stripsbg/strip1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-stone-950/50" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:border-white/60 hover:bg-white/20 transition-all rounded-full text-[11px] font-medium tracking-wide"
            >
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          <p className="text-[11px] tracking-[0.35em] uppercase font-semibold text-white/50 mb-2">AI Fabric Visualizer</p>
          <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            See Your Fabric Come to Life
          </h1>
          <p className="mt-3 text-sm text-white/60 font-light max-w-md leading-relaxed">
            Pick a fabric, choose a product, and let our AI show you exactly how it looks before you decide.
          </p>
        </div>
      </div>

      {/* ── Option Cards ── */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pb-16 mt-10">
        <p className="text-center text-[11px] text-stone-400 uppercase tracking-[0.3em] font-semibold mb-8">
          Choose Your Experience
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">

          {/* ── AI Visualizer Card ── */}
          <div data-card className="relative h-[420px] lg:h-[500px] rounded-3xl overflow-hidden group">
            <img
              src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/after.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/55 to-stone-950/10" />

            {/* content */}
            <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-9">
              <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 backdrop-blur-sm rounded-full px-3 py-1 mb-4 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] text-primary uppercase tracking-widest font-semibold">AI Powered</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-white mb-2 leading-tight">
                AI Visualizer
              </h2>
              <p className="text-[12px] sm:text-[13px] text-white/60 leading-relaxed mb-5 max-w-xs">
                Drape any fabric onto real product silhouettes using generative AI. See exactly how it looks before you order.
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-6">
                {['Browse Inventory', 'Upload Fabric', 'AI Preview'].map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] text-white/55 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => handleOpen('ai', e)}
                className="w-full py-4 bg-primary text-stone-900 rounded-2xl font-bold uppercase tracking-widest text-[12px] shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Launch AI Visualizer
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── 3D Studio Card ── */}
          <div
            data-card
            className="relative h-[420px] lg:h-[500px] rounded-3xl overflow-hidden group"
            style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 45%, #18181b 100%)' }}
          >
            {/* subtle dot grid */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}
            />
            {/* wireframe cube decoration */}
            <div className="absolute top-8 right-8 w-36 h-36 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.14]">
              <svg viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="1.2">
                <line x1="50" y1="12" x2="88" y2="32" />
                <line x1="88" y1="32" x2="88" y2="72" />
                <line x1="88" y1="72" x2="50" y2="88" />
                <line x1="50" y1="88" x2="12" y2="72" />
                <line x1="12" y1="72" x2="12" y2="32" />
                <line x1="12" y1="32" x2="50" y2="12" />
                <line x1="50" y1="12" x2="50" y2="50" />
                <line x1="88" y1="32" x2="50" y2="50" />
                <line x1="12" y1="32" x2="50" y2="50" />
                <line x1="50" y1="50" x2="50" y2="88" />
                <line x1="50" y1="50" x2="88" y2="72" />
                <line x1="50" y1="50" x2="12" y2="72" />
              </svg>
            </div>
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/30 to-transparent" />

            {/* content */}
            <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-9">
              <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 backdrop-blur-sm rounded-full px-3 py-1 mb-4 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] text-primary uppercase tracking-widest font-semibold">Interactive 3D</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-white mb-2 leading-tight">
                3D Studio
              </h2>
              <p className="text-[12px] sm:text-[13px] text-white/60 leading-relaxed mb-5 max-w-xs">
                Explore fabrics in an immersive 3D environment. Rotate, zoom and inspect every weave in stunning detail.
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-6">
                {['360° Rotation', 'Real-time Preview', 'HD Render'].map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] text-white/55 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => handleOpen('3d', e)}
                className="w-full py-4 bg-primary text-stone-900 rounded-2xl font-bold uppercase tracking-widest text-[12px] shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Explore 3D Studio
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
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
                <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-4" />
                <p className="text-stone-900 text-[12px] font-bold tracking-[0.3em] uppercase">Closing</p>
              </div>
            )}

            {/* ── Overlay Header ── */}
            <div
              style={closeStyle}
              className="h-12 shrink-0 bg-stone-900 border-b border-stone-800 flex items-center px-5 gap-4"
            >
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-2 h-8 px-3.5 bg-white border border-white/20 hover:bg-white/80 hover:border-white/100 text-black transition-all rounded-sm"
              >
                <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Go Back</span>
              </button>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isEngineReady ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                <span className="text-[11px] text-stone-200 font-bold tracking-[0.2em] uppercase">
                  {mode === 'ai' ? 'AI Visualizer' : '3D Fabric Studio'}
                </span>
              </div>
            </div>

            <div style={contentStyle}>
              {/* Loader — shown until engine is ready */}
              {!isEngineReady && (
                <div className="flex flex-col items-center justify-center min-h-screen gap-5 bg-white">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1 ${mode === '3d' ? 'bg-stone-900' : 'bg-primary/10 border border-primary/20'}`}>
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
                  <div className="w-9 h-9 border-2 border-stone-100 border-t-stone-900 rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-[10px] text-stone-400 uppercase tracking-[0.35em] font-semibold">Preparing</p>
                    <p className="text-2xl font-serif text-stone-900 mt-1.5">
                      {mode === 'ai' ? 'AI Visualizer' : '3D Studio'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-2 font-light tracking-wide">
                      {mode === 'ai' ? 'Loading fabric inventory…' : 'Initialising 3D engine…'}
                    </p>
                  </div>
                </div>
              )}

              {/* AI engine */}
              {isEngineReady && mode === 'ai' && <AiVisualizerEngine />}

              {/* 3D engine */}
              {isEngineReady && mode === '3d' && (
                <div className="flex flex-col bg-stone-50 font-sans h-full">
                  {/* Studio sub-toolbar — product / texture / status only (branding is in the overlay header) */}
                  <div style={{display:"none"}} className="h-10 shrink-0 bg-stone-800 border-b border-stone-700 flex items-center px-5 gap-3">
                    <div className="flex items-center gap-2 bg-stone-700/60 border border-stone-600 px-3 py-1 rounded-sm">
                      <svg className="w-3 h-3 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-[10px] text-stone-300 font-medium tracking-[0.1em] uppercase">{currentProduct.product_name}</span>
                    </div>
                    <div className="flex-1" />
                    {selected3d && (
                      <div className="flex items-center gap-2 bg-stone-700/60 border border-stone-600 px-3 py-1 rounded-sm">
                        <img
                          src={selected3d.textureUrl}
                          alt=""
                          className="w-4 h-4 rounded-sm object-cover border border-stone-600 shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                        <span className="text-[10px] text-stone-300 font-medium tracking-wide truncate max-w-[160px]">{selected3d.fabricName}</span>
                        {isApplying && (
                          <div className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${modelLoaded ? 'bg-emerald-500' : 'bg-stone-400 animate-pulse'}`} />
                      <span className="text-[10px] text-stone-500 font-bold tracking-[0.2em] uppercase">{modelLoaded ? 'Ready' : 'Loading'}</span>
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
