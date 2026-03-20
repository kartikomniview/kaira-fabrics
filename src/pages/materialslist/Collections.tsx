import { Link, useSearchParams } from 'react-router-dom'
import { collections } from '../../data/collections'

const Collections = () => {
  const [, setSearchParams] = useSearchParams()

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-10 py-8">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-2">
          Discover
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal">
          Fabric Collections
        </h1>
        <p className="text-sm text-stone-500 mt-4 max-w-2xl">
          Browse our curated collections of premium fabrics. Select a collection below to view its complete range of materials, colors, and patterns.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => setSearchParams({ collection: c.name })}
            className="group relative flex flex-col items-start bg-white border border-stone-200 overflow-hidden hover:border-gold/50 transition-colors text-left"
          >
            {/* Image Container */}
            <div className="w-full aspect-[4/3] bg-stone-100 overflow-hidden relative">
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
              />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="p-5 w-full bg-white flex flex-col flex-1">
              <span className="text-[9px] text-gold uppercase tracking-[0.2em] font-semibold mb-1">
                {c.category}
              </span>
              <h3 className="font-serif text-xl text-charcoal mb-1 group-hover:text-gold transition-colors">
                {c.name}
              </h3>
              <p className="text-xs text-stone-500 mb-4 line-clamp-2">
                {c.description}
              </p>
              
              <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between w-full">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
                  {c.itemCount} Fabrics
                </span>
                <span className="text-[10px] uppercase tracking-widest text-charcoal font-semibold flex items-center gap-1 group-hover:text-gold transition-colors">
                  View full
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Collections
