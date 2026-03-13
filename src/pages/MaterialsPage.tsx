import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { newMaterials } from '../data/newmaterials'
import ThreeDModal from '../components/ui/ThreeDModal'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const weaveBg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A2EF0F' stroke-width='0.4' opacity='0.18'%3E%3Cpath d='M0 10h40M0 20h40M0 30h40M10 0v40M20 0v40M30 0v40'/%3E%3C/g%3E%3C/svg%3E")`

const colorOptions = ['All', ...Array.from(new Set(newMaterials.map((m) => m.color_group).filter((v): v is string => v !== null))).sort()]
const patternOptions = ['All', ...Array.from(new Set(newMaterials.map((m) => m.pattern).filter((v): v is string => v !== null))).sort()]

interface ModalState {
  fabricName: string
  textureUrl: string
  roughness: number
  metalness: number
}

const MaterialsPage = () => {
  const [searchParams] = useSearchParams()
  const collectionParam = searchParams.get('collection') ?? ''

  const [activeColor, setActiveColor] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [modal, setModal] = useState<ModalState | null>(null)

  const collectionMaterials = useMemo(
    () => collectionParam ? newMaterials.filter((m) => m.collection_name === collectionParam) : newMaterials,
    [collectionParam]
  )

  const filtered = useMemo(() => collectionMaterials.filter((m) => {
    if (activeColor !== 'All' && m.color_group !== activeColor) return false
    if (activePattern !== 'All' && m.pattern !== activePattern) return false
    return true
  }), [collectionMaterials, activeColor, activePattern])

  const materialType = collectionMaterials[0]?.material_type ?? ''

  return (
    <>
      <div className="min-h-screen bg-cream">

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <div
          className="relative bg-charcoal pt-28 pb-20 overflow-hidden"
          style={{ backgroundImage: weaveBg }}
        >
          <span className="absolute left-0 top-0 h-full w-px bg-gold/20" />
          <span className="absolute right-0 top-0 h-full w-px bg-gold/20" />
          <span className="absolute left-1/2 top-0 h-full w-px bg-gold/10 -translate-x-1/2" />

          <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-12 bg-gold/50" />
              <svg className="w-5 h-5 text-gold opacity-70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
              </svg>
              <span className="h-px w-12 bg-gold/50" />
            </div>

            {materialType && (
              <p className="text-gold text-xs tracking-[0.35em] uppercase font-medium mb-4">{materialType} · Premium Textiles</p>
            )}
            {!materialType && (
              <p className="text-gold text-xs tracking-[0.35em] uppercase font-medium mb-4">Materials Library · All Fabrics</p>
            )}

            <h1 className="font-serif text-5xl md:text-7xl text-cream mb-5 leading-tight">
              {collectionParam || 'All Materials'}
            </h1>
            <p className="text-stone-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {collectionParam
                ? `${collectionMaterials.length} fabric option${collectionMaterials.length !== 1 ? 's' : ''} in the ${collectionParam} collection.`
                : 'Browse our complete library of fabrics by colour, pattern and more.'}
            </p>

            {collectionParam && (
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 mt-6 text-[11px] uppercase tracking-widest text-gold border border-gold/30 px-5 py-2 hover:bg-gold hover:text-charcoal transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Collections
              </Link>
            )}

            <div className="mt-10 flex justify-center gap-2">
              {['bg-gold', 'bg-charcoal', 'bg-stone-300', 'bg-gold/60', 'bg-stone-500'].map((c, i) => (
                <span key={i} className={`${c} h-1.5 w-8 rounded-full`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter & Grid ────────────────────────────────────────── */}
        <div className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            {/* Section label */}
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px flex-1 bg-stone-200" />
              <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium whitespace-nowrap">Filter Materials</p>
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-stone-200 items-center">
              {[
                { label: 'Color', value: activeColor, options: colorOptions, set: setActiveColor },
                { label: 'Pattern', value: activePattern, options: patternOptions, set: setActivePattern },
              ].map(({ label, value, options, set }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">{label}</span>
                  <select
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="border border-stone-200 bg-white text-xs text-charcoal px-3 py-2 focus:outline-none focus:border-gold appearance-none pr-7 cursor-pointer"
                  >
                    {options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
              {(activeColor !== 'All' || activePattern !== 'All') && (
                <button
                  onClick={() => { setActiveColor('All'); setActivePattern('All') }}
                  className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-gold transition-colors border border-stone-200 px-3 py-2 ml-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Result count */}
            {filtered.length > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-6">
                Showing {filtered.length} fabric{filtered.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
                {filtered.map((m) => (
                  <div key={m.id} className="group bg-white border border-stone-200 overflow-hidden hover:border-gold/50 hover:shadow-md transition-all duration-300">
                    {/* gold accent bar */}
                    <span className="block h-0.5 w-0 group-hover:w-full bg-gold transition-all duration-300" />
                    <div className="w-full aspect-square overflow-hidden bg-stone-100">
                      <img
                        src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                        alt={`${m.collection_name} ${m.material_name}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <div className="p-2.5 border-t border-stone-100">
                      <p className="text-[11px] font-bold text-charcoal leading-tight truncate uppercase tracking-tight">{m.collection_name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{m.material_type} · {m.color_group}</p>
                    </div>
                    <div className="flex border-t border-stone-100">
                      <button
                        onClick={() => setModal({
                          fabricName: `${m.collection_name} ${m.material_name}`,
                          textureUrl: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
                          roughness: m.roughness ?? 0.5,
                          metalness: m.metalness ?? 0,
                        })}
                        className="flex-1 flex items-center justify-center gap-1 bg-gold hover:bg-gold-dark text-charcoal text-[10px] font-bold py-1.5 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 20 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        3D
                      </button>
                      <span className="w-px bg-stone-100" />
                      <button className="flex-1 flex items-center justify-center gap-1 bg-charcoal hover:bg-stone-800 text-cream text-[10px] font-bold py-1.5 transition-colors">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" />
                        </svg>
                        AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed border-stone-200">
                <p className="text-stone-400 text-xs tracking-widest uppercase">No fabrics match your filters</p>
                <button
                  onClick={() => { setActiveColor('All'); setActivePattern('All') }}
                  className="text-xs uppercase tracking-widest text-gold border border-gold/40 px-5 py-2 hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <ThreeDModal
          fabricName={modal.fabricName}
          textureUrl={modal.textureUrl}
          roughness={modal.roughness}
          metalness={modal.metalness}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

export default MaterialsPage
