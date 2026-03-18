import { useState, useRef, useMemo, useEffect } from 'react'
import { newMaterials } from '../data/newmaterials'
import { dummyProducts, getProductImageUrl } from '../data/products'
import type { Product } from '../data/products'
import AIVisualizerPageMobile from './AIVisualizerPageMobile'

import CTASection from '../components/sections/CTASection'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const S3_BG = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/roomBackgrounds/thumbnails/realisticBackgrounds'

// ── Backgrounds ──────────────────────────────────────────────────────────────
export const backgroundsList: Background[] = [
  { id: 'bg-10',  label: 'Scene 10',  thumb: `${S3_BG}/Large_Background_10.webp`,      category: 'Interior' },
  { id: 'bg-12',  label: 'Scene 12',  thumb: `${S3_BG}/Large_Background_12.webp`,      category: 'Interior' },
  { id: 'bg-13',  label: 'Scene 13',  thumb: `${S3_BG}/Large_Background_13.webp`,      category: 'Interior' },
  { id: 'bg-17',  label: 'Scene 17',  thumb: `${S3_BG}/Large_Background_17.webp`,      category: 'Interior' },
  { id: 'bg-22',  label: 'Scene 22',  thumb: `${S3_BG}/Large_Background_22.webp`,      category: 'Interior' },
  { id: 'bg-26',  label: 'Scene 26',  thumb: `${S3_BG}/Large_Background_26.webp`,      category: 'Interior' },
  { id: 'bg-27',  label: 'Scene 27',  thumb: `${S3_BG}/Large_Background_27.webp`,      category: 'Interior' },
  { id: 'bg-31',  label: 'Scene 31',  thumb: `${S3_BG}/Large_Background_31.webp`,      category: 'Interior' },
  { id: 'bg-r50', label: 'Realistic 50', thumb: `${S3_BG}/Realistic_Background_50.webp`, category: 'Realistic' },
]

// ── Material filter constants ─────────────────────────────────────────────────
const materialTypeOptions = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort(),
]
const collectionList = Array.from(
  new Set(newMaterials.map((m) => m.collection_name).filter(Boolean))
).sort()

