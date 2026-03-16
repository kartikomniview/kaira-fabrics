import { useEffect, useRef, useState, useMemo } from 'react'
import { newMaterials } from '../data/newmaterials'
import { dummyProducts, getProductGlbUrl, getProductImageUrl } from '../data/products'
import type { Product } from '../data/products'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS } from '../utils/textureUtils'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const materialTypeOptions = ['All', ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort()]
const collectionList = Array.from(new Set(newMaterials.map((m) => m.collection_name).filter(Boolean))).sort()

const COLOR_GROUPS = ['Blues', 'Browns', 'Grays', 'Greens', 'Purples', 'Reds', 'Yellow', 'Whites', 'Blacks']
const COLOR_MAP: Record<string, string> = {
  Blues: '#3B82F6',
  Browns: '#92400E',
  Grays: '#9CA3AF',
  Greens: '#22C55E',
  Purples: '#A855F7',
  Reds: '#EF4444',
  Yellow: '#EAB308',
  Whites: '#F5F5F4',
  Blacks: '#1C1917',
}

// Collection thumbnail URL constant
const getCollectionThumbUrl = (name: string) => `https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/${name}.webp`

const S3_BASE = 'https://supoassets.s3.ap-south-1.amazonaws.com'
const COMPANY = 'KairaFabrics'

function getRoughnessMapURL(collectionName: string) {
  return `${S3_BASE}/public/textures/${COMPANY}/${collectionName}/${collectionName}_Roughness.webp`
}

function getNormalMapURL(collectionName: string) {
  return `${S3_BASE}/public/textures/${COMPANY}/${collectionName}/${collectionName}_Normal.webp`
}

function getSheenMapUrl(materialType: string) {
  if (materialType.includes('Fabric') || materialType.includes('Velvet') || materialType.includes('Suede')) {
    return `${S3_BASE}/public/textures/Common/SheenColorMap.webp`
  }
  return ''
}

function getUvValue(collectionName: string): number {
  if (
    collectionName === 'Florious' || collectionName === 'Indigo' ||
    collectionName === 'Aboone' || collectionName === 'Perth' ||
    collectionName === 'Ibiza' || collectionName === 'Intense'
  ) return 8
  if (collectionName.includes('DigitalPrint') || collectionName === 'Kadillac') return 8
  if (collectionName === 'Impression') return 14
  return 16
}

function getRoughnessValue(collectionName: string, baseRoughness: number): number {
  if (collectionName === 'Intense' || collectionName === 'Modello') return 0.6
  return baseRoughness
}



interface SelectedMaterial {
  id: number
  fabricName: string
  textureUrl: string
  roughness: number
  metalness: number
  collectionName: string
  materialCode: string
  materialType: string
  colorGroup: string | null
}

