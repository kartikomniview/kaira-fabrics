import { useState } from 'react'
import CollectionCard from '../components/ui/CollectionCard'
import { collections } from '../data/collections'

const categories = ['All', 'Velvet', 'Linen', 'Silk', 'Cashmere', 'Technical', 'Woven', 'Leather', 'Embroidered']

const CollectionsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? collections
    : collections.filter((c) => c.category === activeCategory)

  return (
    <div className="min-h-screen">
      {/* Page Hero */}
      <div className="bg-charcoal pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            Our Portfolio
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
            Fabric Collections
          </h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            Explore our complete range of curated textile collections, each telling
            a unique story of craft, material, and method.
          </p>
        </div>
      </div>

      {/* Filter & Grid */}
      <div className="bg-cream py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
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

          {/* Results info */}
          <p className="text-stone-400 text-sm text-center mb-6">
            {filtered.length} collection{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-3xl text-charcoal mb-3">No collections found</p>
              <p className="text-stone-400">Try a different category</p>
            </div>
          )}
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-stone-100 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { title: 'Sample Swatches', desc: 'Order physical swatches to experience the fabric quality firsthand before committing.' },
              { title: 'Volume Discounts', desc: 'Tiered pricing for interior designers and trade customers on qualifying orders.' },
              { title: 'Custom Weaves', desc: 'Commission bespoke fabric colourways, widths, and finishes exclusive to your project.' },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-serif text-xl text-charcoal mb-3">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionsPage
