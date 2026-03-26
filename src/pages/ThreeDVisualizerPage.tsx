import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ThreeDVisualizerPageMobile from './ThreeDVisualizerPageMobile'
import { newMaterials } from '../data/newmaterials'
import { collections } from '../data/collections'
import { dummyProducts, getProductGlbUrl, getProductImageUrl } from '../data/products'
import type { Product } from '../data/products'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS } from '../utils/textureUtils'
import * as THREE from 'three';
import '@google/model-viewer'
const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const materialTypeOptions = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort(),
]
const allColorGroups = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.color_group).filter((v): v is string => !!v))).sort(),
]
const COLOR_MAP: Record<string, string> = {
  Whites: '#f5f0eb', Creams: '#f2e9d0', Beiges: '#c9b49a', Browns: '#8b5a2b',
  Tans: '#d2b48c', Grays: '#8a8a8a', 'Light Grays': '#c4c4c4', 'Dark Grays': '#555555',
  Blacks: '#1c1c1c', Blues: '#3b6ea5', Navys: '#1b2f6b', Teals: '#19787d',
  Greens: '#2e7d32', Reds: '#c0392b', Oranges: '#e07020', Yellows: '#d4a017',
  Pinks: '#d4607a', Purples: '#7b3fa0', Mauves: '#9e7b9b', Coals: '#3c3c3c',
}

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-stone-900 rounded-[2px] px-[1px]">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const S3_BASE = 'https://supoassets.s3.ap-south-1.amazonaws.com'
const COMPANY = 'KairaFabrics'

function getRoughnessMapURL(collectionName: string) {
  return `${S3_BASE}/public/textures/${COMPANY}/${collectionName}/${collectionName}_Roughness.webp`
}

function getNormalMapURL(collectionName: string) {
  return `${S3_BASE}/public/textures/${COMPANY}/${collectionName}/${collectionName}_Normal.webp`
}

