import { useState } from 'react'
import MaterialCard from '../components/ui/MaterialCard'
import { materials, materialCategories } from '../data/materials'

const MaterialsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? materials
      : materials.filter((m) => m.category === activeCategory)

  return (
    <div className="min-h-screen">
      {/* Page Hero */}
      <div className="bg-charcoal pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
              Material Knowledge
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
              The Materials
            </h1>
            <p className="text-stone-400 text-lg leading-relaxed">
              Every KAIRA fabric begins with the finest raw materials. Explore the qualities, origins,
              and care requirements of each material in our range.
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy strip */}
      <div className="bg-gold/10 border-y border-gold/20 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Source Transparency', value: '100%' },
              { label: 'Natural Materials', value: '85%' },
              { label: 'Certifications', value: '12+' },
              { label: 'Partner Spinners', value: '30+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-3xl text-gold">{s.value}</p>
                <p className="text-charcoal text-xs tracking-widest uppercase mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Cards */}
      <div className="bg-cream py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {materialCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-charcoal text-cream'
                    : 'border border-stone-300 text-stone-500 hover:border-charcoal hover:text-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-3xl text-charcoal mb-3">No materials found</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="text-sm text-gold underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Care guide promo */}
      <div className="bg-charcoal py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-serif text-3xl text-cream mb-4">
            Download Our Care &amp; Maintenance Guide
          </h2>
          <p className="text-stone-400 max-w-lg mx-auto mb-8">
            Preserve the beauty of your KAIRA fabrics with our comprehensive care guide,
            developed by our in-house textile experts.
          </p>
          <button className="inline-flex items-center gap-3 border border-gold text-gold px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-charcoal transition-all">
            Download PDF Guide
          </button>
        </div>
      </div>
    </div>
  )
}

export default MaterialsPage
