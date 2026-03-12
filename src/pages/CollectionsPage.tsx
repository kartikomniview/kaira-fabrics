import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { newMaterials } from '../data/newmaterials'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const allCollections = (() => {
  const map = new Map<string, { name: string; materialType: string; count: number; images: string[] }>()
  for (const m of newMaterials) {
    if (!map.has(m.collection_name)) {
      map.set(m.collection_name, { name: m.collection_name, materialType: m.material_type, count: 0, images: [] })
    }
    const c = map.get(m.collection_name)!
    c.count++
    if (c.images.length < 4) {
      c.images.push(`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`)
    }
  }
  return Array.from(map.values())
})()

const materialTypeOptions = ['All', ...Array.from(new Set(allCollections.map((c) => c.materialType))).sort()]

const CollectionsPage = () => {
  const navigate = useNavigate()
  const [activeMaterialType, setActiveMaterialType] = useState('All')

  const filtered = useMemo(
    () =>
      activeMaterialType === 'All'
        ? allCollections
        : allCollections.filter((c) => c.materialType === activeMaterialType),
    [activeMaterialType]
  )

  return (
    <div className="min-h-screen">
      {/* Page Hero */}
      <div className="bg-charcoal pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">Our Portfolio</p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">Fabric Collections</h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            Explore our complete range of curated textile collections, each telling a unique story of craft, material, and method.
          </p>
        </div>
      </div>

      {/* Filter & Grid */}
      <div className="bg-stone-50 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* Material type filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {materialTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setActiveMaterialType(type)}
                className={`px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                  activeMaterialType === type
                    ? 'bg-[#2D3142] text-white'
                    : 'border border-stone-300 text-stone-500 hover:border-[#2D3142] hover:text-[#2D3142]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Result count */}
          <p className="text-[10px] uppercase tracking-widest text-stone-400 text-center mb-6">
            {filtered.length} collection{filtered.length !== 1 ? 's' : ''}
            {activeMaterialType !== 'All' ? ` · ${activeMaterialType}` : ''}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((col) => (
                <div
                  key={col.name}
                  onClick={() => navigate(`/materials?collection=${encodeURIComponent(col.name)}`)}
                  className="group cursor-pointer bg-white border border-stone-200/70 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Thumbnail — 2×2 grid if 4 images, else single */}
                  {col.images.length >= 4 ? (
                    <div className="grid grid-cols-2 aspect-square">
                      {col.images.slice(0, 4).map((img, i) => (
                        <div key={i} className="overflow-hidden bg-stone-200">
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-square overflow-hidden bg-stone-200">
                      <img
                        src={col.images[0]}
                        alt={col.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-[11px] font-bold text-stone-800 uppercase tracking-tight leading-tight truncate">{col.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-stone-400">{col.materialType}</span>
                      <span className="text-[10px] text-[#C08156] font-semibold">{col.count} options</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-stone-700 mb-3">No collections found</p>
              <button
                onClick={() => setActiveMaterialType('All')}
                className="text-xs uppercase tracking-widest text-[#C08156] border-b border-[#C08156] pb-px"
              >
                View all
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollectionsPage
