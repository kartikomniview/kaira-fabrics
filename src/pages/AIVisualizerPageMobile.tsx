import { useState, useRef, useMemo, useEffect } from 'react'
import { newMaterials } from '../data/newmaterials'
import { dummyProducts, getProductImageUrl } from '../data/products'
import type { Product } from '../data/products'
import { backgroundsList } from './AIVisualizerPage'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

// ── Constants ─────────────────────────────────────────────────────────────────
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

type TabId = 'fabrics' | 'backgrounds' | 'product'

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'fabrics',
    label: 'Fabrics',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'backgrounds',
    label: 'Scenes',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'product',
    label: 'Product',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
]

// ── Mobile Component ──────────────────────────────────────────────────────────
const AIVisualizerPageMobile = () => {
  // Tab
  const [activeTab, setActiveTab] = useState<TabId>('backgrounds')

  // Material state
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null)
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [search, setSearch] = useState('')
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
  const [productSize, setProductSize] = useState(160)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeFilterCount = [
    search ? 1 : 0,
    activeMaterialType !== 'All' ? 1 : 0,
    activeColorGroup !== 'All' ? 1 : 0,
    activeCollection !== 'All' ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

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

  const canGenerate = !isGenerating && !!selectedBackground && productOnCanvas && !!selectedMaterial

  // ── Handlers ───────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setActiveMaterialType('All')
    setActiveCollection('All')
    setActiveColorGroup('All')
    setSearch('')
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
    // Switch to canvas view after picking a fabric
    setActiveTab('backgrounds')
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
    <div
      className="flex flex-col overflow-hidden bg-stone-100"
      style={{ height: 'calc(100dvh - 64px)', marginTop: '64px' }}
    >
      {/* ── Thin toolbar ── */}
      <div className="h-9 shrink-0 bg-white border-b border-stone-200 flex items-center px-3 gap-2 shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552]" />
        <span className="text-[10px] text-stone-700 tracking-widest uppercase font-medium">AI Interior Studio</span>
        <div className="flex-1" />
        {/* Quick status dots */}
        <div className={`w-1.5 h-1.5 rounded-full ${selectedBackground ? 'bg-emerald-500' : 'bg-stone-300'}`} title="Background" />
        <div className={`w-1.5 h-1.5 rounded-full ${productOnCanvas ? 'bg-emerald-500' : 'bg-stone-300'}`} title="Product" />
        <div className={`w-1.5 h-1.5 rounded-full ${selectedMaterial ? 'bg-emerald-500' : 'bg-stone-300'}`} title="Fabric" />
        {selectedMaterial && (
          <div className="flex items-center gap-1 ml-1 max-w-[110px]">
            <img
              src={selectedMaterial.textureUrl}
              alt=""
              className="w-4 h-4 rounded-sm object-cover border border-stone-200 shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-[9px] text-stone-500 truncate">{selectedMaterial.fabricName}</span>
          </div>
        )}
      </div>

      {/* ── Canvas — 55% ── */}
      <div
        ref={canvasRef}
        className="relative bg-stone-50 overflow-hidden"
        style={{ flex: '55 1 0%' }}
      >
        {/* Background image */}
        {selectedBackground && (
          <img
            src={selectedBackground.thumb}
            alt={selectedBackground.label}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Empty canvas state */}
        {!selectedBackground && !productOnCanvas && !generatedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none px-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-stone-100 border-2 border-dashed border-stone-200 flex items-center justify-center">
              <svg className="w-7 h-7 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-stone-400 text-[11px] font-medium tracking-wide">Select a scene below</p>
            <p className="text-stone-300 text-[10px] mt-1">then add a product and fabric</p>
          </div>
        )}

        {/* Hint — bg chosen, no product */}
        {selectedBackground && !productOnCanvas && !generatedImage && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm text-white text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tap a product to place it here
            </div>
          </div>
        )}

        {/* Draggable product */}
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
            <div className="relative cursor-grab active:cursor-grabbing">
              {/* Selection glow border */}
              <div
                className="absolute inset-0 rounded-xl border-2 border-[#C5A552] shadow-[0_0_0_3px_rgba(197,165,82,0.18)] pointer-events-none z-10"
                style={{ margin: '-5px', borderRadius: '14px' }}
              />

              {/* Product image */}
              <img
                src={getProductImageUrl(selectedProduct)}
                alt={selectedProduct.product_name}
                style={{ width: `${productSize}px`, display: 'block' }}
                className="object-contain drop-shadow-2xl select-none rounded-lg"
                draggable={false}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }}
              />

              {/* Drag hint badge */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                <div className="bg-[#C5A552]/90 text-white text-[7px] px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 shadow-md">
                  <svg className="w-2 h-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                  </svg>
                  Drag
                </div>
              </div>

              {/* Fabric pill below product */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                {selectedMaterial ? (
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#C5A552]/40 shadow rounded-full px-2 py-1 whitespace-nowrap">
                    <img
                      src={selectedMaterial.textureUrl}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover border border-[#C5A552]/50 shrink-0"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    <span className="text-[8px] text-stone-700 font-medium max-w-[90px] truncate">{selectedMaterial.fabricName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-stone-300 shadow rounded-full px-2 py-1 whitespace-nowrap">
                    <span className="text-[8px] text-stone-400 italic">No fabric</span>
                  </div>
                )}
              </div>

              {/* Size slider — inline below fabric pill */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 pointer-events-auto z-30 whitespace-nowrap">
                <svg className="w-3 h-3 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <input
                  type="range"
                  min={60}
                  max={320}
                  value={productSize}
                  onChange={(e) => setProductSize(Number(e.target.value))}
                  className="w-20 h-1.5 accent-[#C5A552]"
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ touchAction: 'none' } as React.CSSProperties}
                />
                <span className="text-[7px] text-white/50 tabular-nums">{productSize}px</span>
              </div>
            </div>
          </div>
        )}

        {/* Generated result */}
        {generatedImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={generatedImage} alt="AI generated preview" className="w-full h-full object-contain" />
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#C5A552] text-white px-2.5 py-1 rounded-lg shadow-md">
              <svg className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span className="text-[8px] font-semibold uppercase tracking-wider">AI Generated</span>
            </div>
          </div>
        )}

        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-[#C5A552] rounded-full animate-spin mb-3" />
            <p className="text-stone-500 text-[10px] tracking-[0.2em] uppercase font-medium">Generating…</p>
            <p className="text-stone-300 text-[9px] mt-1">AI is compositing your scene</p>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#C5A552]/30 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#C5A552]/30 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#C5A552]/30 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#C5A552]/30 pointer-events-none" />

        {/* Generate / Clear floating action */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
          {generatedImage && (
            <button
              onClick={() => setGeneratedImage(null)}
              style={{ touchAction: 'manipulation' }}
              className="flex items-center gap-1 h-8 px-3 bg-white/90 backdrop-blur-sm border border-stone-300 text-stone-500 rounded-xl text-[10px] font-medium shadow-md active:scale-95 transition-transform"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{ touchAction: 'manipulation' }}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-[10px] font-semibold tracking-wide uppercase shadow-lg transition-all active:scale-95 ${
              canGenerate
                ? 'bg-[#C5A552] hover:bg-[#b8943f] text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="w-3 h-3 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Bottom Panel — 45% ── */}
      <div
        className="flex flex-col bg-white border-t-2 border-stone-200 overflow-hidden min-h-0"
        style={{ flex: '45 1 0%' }}
      >

        {/* Tab bar */}
        <div className="shrink-0 flex border-b border-stone-200 bg-stone-50">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            // Badge logic
            const badge =
              tab.id === 'fabrics' && activeFilterCount > 0
                ? activeFilterCount
                : tab.id === 'fabrics' && selectedMaterial
                ? null
                : null

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ touchAction: 'manipulation' }}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold uppercase tracking-wide transition-all active:bg-stone-100 border-b-2 ${
                  isActive
                    ? 'border-b-[#C5A552] text-[#C5A552] bg-white'
                    : 'border-b-transparent text-stone-400'
                }`}
              >
                <span className={isActive ? 'text-[#C5A552]' : 'text-stone-400'}>{tab.icon}</span>
                {tab.label}

                {/* Active state indicator dot */}
                {tab.id === 'fabrics' && selectedMaterial && (
                  <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                {tab.id === 'backgrounds' && selectedBackground && (
                  <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                {tab.id === 'product' && productOnCanvas && (
                  <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}

                {/* Filter count badge */}
                {badge !== null && badge > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[#C5A552] text-white text-[7px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Tab: Fabrics ── */}
        {activeTab === 'fabrics' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">

            {/* Filter toggle header */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-stone-50 border-b border-stone-100">
              <span className="text-[9px] text-stone-400 tabular-nums">{filtered.length} materials</span>
              <div className="flex-1" />
              {selectedMaterial && (
                <div className="flex items-center gap-1.5 max-w-[150px]">
                  <img
                    src={selectedMaterial.textureUrl}
                    alt=""
                    className="w-4 h-4 rounded-sm object-cover border border-[#C5A552]/40 shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="text-[9px] text-[#C5A552] font-medium truncate">{selectedMaterial.collectionName}</span>
                </div>
              )}
              <button
                onClick={() => setFiltersVisible((v) => !v)}
                style={{ touchAction: 'manipulation' }}
                className="relative flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full border border-stone-200 bg-white text-stone-500 transition-all active:scale-95"
              >
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V21a1 1 0 01-1.447.894l-4-2A1 1 0 017 19v-5.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C5A552] text-white text-[7px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Collapsible filters */}
            <div
              className={`shrink-0 overflow-hidden transition-all duration-200 ease-in-out ${filtersVisible ? 'max-h-36' : 'max-h-0'}`}
            >
              <div className="px-3 pt-2 pb-1.5 space-y-1.5 border-b border-stone-100">
                {/* Search + Type row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search fabrics…"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[11px] pl-6 pr-2 py-2 placeholder-stone-300 focus:outline-none focus:border-[#C5A552]/60 rounded-lg transition-colors"
                    />
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={activeMaterialType}
                      onChange={(e) => setActiveMaterialType(e.target.value)}
                      className="bg-stone-50 border border-stone-200 text-stone-600 text-[10px] pl-2 pr-6 py-2 focus:outline-none focus:border-[#C5A552]/60 appearance-none cursor-pointer rounded-lg transition-colors"
                    >
                      {materialTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Color + Collection scroll row */}
                <div className="relative">
                  <div
                    className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
                    style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                  >
                    <button
                      onClick={() => { setActiveColorGroup('All'); setActiveCollection('All') }}
                      style={{ touchAction: 'manipulation' }}
                      className={`shrink-0 px-2.5 py-1 rounded-full border text-[9px] font-medium transition-all active:scale-95 ${
                        activeColorGroup === 'All' && activeCollection === 'All'
                          ? 'bg-[#C5A552] border-[#C5A552] text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-500'
                      }`}
                    >
                      All
                    </button>
                    {COLOR_GROUPS.map((cg) => (
                      <button
                        key={cg}
                        onClick={() => setActiveColorGroup(activeColorGroup === cg ? 'All' : cg)}
                        title={cg}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 transition-all active:scale-95 ${
                          activeColorGroup === cg ? 'border-[#C5A552] scale-110 shadow-sm' : 'border-transparent'
                        }`}
                        style={{
                          backgroundColor: COLOR_MAP[cg],
                          boxShadow: cg === 'Whites' ? 'inset 0 0 0 1px #d6d3d1' : undefined,
                          touchAction: 'manipulation',
                        } as React.CSSProperties}
                      />
                    ))}
                    <div className="w-px h-4 bg-stone-200 shrink-0 mx-0.5" />
                    {collectionList.map((c) => (
                      <button
                        key={c}
                        onClick={() => setActiveCollection(activeCollection === c ? 'All' : c)}
                        style={{ touchAction: 'manipulation' }}
                        className={`shrink-0 px-2.5 py-1 rounded-full border text-[9px] font-medium transition-all whitespace-nowrap active:scale-95 ${
                          activeCollection === c
                            ? 'bg-[#C5A552]/15 border-[#C5A552]/50 text-[#C5A552]'
                            : 'bg-stone-50 border-stone-200 text-stone-500'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    style={{ touchAction: 'manipulation' }}
                    className="text-[9px] text-stone-400 underline transition-colors active:text-stone-600"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Materials grid */}
            <div
              className="flex-1 overflow-y-auto px-2.5 pt-2 pb-1 min-h-0"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {isLoading ? (
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 15 }, (_, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg bg-stone-200 overflow-hidden"
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
                <div className="grid grid-cols-5 gap-1.5">
                  {filtered.map((m) => {
                    const isActive = selectedMaterial?.id === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMaterial(m)}
                        style={{ touchAction: 'manipulation' }}
                        title={`${m.collection_name} ${m.material_name}`}
                        className={`relative aspect-square overflow-hidden border rounded-lg transition-all duration-150 active:scale-95 ${
                          isActive
                            ? 'border-[#C5A552] shadow-[0_0_0_1px_rgba(197,165,82,0.25)] scale-[1.03]'
                            : 'border-stone-200'
                        }`}
                      >
                        <img
                          src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                          alt={`${m.collection_name} ${m.material_name}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement
                            el.style.display = 'none'
                            if (el.parentElement) el.parentElement.style.backgroundColor = '#e7e5e4'
                          }}
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-3 h-3 bg-[#C5A552] rounded-full flex items-center justify-center shadow">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-stone-400 text-[11px]">No materials found</p>
                  <button
                    onClick={clearFilters}
                    style={{ touchAction: 'manipulation' }}
                    className="text-[10px] text-white bg-[#C5A552] px-4 py-2 rounded-lg font-medium active:scale-95 transition-transform"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Backgrounds ── */}
        {activeTab === 'backgrounds' && (
          <div
            className="flex-1 overflow-y-auto px-2.5 pt-2 pb-1 min-h-0"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {/* Upload + No BG row */}
            <div className="flex items-center gap-2 mb-2">
              {/* None option */}
              <button
                onClick={() => { setSelectedBackground(null); setGeneratedImage(null) }}
                style={{ touchAction: 'manipulation' }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-[10px] font-medium transition-all active:scale-95 ${
                  !selectedBackground
                    ? 'border-[#C5A552] bg-[#C5A552]/5 text-[#C5A552]'
                    : 'border-stone-200 text-stone-400 bg-stone-50'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
                None
              </button>

              {/* Upload button */}
              <button
                onClick={() => bgUploadRef.current?.click()}
                style={{ touchAction: 'manipulation' }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-[#C5A552]/40 bg-[#C5A552]/5 text-[#C5A552] text-[10px] font-medium transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Background grid */}
            <div className="grid grid-cols-2 gap-2">
              {backgrounds.map((bg) => {
                const isActive = selectedBackground?.id === bg.id
                return (
                  <button
                    key={bg.id}
                    onClick={() => { setSelectedBackground(bg); setGeneratedImage(null) }}
                    style={{ touchAction: 'manipulation' }}
                    title={bg.label}
                    className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-150 active:scale-95 ${
                      isActive ? 'border-[#C5A552] shadow-[0_0_0_1px_rgba(197,165,82,0.25)]' : 'border-stone-200'
                    }`}
                  >
                    <div className="aspect-[4/3]">
                      <img
                        src={bg.thumb}
                        alt={bg.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement
                          el.style.opacity = '0'
                          if (el.parentElement) el.parentElement.style.backgroundColor = '#e7e5e4'
                        }}
                      />
                    </div>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C5A552] flex items-center justify-center shadow-md z-10">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-1.5">
                      <p className="text-[8px] text-white font-medium leading-tight truncate">{bg.label}</p>
                      <p className={`text-[7px] ${bg.isCustom ? 'text-[#C5A552]' : 'text-white/50'}`}>
                        {bg.isCustom ? 'Custom' : bg.category}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Tab: Product ── */}
        {activeTab === 'product' && (
          <div
            className="flex-1 overflow-y-auto py-1.5 px-2 min-h-0"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {dummyProducts.map((p) => {
              const isActive = selectedProduct.product_id === p.product_id && productOnCanvas
              return (
                <button
                  key={p.product_id}
                  onClick={() => {
                    setSelectedProduct(p)
                    setProductOnCanvas(true)
                    posRef.current = { x: 50, y: 50 }
                    setProductPos({ x: 50, y: 50 })
                    setGeneratedImage(null)
                    // Switch to backgrounds tab so user sees the canvas
                    setActiveTab('backgrounds')
                  }}
                  style={{ touchAction: 'manipulation' }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all border-l-2 active:bg-stone-100 ${
                    isActive ? 'bg-[#C5A552]/10 border-l-[#C5A552]' : 'hover:bg-stone-50 border-l-transparent bg-stone-50/50'
                  }`}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <img
                      src={getProductImageUrl(p)}
                      alt={p.product_name}
                      className="w-full h-full object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-[11px] font-semibold uppercase tracking-tight truncate ${isActive ? 'text-[#C5A552]' : 'text-stone-700'}`}>
                      {p.product_name}
                    </p>
                    <p className="text-[9px] text-stone-400 mt-0.5 truncate">{p.category_name} · {p.sub_category_name}</p>
                  </div>
                  {isActive ? (
                    <div className="w-5 h-5 rounded-full bg-[#C5A552] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-stone-200 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIVisualizerPageMobile
