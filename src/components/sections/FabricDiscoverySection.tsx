import { useState } from 'react'

const fabrics = [
  { id: 1, name: 'Ivory Linen', color: 'Neutral', pattern: 'Solid', material: 'Linen', collection: 'Linen Masters', hex: '#F5F0E8' },
  { id: 2, name: 'Midnight Velvet', color: 'Dark', pattern: 'Solid', material: 'Velvet', collection: 'Royal Velvet', hex: '#1A0A2E' },
  { id: 3, name: 'Amber Silk', color: 'Warm', pattern: 'Solid', material: 'Silk', collection: 'Silk Heritage', hex: '#C5A552' },
  { id: 4, name: 'Storm Herringbone', color: 'Neutral', pattern: 'Herringbone', material: 'Wool', collection: 'Contemporary Weave', hex: '#5A5D6B' },
  { id: 5, name: 'Terracotta Linen', color: 'Warm', pattern: 'Solid', material: 'Linen', collection: 'Linen Masters', hex: '#C4704A' },
  { id: 6, name: 'Forest Cashmere', color: 'Cool', pattern: 'Solid', material: 'Cashmere', collection: 'Cashmere Touch', hex: '#2D4A35' },
  { id: 7, name: 'Blush Velvet', color: 'Warm', pattern: 'Solid', material: 'Velvet', collection: 'Royal Velvet', hex: '#D4A0A0' },
  { id: 8, name: 'Midnight Blue Silk', color: 'Cool', pattern: 'Solid', material: 'Silk', collection: 'Silk Heritage', hex: '#1A2C5B' },
  { id: 9, name: 'Warm Greige', color: 'Neutral', pattern: 'Textured', material: 'Linen', collection: 'Linen Masters', hex: '#C8BBA8' },
  { id: 10, name: 'Emerald Jacquard', color: 'Cool', pattern: 'Geometric', material: 'Jacquard', collection: 'Contemporary Weave', hex: '#1A5440' },
  { id: 11, name: 'Cognac Leather', color: 'Warm', pattern: 'Solid', material: 'Leather', collection: 'Italian Leather', hex: '#8B4A2A' },
  { id: 12, name: 'Pearl Cashmere', color: 'Neutral', pattern: 'Solid', material: 'Cashmere', collection: 'Cashmere Touch', hex: '#E8E0D5' },
]

const colorFilters = ['All', 'Neutral', 'Warm', 'Cool', 'Dark']
const patternFilters = ['All', 'Solid', 'Herringbone', 'Geometric', 'Textured']
const materialFilters = ['All', 'Linen', 'Velvet', 'Silk', 'Cashmere', 'Wool', 'Leather', 'Jacquard']
const collectionFilters = ['All', 'Linen Masters', 'Royal Velvet', 'Silk Heritage', 'Cashmere Touch', 'Contemporary Weave', 'Italian Leather']

const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-all duration-200 ${
      active
        ? 'bg-charcoal text-cream'
        : 'bg-transparent border border-stone-300 text-stone-500 hover:border-charcoal hover:text-charcoal'
    }`}
  >
    {label}
  </button>
)

const FabricDiscoverySection = () => {
  const [activeColor, setActiveColor] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [activeMaterial, setActiveMaterial] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')

  const filtered = fabrics.filter((f) => {
    if (activeColor !== 'All' && f.color !== activeColor) return false
    if (activePattern !== 'All' && f.pattern !== activePattern) return false
    if (activeMaterial !== 'All' && f.material !== activeMaterial) return false
    if (activeCollection !== 'All' && f.collection !== activeCollection) return false
    return true
  })

  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            Browse Our Range
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
            Fabric Discovery
          </h2>
          <p className="text-stone-500 text-lg max-w-xl">
            Explore over 500 premium textile swatches. Filter by colour, pattern, material, or collection.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 mb-10 border border-stone-200 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-stone-400 tracking-widest uppercase w-20 shrink-0">Colour</span>
            <div className="flex flex-wrap gap-2">
              {colorFilters.map((f) => (
                <FilterPill key={f} label={f} active={activeColor === f} onClick={() => setActiveColor(f)} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-stone-400 tracking-widest uppercase w-20 shrink-0">Pattern</span>
            <div className="flex flex-wrap gap-2">
              {patternFilters.map((f) => (
                <FilterPill key={f} label={f} active={activePattern === f} onClick={() => setActivePattern(f)} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-stone-400 tracking-widest uppercase w-20 shrink-0">Material</span>
            <div className="flex flex-wrap gap-2">
              {materialFilters.map((f) => (
                <FilterPill key={f} label={f} active={activeMaterial === f} onClick={() => setActiveMaterial(f)} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-stone-400 tracking-widest uppercase w-20 shrink-0">Collection</span>
            <div className="flex flex-wrap gap-2">
              {collectionFilters.map((f) => (
                <FilterPill key={f} label={f} active={activeCollection === f} onClick={() => setActiveCollection(f)} />
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-stone-400 mb-6">
          Showing <span className="text-charcoal font-medium">{filtered.length}</span> of {fabrics.length} fabrics
        </p>

        {/* Fabric Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map((fabric) => (
              <div key={fabric.id} className="group cursor-pointer">
                <div
                  className="aspect-square mb-3 border border-stone-200 group-hover:border-gold transition-colors duration-300"
                  style={{ backgroundColor: fabric.hex }}
                />
                <p className="text-xs font-medium text-charcoal truncate">{fabric.name}</p>
                <p className="text-xs text-stone-400">{fabric.material}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-charcoal mb-2">No fabrics found</p>
            <p className="text-stone-400 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FabricDiscoverySection