function getSheenMapUrl(materialType: string) {
  if (materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('velvet')) {
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

function getRoughnessValue(materialType: string, collectionName: string, baseRoughness: number): number {
  if (materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('digitalprint')) return 0.8 // Velvets and Fabrics are generally very rough
  if (collectionName === 'Intense' || collectionName === 'Modello') return 0.6
  if (materialType.toLowerCase().includes('leather')) return 0.5 // Leathers are smoother
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
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [search, setSearch] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showColDropdown, setShowColDropdown] = useState(false)
  const [visibleCount, setVisibleCount] = useState(24)
  const PAGE_SIZE = 24
  const [currentProduct, setCurrentProduct] = useState<Product>(dummyProducts[0])
  const [productPanelOpen, setProductPanelOpen] = useState(false)
  const [quotationOpen, setQuotationOpen] = useState(false)

  const isSearchMode = search.trim().length > 0

  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // Toggle flags for material maps
  const [applyRoughnessMap] = useState(true)
  const [applyNormalMap] = useState(true)
  const [applySheenMap] = useState(true)

  const modelUrl = getProductGlbUrl(currentProduct)

  // Close collection dropdown on outside click
  useEffect(() => {
    if (!showColDropdown) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-col-dropdown]')) setShowColDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColDropdown])

  // Reset activeCollection when material type changes
  useEffect(() => {
    setActiveCollection('All')
  }, [activeMaterialType])

  // Reset pagination whenever filters or search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, activeMaterialType, activeCollection, activeColorGroup, activePattern])

  const scrollColors = (direction: 'left' | 'right') => {
    if (colorScrollRef.current) {
      const scrollAmount = 120
      colorScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const collectionsWithThumbs = useMemo(() => {
    return collections
      .filter(c => activeMaterialType === 'All' || c.category === activeMaterialType)
      .map(c => ({ name: c.name, thumb: c.image }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [activeMaterialType])

  const filtered = useMemo(() => {
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return newMaterials.filter((m) =>
        m.material_name?.toLowerCase().includes(q) ||
        m.collection_name?.toLowerCase().includes(q) ||
        m.material_code?.toLowerCase().includes(q) ||
        m.material_type?.toLowerCase().includes(q) ||
        m.color_group?.toLowerCase().includes(q) ||
        (m as any).pattern?.toLowerCase().includes(q)
      )
    }
    return newMaterials.filter((m) => {
      if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
      if (activeCollection !== 'All' && m.collection_name !== activeCollection) return false
      if (activeColorGroup !== 'All' && m.color_group !== activeColorGroup) return false
      if (activePattern !== 'All' && (m as any).pattern !== activePattern) return false
      return true
    })
  }, [activeMaterialType, activeCollection, activeColorGroup, activePattern, search])

  const visibleMaterials = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const activeFilterCount = [activeMaterialType, activeCollection, activeColorGroup, activePattern].filter((v) => v !== 'All').length

  const clearFilters = () => {
    setActiveMaterialType('All')
    setActiveCollection('All')
    setActiveColorGroup('All')
    setActivePattern('All')
    setSearch('')
  }

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
    const roughness = getRoughnessValue(mat.materialType, mat.collectionName, mat.roughness)
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
    const onLoad = () => {
      setModelLoaded(true)
    }
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
      style={{ height: 'calc(100vh - 78px)', marginTop: '78px' }}
    >
      {/* ── Studio Toolbar ── */}
      <div className="h-12 shrink-0 bg-stone-900 border-b border-stone-800 flex items-center px-6 gap-4 shadow-sm">
        {/* Home button */}
        <Link
          to="/"
          className="flex items-center gap-1.5 h-7 px-3 bg-white border border-stone-200 hover:border-stone-900 text-stone-900 transition-all rounded-sm group shrink-0"
        >
          <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Home</span>
        </Link>

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

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6">

        {/* ── LEFT: Material Selector ── */}
        <div className="w-[430px] xl:w-[490px] shrink-0 flex flex-col overflow-hidden bg-white rounded-sm shadow-sm border border-stone-200/80">

          {/* Top bar */}
          <div className="shrink-0 bg-stone-50 border-b border-stone-200/80 px-4 pt-3 pb-3 space-y-2.5">

            {/* Title row */}
            <div className="flex items-center gap-2">
              <h2 className="text-[12px] font-bold text-stone-700 uppercase tracking-widest flex-1">Kaira Inventory</h2>
              <span className="text-[11px] text-stone-400">{filtered.length} fabrics</span>
              {(activeFilterCount > 0 || isSearchMode) && (
                <button onClick={clearFilters} className="text-[11px] uppercase tracking-widest text-primary hover:underline ml-2 font-semibold">
                  Clear {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </button>
              )}
            </div>

            {/* Search bar */}
            <div
              className={`flex items-center gap-2 rounded-lg border transition-all duration-200 px-3 py-2 ${
                isSearchFocused
                  ? 'border-primary/60 bg-white shadow-md ring-1 ring-primary/20'
                  : isSearchMode
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <svg className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSearchFocused || isSearchMode ? 'text-primary' : 'text-stone-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search by name, code, type, pattern, color…"
                className="flex-1 bg-transparent text-[11px] focus:outline-none placeholder-stone-400 text-stone-700 min-w-0"
              />
              {isSearchMode && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); setSearch(''); searchInputRef.current?.focus() }}
                  className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                </button>
              )}
            </div>

            {/* Search mode: compact tag strip OR full filter row */}
            {isSearchMode ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] uppercase tracking-widest text-stone-400 shrink-0">Results for</span>
                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">"{search.trim()}"</span>
                {activeFilterCount > 0 && (
                  <span className="text-[11px] text-stone-400">+ {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Type dropdown */}
                <div className="shrink-0">
                  <select
                    value={activeMaterialType}
                    onChange={(e) => setActiveMaterialType(e.target.value)}
                    className="bg-white border border-stone-200 text-[11px] px-2 py-1 h-7 rounded-lg focus:outline-none focus:border-primary/60 text-stone-700 font-semibold uppercase tracking-wider cursor-pointer max-w-[90px]"
                  >
                    <option value="All">Types</option>
                    {materialTypeOptions.filter(t => t !== 'All').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Collection dropdown */}
                <div className="relative shrink-0 w-[120px]" data-col-dropdown>
                  <button
                    onClick={() => setShowColDropdown(!showColDropdown)}
                    className="w-full bg-white border border-stone-200 text-[11px] px-2.5 py-1 h-7 rounded-lg flex items-center justify-between hover:border-stone-300"
                  >
                    <span className="font-semibold text-stone-700 uppercase tracking-wider truncate">
                      {activeCollection === 'All' ? 'Collections' : activeCollection}
                    </span>
                    <svg className={`w-3 h-3 text-stone-500 shrink-0 transition-transform ${showColDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {showColDropdown && (
                    <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl p-3 w-[300px] max-h-72 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-3">
                        <div
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                          onClick={() => { setActiveCollection('All'); setShowColDropdown(false) }}
                        >
                          <div className={`w-full aspect-square rounded-lg border flex items-center justify-center transition-all ${activeCollection === 'All' ? 'border-primary shadow-sm bg-primary/5' : 'border-stone-200 bg-stone-50 group-hover:border-stone-300'}`}>
                            <span className="text-xs font-bold text-stone-500">ALL</span>
                          </div>
                          <span className="text-[10px] font-semibold text-stone-700 uppercase tracking-wider text-center w-full truncate">All</span>
                        </div>
                        {collectionsWithThumbs.map(c => {
                          const isActive = activeCollection === c.name
                          return (
                            <div
                              key={c.name}
                              className="flex flex-col items-center gap-1.5 cursor-pointer group"
                              onClick={() => { setActiveCollection(c.name); setShowColDropdown(false) }}
                            >
                              <div className={`w-full aspect-square rounded-lg overflow-hidden border transition-all ${isActive ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-stone-200 group-hover:border-stone-300'}`}>
                                <img src={c.thumb} alt={c.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-semibold text-stone-700 uppercase tracking-wider text-center w-full truncate">{c.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color swatches with scroll */}
                <div className="flex-1 flex items-center min-w-0 gap-1 overflow-hidden">
                  <button
                    onClick={() => scrollColors('left')}
                    className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm text-stone-400 hover:text-stone-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div
                    ref={colorScrollRef}
                    className="flex-1 flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1"
                  >
                    {allColorGroups.map((c) => {
                      const isActive = activeColorGroup === c
                      return (
                        <button
                          key={c}
                          onClick={() => setActiveColorGroup(c)}
                          title={c}
                          className={`relative shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-full transition-all ${
                            isActive ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-110 hover:ring-1 hover:ring-stone-300 ring-offset-1'
                          }`}
                        >
                          <span
                            className="absolute inset-0 rounded-full border border-stone-200 shadow-sm"
                            style={{ background: c === 'All' ? 'linear-gradient(135deg,#f5f0eb,#8b5a2b,#1c1c1c)' : (COLOR_MAP[c] ?? '#d0c8c0') }}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => scrollColors('right')}
                    className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm text-stone-400 hover:text-stone-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeMaterialType !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-wider pl-2.5 pr-1.5 py-1 rounded-full">
                    <span className="text-stone-400 mr-0.5">Type:</span>{activeMaterialType}
                    <button onClick={() => setActiveMaterialType('All')} className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0">
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </span>
                )}
                {activeCollection !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-wider pl-2.5 pr-1.5 py-1 rounded-full">
                    <span className="text-stone-400 mr-0.5">Col:</span>{activeCollection}
                    <button onClick={() => setActiveCollection('All')} className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0">
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </span>
                )}
                {activeColorGroup !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-wider pl-2 pr-1.5 py-1 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ background: COLOR_MAP[activeColorGroup] ?? '#d0c8c0' }} />
                    {activeColorGroup}
                    <button onClick={() => setActiveColorGroup('All')} className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0">
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </span>
                )}
                {activePattern !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-wider pl-2.5 pr-1.5 py-1 rounded-full">
                    <span className="text-stone-400 mr-0.5">Pattern:</span>{activePattern}
                    <button onClick={() => setActivePattern('All')} className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0">
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Materials grid */}
          <div className="flex-1 overflow-y-auto p-3 bg-stone-50">
            {isLoading ? (
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-2">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="relative aspect-square rounded-lg bg-stone-100 overflow-hidden border border-stone-200" aria-hidden="true">
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
            ) : filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4 py-10">
                <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="text-[11px] text-stone-400 uppercase tracking-widest">No materials found</p>
                {isSearchMode ? (
                  <p className="text-[9px] text-stone-400">No results for <span className="text-primary font-semibold">"{search.trim()}"</span></p>
                ) : (
                  <p className="text-[9px] text-stone-400">Adjust your filters or</p>
                )}
                <button onClick={clearFilters} className="text-[9px] text-primary hover:underline uppercase tracking-widest font-semibold">View all</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-2 ${isSearchMode ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-3 xl:grid-cols-4'}`}>
                  {visibleMaterials.map((m) => {
                    const isActive = selected?.id === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelect(m)}
                        className={`overflow-hidden rounded-lg border-2 relative transition-all ${
                          isSearchMode ? 'aspect-[4/5]' : 'aspect-square'
                        } ${
                          isActive ? 'border-primary shadow-md scale-[1.03]' : 'border-transparent hover:border-stone-300'
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
                            if (el.parentElement) el.parentElement.style.backgroundColor = '#f5f5f4'
                          }}
                        />
                        {isSearchMode ? (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-4 pb-1.5 px-1.5">
                            <p className="text-[8px] text-white font-bold uppercase leading-tight truncate">
                              {highlight(m.collection_name ?? '', search.trim())}
                            </p>
                            <p className="text-[10px] text-white font-bold uppercase leading-tight truncate">
                              {highlight(m.collection_name ?? '', search.trim())}
                            </p>
                            <p className="text-[9px] text-white/70 mt-0.5 truncate">
                              {highlight(m.material_name ?? '', search.trim())}
                            </p>
                            {(m.material_type?.toLowerCase().includes(search.toLowerCase()) ||
                              m.color_group?.toLowerCase().includes(search.toLowerCase()) ||
                              (m as any).pattern?.toLowerCase().includes(search.toLowerCase())) && (
                              <p className="text-[9px] text-primary/80 mt-0.5 truncate">
                                {highlight(m.material_type ?? '', search.trim())} · {highlight(m.color_group ?? '', search.trim())}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-1 text-center">
                            <span className="text-[10px] text-white font-bold uppercase leading-tight">{m.collection_name}</span>
                            <span className="text-[9px] text-white/70 mt-0.5">{m.material_name}</span>
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-2.5 h-2.5 text-stone-900" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {hasMore && (
                  <button
                    onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                    className="mt-3 w-full py-2 rounded-xl border border-stone-200 bg-white text-[12px] font-semibold uppercase tracking-widest text-stone-500 hover:border-primary/40 hover:text-primary transition-all active:scale-[0.98]"
                  >
                    Load more ({filtered.length - visibleCount} remaining)
                  </button>
                )}
              </>
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
              <span className="text-[11px] tracking-[0.1em] uppercase font-bold">Change Product</span>
            </button>

            <div className="w-px h-5 bg-stone-200" />
            <span className="text-[11px] text-stone-400 tracking-[0.2em] font-bold uppercase select-none">Viewport · Perspective</span>
            <div className="flex-1" />
            <span className="text-[11px] text-stone-400 tracking-wider select-none font-medium">Drag to orbit · Scroll to zoom</span>
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
                <p className="text-stone-900 text-[12px] font-bold tracking-[0.3em] uppercase">Loading 3D Model</p>
                <p className="text-stone-500 text-[11px] mt-2 font-medium tracking-widest">{currentProduct.product_name}</p>
              </div>
            )}

            {/* Texture applying overlay */}
            {isApplying && modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-10 pointer-events-none">
                <div className="bg-white border border-stone-200/50 px-8 py-4 flex items-center gap-4 shadow-xl rounded-sm">
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                  <span className="text-stone-900 text-[11px] font-bold tracking-[0.2em] uppercase">Applying Texture…</span>
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
                  <span className="text-[12px] font-bold text-stone-900 tracking-[0.2em] uppercase block mb-0.5">{selected.fabricName}</span>
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
