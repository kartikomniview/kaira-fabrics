import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { newMaterials } from '../../data/newmaterials'
import type { Material } from '../../data/materials'
import MaterialDetailModal from '../ui/MaterialDetailModal'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const COLOR_SWATCH: Record<string, string> = {
  Whites: '#f5f0eb', Creams: '#f2e9d0', Beiges: '#c9b49a', Browns: '#8b5a2b',
  Tans: '#d2b48c', Grays: '#8a8a8a', 'Light Grays': '#c4c4c4', 'Dark Grays': '#555555',
  Blacks: '#1c1c1c', Blues: '#3b6ea5', Navys: '#1b2f6b', Teals: '#19787d',
  Greens: '#2e7d32', Reds: '#c0392b', Oranges: '#e07020', Yellows: '#d4a017',
  Pinks: '#d4607a', Purples: '#7b3fa0', Mauves: '#9e7b9b', Coals: '#3c3c3c',
}

const allColorGroups  = ['All', ...Array.from(new Set(newMaterials.map((m) => m.color_group).filter((v): v is string => v !== null))).sort()]
const allPatterns     = ['All', ...Array.from(new Set(newMaterials.map((m) => m.pattern).filter((v): v is string => v !== null))).sort()]
const allMaterialTypes = ['All', ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort()]

const DISPLAY_LIMIT = 12

const FabricDiscoverySection = () => {
  const [activeColor,    setActiveColor]    = useState('All')
  const [activePattern,  setActivePattern]  = useState('All')
  const [activeMaterial, setActiveMaterial] = useState('All')
  const [selected, setSelected] = useState<Material | null>(null)

  const filtered = useMemo(() => newMaterials.filter((m) => {
    if (activeColor    !== 'All' && m.color_group   !== activeColor)    return false
    if (activePattern  !== 'All' && m.pattern       !== activePattern)  return false
    if (activeMaterial !== 'All' && m.material_type !== activeMaterial) return false
    return true
  }), [activeColor, activePattern, activeMaterial])

  const displayed = filtered.slice(0, DISPLAY_LIMIT)
  const activeCount = [activeColor, activePattern, activeMaterial].filter((v) => v !== 'All').length
  const clearAll = () => { setActiveColor('All'); setActivePattern('All'); setActiveMaterial('All') }

  return (
    <>
    <section className="bg-stone-50 py-6 lg:py-14 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Heading */}
        <div className="text-center mb-5 lg:mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-1">Materials Library</p>
          <h2 className="font-serif text-2xl md:text-3xl">
            Explore <span className="text-secondary font-medium">Materials</span>
          </h2>
          <p className="mt-2 text-stone-400 text-xs max-w-md mx-auto tracking-wide leading-relaxed">
            Explore our curated fabric library — filter by color, pattern or material type
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
            <span className="w-1 h-1 rotate-45 bg-secondary inline-block" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────── */}
        <div className="bg-white border border-stone-100 shadow-sm px-3 py-3 md:px-5 md:py-4 mb-4 md:mb-6 space-y-2.5 md:space-y-3">

          {/* Color swatches */}
          <div className="flex items-center gap-x-2">
            <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold shrink-0 w-12 md:w-14">Color</span>
            <div className="hide-scrollbar flex gap-1.5 overflow-x-auto pb-0.5 flex-nowrap md:flex-wrap min-w-0">
              {allColorGroups.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveColor(c)}
                  title={c}
                  className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] transition-all duration-150 border font-medium ${
                    activeColor === c
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

          <div className="h-px bg-stone-100" />

          {/* Pattern + Material pills in one row */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 items-start">
            <div className="flex items-center gap-x-2 min-w-0 w-full sm:w-auto">
              <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold shrink-0 w-12 md:w-14">Pattern</span>
              <div className="hide-scrollbar flex gap-1.5 overflow-x-auto pb-0.5 flex-nowrap md:flex-wrap min-w-0">
                {allPatterns.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePattern(p)}
                    className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest transition-all duration-150 border font-medium ${
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

            <div className="w-px self-stretch bg-stone-100 hidden sm:block" />

            <div className="flex items-center gap-x-2 min-w-0 w-full sm:w-auto">
              <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold shrink-0 w-12 md:w-14">Material</span>
              <div className="hide-scrollbar flex gap-1.5 overflow-x-auto pb-0.5 flex-nowrap md:flex-wrap min-w-0">
                {allMaterialTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveMaterial(t)}
                    className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest transition-all duration-150 border font-medium ${
                      activeMaterial === t
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-charcoal'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active count + clear */}
          {activeCount > 0 && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] text-stone-400">{filtered.length} fabric{filtered.length !== 1 ? 's' : ''} match</span>
              <button
                onClick={clearAll}
                className="text-[9px] uppercase tracking-widest text-stone-400 hover:text-gold transition-colors border-b border-stone-300 pb-px"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Result count */}
        <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3">
          Showing {displayed.length} of {filtered.length} fabrics
        </p>

        {/* ── Fabric grid ────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-2.5">
            {displayed.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m as Material)}
                className="group relative aspect-square bg-stone-100 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 cursor-pointer"
              >
                <img
                  src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                  alt={`${m.collection_name} ${m.material_name}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
                />

                {/* Material code watermark */}
                <span className="absolute inset-0 flex items-center justify-center font-serif text-lg text-stone-400 uppercase tracking-widest opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none select-none">
                  {m.material_code}
                </span>

                {/* Gold top accent */}
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
          <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed border-stone-200">
            <svg className="w-9 h-9 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-stone-400 text-xs tracking-widest uppercase">No fabrics match your filters</p>
            <button
              onClick={clearAll}
              className="text-[11px] uppercase tracking-widest text-gold border border-gold/40 px-5 py-2 hover:bg-charcoal hover:text-cream transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* View All CTA */}
        <div className="mt-5 md:mt-8 flex flex-col items-center gap-2 md:gap-3">
          <p className="text-[10px] uppercase tracking-widest text-stone-400">
            Showing {Math.min(DISPLAY_LIMIT, filtered.length)} of {filtered.length} — explore the full library
          </p>
          <Link
            to="/materials"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-cream text-[11px] uppercase tracking-widest font-semibold hover:bg-secondary transition-colors"
          >
            View All Materials
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>

    {selected && (
      <MaterialDetailModal
        material={selected}
        onClose={() => setSelected(null)}
      />
    )}
    </>
  )
}

export default FabricDiscoverySection