const ThreeDVisualizerPage = () => {
  const mvRef = useRef<HTMLElement>(null)
  const colorScrollRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [search, setSearch] = useState('')
  const [currentProduct, setCurrentProduct] = useState<Product>(dummyProducts[0])
  const [productPanelOpen, setProductPanelOpen] = useState(false)
  const [quotationOpen, setQuotationOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // Toggle flags for material maps
  const [applyRoughnessMap] = useState(false)
  const [applyNormalMap] = useState(false)
  const [applySheenMap] = useState(false)

  const modelUrl = getProductGlbUrl(currentProduct)

  const scrollColors = (direction: 'left' | 'right') => {
    if (colorScrollRef.current) {
      const scrollAmount = 120
      colorScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const filtered = useMemo(() => newMaterials.filter((m) => {
    if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
    if (activeCollection !== 'All' && m.collection_name !== activeCollection) return false
    if (activeColorGroup !== 'All' && m.color_group !== activeColorGroup) return false
    if (search) {
      const q = search.toLowerCase()
      const matchName = m.material_name?.toLowerCase().includes(q)
      const matchColl = m.collection_name?.toLowerCase().includes(q)
      const matchColor = m.color_group?.toLowerCase().includes(q)
      if (!matchName && !matchColl && !matchColor) return false
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

  const applyTexture = async (mat: SelectedMaterial) => {
    const mv = mvRef.current as any
    if (!mv) return
    setIsApplying(true)
    const [baseBlobUrl, roughnessBlobUrl, normalBlobUrl, sheenBlobUrl] = await Promise.all([
      fetchBlobUrl(mat.textureUrl),
      applyRoughnessMap ? fetchBlobUrl(getRoughnessMapURL(mat.collectionName)) : Promise.resolve(null),
      applyNormalMap ? fetchBlobUrl(getNormalMapURL(mat.collectionName)) : Promise.resolve(null),
      applySheenMap ? (() => { const u = getSheenMapUrl(mat.materialType); return u ? fetchBlobUrl(u) : Promise.resolve(null) })() : Promise.resolve(null),
    ])
    const uvScale = getUvValue(mat.collectionName)
    const roughness = getRoughnessValue(mat.collectionName, mat.roughness)
    await applyTextureToModel(mv, {
      baseBlobUrl,
      roughness,
      metalness: mat.metalness,
      uvScale,
      skipParts: NO_FABRIC_PARTS,
      roughnessBlobUrl,
      normalBlobUrl,
      sheenBlobUrl,
    })
    // Revoke blob URLs now that all texture objects have been created
    if (baseBlobUrl) URL.revokeObjectURL(baseBlobUrl)
    if (roughnessBlobUrl) URL.revokeObjectURL(roughnessBlobUrl)
    if (normalBlobUrl) URL.revokeObjectURL(normalBlobUrl)
    if (sheenBlobUrl) URL.revokeObjectURL(sheenBlobUrl)
    setIsApplying(false)
  }

  const handleSelect = (m: typeof newMaterials[0]) => {
    const mat: SelectedMaterial = {
      id: m.id,
      fabricName: `${m.collection_name} ${m.material_name}`,
      textureUrl: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
      roughness: m.roughness ?? 0.5,
      metalness: m.metalness ?? 0,
      collectionName: m.collection_name,
      materialCode: m.material_code,
      materialType: m.material_type ?? '',
      colorGroup: m.color_group,
    }
    setSelected(mat)
    if (modelLoaded) applyTexture(mat)
  }

  // Listen for model load
  useEffect(() => {
    const mv = mvRef.current as any
    if (!mv) return
    const onLoad = () => setModelLoaded(true)
    mv.addEventListener('load', onLoad)
    return () => mv.removeEventListener('load', onLoad)
  }, [])

  // If model loads after a material was already selected, apply it
  useEffect(() => {
    if (modelLoaded && selected) applyTexture(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelLoaded])

  // Reset model loaded state when product changes so loading overlay re-shows
  useEffect(() => {
    setModelLoaded(false)
  }, [currentProduct])

  return (
    <div
      className="flex flex-col overflow-hidden bg-stone-100"
      style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}
    >
      {/* ── Studio Toolbar ── */}
      <div className="h-10 shrink-0 bg-white border-b border-stone-200 flex items-center px-4 gap-3 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C5A552]" />
          <span className="text-[11px] text-stone-400 font-medium tracking-[0.18em] uppercase">Kaira</span>
          <span className="text-stone-300 text-xs">›</span>
          <span className="text-[11px] text-stone-700 tracking-widest uppercase">3D Fabric Studio</span>
        </div>

        <div className="w-px h-4 bg-stone-200 mx-1" />

        {/* Model badge */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-sm">
          <svg className="w-3 h-3 text-[#C5A552]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-[10px] text-stone-500 tracking-wide">{currentProduct.product_name}</span>
        </div>

        <div className="flex-1" />

        {/* Active texture chip */}
        {selected && (
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-sm">
            <img
              src={selected.textureUrl}
              alt=""
              className="w-4 h-4 rounded-sm object-cover border border-stone-200 shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-[10px] text-stone-600 truncate max-w-[160px]">{selected.fabricName}</span>
            {isApplying && (
              <div className="w-3 h-3 border border-[#C5A552]/40 border-t-[#C5A552] rounded-full animate-spin shrink-0" />
            )}
          </div>
        )}

        {/* Model status dot */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${modelLoaded ? 'bg-emerald-500' : 'bg-stone-300 animate-pulse'}`} />
          <span className="text-[10px] text-stone-400 tracking-wider">{modelLoaded ? 'Ready' : 'Loading'}</span>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">

        {/* ── LEFT: Material Selector ── */}
        <div className="w-[430px] xl:w-[490px] shrink-0 flex flex-col overflow-hidden bg-white rounded-2xl shadow-sm border border-stone-200">

          {/* Filter section */}
          <div className="shrink-0 p-3.5 border-b border-stone-200">
            <p className="text-[9px] text-[#C5A552] uppercase tracking-[0.18em] font-semibold mb-2.5">Filter Materials</p>
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
              <div className="w-1/3 shrink-0">
                <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1">Type</p>
                <div className="relative">
                  <select
                    value={activeMaterialType}
                    onChange={(e) => setActiveMaterialType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[10px] pl-2 pr-6 py-1.5 focus:outline-none focus:border-[#C5A552]/60 appearance-none cursor-pointer transition-colors rounded-lg"
                  >
                    {materialTypeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1">Color</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollColors('left')}
                    className="p-1 hover:bg-stone-50 rounded-full text-stone-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div
                    ref={colorScrollRef}
                    className="flex-1 flex gap-1.5 overflow-x-hidden scroll-smooth py-1"
                  >
                    <button
                      onClick={() => setActiveColorGroup('All')}
                      title="All colors"
                      className={`shrink-0 w-5 h-5 rounded-full border border-stone-200 flex items-center justify-center transition-all bg-white ${
                        activeColorGroup === 'All' ? 'border-[#C5A552] ring-1 ring-[#C5A552]' : ''
                      }`}
                    >
                      <span className="text-[7px] font-bold text-stone-400">A</span>
                    </button>
                    {COLOR_GROUPS.map((cg) => (
                      <button
                        key={cg}
                        onClick={() => setActiveColorGroup(cg)}
                        title={cg}
                        className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${
                          activeColorGroup === cg
                            ? 'border-[#C5A552] scale-110 shadow-sm'
                            : 'border-transparent hover:border-stone-300'
                        }`}
                        style={{
                          backgroundColor: COLOR_MAP[cg],
                          boxShadow: cg === 'Whites' ? 'inset 0 0 0 1px #d6d3d1' : undefined,
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => scrollColors('right')}
                    className="p-1 hover:bg-stone-50 rounded-full text-stone-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
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
                    <svg className="w-2.5 h-2.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
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

                <button
                  onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setActiveColorGroup('All'); setSearch('') }}
                  className="text-[8px] text-stone-400 hover:text-stone-600 uppercase tracking-widest transition-colors ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Collections list + Materials grid */}
          <div className="flex-1 flex overflow-hidden">

            {/* Collections sidebar */}
            <div className="w-40 shrink-0 flex flex-col border-r border-stone-200 overflow-hidden">
              <div className="px-3 py-2 bg-stone-50 border-b border-stone-200 shrink-0">
                <p className="text-[9px] text-stone-500 uppercase tracking-[0.18em] font-medium">Collections</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <button
                  onClick={() => setActiveCollection('All')}
                  className={`w-full text-left px-2.5 py-2 flex items-center gap-2 border-b border-stone-50 transition-all border-l-2 ${
                    activeCollection === 'All'
                      ? 'bg-[#C5A552]/10 text-[#C5A552] border-l-[#C5A552]'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 border-l-transparent'
                  }`}
                >
                  <div className="w-8 h-8 shrink-0 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] tracking-wide font-medium block truncate">All</span>
                    <span className={`text-[9px] tabular-nums ${activeCollection === 'All' ? 'text-[#C5A552]/70' : 'text-stone-300'}`}>
                      {collectionCounts.All ?? 0}
                    </span>
                  </div>
                </button>
                {collectionList.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCollection(c)}
                    className={`w-full text-left px-2.5 py-2 flex items-center gap-2 border-b border-stone-50 transition-all border-l-2 ${
                      activeCollection === c
                        ? 'bg-[#C5A552]/10 text-[#C5A552] border-l-[#C5A552]'
                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 border-l-transparent'
                    }`}
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
                      <span className={`text-[9px] tabular-nums ${activeCollection === c ? 'text-[#C5A552]/70' : 'text-stone-300'}`}>
                        {collectionCounts[c] ?? 0}
                      </span>
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
                      const isActive = selected?.id === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleSelect(m)}
                          title={`${m.collection_name} ${m.material_name}`}
                          className={`group relative aspect-square overflow-hidden border transition-all duration-150 rounded-lg ${
                            isActive
                              ? 'border-[#C5A552] shadow-[0_0_0_1px_rgba(197,165,82,0.25)] scale-[1.03]'
                              : 'border-stone-200 hover:border-stone-400'
                          }`}
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
                          <div className={`absolute inset-0 bg-black/55 flex flex-col items-center justify-center p-1 transition-opacity ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
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
                    <div className="flex flex-wrap gap-1 justify-center">
                      {search && <span className="text-[9px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Search: "{search}"</span>}
                      {activeMaterialType !== 'All' && <span className="text-[9px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{activeMaterialType}</span>}
                      {activeColorGroup !== 'All' && <span className="text-[9px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{activeColorGroup}</span>}
                      {activeCollection !== 'All' && <span className="text-[9px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{activeCollection}</span>}
                    </div>
                    <button
                      onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setActiveColorGroup('All'); setSearch('') }}
                      className="mt-1 text-[10px] text-white bg-[#C5A552] hover:bg-[#b8943f] px-4 py-1.5 rounded-lg transition-colors tracking-wide font-medium"
                    >
                      Reset all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected material info */}
          <div className="shrink-0 border-t-2 border-stone-200 bg-gradient-to-b from-stone-50 to-white">
            {selected ? (
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${isApplying ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-medium">
                    {isApplying ? 'Applying…' : 'Applied Fabric'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={selected.textureUrl}
                      alt={selected.fabricName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#C5A552]/30 shadow-md"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    {isApplying && (
                      <div className="absolute inset-0 rounded-xl bg-white/60 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#C5A552]/40 border-t-[#C5A552] rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-tight truncate leading-tight">{selected.collectionName}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">{selected.fabricName.replace(selected.collectionName, '').trim()}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {selected.materialType && (
                        <span className="text-[8px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">{selected.materialType}</span>
                      )}
                      {selected.colorGroup && (
                        <span className="flex items-center gap-1 text-[8px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLOR_MAP[selected.colorGroup] ?? '#aaa' }} />
                          {selected.colorGroup}
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
                  <p className="text-[10px] text-stone-400 mt-0.5">Pick a material from the grid to apply it to the 3D model</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: 3D Viewport ── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

          {/* Viewport title bar */}
          <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 gap-2.5">
            {/* Change Product button */}
            <button
              onClick={() => setProductPanelOpen(true)}
              className="flex items-center gap-1.5 h-7 px-3 bg-[#C5A552] hover:bg-[#b8943f] text-white transition-all rounded-lg shrink-0 shadow-sm"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[9px] tracking-wide font-semibold">Change Product</span>
            </button>

            <div className="w-px h-4 bg-stone-200" />
            <span className="text-[9px] text-stone-400 tracking-widest uppercase select-none">Viewport · Perspective</span>
            <div className="flex-1" />
            <span className="text-[9px] text-stone-300 select-none">Drag to orbit · Scroll to zoom</span>
          </div>

          {/* model-viewer fills remaining space */}
          <div className="flex-1 relative">
            {/* @ts-ignore */}
            <model-viewer
              ref={mvRef as any}
              src={modelUrl}
              alt={`${currentProduct.product_name} 3D model`}
              camera-controls
              disable-pan
              tone-mapping="neutral"
              exposure="0.8"
              shadow-intensity="1"
              shadow-softness="0.5"
              max-camera-orbit="Infinity 90deg auto"
              camera-orbit="auto auto 4m"
              ar
              ar-modes="scene-viewer quick-look"
              style={{ width: '100%', height: '100%', background: '#ffffff' }}
            />

            {/* ── Product selector slide panel ── */}
            {/* Backdrop */}
            <div
              className={`absolute inset-0 z-20 bg-black/25 transition-opacity duration-300 ${
                productPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setProductPanelOpen(false)}
            />
            {/* Panel */}
            <div
              className={`absolute inset-y-0 left-0 z-30 w-64 flex flex-col bg-white border-r border-stone-200 shadow-2xl transition-transform duration-300 ease-out ${
                productPanelOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Panel header */}
              <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 justify-between">
                <div>
                  <p className="text-[10px] text-stone-600 font-semibold uppercase tracking-widest">Products</p>
                </div>
                <button
                  onClick={() => setProductPanelOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-y-auto py-1">
                {dummyProducts.map((p) => {
                  const isActive = currentProduct.product_id === p.product_id
                  return (
                    <button
                      key={p.product_id}
                      onClick={() => { setCurrentProduct(p); setProductPanelOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all border-l-2 ${
                        isActive
                          ? 'bg-[#C5A552]/10 border-l-[#C5A552]'
                          : 'hover:bg-stone-50 border-l-transparent'
                      }`}
                    >
                      <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                        <img
                          src={getProductImageUrl(p)}
                          alt={p.product_name}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-[11px] font-semibold uppercase tracking-tight truncate ${
                          isActive ? 'text-[#C5A552]' : 'text-stone-700'
                        }`}>
                          {p.product_name}
                        </p>
                        <p className="text-[9px] text-stone-400 tracking-wide mt-0.5">
                          {p.category_name} · {p.sub_category_name}
                        </p>
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

            {/* Get Quotation — large bottom-right CTA */}
            {!productPanelOpen && (
              <div className="absolute bottom-5 right-5 z-10">
                <button
                  onClick={() => setQuotationOpen(true)}
                  className="flex items-center gap-2.5 pl-4 pr-5 py-3 bg-[#C5A552] hover:bg-[#b8943f] active:bg-[#a07c30] text-white rounded-xl shadow-xl hover:shadow-2xl transition-all text-sm font-semibold tracking-wide group"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Get Quotation
                </button>
              </div>
            )}

            {/* Corner bracket decorations */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#C5A552]/30 pointer-events-none" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#C5A552]/30 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#C5A552]/30 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#C5A552]/30 pointer-events-none" />

            {/* Model loading overlay */}
            {!modelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 pointer-events-none">
                <div className="w-8 h-8 border-2 border-stone-200 border-t-[#C5A552] rounded-full animate-spin mb-4" />
                <p className="text-stone-400 text-[11px] tracking-[0.2em] uppercase">Loading 3D Model</p>
                <p className="text-stone-300 text-[10px] mt-1 tracking-wide">{currentProduct.product_name}</p>
              </div>
            )}

            {/* Texture applying overlay */}
            {isApplying && modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10 pointer-events-none">
                <div className="bg-white border border-stone-200 px-6 py-3 flex items-center gap-3 shadow-lg rounded-lg">
                  <div className="w-4 h-4 border-2 border-stone-200 border-t-[#C5A552] rounded-full animate-spin" />
                  <span className="text-stone-500 text-[11px] tracking-[0.15em] uppercase">Applying texture…</span>
                </div>
              </div>
            )}

            {/* Bottom info bar */}
            {selected && modelLoaded && !isApplying && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-stone-200 shadow-md px-4 py-2 pointer-events-none flex items-center gap-3 rounded-lg">
                <img
                  src={selected.textureUrl}
                  alt=""
                  className="w-6 h-6 rounded object-cover border border-stone-200"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div>
                  <span className="text-[10px] text-stone-600 tracking-widest uppercase">{selected.fabricName}</span>
                  <span className="text-[10px] text-stone-400 ml-2">R:{selected.roughness.toFixed(1)} M:{selected.metalness.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quotation Modal ── */}
      {quotationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setQuotationOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#C5A552] uppercase tracking-widest font-semibold">Contact Us</p>
                <p className="text-base font-bold text-stone-800 mt-0.5">Get a Quotation</p>
              </div>
              <button
                onClick={() => setQuotationOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Context strip — shows selected fabric + product */}
            {selected && (
              <div className="px-5 py-3 bg-[#C5A552]/5 border-b border-[#C5A552]/15 flex items-center gap-3">
                <img
                  src={selected.textureUrl}
                  alt={selected.fabricName}
                  className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-stone-700 truncate">{selected.fabricName}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">on {currentProduct.product_name} · {selected.materialType}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              className="px-5 py-4 space-y-3"
              onSubmit={(e) => { e.preventDefault(); setQuotationOpen(false) }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[11px] px-3 py-2 rounded-lg focus:outline-none focus:border-[#C5A552]/60 transition-colors placeholder-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[11px] px-3 py-2 rounded-lg focus:outline-none focus:border-[#C5A552]/60 transition-colors placeholder-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Email *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[11px] px-3 py-2 rounded-lg focus:outline-none focus:border-[#C5A552]/60 transition-colors placeholder-stone-300"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Message</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your requirements…"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[11px] px-3 py-2 rounded-lg focus:outline-none focus:border-[#C5A552]/60 transition-colors placeholder-stone-300 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setQuotationOpen(false)}
                  className="flex-1 py-2 border border-stone-200 hover:bg-stone-50 text-stone-500 text-[11px] font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#C5A552] hover:bg-[#b8943f] text-white text-[11px] font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThreeDVisualizerPage
