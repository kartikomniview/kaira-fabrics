import { Link } from 'react-router-dom'
import type { Collection } from '../../data/collections'

interface CollectionCardProps {
  collection: Collection
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  return (
    <div className="group relative overflow-hidden bg-white">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-6 border border-t-0 border-stone-200">
        <span className="text-gold text-xs tracking-[0.2em] uppercase font-medium">
          {collection.category}
        </span>
        <h3 className="font-serif text-xl mt-1 mb-2 text-charcoal">{collection.name}</h3>
        <p className="text-stone-500 text-sm leading-relaxed mb-5 line-clamp-2">
          {collection.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400">{collection.itemCount} fabrics</span>
          <Link
            to={`/collections`}
            className="text-xs tracking-widest uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-gold hover:border-gold transition-colors duration-200"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CollectionCard
