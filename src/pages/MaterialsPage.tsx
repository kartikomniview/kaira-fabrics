import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { newMaterials } from '../data/newmaterials'
import type { Material } from '../data/materials'
import MaterialDetailModal from '../components/ui/MaterialDetailModal'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

// Unique sorted filter options derived from data
const allMaterialTypes = ['All', ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort()]
const allColorGroups   = ['All', ...Array.from(new Set(newMaterials.map((m) => m.color_group).filter((v): v is string => v !== null))).sort()]
const allPatterns      = ['All', ...Array.from(new Set(newMaterials.map((m) => m.pattern).filter((v): v is string => v !== null))).sort()]

// Color group → CSS color swatch
const COLOR_SWATCH: Record<string, string> = {
  Whites: '#f5f0eb',
  Creams: '#f2e9d0',
  Beiges: '#c9b49a',
  Browns: '#8b5a2b',
  Tans: '#d2b48c',
  Grays: '#8a8a8a',
  'Light Grays': '#c4c4c4',
  'Dark Grays': '#555555',
  Blacks: '#1c1c1c',
  Blues: '#3b6ea5',
  Navys: '#1b2f6b',
  Teals: '#19787d',
  Greens: '#2e7d32',
  Reds: '#c0392b',
  Oranges: '#e07020',
  Yellows: '#d4a017',
  Pinks: '#d4607a',
  Purples: '#7b3fa0',
  Mauves: '#9e7b9b',
  Coals: '#3c3c3c',
}

const MaterialsPage = () => {
  const [searchParams] = useSearchParams()
  const collectionParam = searchParams.get('collection') ?? ''

  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeColorGroup,   setActiveColorGroup]   = useState('All')
  const [activePattern,      setActivePattern]      = useState('All')
  const [selectedMaterial,   setSelectedMaterial]   = useState<Material | null>(null)

  const collectionMaterials = useMemo(
    () => collectionParam ? newMaterials.filter((m) => m.collection_name === collectionParam) : newMaterials,
    [collectionParam],
  )

  const filtered = useMemo(() => collectionMaterials.filter((m) => {
    if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
    if (activeColorGroup   !== 'All' && m.color_group   !== activeColorGroup)   return false
    if (activePattern      !== 'All' && m.pattern       !== activePattern)      return false
    return true
  }), [collectionMaterials, activeMaterialType, activeColorGroup, activePattern])

  const activeFilterCount = [activeMaterialType, activeColorGroup, activePattern].filter((v) => v !== 'All').length
  const clearAll = () => { setActiveMaterialType('All'); setActiveColorGroup('All'); setActivePattern('All') }

  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <div className="min-h-screen bg-cream pt-[72px]"> {/* offset for fixed header */}

        {/* ── Page title bar ───────────────────────────────────────── */}
        <div className="bg-white border-b border-stone-100 px-6 lg:px-10 py-4">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <div>
              {collectionParam ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/collections"
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-400 hover:text-gold transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Collections
                  </Link>
                  <span className="text-stone-300">/</span>
                  <span className="text-[10px] uppercase tracking-widest text-charcoal font-semibold">{collectionParam}</span>
                </div>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Materials Library</p>
              )}
              <h1 className="font-serif text-2xl text-charcoal mt-0.5">
                {collectionParam || 'All Materials'}
              </h1>
            </div>
            <p className="text-[11px] text-stone-400 shrink-0">
              <span className="font-semibold text-charcoal">{filtered.length}</span> of {collectionMaterials.length} fabrics
            </p>
          </div>
        </div>

        {/* ── Color / Pattern top bar ──────────────────────────────── */}
        <div className="bg-white border-b border-stone-100 px-6 lg:px-10 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap gap-x-8 gap-y-3 items-start">

            {/* Color Group */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold shrink-0">Color</span>
              <div className="flex flex-wrap gap-1.5">
                {allColorGroups.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveColorGroup(c)}
                    title={c}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] transition-all duration-150 border font-medium ${
                      activeColorGroup === c
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-charcoal'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-300/50"
                      style={{ background: c === 'All' ? 'linear-gradient(135deg,#f5f0eb,#8b5a2b,#1c1c1c)' : (COLOR_SWATCH[c] ?? '#d0c8c0') }}
                    />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px self-stretch bg-stone-100 hidden sm:block" />

            {/* Pattern */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold shrink-0">Pattern</span>
              <div className="flex flex-wrap gap-1.5">
                {allPatterns.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePattern(p)}
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-widest transition-all duration-150 border font-medium ${
                      activePattern === p
                        ? 'bg-gold text-charcoal border-gold'
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-charcoal'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 flex gap-7 items-start">

          {/* ── LEFT: Sticky Filter Panel (Material Type only) ─────── */}
          <aside className="w-52 shrink-0 sticky top-[88px] bg-white border border-stone-200 shadow-sm self-start">

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4h18M7 8h10M11 12h2" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-gold text-charcoal text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[9px] uppercase tracking-widest text-stone-400 hover:text-gold transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="p-4">
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold mb-2">
                Material Type
              </p>
              <div className="flex flex-col gap-1">
                {allMaterialTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveMaterialType(t)}
                    className={`w-full text-left px-3 py-1.5 text-[11px] uppercase tracking-widest transition-all duration-150 border font-medium ${
                      activeMaterialType === t
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-white text-stone-500 border-stone-100 hover:border-stone-300 hover:text-charcoal'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Materials Grid ───────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="relative aspect-square bg-stone-200 overflow-hidden"
                    aria-hidden="true"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div
                      className="absolute inset-0 -translate-x-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
                        animation: `kaira-shimmer 1.6s ease-in-out ${i * 0.04}s infinite`,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m as Material)}
                    className="group relative aspect-square bg-stone-100 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 cursor-pointer"
                  >
                    <img
                      src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                      alt={`${m.collection_name} ${m.material_name}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
                    />

                    <span className="absolute inset-0 flex items-center justify-center font-serif text-lg text-stone-400 uppercase tracking-widest opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none select-none">
                      {m.material_code}
                    </span>

                    {/* Gold accent top bar */}
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/55 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2.5 text-left">
                      <span className="text-[9px] text-gold uppercase tracking-[0.2em] font-semibold leading-tight">
                        {m.material_type}
                      </span>
                      <p className="text-[11px] font-bold text-cream uppercase tracking-tight leading-tight mt-0.5 truncate">
                        {m.collection_name}
                      </p>
                      <p className="text-[10px] text-stone-300 mt-0.5 truncate">
                        {m.color_group}{m.pattern ? ` · ${m.pattern}` : ''}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-gold">
                        <span className="text-[9px] uppercase tracking-widest font-semibold">Details</span>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-24 border border-dashed border-stone-200">
                <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-stone-400 text-xs tracking-widest uppercase">No fabrics match your filters</p>
                <button
                  onClick={clearAll}
                  className="text-xs uppercase tracking-widest text-gold border border-gold/40 px-5 py-2 hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {selectedMaterial && (
        <MaterialDetailModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </>
  )
}

export default MaterialsPage
