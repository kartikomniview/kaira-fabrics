import { useState, useRef, useMemo, useEffect } from 'react'
import { newMaterials } from '../data/newmaterials'
import { dummyProducts, getProductImageUrl } from '../data/products'
import type { Product } from '../data/products'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'
const getCollectionThumbUrl = (name: string) =>
  `https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/${name}.webp`

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

// ── Component ─────────────────────────────────────────────────────────────────
const AIVisualizerPage = () => {
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
  const posRef = useRef({ x: 50, y: 50 })  // mirrors productPos but mutation-safe during drag

  // Product state
  const [selectedProduct, setSelectedProduct] = useState<Product>(dummyProducts[0])
  const [productOnCanvas, setProductOnCanvas] = useState(false)
  const [productPos, setProductPos] = useState({ x: 50, y: 50 })  // % of canvas
  const [productSize, setProductSize] = useState(220)  // px width

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

  const materialEnabled = !!(selectedBackground && productOnCanvas)
  const canGenerate = !isGenerating && materialEnabled && !!selectedMaterial

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
    // Direct DOM update — zero React re-renders during drag
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
      style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}
    >
      {/* ── Studio Toolbar ── */}
      <div className="h-10 shrink-0 bg-white border-b border-stone-200 flex items-center px-4 gap-3 shadow-sm">
        <div className="flex items-center gap-2 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552]" />
          <span className="text-[11px] text-stone-400 font-medium tracking-[0.18em] uppercase">Kaira</span>
          <span className="text-stone-300 text-xs">›</span>
          <span className="text-[11px] text-stone-700 tracking-widest uppercase">AI Interior Studio</span>
        </div>

        <div className="w-px h-4 bg-stone-200 mx-1" />

        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-sm">
          <svg className="w-3 h-3 text-[#C5A552]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-[10px] text-stone-500 tracking-wide">{selectedProduct.product_name}</span>
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

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">

        {/* ══════════════════════════════════════════════════════
            LEFT PANEL — Material Selector
        ══════════════════════════════════════════════════════ */}
        <div className="w-[430px] xl:w-[490px] shrink-0 flex flex-col overflow-hidden bg-white rounded-2xl shadow-sm border border-stone-200 relative">

          {/* ── Disabled overlay until background + product are ready ── */}
          {!materialEnabled && (
            <div className="absolute inset-0 z-20 rounded-2xl bg-white/80 backdrop-blur-[3px] flex flex-col items-center justify-center pointer-events-auto cursor-not-allowed">
              <div className="bg-white border border-stone-200 rounded-2xl px-6 py-5 shadow-xl text-center max-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-stone-700 text-[11px] font-semibold mb-1.5">Setup Required</p>
                <p className="text-stone-400 text-[10px] leading-relaxed">
                  Choose a <span className="text-[#C5A552] font-medium">background</span> and click a <span className="text-[#C5A552] font-medium">product</span> to unlock fabric selection
                </p>
                <div className="flex gap-2 justify-center mt-3.5">
                  <div className={`flex items-center gap-1 text-[8px] px-2.5 py-1 rounded-full ${
                    selectedBackground ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      selectedBackground ? 'bg-emerald-500' : 'bg-stone-300'
                    }`} />
                    Background
                  </div>
                  <div className={`flex items-center gap-1 text-[8px] px-2.5 py-1 rounded-full ${
                    productOnCanvas ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      productOnCanvas ? 'bg-emerald-500' : 'bg-stone-300'
                    }`} />
                    Product
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div className="shrink-0 p-3.5 border-b border-stone-200">
            <p className="text-[9px] text-[#C5A552] uppercase tracking-[0.18em] font-semibold mb-2.5">Filter Materials</p>

            {/* Search */}
            <div className="relative mb-3">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fabrics…"
                className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[11px] pl-7 pr-3 py-1.5 placeholder-stone-300 focus:outline-none focus:border-[#C5A552]/60 transition-colors rounded-lg"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Type */}
              <div className="w-1/3 shrink-0">
                <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1">Type</p>
                <div className="relative">
                  <select
                    value={activeMaterialType}
                    onChange={(e) => setActiveMaterialType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[10px] pl-2 pr-6 py-1.5 focus:outline-none focus:border-[#C5A552]/60 appearance-none cursor-pointer transition-colors rounded-lg"
                  >
                    {materialTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Color */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1">Color</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => scrollColors('left')} className="p-1 hover:bg-stone-50 rounded-full text-stone-400 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div ref={colorScrollRef} className="flex-1 flex gap-1.5 overflow-x-hidden scroll-smooth py-1">
                    <button
                      onClick={() => setActiveColorGroup('All')}
                      title="All colors"
                      className={`shrink-0 w-5 h-5 rounded-full border border-stone-200 flex items-center justify-center transition-all bg-white ${activeColorGroup === 'All' ? 'border-[#C5A552] ring-1 ring-[#C5A552]' : ''}`}
                    >
                      <span className="text-[7px] font-bold text-stone-400">A</span>
                    </button>
                    {COLOR_GROUPS.map((cg) => (
                      <button
                        key={cg}
                        onClick={() => setActiveColorGroup(cg)}
                        title={cg}
                        className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${activeColorGroup === cg ? 'border-[#C5A552] scale-110 shadow-sm' : 'border-transparent hover:border-stone-300'}`}
                        style={{ backgroundColor: COLOR_MAP[cg], boxShadow: cg === 'Whites' ? 'inset 0 0 0 1px #d6d3d1' : undefined }}
                      />
                    ))}
                  </div>
                  <button onClick={() => scrollColors('right')} className="p-1 hover:bg-stone-50 rounded-full text-stone-400 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
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
                  <span className="flex items-center gap-1 bg-[#C5A552]/10 text-[#C5A552] border border-[#C5A552]/30 text-[9px] px-2 py-0.5 rounded-full">
                    {activeMaterialType}
                    <button onClick={() => setActiveMaterialType('All')} className="text-[#C5A552]/60 hover:text-[#C5A552] transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {activeColorGroup !== 'All' && (
                  <span className="flex items-center gap-1 bg-[#C5A552]/10 text-[#C5A552] border border-[#C5A552]/30 text-[9px] px-2 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full shrink-0 border border-white/50" style={{ backgroundColor: COLOR_MAP[activeColorGroup] }} />
                    {activeColorGroup}
                    <button onClick={() => setActiveColorGroup('All')} className="text-[#C5A552]/60 hover:text-[#C5A552] transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {activeCollection !== 'All' && (
                  <span className="flex items-center gap-1 bg-[#C5A552]/10 text-[#C5A552] border border-[#C5A552]/30 text-[9px] px-2 py-0.5 rounded-full">
                    {activeCollection}
                    <button onClick={() => setActiveCollection('All')} className="text-[#C5A552]/60 hover:text-[#C5A552] transition-colors">
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

          {/* Collections sidebar + Materials grid */}
          <div className="flex-1 flex overflow-hidden">

            {/* Collections */}
            <div className="w-40 shrink-0 flex flex-col border-r border-stone-200 overflow-hidden">
              <div className="px-3 py-2 bg-stone-50 border-b border-stone-200 shrink-0">
                <p className="text-[9px] text-stone-500 uppercase tracking-[0.18em] font-medium">Collections</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <button
                  onClick={() => setActiveCollection('All')}
                  className={`w-full text-left px-2.5 py-2 flex items-center gap-2 border-b border-stone-50 transition-all border-l-2 ${activeCollection === 'All' ? 'bg-[#C5A552]/10 text-[#C5A552] border-l-[#C5A552]' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 border-l-transparent'}`}
                >
                  <div className="w-8 h-8 shrink-0 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] tracking-wide font-medium block truncate">All</span>
                    <span className={`text-[9px] tabular-nums ${activeCollection === 'All' ? 'text-[#C5A552]/70' : 'text-stone-300'}`}>{collectionCounts.All ?? 0}</span>
                  </div>
                </button>
                {collectionList.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCollection(c)}
                    className={`w-full text-left px-2.5 py-2 flex items-center gap-2 border-b border-stone-50 transition-all border-l-2 ${activeCollection === c ? 'bg-[#C5A552]/10 text-[#C5A552] border-l-[#C5A552]' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 border-l-transparent'}`}
                  >
                    <img
                      src={getCollectionThumbUrl(c)}
                      alt={c}
                      className="w-8 h-8 shrink-0 rounded-md object-cover border border-stone-200"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement
                        el.style.display = 'none'
                        if (el.parentElement) {
                          const ph = document.createElement('div')
                          ph.className = 'w-8 h-8 shrink-0 rounded-md bg-stone-100 border border-stone-200'
                          el.parentElement.insertBefore(ph, el)
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] tracking-wide block truncate">{c}</span>
                      <span className={`text-[9px] tabular-nums ${activeCollection === c ? 'text-[#C5A552]/70' : 'text-stone-300'}`}>{collectionCounts[c] ?? 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Materials grid */}
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
                          className={`group relative aspect-square overflow-hidden border transition-all duration-150 rounded-lg ${isActive ? 'border-[#C5A552] shadow-[0_0_0_1px_rgba(197,165,82,0.25)] scale-[1.03]' : 'border-stone-200 hover:border-stone-400'}`}
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
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C5A552] rounded-full flex items-center justify-center shadow-md">
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
                      className="mt-1 text-[10px] text-white bg-[#C5A552] hover:bg-[#b8943f] px-4 py-1.5 rounded-lg transition-colors tracking-wide font-medium"
                    >
                      Reset all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected material footer */}
          <div className="shrink-0 border-t-2 border-stone-200 bg-gradient-to-b from-stone-50 to-white">
            {selectedMaterial ? (
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-medium">Selected Fabric</p>
                </div>
                <div className="flex items-start gap-3">
                  <img
                    src={selectedMaterial.textureUrl}
                    alt={selectedMaterial.fabricName}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#C5A552]/30 shadow-md shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-tight truncate leading-tight">{selectedMaterial.collectionName}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">{selectedMaterial.fabricName.replace(selectedMaterial.collectionName, '').trim()}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {selectedMaterial.materialType && (
                        <span className="text-[8px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">{selectedMaterial.materialType}</span>
                      )}
                      {selectedMaterial.colorGroup && (
                        <span className="flex items-center gap-1 text-[8px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLOR_MAP[selectedMaterial.colorGroup] ?? '#aaa' }} />
                          {selectedMaterial.colorGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-stone-100 border-2 border-dashed border-stone-200 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-stone-600">No fabric selected</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Pick a material from the grid above</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CENTER — AI Preview Canvas
        ══════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

          {/* Canvas title bar */}
          <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 gap-2.5">
            <span className="text-[9px] text-stone-400 tracking-widest uppercase select-none">AI Preview Canvas</span>
            <div className="flex-1" />
            {generatedImage && (
              <button
                onClick={() => setGeneratedImage(null)}
                className="flex items-center gap-1.5 h-7 px-3 border border-stone-200 hover:border-stone-400 text-stone-500 hover:text-stone-700 transition-all rounded-lg text-[9px] tracking-wide"
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
                <p className="text-stone-400 text-xs tracking-wide font-medium">Select a background scene</p>
                <p className="text-stone-300 text-[10px] mt-1">then choose a fabric and product to generate your AI preview</p>
              </div>
            )}

            {/* Hint — background chosen but no product placed yet */}
            {selectedBackground && !productOnCanvas && !generatedImage && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Click a product on the right to place it on canvas
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
                  {/* Outer selection border + glow */}
                  <div
                    className="absolute inset-0 rounded-xl border-2 border-[#C5A552] shadow-[0_0_0_4px_rgba(197,165,82,0.18)] pointer-events-none z-10 transition-opacity opacity-0 group-hover:opacity-100"
                    style={{ margin: '-6px', borderRadius: '14px' }}
                  />

                  {/* Corner drag handles — visible on hover */}
                  {[
                    'top-0 left-0 -translate-x-1 -translate-y-1',
                    'top-0 right-0 translate-x-1 -translate-y-1',
                    'bottom-0 left-0 -translate-x-1 translate-y-1',
                    'bottom-0 right-0 translate-x-1 translate-y-1',
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className={`absolute w-3 h-3 bg-[#C5A552] rounded-sm shadow-md z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${cls}`}
                    />
                  ))}

                  {/* Top drag-handle badge */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-[#C5A552] text-white text-[8px] px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5 shadow-md">
                      <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                      </svg>
                      Drag to move
                    </div>
                  </div>

                  {/* Product image */}
                  <img
                    src={getProductImageUrl(selectedProduct)}
                    alt={selectedProduct.product_name}
                    style={{ width: `${productSize}px`, display: 'block' }}
                    className="object-contain drop-shadow-2xl select-none rounded-lg"
                    draggable={false}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }}
                  />

                  {/* ── Fabric placeholder strip ── */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    {selectedMaterial ? (
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#C5A552]/40 shadow-lg rounded-full px-2.5 py-1.5 whitespace-nowrap">
                        <img
                          src={selectedMaterial.textureUrl}
                          alt={selectedMaterial.fabricName}
                          className="w-5 h-5 rounded-full object-cover border border-[#C5A552]/50 shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                        <span className="text-[9px] text-stone-700 font-medium max-w-[120px] truncate">{selectedMaterial.fabricName}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552] shrink-0" />
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

                  {/* Size control strip — visible on hover, above fabric pill */}
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
                      className="w-24 h-1.5 accent-[#C5A552]"
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
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#C5A552] text-white px-3 py-1.5 rounded-lg shadow-md">
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
                <div className="w-10 h-10 border-2 border-stone-200 border-t-[#C5A552] rounded-full animate-spin mb-4" />
                <p className="text-stone-500 text-[11px] tracking-[0.2em] uppercase font-medium">Generating Preview…</p>
                <p className="text-stone-300 text-[10px] mt-1.5">AI is compositing your scene</p>
              </div>
            )}

            {/* Corner bracket decorations */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#C5A552]/30 pointer-events-none" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#C5A552]/30 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#C5A552]/30 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#C5A552]/30 pointer-events-none" />
          </div>

          {/* Bottom action bar */}
          <div className="shrink-0 border-t border-stone-200 bg-stone-50 px-4 py-3 flex items-center gap-3">
            {/* Status pills */}
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <div className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full ${selectedMaterial ? 'bg-[#C5A552]/10 text-[#C5A552]' : 'bg-stone-100 text-stone-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${selectedMaterial ? 'bg-[#C5A552]' : 'bg-stone-300'}`} />
                {selectedMaterial ? selectedMaterial.collectionName : 'No fabric'}
              </div>
              <div className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full ${selectedBackground ? 'bg-[#C5A552]/10 text-[#C5A552]' : 'bg-stone-100 text-stone-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${selectedBackground ? 'bg-[#C5A552]' : 'bg-stone-300'}`} />
                {selectedBackground ? selectedBackground.label : 'No background'}
              </div>
              <div className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full ${
                productOnCanvas ? 'bg-[#C5A552]/10 text-[#C5A552]' : 'bg-stone-100 text-stone-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  productOnCanvas ? 'bg-[#C5A552]' : 'bg-stone-300'
                }`} />
                {productOnCanvas ? selectedProduct.product_name : 'No product placed'}
              </div>
            </div>

            {/* Download */}
            {generatedImage && (
              <button className="flex items-center gap-1.5 h-8 px-4 border border-stone-200 hover:border-stone-400 text-stone-500 hover:text-stone-700 transition-all rounded-lg text-[10px] tracking-wide">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            )}

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`flex items-center gap-2 h-8 px-6 rounded-lg text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${canGenerate ? 'bg-[#C5A552] hover:bg-[#b8943f] text-white shadow-sm hover:shadow-md' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
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
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANEL — Background + Product
        ══════════════════════════════════════════════════════ */}
        <div className="w-[280px] xl:w-[300px] shrink-0 flex flex-col gap-4">

          {/* Background selector */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden min-h-0">
            <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 gap-2 justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-[#C5A552] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[10px] text-stone-600 font-semibold uppercase tracking-widest">Background</p>
              </div>
              <button
                onClick={() => bgUploadRef.current?.click()}
                className="flex items-center gap-1 h-6 px-2.5 bg-[#C5A552]/10 hover:bg-[#C5A552]/20 text-[#C5A552] border border-[#C5A552]/30 rounded-lg text-[9px] font-medium transition-all"
              >
                <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="flex-1 overflow-y-auto p-2.5">
              {/* None option */}
              <button
                onClick={() => { setSelectedBackground(null); setGeneratedImage(null) }}
                className={`w-full text-left mb-2 flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-2 transition-all ${!selectedBackground ? 'border-[#C5A552] bg-[#C5A552]/5' : 'border-stone-200 hover:border-stone-300 bg-stone-50'}`}
              >
                <div className="w-12 h-9 rounded-md bg-stone-200 border border-stone-300 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-[10px] text-stone-500 font-medium">No Background</span>
                {!selectedBackground && (
                  <div className="ml-auto w-3.5 h-3.5 rounded-full bg-[#C5A552] flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                  </div>
                )}
              </button>

              {/* Background grid */}
              <div className="grid grid-cols-2 gap-2">
                {backgrounds.map((bg) => {
                  const isActive = selectedBackground?.id === bg.id
                  return (
                    <button
                      key={bg.id}
                      onClick={() => { setSelectedBackground(bg); setGeneratedImage(null) }}
                      title={bg.label}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-150 ${isActive ? 'border-[#C5A552] shadow-[0_0_0_1px_rgba(197,165,82,0.25)]' : 'border-stone-200 hover:border-stone-400'}`}
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
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C5A552] flex items-center justify-center shadow-md z-10">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-1.5">
                        <p className="text-[8px] text-white font-medium leading-tight truncate">{bg.label}</p>
                        <p className={`text-[7px] ${bg.isCustom ? 'text-[#C5A552]' : 'text-white/50'}`}>{bg.isCustom ? 'Custom' : bg.category}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Product selector */}
          <div className="shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden" style={{ maxHeight: '250px' }}>
            <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 gap-2">
              <svg className="w-3 h-3 text-[#C5A552] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-[10px] text-stone-600 font-semibold uppercase tracking-widest">Product</p>
            </div>
            <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
              {dummyProducts.map((p) => {
                const isActive = selectedProduct.product_id === p.product_id
                return (
                  <button
                    key={p.product_id}
                    onClick={() => {
                      setSelectedProduct(p)
                      setProductOnCanvas(true)
                      posRef.current = { x: 50, y: 50 }
                      setProductPos({ x: 50, y: 50 })
                      setGeneratedImage(null)
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all border-l-2 mb-0.5 ${isActive ? 'bg-[#C5A552]/10 border-l-[#C5A552]' : 'hover:bg-stone-50 border-l-transparent'}`}
                  >
                    <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                      <img
                        src={getProductImageUrl(p)}
                        alt={p.product_name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-[10px] font-semibold uppercase tracking-tight truncate ${isActive ? 'text-[#C5A552]' : 'text-stone-700'}`}>{p.product_name}</p>
                      <p className="text-[9px] text-stone-400 tracking-wide mt-0.5 truncate">{p.category_name} · {p.sub_category_name}</p>
                    </div>
                    {isActive && (
                      <div className="w-4 h-4 rounded-full bg-[#C5A552] flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AIVisualizerPage
