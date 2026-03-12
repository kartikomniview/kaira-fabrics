import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { newMaterials } from '../data/newmaterials'
import ThreeDModal from '../components/ui/ThreeDModal'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

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
      <div className="min-h-screen">
        {/* Page Hero */}
        <div className="bg-charcoal pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
            {materialType && (
              <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">{materialType}</p>
            )}
            <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
              {collectionParam || 'All Materials'}
            </h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              {collectionParam
                ? `${collectionMaterials.length} fabric option${collectionMaterials.length !== 1 ? 's' : ''} in the ${collectionParam} collection.`
                : 'Browse our complete library of fabrics by color, pattern and more.'}
            </p>
            {collectionParam && (
              <Link
                to="/collections"
                className="inline-block mt-5 text-[11px] uppercase tracking-widest text-gold border-b border-gold pb-px hover:opacity-70 transition-opacity"
              >
                ← Back to Collections
              </Link>
            )}
          </div>
        </div>

        {/* Filter & Grid */}
        <div className="bg-stone-50 py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 mb-6 pb-5 border-b border-stone-200">
              {[
                { label: 'Color', value: activeColor, options: colorOptions, set: setActiveColor },
                { label: 'Pattern', value: activePattern, options: patternOptions, set: setActivePattern },
              ].map(({ label, value, options, set }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">{label}</span>
                  <select
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="border border-stone-200 bg-white text-xs text-stone-700 px-3 py-1.5 focus:outline-none focus:border-secondary appearance-none pr-6 cursor-pointer"
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
                  className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-secondary transition-colors border-b border-stone-300 pb-px ml-2"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Result count */}
            {filtered.length > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-4">
                Showing {filtered.length} fabric{filtered.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {filtered.map((m) => (
                  <div key={m.id} className="group bg-stone-100/50 p-2 rounded-lg border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-full aspect-square rounded-md overflow-hidden mb-3 bg-stone-200">
                      <img
                        src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                        alt={`${m.collection_name} ${m.material_name}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <div className="px-1 mb-3">
                      <p className="text-[11px] font-bold text-stone-800 leading-tight truncate uppercase tracking-tight">{m.collection_name}</p>
                      <p className="text-[10px] text-stone-500">{m.material_type} · {m.color_group}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setModal({
                          fabricName: `${m.collection_name} ${m.material_name}`,
                          textureUrl: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
                          roughness: m.roughness ?? 0.5,
                          metalness: m.metalness ?? 0,
                        })}
                        className="flex-1 flex items-center justify-center gap-1 bg-[#C08156] hover:bg-[#A66E45] text-white text-[10px] font-bold py-1.5 rounded transition-colors shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 20 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        3D
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 bg-[#2D3142] hover:bg-[#1C1E2B] text-white text-[10px] font-bold py-1.5 rounded transition-colors shadow-sm">
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
              <div className="flex flex-col items-center justify-center gap-3 h-32 border border-dashed border-stone-300">
                <p className="text-stone-400 text-xs tracking-wide">No fabrics match your filters</p>
                <button
                  onClick={() => { setActiveColor('All'); setActivePattern('All') }}
                  className="text-[11px] uppercase tracking-widest text-[#C08156] border-b border-[#C08156] pb-px hover:opacity-70 transition-opacity"
                >
                  View all
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