const COLOR_GROUPS = ['Blues', 'Browns', 'Grays', 'Greens', 'Purples', 'Reds', 'Yellow', 'Whites', 'Blacks']
const COLOR_MAP: Record<string, string> = {
  Blues: '#3B82F6', Browns: '#92400E', Grays: '#9CA3AF', Greens: '#22C55E',
  Purples: '#A855F7', Reds: '#EF4444', Yellow: '#EAB308', Whites: '#F5F5F4', Blacks: '#1C1917',
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Background {
  id: string
  label: string
  thumb: string
  category: string
  isCustom?: boolean
}

interface SelectedMaterial {
  id: number
  fabricName: string
  textureUrl: string
  collectionName: string
  materialCode: string
  materialType: string
  colorGroup: string | null
}

const STEPS = [
  { num: 1, label: 'Background', description: 'Choose a scene' },
  { num: 2, label: 'Product', description: 'Select furniture' },
  { num: 3, label: 'Material', description: 'Pick a fabric' },
] as const

// ── Component ─────────────────────────────────────────────────────────────────
const AIVisualizerDesktop = () => {
  // Step state
  const [currentStep, setCurrentStep] = useState(1)

  // Material state
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null)
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [search, setSearch] = useState('')
  const colorScrollRef = useRef<HTMLDivElement>(null)

  // Background state
  const [backgrounds, setBackgrounds] = useState<Background[]>(backgroundsList)
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null)
  const bgUploadRef = useRef<HTMLInputElement>(null)

  // Canvas + drag state
  const canvasRef = useRef<HTMLDivElement>(null)
  const productWrapperRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const posRef = useRef({ x: 50, y: 50 })

  // Product state
  const [selectedProduct, setSelectedProduct] = useState<Product>(dummyProducts[0])
  const [productOnCanvas, setProductOnCanvas] = useState(false)
  const [productPos, setProductPos] = useState({ x: 50, y: 50 })
  const [productSize, setProductSize] = useState(220)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => newMaterials.filter((m) => {
    if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
    if (activeCollection !== 'All' && m.collection_name !== activeCollection) return false
    if (activeColorGroup !== 'All' && m.color_group !== activeColorGroup) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !m.material_name?.toLowerCase().includes(q) &&
        !m.collection_name?.toLowerCase().includes(q) &&
        !m.color_group?.toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [activeMaterialType, activeCollection, activeColorGroup, search])

  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 }
    newMaterials.forEach((m) => {
      if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return
      if (activeColorGroup !== 'All' && m.color_group !== activeColorGroup) return
      if (search) {
        const q = search.toLowerCase()
        if (
          !m.material_name?.toLowerCase().includes(q) &&
          !m.collection_name?.toLowerCase().includes(q) &&
          !m.color_group?.toLowerCase().includes(q)
        ) return
      }
      counts.All = (counts.All || 0) + 1
      counts[m.collection_name] = (counts[m.collection_name] || 0) + 1
    })
    return counts
  }, [activeMaterialType, activeColorGroup, search])

  const canGenerate = !isGenerating && !!selectedBackground && productOnCanvas && !!selectedMaterial

  // Step navigation helpers
  const canGoNext = currentStep === 1 ? !!selectedBackground : currentStep === 2 ? productOnCanvas : false
  const canClickStep = (num: number) =>
    num === 1 || (num === 2 && !!selectedBackground) || (num === 3 && !!selectedBackground && productOnCanvas)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const scrollColors = (dir: 'left' | 'right') => {
    colorScrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
  }

  const handleSelectMaterial = (m: typeof newMaterials[0]) => {
    setSelectedMaterial({
      id: m.id,
      fabricName: `${m.collection_name} ${m.material_name}`,
      textureUrl: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
      collectionName: m.collection_name,
      materialCode: m.material_code,
      materialType: m.material_type ?? '',
      colorGroup: m.color_group,
    })
    setGeneratedImage(null)
  }

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const newBg: Background = {
        id: `custom-${Date.now()}`,
        label: file.name.replace(/\.[^/.]+$/, ''),
        thumb: ev.target?.result as string,
        category: 'Custom',
        isCustom: true,
      }
      setBackgrounds((prev) => [newBg, ...prev])
      setSelectedBackground(newBg)
      setGeneratedImage(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSelectBackground = (bg: Background) => {
    setSelectedBackground(bg)
    setGeneratedImage(null)
    setTimeout(() => setCurrentStep(2), 350)
  }

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p)
    setProductOnCanvas(true)
    posRef.current = { x: 50, y: 50 }
    setProductPos({ x: 50, y: 50 })
    setGeneratedImage(null)
    setTimeout(() => setCurrentStep(3), 350)
  }

  const handleGenerate = () => {
    if (!canGenerate) return
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedImage(
        `https://placehold.co/900x600/F5F0E8/C5A552?text=AI+Preview+·+${encodeURIComponent(selectedProduct.product_name)}`
      )
      setIsGenerating(false)
    }, 2500)
  }

  const clearAll = () => {
    setActiveMaterialType('All')
    setActiveCollection('All')
    setActiveColorGroup('All')
    setSearch('')
  }

  const handleProductPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleProductPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    const newX = Math.max(5, Math.min(95, posRef.current.x + (dx / rect.width) * 100))
    const newY = Math.max(5, Math.min(95, posRef.current.y + (dy / rect.height) * 100))
    posRef.current = { x: newX, y: newY }
    if (productWrapperRef.current) {
      productWrapperRef.current.style.left = `${newX}%`
      productWrapperRef.current.style.top = `${newY}%`
    }
  }

  const handleProductPointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setProductPos({ ...posRef.current })
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full bg-stone-100 overflow-hidden">

      {/* ── Header with Stepper ── */}
      <div className="shrink-0 bg-white border-b border-stone-200 shadow-sm z-10">
        {/* Brand row */}
        <div className="h-10 flex items-center px-4 gap-3">
          <div className="flex items-center gap-2 select-none">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[11px] text-stone-400 font-medium tracking-[0.18em] uppercase">Kaira</span>
            <span className="text-stone-300 text-xs">›</span>
            <span className="text-[11px] text-stone-700 tracking-widest uppercase">AI Interior Studio</span>
          </div>
          <div className="flex-1" />
          {selectedMaterial && (
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-sm">
              <img
                src={selectedMaterial.textureUrl}
                alt=""
                className="w-4 h-4 rounded-sm object-cover border border-stone-200 shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <span className="text-[10px] text-stone-600 truncate max-w-[160px]">{selectedMaterial.fabricName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] text-stone-400 tracking-wider">{isGenerating ? 'Generating…' : 'Ready'}</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="h-14 flex items-center justify-center px-6 border-t border-stone-100">
          {STEPS.map((step, i) => {
            const isCompleted = currentStep > step.num
            const isCurrent = currentStep === step.num
            const clickable = canClickStep(step.num)
            return (
              <div key={step.num} className="flex items-center">
                {i > 0 && (
                  <div className={`w-10 xl:w-16 h-px mx-2 transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-stone-200'}`} />
                )}
                <button
                  onClick={() => clickable && setCurrentStep(step.num)}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                    isCurrent
                      ? 'bg-primary/10 border border-primary/30 shadow-sm'
                      : isCompleted
                        ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                        : 'border border-transparent'
                  } ${!clickable && !isCurrent ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-stone-200 text-stone-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    ) : step.num}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className={`text-[10px] font-semibold uppercase tracking-widest leading-tight ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-stone-400'
                    }`}>{step.label}</p>
                    <p className="text-[9px] text-stone-400 leading-tight">{step.description}</p>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">

        {/* ══════════════════════════════════════════════════════
            CANVAS — Always Visible
        ══════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Canvas title bar */}
          <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 gap-2.5">
            <span className="text-[9px] text-stone-400 tracking-widest uppercase select-none">AI Preview Canvas</span>
            <div className="flex-1" />
            {/* Selection summary pills */}
            <div className="flex items-center gap-1.5">
              {selectedBackground && (
                <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{selectedBackground.label}</span>
              )}
              {productOnCanvas && (
                <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{selectedProduct.product_name}</span>
              )}
              {selectedMaterial && (
                <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full truncate max-w-[100px]">{selectedMaterial.collectionName}</span>
              )}
            </div>
            {generatedImage && (
              <button
                onClick={() => setGeneratedImage(null)}
                className="flex items-center gap-1.5 h-7 px-3 border border-stone-200 hover:border-stone-400 text-stone-500 hover:text-stone-700 transition-all rounded-lg text-[9px] tracking-wide ml-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Canvas area */}
          <div ref={canvasRef} className="flex-1 relative flex items-center justify-center overflow-hidden bg-stone-50">
            {/* Background layer */}
            {selectedBackground && (
              <img
                src={selectedBackground.thumb}
                alt={selectedBackground.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Empty state */}
            {!selectedBackground && !productOnCanvas && !generatedImage && (
              <div className="text-center pointer-events-none select-none">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-stone-100 border-2 border-dashed border-stone-200 flex items-center justify-center">
                  <svg className="w-9 h-9 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-stone-400 text-xs tracking-wide font-medium">Your preview will appear here</p>
                <p className="text-stone-300 text-[10px] mt-1">Start by selecting a background scene →</p>
              </div>
            )}

            {/* Background selected but no product yet */}
            {selectedBackground && !productOnCanvas && !generatedImage && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select a product in Step 2 →
                </div>
              </div>
            )}

            {/* Draggable product on canvas */}
            {productOnCanvas && !generatedImage && (
              <div
                ref={productWrapperRef}
                className="absolute z-10 touch-none"
                style={{
                  left: `${productPos.x}%`,
                  top: `${productPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  userSelect: 'none',
                  willChange: 'left, top',
                }}
                onPointerDown={handleProductPointerDown}
                onPointerMove={handleProductPointerMove}
                onPointerUp={handleProductPointerUp}
                onPointerCancel={handleProductPointerUp}
              >
                <div className="relative group cursor-grab active:cursor-grabbing">
                  <div
                    className="absolute inset-0 rounded-xl border-2 border-primary shadow-[0_0_0_4px_rgba(197,165,82,0.18)] pointer-events-none z-10 transition-opacity opacity-0 group-hover:opacity-100"
                    style={{ margin: '-6px', borderRadius: '14px' }}
                  />
                  {['top-0 left-0 -translate-x-1 -translate-y-1','top-0 right-0 translate-x-1 -translate-y-1','bottom-0 left-0 -translate-x-1 translate-y-1','bottom-0 right-0 translate-x-1 translate-y-1'].map((cls, i) => (
                    <div key={i} className={`absolute w-3 h-3 bg-primary rounded-sm shadow-md z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${cls}`} />
                  ))}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-primary text-white text-[8px] px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5 shadow-md">
                      <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                      </svg>
                      Drag to move
                    </div>
                  </div>
                  <img
                    src={getProductImageUrl(selectedProduct)}
                    alt={selectedProduct.product_name}
                    style={{ width: `${productSize}px`, display: 'block' }}
                    className="object-contain drop-shadow-2xl select-none rounded-lg"
                    draggable={false}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }}
                  />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    {selectedMaterial ? (
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary/40 shadow-lg rounded-full px-2.5 py-1.5 whitespace-nowrap">
                        <img
                          src={selectedMaterial.textureUrl}
                          alt={selectedMaterial.fabricName}
                          className="w-5 h-5 rounded-full object-cover border border-primary/50 shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                        <span className="text-[9px] text-stone-700 font-medium max-w-[120px] truncate">{selectedMaterial.fabricName}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-stone-300 shadow-md rounded-full px-2.5 py-1.5 whitespace-nowrap">
                        <div className="w-5 h-5 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                          </svg>
                        </div>
                        <span className="text-[9px] text-stone-400 italic">No fabric selected</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/55 backdrop-blur-sm rounded-full px-3 py-1.5 pointer-events-auto z-30 whitespace-nowrap">
                    <svg className="w-3 h-3 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <input
                      type="range"
                      min={80}
                      max={500}
                      value={productSize}
                      onChange={(e) => setProductSize(Number(e.target.value))}
                      className="w-24 h-1.5 accent-primary"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                    <span className="text-[8px] text-white/50 tabular-nums">{productSize}px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated result */}
            {generatedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={generatedImage} alt="AI generated preview" className="w-full h-full object-contain" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg shadow-md">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span className="text-[9px] font-semibold uppercase tracking-widest">AI Generated</span>
                </div>
              </div>
            )}

            {/* Generating overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-10 h-10 border-2 border-stone-200 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-stone-500 text-[11px] tracking-[0.2em] uppercase font-medium">Generating Preview…</p>
                <p className="text-stone-300 text-[10px] mt-1.5">AI is compositing your scene</p>
              </div>
            )}

            {/* Corner bracket decorations */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/30 pointer-events-none" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/30 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/30 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/30 pointer-events-none" />
          </div>

          {/* Canvas bottom status bar */}
          <div className="shrink-0 border-t border-stone-200 bg-stone-50 px-4 py-2.5 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <div className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full ${selectedBackground ? 'bg-primary/10 text-primary' : 'bg-stone-100 text-stone-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${selectedBackground ? 'bg-primary' : 'bg-stone-300'}`} />
                {selectedBackground ? selectedBackground.label : 'No background'}
              </div>
              <div className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full ${productOnCanvas ? 'bg-primary/10 text-primary' : 'bg-stone-100 text-stone-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${productOnCanvas ? 'bg-primary' : 'bg-stone-300'}`} />
                {productOnCanvas ? selectedProduct.product_name : 'No product'}
              </div>
              <div className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full ${selectedMaterial ? 'bg-primary/10 text-primary' : 'bg-stone-100 text-stone-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${selectedMaterial ? 'bg-primary' : 'bg-stone-300'}`} />
                {selectedMaterial ? selectedMaterial.collectionName : 'No fabric'}
              </div>
            </div>
            {generatedImage && (
              <button className="flex items-center gap-1.5 h-7 px-3 border border-stone-200 hover:border-stone-400 text-stone-500 hover:text-stone-700 transition-all rounded-lg text-[9px] tracking-wide">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            STEP PANEL — Right side, changes per step
        ══════════════════════════════════════════════════════ */}
        <div className={`shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden transition-all duration-300 ${
          currentStep === 3 ? 'w-[430px] xl:w-[490px]' : 'w-[360px] xl:w-[400px]'
        }`}>

          {/* ──────── STEP 1: Background ──────── */}
          {currentStep === 1 && (
            <>
              <div className="h-12 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-4 gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-stone-700 font-semibold uppercase tracking-widest">Choose a Scene</p>
                  <p className="text-[9px] text-stone-400">Select a room background for your visualization</p>
                </div>
                <button
                  onClick={() => bgUploadRef.current?.click()}
                  className="flex items-center gap-1.5 h-7 px-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-[9px] font-medium transition-all"
                >
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Upload
                </button>
                <input
                  ref={bgUploadRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBgUpload}
                  className="sr-only"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {backgrounds.map((bg) => {
                    const isActive = selectedBackground?.id === bg.id
                    return (
                      <button
                        key={bg.id}
                        onClick={() => handleSelectBackground(bg)}
                        title={bg.label}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          isActive ? 'border-primary shadow-[0_0_0_2px_rgba(197,165,82,0.25)] scale-[1.02]' : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className="aspect-[4/3]">
                          <img
                            src={bg.thumb}
                            alt={bg.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement
                              el.style.opacity = '0'
                              if (el.parentElement) el.parentElement.style.backgroundColor = '#e7e5e4'
                            }}
                          />
                        </div>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md z-10">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-2">
                          <p className="text-[9px] text-white font-medium leading-tight truncate">{bg.label}</p>
                          <p className={`text-[8px] ${bg.isCustom ? 'text-primary' : 'text-white/50'}`}>{bg.isCustom ? 'Custom' : bg.category}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ──────── STEP 2: Product ──────── */}
          {currentStep === 2 && (
            <>
              <div className="h-12 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-4 gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-stone-700 font-semibold uppercase tracking-widest">Select a Product</p>
                  <p className="text-[9px] text-stone-400">Choose furniture to place on your scene</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-3">
                  {dummyProducts.map((p) => {
                    const isActive = selectedProduct.product_id === p.product_id && productOnCanvas
                    return (
                      <button
                        key={p.product_id}
                        onClick={() => handleSelectProduct(p)}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-200 bg-stone-50 ${
                          isActive ? 'border-primary shadow-[0_0_0_2px_rgba(197,165,82,0.25)] scale-[1.02]' : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className="aspect-square p-4 flex items-center justify-center">
                          <img
                            src={getProductImageUrl(p)}
                            alt={p.product_name}
                            className="w-full h-full object-contain drop-shadow-lg"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md z-10">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </div>
                        )}
                        <div className="border-t border-stone-200 bg-white px-3 py-2.5">
                          <p className={`text-[11px] font-semibold uppercase tracking-tight ${isActive ? 'text-primary' : 'text-stone-700'}`}>{p.product_name}</p>
                          <p className="text-[9px] text-stone-400 tracking-wide mt-0.5">{p.category_name} · {p.sub_category_name}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ──────── STEP 3: Material ──────── */}
          {currentStep === 3 && (
            <>
              {/* Filter bar */}
              <div className="shrink-0 p-3.5 border-b border-stone-200">
                <p className="text-[9px] text-primary uppercase tracking-[0.18em] font-semibold mb-2.5">Filter Materials</p>
                <div className="relative mb-3">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search fabrics…"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[11px] pl-7 pr-3 py-1.5 placeholder-stone-300 focus:outline-none focus:border-primary/60 transition-colors rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1/2">
                    <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1">Collection</p>
                    <div className="relative">
                      <select
                        value={activeCollection}
                        onChange={(e) => setActiveCollection(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[10px] pl-2 pr-6 py-1.5 focus:outline-none focus:border-primary/60 appearance-none cursor-pointer transition-colors rounded-lg"
                      >
                        <option value="All">All Collections ({collectionCounts.All ?? 0})</option>
                        {collectionList.map((c) => <option key={c} value={c}>{c} ({collectionCounts[c] ?? 0})</option>)}
                      </select>
                      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-1/2">
                    <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1">Type</p>
                    <div className="relative">
                      <select
                        value={activeMaterialType}
                        onChange={(e) => setActiveMaterialType(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[10px] pl-2 pr-6 py-1.5 focus:outline-none focus:border-primary/60 appearance-none cursor-pointer transition-colors rounded-lg"
                      >
                        {materialTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1">Color</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => scrollColors('left')} className="p-1 hover:bg-stone-50 rounded-full text-stone-400 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div ref={colorScrollRef} className="flex-1 flex gap-1.5 overflow-x-hidden scroll-smooth py-1">
                      <button
                        onClick={() => setActiveColorGroup('All')}
                        title="All colors"
                        className={`shrink-0 w-5 h-5 rounded-full border border-stone-200 flex items-center justify-center transition-all bg-white ${activeColorGroup === 'All' ? 'border-primary ring-1 ring-primary' : ''}`}
                      >
                        <span className="text-[7px] font-bold text-stone-400">A</span>
                      </button>
                      {COLOR_GROUPS.map((cg) => (
                        <button
                          key={cg}
                          onClick={() => setActiveColorGroup(cg)}
                          title={cg}
                          className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${activeColorGroup === cg ? 'border-primary scale-110 shadow-sm' : 'border-transparent hover:border-stone-300'}`}
                          style={{ backgroundColor: COLOR_MAP[cg], boxShadow: cg === 'Whites' ? 'inset 0 0 0 1px #d6d3d1' : undefined }}
                        />
                      ))}
                    </div>
                    <button onClick={() => scrollColors('right')} className="p-1 hover:bg-stone-50 rounded-full text-stone-400 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                {/* Active filter chips */}
                {(activeMaterialType !== 'All' || activeCollection !== 'All' || activeColorGroup !== 'All' || search) && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[8px] text-stone-400 uppercase tracking-widest shrink-0">Active:</span>
                    {search && (
                      <span className="flex items-center gap-1 bg-stone-100 text-stone-600 text-[9px] px-2 py-0.5 rounded-full">
                        <span className="max-w-[80px] truncate">"{search}"</span>
                        <button onClick={() => setSearch('')} className="text-stone-400 hover:text-stone-700 transition-colors">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    )}
                    {activeMaterialType !== 'All' && (
                      <span className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 text-[9px] px-2 py-0.5 rounded-full">
                        {activeMaterialType}
                        <button onClick={() => setActiveMaterialType('All')} className="text-primary/60 hover:text-primary transition-colors">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    )}
                    {activeColorGroup !== 'All' && (
                      <span className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 text-[9px] px-2 py-0.5 rounded-full">
                        <span className="w-2 h-2 rounded-full shrink-0 border border-white/50" style={{ backgroundColor: COLOR_MAP[activeColorGroup] }} />
                        {activeColorGroup}
                        <button onClick={() => setActiveColorGroup('All')} className="text-primary/60 hover:text-primary transition-colors">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    )}
                    {activeCollection !== 'All' && (
                      <span className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 text-[9px] px-2 py-0.5 rounded-full">
                        {activeCollection}
                        <button onClick={() => setActiveCollection('All')} className="text-primary/60 hover:text-primary transition-colors">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    )}
                    <button onClick={clearAll} className="text-[8px] text-stone-400 hover:text-stone-600 uppercase tracking-widest transition-colors ml-auto">
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Materials grid */}
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-3 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
                    <p className="text-[9px] text-stone-500 font-medium tracking-wide truncate">
                      {activeCollection === 'All' ? 'All Materials' : activeCollection}
                    </p>
                    <span className="text-[9px] text-stone-400 tabular-nums shrink-0 ml-2 bg-stone-200 px-1.5 py-0.5 rounded-full">{filtered.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2.5">
                    {isLoading ? (
                      <div className="grid grid-cols-4 gap-1.5">
                        {Array.from({ length: 16 }, (_, i) => (
                          <div
                            key={i}
                            className="relative aspect-square rounded-lg bg-stone-200 overflow-hidden border border-stone-100"
                            aria-hidden="true"
                          >
                            <div
                              className="absolute inset-0 -translate-x-full"
                              style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
                                animation: `kaira-shimmer 1.6s ease-in-out ${i * 0.05}s infinite`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : filtered.length > 0 ? (
                      <div className="grid grid-cols-4 gap-1.5">
                        {filtered.map((m) => {
                          const isActive = selectedMaterial?.id === m.id
                          return (
                            <button
                              key={m.id}
                              onClick={() => handleSelectMaterial(m)}
                              title={`${m.collection_name} ${m.material_name}`}
                              className={`group relative aspect-square overflow-hidden border transition-all duration-150 rounded-lg ${isActive ? 'border-primary shadow-[0_0_0_1px_rgba(197,165,82,0.25)] scale-[1.03]' : 'border-stone-200 hover:border-stone-400'}`}
                            >
                              <img
                                src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                                alt={`${m.collection_name} ${m.material_name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const el = e.currentTarget as HTMLImageElement
                                  el.style.display = 'none'
                                  if (el.parentElement) el.parentElement.style.backgroundColor = '#e7e5e4'
                                }}
                              />
                              <div className={`absolute inset-0 bg-black/55 flex flex-col items-center justify-center p-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <p className="text-[7px] text-white font-semibold uppercase text-center leading-tight tracking-wide line-clamp-2">{m.collection_name}</p>
                                <p className="text-[6px] text-white/70 mt-0.5 tracking-wide">{m.material_name}</p>
                              </div>
                              {isActive && (
                                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center shadow-md">
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-10 px-4 gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-stone-600 text-[11px] font-medium tracking-wide">No materials found</p>
                          <p className="text-stone-400 text-[10px] mt-0.5">No results for current filters</p>
                        </div>
                        <button
                          onClick={clearAll}
                          className="mt-1 text-[10px] text-white bg-primary hover:bg-[#b8943f] px-4 py-1.5 rounded-lg transition-colors tracking-wide font-medium"
                        >
                          Reset all filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ──────── Navigation Footer ──────── */}
          <div className="shrink-0 border-t border-stone-200 bg-stone-50 px-4 py-3 flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-1.5 h-8 px-4 border border-stone-200 hover:border-stone-400 text-stone-500 hover:text-stone-700 transition-all rounded-lg text-[10px] tracking-wide"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}

            <div className="flex-1" />

            {/* Step counter */}
            <span className="text-[9px] text-stone-400 tracking-widest uppercase">
              Step {currentStep} of 3
            </span>

            {currentStep < 3 ? (
              <button
                onClick={() => canGoNext && setCurrentStep(currentStep + 1)}
                disabled={!canGoNext}
                className={`flex items-center gap-1.5 h-8 px-5 rounded-lg text-[10px] font-semibold tracking-widest uppercase transition-all duration-200 ${
                  canGoNext
                    ? 'bg-primary hover:bg-[#b8943f] text-white shadow-sm hover:shadow-md'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                Next
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`flex items-center gap-2 h-8 px-6 rounded-lg text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${
                  canGenerate
                    ? 'bg-primary hover:bg-[#b8943f] text-white shadow-sm hover:shadow-md'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating…
                  </>
                ) : 'Generate AI Preview'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

const AIVisualizerPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  
  if (isMobile) return <AIVisualizerPageMobile />
  
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">
      {/* Embedded Tool Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 lg:px-12 xl:px-16 flex justify-center bg-stone-50">
         <div className="w-full max-w-[1600px] border border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden bg-white flex flex-col" style={{ height: '85vh', minHeight: '750px', maxHeight: '1000px' }}>
            <AIVisualizerDesktop />
         </div>
      </section>

      <CTASection />
    </main>
  )
}

export default AIVisualizerPage
