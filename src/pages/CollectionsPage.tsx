import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { newMaterials } from '../data/newmaterials'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const weaveBg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A2EF0F' stroke-width='0.4' opacity='0.18'%3E%3Cpath d='M0 10h40M0 20h40M0 30h40M10 0v40M20 0v40M30 0v40'/%3E%3C/g%3E%3C/svg%3E")`

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
          <p className="text-gold text-xs tracking-[0.35em] uppercase font-medium mb-4">
            Our Portfolio · Curated Textiles
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-cream mb-5 leading-tight">
            Fabric Collections
          </h1>
          <p className="text-stone-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our complete range of curated textile collections, each telling a unique story
            of craft, material, and method.
          </p>
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
            <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium whitespace-nowrap">Browse By Collection</p>
            <span className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Material type filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {materialTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setActiveMaterialType(type)}
                className={`px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                  activeMaterialType === type
                    ? 'bg-charcoal text-cream'
                    : 'border border-stone-200 text-stone-400 hover:border-gold hover:text-charcoal'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Result count */}
          <p className="text-[10px] uppercase tracking-widest text-stone-400 text-center mb-8">
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
                  className="group cursor-pointer bg-white border border-stone-200 overflow-hidden hover:border-gold/50 hover:shadow-md transition-all duration-300"
                >
                  {/* gold accent bar */}
                  <span className="block h-0.5 w-0 group-hover:w-full bg-gold transition-all duration-300" />

                  {/* Thumbnail */}
                  {col.images.length >= 4 ? (
                    <div className="grid grid-cols-2 aspect-square">
                      {col.images.slice(0, 4).map((img, i) => (
                        <div key={i} className="overflow-hidden bg-stone-100">
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
                    <div className="aspect-square overflow-hidden bg-stone-100">
                      <img
                        src={col.images[0]}
                        alt={col.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-3 border-t border-stone-100">
                    <p className="text-[11px] font-bold text-charcoal uppercase tracking-tight leading-tight truncate">{col.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-stone-400">{col.materialType}</span>
                      <span className="text-[10px] text-gold font-semibold">{col.count} options</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-stone-200">
              <p className="font-serif text-2xl text-charcoal mb-3">No collections found</p>
              <button
                onClick={() => setActiveMaterialType('All')}
                className="text-xs uppercase tracking-widest text-gold border border-gold/40 px-5 py-2 hover:bg-charcoal hover:text-cream transition-colors"
              >
                View All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollectionsPage
