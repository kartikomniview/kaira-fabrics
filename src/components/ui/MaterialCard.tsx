import type { Material } from '../../data/materials'

interface MaterialCardProps {
  material: Material
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  return (
    <div className="group bg-white overflow-hidden border border-stone-200 hover:border-gold transition-colors duration-300">
      <div className="aspect-[5/4] overflow-hidden">
        <img
          src={material.image}
          alt={material.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-gold text-xs tracking-[0.2em] uppercase font-medium">
              {material.category}
            </span>
            <h3 className="font-serif text-xl mt-0.5 text-charcoal">{material.name}</h3>
          </div>
          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 shrink-0 ml-3">
            {material.origin}
          </span>
        </div>
        <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {material.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {material.properties.map((prop) => (
            <span
              key={prop}
              className="text-xs text-charcoal border border-stone-200 px-2 py-0.5"
            >
              {prop}
            </span>
          ))}
        </div>
        <p className="text-xs text-stone-400 border-t border-stone-100 pt-3">
          Care: {material.careInstructions}
        </p>
      </div>
    </div>
  )
}

export default MaterialCard
