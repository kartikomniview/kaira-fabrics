import { useEffect, useRef, useState, useMemo } from 'react'
import { newMaterials } from '../data/newmaterials'

const MODEL_URL = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/models/OVL/Sofa/SetSofas/Linda.glb'
const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const materialTypeOptions = ['All', ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort()]
const collectionOptions = ['All', ...Array.from(new Set(newMaterials.map((m) => m.collection_name).filter(Boolean))).sort()]

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
  const [selected, setSelected] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => newMaterials.filter((m) => {
    if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
    if (activeCollection !== 'All' && m.collection_name !== activeCollection) return false
    if (search) {
      const q = search.toLowerCase()
      const matchName = m.material_name?.toLowerCase().includes(q)
      const matchColl = m.collection_name?.toLowerCase().includes(q)
      const matchColor = m.color_group?.toLowerCase().includes(q)
      if (!matchName && !matchColl && !matchColor) return false
    }
    return true
  }), [activeMaterialType, activeCollection, search])

  const applyTexture = async (mat: SelectedMaterial) => {
    const mv = mvRef.current as any
    if (!mv) return
    setIsApplying(true)
    try {
      const fetchUrl = import.meta.env.DEV
        ? mat.textureUrl.replace('https://supoassets.s3.ap-south-1.amazonaws.com', '/s3proxy')
        : mat.textureUrl
      const res = await fetch(fetchUrl)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const texture = await mv.createTexture(objectUrl)
      const model = mv.model
      if (model) {
        for (const m of model.materials) {
          m.pbrMetallicRoughness.setRoughnessFactor(mat.roughness)
          m.pbrMetallicRoughness.setMetallicFactor(mat.metalness)
          await m.pbrMetallicRoughness.baseColorTexture.setTexture(texture)
        }
      }
      URL.revokeObjectURL(objectUrl)
    } catch {
      // silently ignore
    } finally {
      setIsApplying(false)
    }
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

  return (
    <div
      className="flex flex-col overflow-hidden bg-stone-100"
      style={{ height: 'calc(100vh - 64px)' }}
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
          <span className="text-[10px] text-stone-500 tracking-wide">Linda Sofa Set</span>
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

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: 3D Viewport ── */}
        <div className="flex-1 relative flex flex-col bg-white overflow-hidden">
          {/* Viewport title bar */}
          <div className="h-7 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="w-px h-3 bg-stone-300 mx-1" />
            <span className="text-[9px] text-stone-400 tracking-widest uppercase select-none">Viewport · Perspective</span>
            <div className="flex-1" />
            <span className="text-[9px] text-stone-300 select-none">Drag to orbit · Scroll to zoom</span>
          </div>

          {/* model-viewer fills remaining space */}
          <div className="flex-1 relative">
            {/* @ts-ignore */}
            <model-viewer
              ref={mvRef as any}
              src={MODEL_URL}
              alt="Linda Sofa 3D model"
              camera-controls
              auto-rotate
              shadow-intensity="1.5"
              exposure="1.1"
              environment-image="neutral"
              style={{ width: '100%', height: '100%', background: '#ffffff' }}
            />

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
                <p className="text-stone-300 text-[10px] mt-1 tracking-wide">Linda Sofa Set</p>
              </div>
            )}

            {/* Texture applying overlay */}
            {isApplying && modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10 pointer-events-none">
                <div className="bg-white border border-stone-200 px-6 py-3 flex items-center gap-3 shadow-lg">
                  <div className="w-4 h-4 border-2 border-stone-200 border-t-[#C5A552] rounded-full animate-spin" />
                  <span className="text-stone-500 text-[11px] tracking-[0.15em] uppercase">Applying texture…</span>
                </div>
              </div>
            )}

            {/* Bottom info bar */}
            {selected && modelLoaded && !isApplying && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-stone-200 shadow-md px-4 py-2 pointer-events-none flex items-center gap-3">
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

        {/* ── RIGHT: Materials Panel ── */}
        <div className="w-72 xl:w-80 shrink-0 flex flex-col bg-white border-l border-stone-200 overflow-hidden">

          {/* Panel header */}
          <div className="h-7 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 gap-2">
            <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[9px] text-stone-500 tracking-widest uppercase select-none flex-1">Materials Library</span>
            <span className="text-[9px] text-stone-400 tabular-nums">{filtered.length}</span>
          </div>

          {/* ── Filters ── */}
          <div className="shrink-0 border-b border-stone-200 p-2.5 space-y-2.5 bg-stone-50">

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fabrics…"
                className="w-full bg-white border border-stone-200 text-stone-600 text-[11px] pl-7 pr-3 py-1.5 placeholder-stone-300 focus:outline-none focus:border-[#C5A552]/60 transition-colors rounded-sm"
              />
            </div>

            {/* Material Type pills */}
            <div>
              <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1.5">Material Type</p>
              <div className="flex flex-wrap gap-1">
                {materialTypeOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveMaterialType(t)}
                    className={`text-[9px] tracking-wide px-2 py-0.5 border transition-all duration-150 rounded-sm ${
                      activeMaterialType === t
                        ? 'border-[#C5A552]/60 bg-[#C5A552]/10 text-[#C5A552]'
                        : 'border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Collection dropdown */}
            <div>
              <p className="text-[9px] text-stone-400 uppercase tracking-[0.15em] mb-1.5">Collection</p>
              <div className="relative">
                <select
                  value={activeCollection}
                  onChange={(e) => setActiveCollection(e.target.value)}
                  className="w-full bg-white border border-stone-200 text-stone-600 text-[11px] px-2.5 py-1.5 focus:outline-none focus:border-[#C5A552]/60 appearance-none cursor-pointer transition-colors rounded-sm"
                >
                  {collectionOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear filters */}
            {(activeMaterialType !== 'All' || activeCollection !== 'All' || search) && (
              <button
                onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setSearch('') }}
                className="text-[9px] text-[#C5A552]/70 hover:text-[#C5A552] uppercase tracking-widest transition-colors"
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* ── Swatches Grid ── */}
          <div className="flex-1 overflow-y-auto p-2.5 bg-white">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5">
                {filtered.map((m) => {
                  const isActive = selected?.id === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(m)}
                      title={`${m.collection_name} ${m.material_name}`}
                      className={`group relative aspect-square overflow-hidden border transition-all duration-150 rounded-sm ${
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
                      {/* Hover / selected info overlay */}
                      <div className={`absolute inset-0 bg-black/55 flex flex-col items-center justify-center p-1 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <p className="text-[8px] text-white font-semibold uppercase text-center leading-tight tracking-wide line-clamp-2">{m.collection_name}</p>
                        <p className="text-[7px] text-white/70 mt-0.5 tracking-wide">{m.material_name}</p>
                      </div>
                      {/* Selected checkmark */}
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
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-stone-400 text-[11px] tracking-wide">No materials found</p>
                <button
                  onClick={() => { setActiveMaterialType('All'); setActiveCollection('All'); setSearch('') }}
                  className="text-[10px] text-[#C5A552]/70 hover:text-[#C5A552] uppercase tracking-widest transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* ── Selected Material Info Footer ── */}
          {selected ? (
            <div className="shrink-0 border-t border-stone-200 p-3 bg-stone-50">
              <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-2">Selected</p>
              <div className="flex items-center gap-2.5">
                <img
                  src={selected.textureUrl}
                  alt={selected.fabricName}
                  className="w-10 h-10 rounded-sm object-cover border border-stone-200 shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-stone-700 font-semibold uppercase tracking-tight truncate">{selected.collectionName}</p>
                  <p className="text-[9px] text-stone-500 truncate">{selected.materialType} · {selected.colorGroup}</p>
                  <p className="text-[9px] text-stone-400 mt-0.5">R {selected.roughness.toFixed(2)} · M {selected.metalness.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="shrink-0 border-t border-stone-200 p-3 bg-stone-50">
              <p className="text-[9px] text-stone-400 text-center tracking-widest uppercase">Select a material to apply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ThreeDVisualizerPage
