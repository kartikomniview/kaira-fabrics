import { Link } from 'react-router-dom'
import type { Collection } from '../../data/collections'

interface CollectionCardProps {
  collection: Collection
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  return (
    <Link
      to="/collections"
      className="group relative block rounded-2xl overflow-hidden aspect-[3/4] bg-stone-200 shadow-sm"
    >
      {/* Image */}
      <img
        src={collection.image}
        alt={collection.name}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />

      {/* Permanent subtle gradient at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Collection name at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-serif text-base font-semibold text-white leading-tight">
          {collection.name}
        </h3>
        <span className="text-xs text-stone-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          {collection.category}
        </span>
      </div>
    </Link>
  )
}

export default CollectionCard
