import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { newMaterials } from '../../data/newmaterials'
import { collections } from '../../data/collections'
import type { Material } from '../../data/materials'
import MaterialDetailModal from '../../components/ui/MaterialDetailModal'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

// Unique sorted filter options derived from data
const allPatterns = ['All', ...Array.from(new Set(newMaterials.map((m) => m.pattern).filter((v): v is string => v !== null))).sort()]

const MaterialsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCollection = searchParams.get('collection') || collections[0]?.name || ''

  const [activePattern,    setActivePattern]    = useState('All')
  const [selectedMaterial, setSelectedMaterial]  = useState<Material | null>(null)

  const collectionMaterials = useMemo(
    () => newMaterials.filter((m) => m.collection_name === selectedCollection),
    [selectedCollection],
  )

  // Collections filtered by the active pattern
  const filteredCollections = useMemo(() => {
    if (activePattern === 'All') return collections
    const collectionsWithPattern = new Set(
      newMaterials
        .filter((m) => m.pattern === activePattern)
        .map((m) => m.collection_name)
    )
    return collections.filter((c) => collectionsWithPattern.has(c.name))
  }, [activePattern])

  // Materials grid shows all materials in the selected collection (pattern drives collection list)
  const filtered = collectionMaterials

  const activeFilterCount = [activePattern].filter((v) => v !== 'All').length
  const clearAll = () => { setActivePattern('All') }

  // Auto-select the first matching collection whenever the pattern changes
  useEffect(() => {
    if (filteredCollections.length > 0) {
      selectCollection(filteredCollections[0].name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePattern])

  useEffect(() => {
      window.scrollTo(0, 0)
  }, [])

  const selectCollection = (name: string) => {
    setSearchParams({ collection: name })
  }

  const [showMobileCollections, setShowMobileCollections] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const activeCollectionData = collections.find((c) => c.name === selectedCollection)

  return (
    <>
      <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.18]" style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="bg-stone-900 pt-24 pb-6">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 px-4 py-2 border border-stone-600 bg-transparent text-stone-300 hover:text-white hover:border-stone-400 transition-all rounded-sm mb-4"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-[11px] uppercase font-bold tracking-widest">Back to Home</span>
            </Link>
            <p className="text-[11px] tracking-[0.4em] uppercase font-bold text-primary mb-1.5">Fabric Collections</p>
            <h1 className="font-serif text-2xl md:text-3xl text-white">Materials Library</h1>
          </div>
        </div>

        {/* ── Main two-column layout ───────────────────────────────── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-6 md:py-8 flex flex-col md:flex-row gap-4 md:gap-7 items-start">

          {/* ── LEFT: Collections Sidebar ──────────────────────────── */}
          <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-[88px] bg-white border border-stone-200 shadow-sm self-start max-h-[calc(100vh-110px)]">

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal">Collections</span>
                <span className="bg-stone-100 text-stone-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {collections.length}
                </span>
              </div>
            </div>

            {/* Pattern dropdown */}
            <div className="px-4 py-3 border-b border-stone-100 shrink-0">
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold mb-2">Pattern</p>
              <select
                value={activePattern}
                onChange={(e) => setActivePattern(e.target.value)}
                className="w-full px-3 py-2 text-[11px] uppercase tracking-widest border border-stone-200 bg-stone-50 text-charcoal focus:outline-none focus:border-gold/50 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_10px_center] bg-no-repeat pr-7 cursor-pointer"
              >
                {allPatterns.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Collection list */}
            <div className="overflow-y-auto flex-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-stone-300">
              {filteredCollections.map((c) => {
                const isActive = c.name === selectedCollection
                return (
                  <button
                    key={c.id}
                    onClick={() => selectCollection(c.name)}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 border-b border-stone-50 transition-all duration-150 ${
                      isActive
                        ? 'bg-charcoal text-cream'
                        : 'bg-white text-stone-600 hover:bg-stone-50 hover:text-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Collection Thumbnail */}
                      <div className={`w-10 h-10 rounded-sm overflow-hidden shrink-0 border ${isActive ? 'border-stone-700' : 'border-stone-100'}`}>
                        <img 
                          src={c.image} 
                          alt={c.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/40?text=K' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide truncate ${isActive ? 'text-cream' : 'text-charcoal'}`}>
                          {c.name}
                        </p>
                        <p className={`text-[9px] uppercase tracking-widest mt-0.5 ${isActive ? 'text-gold' : 'text-stone-400'}`}>
                          {c.category}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded-full min-w-[22px] text-center leading-none ${
                      isActive ? 'bg-gold text-charcoal' : 'bg-stone-100 text-stone-400'
                    }`}>
                      {c.itemCount}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* ── Mobile: Collection selector ─────────────────────────── */}
          <div className="md:hidden w-full">
            <button
              onClick={() => setShowMobileCollections((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 border px-4 py-2.5 text-[12px] uppercase tracking-widest font-medium transition-colors ${
                showMobileCollections ? 'bg-charcoal text-cream border-charcoal' : 'bg-white text-charcoal border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {selectedCollection}
              </div>
              <svg className={`w-3 h-3 transition-transform ${showMobileCollections ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showMobileCollections && (
              <div className="bg-white border border-t-0 border-stone-200 shadow-sm max-h-64 overflow-y-auto">
                {filteredCollections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { selectCollection(c.name); setShowMobileCollections(false) }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between border-b border-stone-50 text-[12px] uppercase tracking-widest font-medium transition-colors ${
                      c.name === selectedCollection ? 'bg-stone-100 text-charcoal' : 'text-stone-500 hover:bg-stone-50 hover:text-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm overflow-hidden shrink-0 border border-stone-100">
                        <img 
                          src={c.image} 
                          alt={c.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {c.name}
                    </div>
                    <span className="text-[10px] text-stone-400">{c.itemCount}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Mobile: Pattern dropdown */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-semibold shrink-0">Pattern</span>
              <select
                value={activePattern}
                onChange={(e) => setActivePattern(e.target.value)}
                className="flex-1 px-3 py-1.5 text-[12px] uppercase tracking-widest border border-stone-200 bg-white text-charcoal focus:outline-none focus:border-gold/50 transition-colors"
              >
                {allPatterns.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="mt-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-gold transition-colors">
                Clear filters
              </button>
            )}
          </div>

          {/* ── RIGHT: Materials Grid ───────────────────────────────── */}
          <div className="flex-1 min-w-0 w-full">

            {/* Collection info header */}
            {activeCollectionData && (
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl text-charcoal">{selectedCollection}</h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">{activeCollectionData.category}</p>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="hidden md:block text-[9px] uppercase tracking-widest text-stone-400 hover:text-gold transition-colors">
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
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
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
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
                      <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-semibold leading-tight">
                        {m.material_type}
                      </span>
                      <p className="text-[12px] font-bold text-cream uppercase tracking-tight leading-tight mt-0.5 truncate">
                        {m.collection_name}
                      </p>
                      <p className="text-[11px] text-stone-300 mt-0.5 truncate">
                        {m.color_group}{m.pattern ? ` · ${m.pattern}` : ''}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-gold">
                        <span className="text-[10px] uppercase tracking-widest font-semibold">Details</span>
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

      {/* ── Smart Catalog Promo Strip ─────────────────────────────── */}
      <div className="bg-stone-900 border-t border-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-8 md:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Left */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] md:text-xs text-stone-500 uppercase tracking-widest font-bold">Smart Discovery</span>
              </div>
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white leading-tight">
                Browse <span className="text-primary">500+ premium fabrics</span> across 100+ collections
              </p>
            </div>
          </div>

          {/* Right */}
          <Link
            to="/materials"
            className="shrink-0 flex items-center gap-3 px-10 py-4.5 md:px-12 md:py-5 bg-primary text-stone-900 text-xs md:text-sm uppercase font-bold tracking-[0.2em] hover:bg-white transition-all rounded-sm shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Open Smart Catalog
          </Link>

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
