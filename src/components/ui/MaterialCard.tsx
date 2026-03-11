import type { Material } from '../../data/materials'

interface MaterialCardProps {
  material: Material
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  return (
    <div className="group bg-white overflow-hidden border border-stone-200 hover:border-stone-400 transition-colors duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={material.image}
          alt={material.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <span className="text-gold text-[10px] tracking-[0.2em] uppercase font-medium">
              {material.category}
            </span>
            <h3 className="font-serif text-sm mt-0.5 text-charcoal">{material.name}</h3>
          </div>
          <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 shrink-0 ml-2">
            {material.origin}
          </span>
        </div>
        <p className="text-stone-500 text-xs leading-relaxed mb-2 line-clamp-2">
          {material.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {material.properties.map((prop) => (
            <span
              key={prop}
              className="text-[10px] text-charcoal border border-stone-200 px-1.5 py-0.5"
            >
              {prop}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-stone-400 border-t border-stone-100 pt-2">
          Care: {material.careInstructions}
        </p>
      </div>
    </div>
  )
}

export default MaterialCard
