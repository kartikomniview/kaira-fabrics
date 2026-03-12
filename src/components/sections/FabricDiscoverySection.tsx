import { useState, useMemo } from 'react'
import { newMaterials } from '../../data/newmaterials'
import ThreeDModal from '../ui/ThreeDModal'

interface ModalState {
  fabricName: string
  textureUrl: string
  roughness: number
  metalness: number
}

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const fabrics = newMaterials.map((m) => ({
  id: m.id,
  name: `${m.collection_name} ${m.material_name}`,
  colorGroup: m.color_group ?? '',
  pattern: m.pattern ?? '',
  material: m.material_type,
  collection: m.collection_name,
  image: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
  roughness: m.roughness ?? 0.5,
  metalness: m.metalness ?? 0,
}))

const colorOptions: string[] = ['All', ...Array.from(new Set(newMaterials.map((m) => m.color_group).filter((v): v is string => v !== null))).sort()]
const patternOptions: string[] = ['All', ...Array.from(new Set(newMaterials.map((m) => m.pattern).filter((v): v is string => v !== null))).sort()]
const materialOptions: string[] = ['All', ...Array.from(new Set(newMaterials.map((m) => m.material_type))).sort()]
const collectionOptions: string[] = ['All', ...Array.from(new Set(newMaterials.map((m) => m.collection_name)))]

const DISPLAY_LIMIT = 12

const FabricDiscoverySection = () => {
  const [activeColor, setActiveColor] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [activeMaterial, setActiveMaterial] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [modal, setModal] = useState<ModalState | null>(null)

  const filtered = useMemo(() => fabrics.filter((f) => {
    if (activeColor !== 'All' && f.colorGroup !== activeColor) return false
    if (activePattern !== 'All' && f.pattern !== activePattern) return false
    if (activeMaterial !== 'All' && f.material !== activeMaterial) return false
    if (activeCollection !== 'All' && f.collection !== activeCollection) return false
    return true
  }), [activeColor, activePattern, activeMaterial, activeCollection])

  const displayed = filtered.slice(0, DISPLAY_LIMIT)

  return (
    <>
    <section className="bg-stone-50 py-10 lg:py-14 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-stone-900">
            Fabric <span className="text-secondary font-medium">Discovery</span>
          </h2>
          <p className="mt-2 text-stone-400 text-xs md:text-sm max-w-lg mx-auto font-normal tracking-wide leading-relaxed">
            Filter by color, pattern, material or collection
          </p>
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
            <span className="w-1 h-1 rotate-45 bg-secondary inline-block" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6 pb-5 border-b border-stone-200">
          {[
            { label: 'Color', value: activeColor, options: colorOptions, set: setActiveColor },
            { label: 'Pattern', value: activePattern, options: patternOptions, set: setActivePattern },
            { label: 'Material', value: activeMaterial, options: materialOptions, set: setActiveMaterial },
            { label: 'Collection', value: activeCollection, options: collectionOptions, set: setActiveCollection },
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
          {(activeColor !== 'All' || activePattern !== 'All' || activeMaterial !== 'All' || activeCollection !== 'All') && (
            <button
              onClick={() => { setActiveColor('All'); setActivePattern('All'); setActiveMaterial('All'); setActiveCollection('All') }}
              className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-secondary transition-colors border-b border-stone-300 pb-px ml-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Result count */}
        {filtered.length > 0 && (
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-4">
            Showing {displayed.length} of {filtered.length} fabrics
          </p>
        )}

        {/* Fabric grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
            {displayed.map((fabric) => (
              <div key={fabric.id} className="group bg-stone-100/50 p-2 rounded-lg border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-full aspect-square rounded-md overflow-hidden mb-3 bg-stone-200">
                  <img
                    src={fabric.image}
                    alt={fabric.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                </div>

                <div className="px-1 mb-3">
                  <p className="text-[11px] font-bold text-stone-800 leading-tight truncate uppercase tracking-tight">{fabric.collection}</p>
                  <p className="text-[10px] text-stone-500">{fabric.material} · {fabric.colorGroup}</p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setModal({
                      fabricName: fabric.name,
                      textureUrl: fabric.image,
                      roughness: fabric.roughness,
                      metalness: fabric.metalness,
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
              onClick={() => { setActiveColor('All'); setActivePattern('All'); setActiveMaterial('All'); setActiveCollection('All') }}
              className="text-[11px] uppercase tracking-widest text-secondary border-b border-secondary pb-px hover:opacity-70 transition-opacity"
            >
              View all
            </button>
          </div>
        )}
      </div>
    </section>

    {modal && (
      <ThreeDModal
        fabricName={modal!.fabricName}
        textureUrl={modal!.textureUrl}
        roughness={modal!.roughness}
        metalness={modal!.metalness}
        onClose={() => setModal(null)}
      />
    )}
    </>
  )
}

export default FabricDiscoverySection
