import { Link } from 'react-router-dom'
import type { Collection } from '../../data/collections'

interface CollectionCardProps {
  collection: Collection
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  return (
    <div className="group bg-white border border-stone-200 hover:border-stone-400 transition-all duration-200">
      <div className="aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-stone-400 bg-stone-100 px-2 py-0.5">
            {collection.category}
          </span>
          <span className="text-[10px] text-stone-400">{collection.itemCount} fabrics</span>
        </div>
        <h3 className="font-serif text-sm font-semibold text-stone-900 mb-1.5">{collection.name}</h3>
        <p className="text-stone-400 text-xs leading-relaxed mb-3 line-clamp-2">
          {collection.description}
        </p>
        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-charcoal border-b border-charcoal/30 pb-0.5 hover:text-gold hover:border-gold transition-colors duration-200"
        >
          View Collection →
        </Link>
      </div>
    </div>
  )
}

export default CollectionCard
