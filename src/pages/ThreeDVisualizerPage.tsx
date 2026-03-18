import { useEffect, useRef, useState, useMemo } from 'react'
import ThreeDVisualizerPageMobile from './ThreeDVisualizerPageMobile'
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

const ThreeDVisualizerDesktop = () => {
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
      className="flex flex-col overflow-hidden bg-stone-50 font-sans"
      style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}
    >
      {/* ── Studio Toolbar ── */}
      <div className="h-12 shrink-0 bg-white border-b border-stone-200 flex items-center px-6 gap-4 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase">Kaira</span>
          <span className="text-stone-300 text-xs">›</span>
          <span className="text-[10px] text-stone-900 font-bold tracking-[0.2em] uppercase">3D Fabric Studio</span>
        </div>

        <div className="w-px h-5 bg-stone-200 mx-2" />

        {/* Model badge */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-sm">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-[10px] text-stone-600 font-medium tracking-[0.1em] uppercase">{currentProduct.product_name}</span>
        </div>

        <div className="flex-1" />

        {/* Active texture chip */}
        {selected && (
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-sm">
            <img
              src={selected.textureUrl}
              alt=""
              className="w-5 h-5 rounded-sm object-cover border border-stone-200 shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-[10px] text-stone-700 font-medium tracking-wide truncate max-w-[160px]">{selected.fabricName}</span>
            {isApplying && (
              <div className="w-3.5 h-3.5 border border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
            )}
          </div>
        )}

        {/* Model status dot */}
        <div className="flex items-center gap-2 ml-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${modelLoaded ? 'bg-emerald-500' : 'bg-stone-300 animate-pulse'}`} />
          <span className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase">{modelLoaded ? 'Ready' : 'Loading'}</span>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6">

        {/* ── LEFT: Material Selector ── */}
        <div className="w-[430px] xl:w-[490px] shrink-0 flex flex-col overflow-hidden bg-white rounded-sm shadow-sm border border-stone-200/80">

          {/* Filter section */}
          <div className="shrink-0 p-5 border-b border-stone-200/80 bg-stone-50/50">
            <p className="text-[10px] text-stone-900 uppercase tracking-[0.2em] font-bold mb-4">Filter Materials</p>
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fabrics…"
                className="w-full bg-white border border-stone-200 text-stone-700 text-xs pl-9 pr-3 py-2 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors rounded-sm shadow-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-1/3 shrink-0">
                <p className="text-[9px] text-stone-500 uppercase tracking-[0.2em] font-bold mb-2">Type</p>
                <div className="relative">
                  <select
                    value={activeMaterialType}
                    onChange={(e) => setActiveMaterialType(e.target.value)}
                    className="w-full bg-white border border-stone-200 text-stone-700 text-[11px] pl-3 pr-8 py-2 focus:outline-none focus:border-stone-400 appearance-none cursor-pointer transition-colors rounded-sm shadow-sm"
                  >
                    {materialTypeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-stone-500 uppercase tracking-[0.2em] font-bold mb-2">Color</p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollColors('left')}
                    className="p-1 hover:bg-stone-100 rounded-sm text-stone-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div
                    ref={colorScrollRef}
                    className="flex-1 flex gap-2 overflow-x-hidden scroll-smooth py-1"
                  >
                    <button
                      onClick={() => setActiveColorGroup('All')}
                      title="All colors"
                      className={`shrink-0 w-6 h-6 rounded-sm border flex items-center justify-center transition-all bg-white ${
                        activeColorGroup === 'All' ? 'border-stone-900 shadow-sm' : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-stone-600">All</span>
                    </button>
                    {COLOR_GROUPS.map((cg) => (
                      <button
                        key={cg}
                        onClick={() => setActiveColorGroup(cg)}
                        title={cg}
                        className={`w-6 h-6 rounded-sm border-2 transition-all shrink-0 ${
                          activeColorGroup === cg
                            ? 'border-stone-900 scale-110 shadow-sm'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: COLOR_MAP[cg],
                          boxShadow: cg === 'Whites' ? 'inset 0 0 0 1px #e7e5e4' : 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => scrollColors('right')}
                    className="p-1 hover:bg-stone-100 rounded-sm text-stone-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(activeMaterialType !== 'All' || activeCollection !== 'All' || activeColorGroup !== 'All' || search) && (
              <div className="mt-4 pt-4 border-t border-stone-200 flex flex-wrap gap-2 items-center">
                <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold shrink-0">Tags:</span>

                {search && (
                  <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-[10px] px-2.5 py-1 rounded-sm border border-stone-200">
                    <svg className="w-3 h-3 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="max-w-[100px] truncate leading-none">"{search}"</span>
                    <button onClick={() => setSearch('')} className="text-stone-400 hover:text-stone-900 transition-colors ml-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}

                {activeMaterialType !== 'All' && (
                  <span className="flex items-center gap-1.5 bg-primary/20 text-stone-900 border border-primary/40 text-[10px] px-2.5 py-1 rounded-sm font-medium">
                    {activeMaterialType}
                    <button onClick={() => setActiveMaterialType('All')} className="text-stone-500 hover:text-stone-900 transition-colors ml-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}

                {activeColorGroup !== 'All' && (
                  <span className="flex items-center gap-1.5 bg-primary/20 text-stone-900 border border-primary/40 text-[10px] px-2.5 py-1 rounded-sm font-medium">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/50" style={{ backgroundColor: COLOR_MAP[activeColorGroup] }} />
                    {activeColorGroup}
                    <button onClick={() => setActiveColorGroup('All')} className="text-stone-500 hover:text-stone-900 transition-colors ml-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}

                {activeCollection !== 'All' && (
                  <span className="flex items-center gap-1.5 bg-primary/20 text-stone-900 border border-primary/40 text-[10px] px-2.5 py-1 rounded-sm font-medium">
                    {activeCollection}
                    <button onClick={() => setActiveCollection('All')} className="text-stone-500 hover:text-stone-900 transition-colors ml-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}

                <button
                  onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setActiveColorGroup('All'); setSearch('') }}
                  className="text-[9px] text-stone-400 hover:text-stone-900 uppercase tracking-[0.2em] font-bold transition-colors ml-auto flex items-center gap-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Collections list + Materials grid */}
          <div className="flex-1 flex overflow-hidden">

            {/* Collections sidebar */}
            <div className="w-40 shrink-0 flex flex-col border-r border-stone-200/80 overflow-hidden bg-stone-50/30">
              <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-200/80 shrink-0">
                <p className="text-[9px] text-stone-500 uppercase tracking-[0.2em] font-bold">Collections</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <button
                  onClick={() => setActiveCollection('All')}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-stone-100 transition-all border-l-[3px] ${
                    activeCollection === 'All'
                      ? 'bg-white text-stone-900 border-l-stone-900 shadow-sm'
                      : 'text-stone-500 hover:bg-white hover:text-stone-900 border-l-transparent'
                  }`}
                >
                  <div className="w-8 h-8 shrink-0 rounded-sm bg-stone-100 border border-stone-200 flex items-center justify-center">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] tracking-wide font-medium block truncate">All</span>
                    <span className={`text-[10px] tabular-nums ${activeCollection === 'All' ? 'text-stone-500' : 'text-stone-400'}`}>
                      {collectionCounts.All ?? 0}
                    </span>
                  </div>
                </button>
                {collectionList.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCollection(c)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-stone-100 transition-all border-l-[3px] ${
                      activeCollection === c
                        ? 'bg-white text-stone-900 border-l-stone-900 shadow-sm'
                        : 'text-stone-500 hover:bg-white hover:text-stone-900 border-l-transparent'
                    }`}
                  >
                    <img
                      src={getCollectionThumbUrl(c)}
                      alt={c}
                      className="w-8 h-8 shrink-0 rounded-sm object-cover border border-stone-200"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement
                        el.style.display = 'none'
                        if (el.parentElement) {
                          const ph = document.createElement('div')
                          ph.className = 'w-8 h-8 shrink-0 rounded-sm bg-stone-100 border border-stone-200'
                          el.parentElement.insertBefore(ph, el)
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] tracking-wide block truncate">{c}</span>
                      <span className={`text-[10px] tabular-nums ${activeCollection === c ? 'text-stone-500' : 'text-stone-400'}`}>
                        {collectionCounts[c] ?? 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Materials grid */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-200/80 flex items-center justify-between shrink-0">
                <p className="text-[10px] text-stone-900 font-bold uppercase tracking-[0.1em] truncate">
                  {activeCollection === 'All' ? 'All Materials' : activeCollection}
                </p>
                <span className="text-[10px] text-stone-600 font-medium tabular-nums shrink-0 ml-2 bg-white border border-stone-200 px-2 py-0.5 rounded-sm">{filtered.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-sm bg-stone-100 overflow-hidden border border-stone-200"
                        aria-hidden="true"
                      >
                        <div
                          className="absolute inset-0 -translate-x-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                            animation: `kaira-shimmer 1.6s ease-in-out ${i * 0.05}s infinite`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : filtered.length > 0 ? (
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map((m) => {
                      const isActive = selected?.id === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleSelect(m)}
                          title={`${m.collection_name} ${m.material_name}`}
                          className={`group relative aspect-square overflow-hidden border transition-all duration-300 rounded-sm ${
                            isActive
                              ? 'border-stone-900 shadow-md scale-100'
                              : 'border-stone-200 hover:border-stone-500 hover:shadow-sm'
                          }`}
                        >
                          <img
                            src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                            alt={`${m.collection_name} ${m.material_name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement
                              el.style.display = 'none'
                              if (el.parentElement) el.parentElement.style.backgroundColor = '#f5f5f4'
                            }}
                          />
                          <div className={`absolute inset-0 bg-stone-900/40 flex flex-col items-center justify-center p-2 transition-opacity duration-300 ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <p className="text-[9px] text-white font-bold uppercase text-center leading-tight tracking-[0.2em] line-clamp-2">{m.collection_name}</p>
                            <p className="text-[8px] text-white/90 mt-1 tracking-wider uppercase">{m.material_name}</p>
                          </div>
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-stone-900 rounded-sm flex items-center justify-center shadow-lg">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 px-4 gap-4">
                    <div className="w-12 h-12 rounded-sm bg-stone-50 border border-stone-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-stone-800 text-[13px] font-bold tracking-wide">No materials found</p>
                      <p className="text-stone-500 text-[11px] mt-1">Adjust filters to see more results</p>
                    </div>
                    <button
                      onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setActiveColorGroup('All'); setSearch('') }}
                      className="mt-2 text-[10px] text-stone-900 border border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white px-5 py-2 rounded-sm transition-all tracking-[0.15em] font-bold uppercase"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected material info */}
          <div className="shrink-0 border-t border-stone-200 bg-white">
            {selected ? (
              <div className="p-5 flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={selected.textureUrl}
                    alt={selected.fabricName}
                    className="w-20 h-20 rounded-sm object-cover border border-stone-200 shadow-sm"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                  {isApplying && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isApplying ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                    <p className="text-[9px] text-stone-500 uppercase tracking-[0.2em] font-bold">
                      {isApplying ? 'Applying…' : 'Applied Fabric'}
                    </p>
                  </div>
                  <p className="text-sm font-serif font-medium text-stone-900 truncate">{selected.collectionName}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate tracking-wide uppercase">{selected.fabricName.replace(selected.collectionName, '').trim()}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {selected.materialType && (
                      <span className="text-[9px] bg-stone-50 border border-stone-200 text-stone-600 px-2 py-1 rounded-sm font-bold uppercase tracking-widest">{selected.materialType}</span>
                    )}
                    {selected.colorGroup && (
                      <span className="flex items-center gap-1.5 text-[9px] bg-stone-50 border border-stone-200 text-stone-600 px-2 py-1 rounded-sm font-bold uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full shrink-0 border border-stone-200" style={{ backgroundColor: COLOR_MAP[selected.colorGroup] ?? '#aaa' }} />
                        {selected.colorGroup}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 flex items-center gap-4">
                <div className="w-20 h-20 bg-stone-50 border border-dashed border-stone-300 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-700 uppercase tracking-widest">No fabric selected</p>
                  <p className="text-[11px] text-stone-500 mt-1">Pick a material from the grid to apply it to the 3D model</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: 3D Viewport ── */}
        <div className="flex-1 flex flex-col bg-stone-50 rounded-sm shadow-sm border border-stone-200 overflow-hidden relative">

          {/* Viewport title bar */}
          <div className="h-12 shrink-0 bg-white border-b border-stone-200/80 flex items-center px-4 gap-4 z-10 relative">
            {/* Change Product button */}
            <button
              onClick={() => setProductPanelOpen(true)}
              className="flex items-center gap-2 h-8 px-4 bg-stone-900 hover:bg-stone-800 text-white transition-all rounded-sm shrink-0 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] tracking-[0.1em] uppercase font-bold">Change Product</span>
            </button>

            <div className="w-px h-5 bg-stone-200" />
            <span className="text-[10px] text-stone-400 tracking-[0.2em] font-bold uppercase select-none">Viewport · Perspective</span>
            <div className="flex-1" />
            <span className="text-[10px] text-stone-400 tracking-wider select-none font-medium">Drag to orbit · Scroll to zoom</span>
          </div>

          {/* model-viewer fills remaining space */}
          <div className="flex-1 relative bg-stone-50">
            {/* @ts-ignore */}
            <model-viewer
              ref={mvRef as any}
              src={modelUrl}
              alt={`${currentProduct.product_name} 3D model`}
              camera-controls
              disable-pan
              tone-mapping="neutral"
              exposure="0.9"
              shadow-intensity="1.2"
              shadow-softness="0.8"
              max-camera-orbit="Infinity 90deg auto"
              camera-orbit="auto auto 4m"
              ar
              ar-modes="scene-viewer quick-look"
              style={{ width: '100%', height: '100%', background: '#fafaf9' }}
            />

            {/* ── Product selector slide panel ── */}
            {/* Backdrop */}
            <div
              className={`absolute inset-0 z-20 bg-stone-900/30 backdrop-blur-[1px] transition-opacity duration-300 ${
                productPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setProductPanelOpen(false)}
            />
            {/* Panel */}
            <div
              className={`absolute inset-y-0 left-0 z-30 w-72 flex flex-col bg-white border-r border-stone-200 shadow-2xl transition-transform duration-300 ease-in-out ${
                productPanelOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Panel header */}
              <div className="h-12 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-5 justify-between">
                <div>
                  <p className="text-[10px] text-stone-900 font-bold uppercase tracking-[0.2em]">Products</p>
                </div>
                <button
                  onClick={() => setProductPanelOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-y-auto py-2">
                {dummyProducts.map((p) => {
                  const isActive = currentProduct.product_id === p.product_id
                  return (
                    <button
                      key={p.product_id}
                      onClick={() => { setCurrentProduct(p); setProductPanelOpen(false) }}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 transition-all border-l-[3px] border-b border-stone-50/50 ${
                        isActive
                          ? 'bg-stone-50 text-stone-900 border-l-stone-900'
                          : 'hover:bg-stone-50 border-l-transparent text-stone-600'
                      }`}
                    >
                      <div className="w-14 h-14 shrink-0 rounded-sm overflow-hidden border border-stone-200 bg-white">
                        <img
                          src={getProductImageUrl(p)}
                          alt={p.product_name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-xs font-bold uppercase tracking-widest truncate ${
                          isActive ? 'text-stone-900' : 'text-stone-700'
                        }`}>
                          {p.product_name}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium tracking-[0.1em] mt-1 uppercase">
                          {p.category_name} · {p.sub_category_name}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
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
              <div className="absolute bottom-6 right-6 z-10">
                <button
                  onClick={() => setQuotationOpen(true)}
                  className="flex items-center gap-3 px-6 py-4 bg-primary text-stone-900 border border-transparent hover:bg-stone-900 hover:text-white transition-all duration-300 rounded-sm shadow-xl hover:shadow-2xl font-bold uppercase tracking-[0.2em] text-[11px] group"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Get Quotation
                </button>
              </div>
            )}

            {/* Corner bracket decorations */}
            <div className="absolute top-5 left-5 w-6 h-6 border-t border-l border-stone-300 pointer-events-none" />
            <div className="absolute top-5 right-5 w-6 h-6 border-t border-r border-stone-300 pointer-events-none" />
            <div className="absolute bottom-5 left-5 w-6 h-6 border-b border-l border-stone-300 pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-6 h-6 border-b border-r border-stone-300 pointer-events-none" />

            {/* Model loading overlay */}
            {!modelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10 pointer-events-none">
                <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-6" />
                <p className="text-stone-900 text-[11px] font-bold tracking-[0.3em] uppercase">Loading 3D Model</p>
                <p className="text-stone-500 text-[10px] mt-2 font-medium tracking-widest">{currentProduct.product_name}</p>
              </div>
            )}

            {/* Texture applying overlay */}
            {isApplying && modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-10 pointer-events-none">
                <div className="bg-white border border-stone-200/50 px-8 py-4 flex items-center gap-4 shadow-xl rounded-sm">
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                  <span className="text-stone-900 text-[10px] font-bold tracking-[0.2em] uppercase">Applying Texture…</span>
                </div>
              </div>
            )}

            {/* Bottom info bar */}
            {selected && modelLoaded && !isApplying && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl px-5 py-3 pointer-events-none flex items-center gap-4 rounded-sm">
                <img
                  src={selected.textureUrl}
                  alt=""
                  className="w-8 h-8 rounded-sm object-cover border border-stone-200"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div>
                  <span className="text-[11px] font-bold text-stone-900 tracking-[0.2em] uppercase block mb-0.5">{selected.fabricName}</span>
                  <span className="text-[9px] text-stone-500 font-medium tracking-widest">Roughness: {selected.roughness.toFixed(1)} · Metalness: {selected.metalness.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quotation Modal ── */}
      {quotationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setQuotationOpen(false) }}
        >
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200">

            {/* Modal header */}
            <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold mb-1">Contact Us</p>
                <p className="text-2xl font-serif text-stone-900">Get a Quotation</p>
              </div>
              <button
                onClick={() => setQuotationOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-sm hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-colors border border-transparent hover:border-stone-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Context strip — shows selected fabric + product */}
            {selected && (
              <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center gap-4">
                <img
                  src={selected.textureUrl}
                  alt={selected.fabricName}
                  className="w-14 h-14 rounded-sm object-cover border border-stone-200 shrink-0 shadow-sm"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 uppercase tracking-widest truncate">{selected.fabricName}</p>
                  <p className="text-[10px] text-stone-500 font-medium tracking-wide mt-1 uppercase">on {currentProduct.product_name} · {selected.materialType}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              className="px-6 py-5 space-y-4"
              onSubmit={(e) => { e.preventDefault(); setQuotationOpen(false) }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-2 uppercase tracking-[0.2em]">Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    className="w-full bg-white border border-stone-200 text-stone-900 text-xs px-4 py-3 rounded-sm focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-2 uppercase tracking-[0.2em]">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    className="w-full bg-white border border-stone-200 text-stone-900 text-xs px-4 py-3 rounded-sm focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold mb-2 uppercase tracking-[0.2em]">Email *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white border border-stone-200 text-stone-900 text-xs px-4 py-3 rounded-sm focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder-stone-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold mb-2 uppercase tracking-[0.2em]">Message</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your requirements…"
                  className="w-full bg-white border border-stone-200 text-stone-900 text-xs px-4 py-3 rounded-sm focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder-stone-400 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setQuotationOpen(false)}
                  className="flex-1 py-3.5 border border-stone-200 hover:border-stone-900 hover:bg-stone-50 text-stone-900 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-stone-900 hover:bg-primary hover:text-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all"
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

const ThreeDVisualizerPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  if (isMobile) return <ThreeDVisualizerPageMobile />
  return <ThreeDVisualizerDesktop />
}

export default ThreeDVisualizerPage
