import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThreeDVisualizerPageMobile from './ThreeDVisualizerPageMobile'
import ThreeDVisualizerEngine, { type SelectedMaterial } from './threedvisualizer/ThreeDVisualizerEngine'
import { dummyProducts } from '../data/products'
import type { Product } from '../data/products'

const ThreeDVisualizerPage = () => {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const handleGoHome = () => {
    setIsExiting(true)
    setTimeout(() => navigate('/'), 600)
  }

  const [currentProduct, setCurrentProduct] = useState<Product>(dummyProducts[0])
  const [selected, setSelected] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  if (isMobile) return <ThreeDVisualizerPageMobile />

  return (
    <div
      className="flex flex-col overflow-hidden bg-stone-50 font-sans"
      style={{ height: 'calc(100vh - 78px)', marginTop: '78px' }}
    >
      {/* ── Exit overlay ── */}
      {isExiting && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-stone-50"
          style={{ animation: 'kaira-exit-fade 0.25s ease forwards' }}
        >
          <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-6" />
          <p className="text-stone-900 text-[12px] font-bold tracking-[0.3em] uppercase">Closing Studio</p>
        </div>
      )}

      {/* ── Studio Toolbar ── */}
      <div className="h-12 shrink-0 bg-stone-900 border-b border-stone-800 flex items-center px-6 gap-4 shadow-sm">
        {/* Home button */}
        <button
          onClick={handleGoHome}
          className="flex items-center gap-1.5 h-7 px-3 bg-white border border-stone-200 hover:border-stone-900 text-stone-900 transition-all rounded-sm group shrink-0"
        >
          <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Home</span>
        </button>

        <div className="w-px h-5 bg-stone-700" />

        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[11px] text-stone-500 font-bold tracking-[0.2em] uppercase">Kaira</span>
          <span className="text-stone-600 text-xs">›</span>
          <span className="text-[11px] text-stone-200 font-bold tracking-[0.2em] uppercase">3D Fabric Studio</span>
        </div>

        <div className="w-px h-5 bg-stone-700 mx-2" />

        {/* Model badge */}
        <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-sm">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-[11px] text-stone-300 font-medium tracking-[0.1em] uppercase">{currentProduct.product_name}</span>
        </div>

        <div className="flex-1" />

        {/* Active texture chip */}
        {selected && (
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-sm">
            <img
              src={selected.textureUrl}
              alt=""
              className="w-5 h-5 rounded-sm object-cover border border-stone-700 shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-[11px] text-stone-300 font-medium tracking-wide truncate max-w-[160px]">{selected.fabricName}</span>
            {isApplying && (
              <div className="w-3.5 h-3.5 border border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
            )}
          </div>
        )}

        {/* Model status dot */}
        <div className="flex items-center gap-2 ml-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${modelLoaded ? 'bg-emerald-500' : 'bg-stone-300 animate-pulse'}`} />
          <span className="text-[11px] text-stone-500 font-bold tracking-[0.2em] uppercase">{modelLoaded ? 'Ready' : 'Loading'}</span>
        </div>
      </div>

      <ThreeDVisualizerEngine
        currentProduct={currentProduct}
        setCurrentProduct={setCurrentProduct}
        selected={selected}
        setSelected={setSelected}
        isApplying={isApplying}
        setIsApplying={setIsApplying}
        modelLoaded={modelLoaded}
        setModelLoaded={setModelLoaded}
      />
    </div>
  )
}

export default ThreeDVisualizerPage
