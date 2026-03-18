import { useEffect, useRef, useState, useMemo } from 'react'
import { newMaterials } from '../data/newmaterials'
import { dummyProducts, getProductGlbUrl, getProductImageUrl } from '../data/products'
import type { Product } from '../data/products'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS } from '../utils/textureUtils'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'
const S3_BASE = 'https://supoassets.s3.ap-south-1.amazonaws.com'
const COMPANY = 'KairaFabrics'

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

const ThreeDVisualizerPageMobile = () => {
  const mvRef = useRef<HTMLElement>(null)
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
  // browseMode: false = model-focused (55/45), true = material-focused (28/72)
  const [browseMode, setBrowseMode] = useState(false)
  // filtersVisible: toggle to collapse filter section and give more room to the grid
  const [filtersVisible, setFiltersVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const [applyRoughnessMap] = useState(false)
  const [applyNormalMap] = useState(false)
  const [applySheenMap] = useState(false)

  const modelUrl = getProductGlbUrl(currentProduct)

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
      const matchName = m.material_name?.toLowerCase().includes(q)
      const matchColl = m.collection_name?.toLowerCase().includes(q)
      const matchColor = m.color_group?.toLowerCase().includes(q)
      if (!matchName && !matchColl && !matchColor) return false
    }
    return true
  }), [activeMaterialType, activeCollection, activeColorGroup, search])

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
    // After selecting a fabric, switch to model view so the user sees the result
    setBrowseMode(false)
  }

  useEffect(() => {
    const mv = mvRef.current as any
    if (!mv) return
    const onLoad = () => setModelLoaded(true)
    mv.addEventListener('load', onLoad)
    return () => mv.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if (modelLoaded && selected) applyTexture(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelLoaded])

  useEffect(() => {
    setModelLoaded(false)
  }, [currentProduct])

  // Viewport / panel flex ratios based on mode
  const viewportFlex = browseMode ? '28 1 0%' : '55 1 0%'
  const panelFlex = browseMode ? '72 1 0%' : '45 1 0%'
  // Denser grid in browse mode to show more swatches
  const gridCols = browseMode ? 'grid-cols-5' : 'grid-cols-4'

  return (
    // Use dvh for correct viewport height on mobile browsers (avoids address-bar overlap).
    // The marginTop matches the fixed 64px header.
    <div
      className="flex flex-col overflow-hidden bg-stone-100"
      style={{
        height: 'calc(100dvh - 64px)',
        marginTop: '64px',
      }}
    >
      {/* ── Toolbar ── */}
      <div className="h-10 shrink-0 bg-white border-b border-stone-200 flex items-center px-3 gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="text-[10px] text-stone-700 tracking-widest uppercase font-medium">3D Fabric Studio</span>
        </div>

        <div className="flex-1" />

        {selected && (
          <div className="flex items-center gap-1.5 max-w-[130px]">
            <img
              src={selected.textureUrl}
              alt=""
              className="w-4 h-4 rounded-sm object-cover border border-stone-200 shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-[9px] text-stone-500 truncate">{selected.fabricName}</span>
            {isApplying && (
              <div className="w-3 h-3 border border-secondary/40 border-t-secondary rounded-full animate-spin shrink-0" />
            )}
          </div>
        )}

        <div className="flex items-center gap-1 ml-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${modelLoaded ? 'bg-emerald-500' : 'bg-stone-300 animate-pulse'}`} />
          <span className="text-[9px] text-stone-400">{modelLoaded ? 'Ready' : 'Loading'}</span>
        </div>
      </div>

      {/* ── Dynamic split ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">

        {/* ── 3D Viewport ── */}
        <div
          className="relative bg-white min-h-0 transition-[flex] duration-300 ease-in-out"
          style={{ flex: viewportFlex }}
        >
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
            style={{ width: '100%', height: '100%', background: '#ffffff', touchAction: 'manipulation' }}
          />

          {/* Change Product button */}
          <button
            onClick={() => setProductPanelOpen(true)}
            style={{ touchAction: 'manipulation' }}
            className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 min-h-[36px] px-2.5 bg-secondary hover:bg-[#b8943f] text-white rounded-lg shadow-sm transition-all active:scale-95"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[9px] font-semibold tracking-wide truncate max-w-[90px]">{currentProduct.product_name}</span>
          </button>

          {/* Get Quotation button */}
          {!productPanelOpen && (
            <button
              onClick={() => setQuotationOpen(true)}
              style={{ touchAction: 'manipulation' }}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 pl-3 pr-4 min-h-[36px] bg-secondary hover:bg-[#b8943f] text-white rounded-xl shadow-lg transition-all text-xs font-semibold tracking-wide active:scale-95"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Get Quotation
            </button>
          )}

          {/* Corner bracket decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-secondary/30 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-secondary/30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-secondary/30 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-secondary/30 pointer-events-none" />

          {/* Product panel backdrop */}
          <div
            className={`absolute inset-0 z-20 bg-black/25 transition-opacity duration-300 ${productPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setProductPanelOpen(false)}
          />

          {/* Product panel */}
          <div
            className={`absolute inset-y-0 left-0 z-30 w-56 flex flex-col bg-white border-r border-stone-200 shadow-2xl transition-transform duration-300 ease-out ${productPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 justify-between">
              <p className="text-[10px] text-stone-600 font-semibold uppercase tracking-widest">Products</p>
              <button
                onClick={() => setProductPanelOpen(false)}
                style={{ touchAction: 'manipulation' }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {dummyProducts.map((p) => {
                const isActive = currentProduct.product_id === p.product_id
                return (
                  <button
                    key={p.product_id}
                    onClick={() => { setCurrentProduct(p); setProductPanelOpen(false) }}
                    style={{ touchAction: 'manipulation' }}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-all border-l-2 active:bg-stone-100 ${isActive ? 'bg-secondary/10 border-l-secondary' : 'hover:bg-stone-50 border-l-transparent'}`}
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
                      <p className={`text-[10px] font-semibold uppercase tracking-tight truncate ${isActive ? 'text-secondary' : 'text-stone-700'}`}>{p.product_name}</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">{p.category_name} · {p.sub_category_name}</p>
                    </div>
                    {isActive && (
                      <div className="w-3.5 h-3.5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Model loading overlay */}
          {!modelLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 pointer-events-none">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-secondary rounded-full animate-spin mb-3" />
              <p className="text-stone-400 text-[10px] tracking-[0.2em] uppercase">Loading 3D Model</p>
              <p className="text-stone-300 text-[9px] mt-1">{currentProduct.product_name}</p>
            </div>
          )}

          {/* Texture applying overlay */}
          {isApplying && modelLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10 pointer-events-none">
              <div className="bg-white border border-stone-200 px-4 py-2.5 flex items-center gap-2.5 shadow-lg rounded-lg">
                <div className="w-4 h-4 border-2 border-stone-200 border-t-secondary rounded-full animate-spin" />
                <span className="text-stone-500 text-[10px] tracking-[0.15em] uppercase">Applying…</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Materials Panel ── */}
        <div
          className="flex flex-col overflow-hidden bg-white border-t-2 border-stone-200 min-h-0 transition-[flex] duration-300 ease-in-out"
          style={{ flex: panelFlex }}
        >
          {/* Panel header — browse/view toggle + filter toggle */}
          <div className="shrink-0 h-9 flex items-center px-3 gap-2 bg-stone-50 border-b border-stone-200">
            {/* Browse / View mode toggle */}
            <button
              onClick={() => setBrowseMode((v) => !v)}
              style={{ touchAction: 'manipulation' }}
              className={`flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-all active:scale-95 ${
                browseMode
                  ? 'bg-secondary border-secondary text-white'
                  : 'bg-white border-stone-200 text-stone-500'
              }`}
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
              {browseMode ? 'Browsing' : 'Browse'}
            </button>

            <div className="flex-1" />

            {/* Material count */}
            <span className="text-[9px] text-stone-400 tabular-nums">{filtered.length}</span>

            {/* Filter toggle with active count badge */}
            <button
              onClick={() => setFiltersVisible((v) => !v)}
              style={{ touchAction: 'manipulation' }}
              className="relative flex items-center gap-1 text-[9px] font-medium px-2.5 py-1 rounded-full border border-stone-200 bg-white text-stone-500 transition-all active:scale-95 active:bg-stone-100"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V21a1 1 0 01-1.447.894l-4-2A1 1 0 017 19v-5.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-secondary text-white text-[8px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Collapsible filters */}
          <div
            className={`shrink-0 overflow-hidden transition-all duration-200 ease-in-out ${filtersVisible ? 'max-h-40' : 'max-h-0'}`}
          >
            <div className="px-3 pt-2 pb-1.5 space-y-1.5 border-b border-stone-100">
              {/* Search + Type */}
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
                    className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-[11px] pl-6 pr-2 py-2 placeholder-stone-300 focus:outline-none focus:border-secondary/60 rounded-lg transition-colors"
                  />
                </div>
                <div className="relative shrink-0">
                  <select
                    value={activeMaterialType}
                    onChange={(e) => setActiveMaterialType(e.target.value)}
                    className="bg-stone-50 border border-stone-200 text-stone-600 text-[10px] pl-2 pr-6 py-2 focus:outline-none focus:border-secondary/60 appearance-none cursor-pointer rounded-lg transition-colors"
                  >
                    {materialTypeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Color groups + Collections — single horizontal scroll row with fade edges */}
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
                        ? 'bg-secondary border-secondary text-white'
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
                        activeColorGroup === cg
                          ? 'border-secondary scale-110 shadow-sm'
                          : 'border-transparent'
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
                          ? 'bg-secondary/15 border-secondary/50 text-secondary'
                          : 'bg-stone-50 border-stone-200 text-stone-500'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {/* Right-fade hint to indicate scrollability */}
                <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {search && (
                    <span className="flex items-center gap-0.5 bg-stone-100 text-stone-600 text-[8px] px-1.5 py-0.5 rounded-full">
                      "{search}"
                      <button onClick={() => setSearch('')} style={{ touchAction: 'manipulation' }} className="text-stone-400 ml-0.5">
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  )}
                  {activeMaterialType !== 'All' && (
                    <span className="flex items-center gap-0.5 bg-secondary/10 text-secondary border border-secondary/30 text-[8px] px-1.5 py-0.5 rounded-full">
                      {activeMaterialType}
                      <button onClick={() => setActiveMaterialType('All')} style={{ touchAction: 'manipulation' }} className="text-secondary/60 ml-0.5">
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setActiveColorGroup('All'); setSearch('') }}
                    style={{ touchAction: 'manipulation' }}
                    className="text-[8px] text-stone-400 hover:text-stone-600 underline ml-auto transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Materials grid — fills remaining space */}
          <div className="flex-1 overflow-y-auto px-2.5 pt-2 pb-1 min-h-0" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            {isLoading ? (
              <div className={`grid ${gridCols} gap-1.5`}>
                {Array.from({ length: browseMode ? 15 : 12 }, (_, i) => (
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
              <div className={`grid ${gridCols} gap-1.5`}>
                {filtered.map((m) => {
                  const isActive = selected?.id === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(m)}
                      style={{ touchAction: 'manipulation' }}
                      title={`${m.collection_name} ${m.material_name}`}
                      className={`group relative aspect-square overflow-hidden border transition-all duration-150 rounded-lg active:scale-95 ${
                        isActive
                          ? 'border-secondary shadow-[0_0_0_1px_rgba(197,165,82,0.25)] scale-[1.03]'
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
                      <div className={`absolute inset-0 bg-black/55 flex flex-col items-center justify-center p-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-[6px] text-white font-semibold uppercase text-center leading-tight line-clamp-2">{m.collection_name}</p>
                        <p className="text-[5px] text-white/70 mt-0.5">{m.material_name}</p>
                      </div>
                      {isActive && (
                        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-secondary rounded-full flex items-center justify-center shadow">
                          <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
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
                <div className="text-center">
                  <p className="text-stone-600 text-[11px] font-medium">No materials found</p>
                  <p className="text-stone-400 text-[10px] mt-0.5">Try changing your filters</p>
                </div>
                <button
                  onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setActiveColorGroup('All'); setSearch('') }}
                  style={{ touchAction: 'manipulation' }}
                  className="text-[10px] text-white bg-secondary px-4 py-2 rounded-lg font-medium active:scale-95 transition-transform"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Selected material bar — slides in when a fabric is active */}
          <div
            className={`shrink-0 border-t border-stone-200 bg-stone-50 overflow-hidden transition-all duration-200 ${selected ? 'max-h-16' : 'max-h-0 border-t-0'}`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {selected && (
              <div className="px-3 py-2 flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src={selected.textureUrl}
                    alt={selected.fabricName}
                    className="w-9 h-9 rounded-lg object-cover border-2 border-secondary/30"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                  {isApplying && (
                    <div className="absolute inset-0 rounded-lg bg-white/60 flex items-center justify-center">
                      <div className="w-3 h-3 border border-secondary/40 border-t-secondary rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold text-stone-800 uppercase tracking-tight truncate">{selected.collectionName}</p>
                    {selected.colorGroup && (
                      <span
                        className="w-3 h-3 rounded-full border border-white/50 shrink-0"
                        style={{ backgroundColor: COLOR_MAP[selected.colorGroup] ?? '#aaa' }}
                      />
                    )}
                  </div>
                  <p className="text-[9px] text-stone-400 truncate">{selected.fabricName.replace(selected.collectionName, '').trim()}</p>
                </div>
                <div className={`text-[8px] px-1.5 py-0.5 rounded-full shrink-0 ${isApplying ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isApplying ? 'Applying…' : 'Applied'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quotation Modal (bottom sheet) ── */}
      {quotationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setQuotationOpen(false) }}
        >
          <div
            className="bg-white rounded-t-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-1 bg-stone-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-secondary uppercase tracking-widest font-semibold">Contact Us</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">Get a Quotation</p>
              </div>
              <button
                onClick={() => setQuotationOpen(false)}
                style={{ touchAction: 'manipulation' }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Context strip */}
            {selected && (
              <div className="px-4 py-2.5 bg-secondary/5 border-b border-secondary/15 flex items-center gap-3">
                <img
                  src={selected.textureUrl}
                  alt={selected.fabricName}
                  className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
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
              className="px-4 py-3.5 space-y-3"
              onSubmit={(e) => { e.preventDefault(); setQuotationOpen(false) }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    autoComplete="name"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    autoComplete="tel"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Email *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Message</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your requirements…"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuotationOpen(false)}
                  style={{ touchAction: 'manipulation' }}
                  className="flex-1 py-3 border border-stone-200 hover:bg-stone-50 text-stone-500 text-[12px] font-medium rounded-lg transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ touchAction: 'manipulation' }}
                  className="flex-1 py-3 bg-secondary hover:bg-[#b8943f] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm active:scale-95"
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

export default ThreeDVisualizerPageMobile
