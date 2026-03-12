import type { Material } from '../../data/materials'
import { getMaterialImageUrl } from '../../data/materials'

interface MaterialCardProps {
  material: Material
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  const imageUrl = getMaterialImageUrl(material)

  return (
    <div className="group bg-white overflow-hidden border border-stone-200 hover:border-stone-400 transition-colors duration-300">
      <div className="aspect-video overflow-hidden bg-stone-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={material.material_name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-3xl text-stone-300 uppercase tracking-widest">
              {material.material_code}
            </span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <span className="text-gold text-[10px] tracking-[0.2em] uppercase font-medium">
              {material.material_type}
            </span>
            <h3 className="font-serif text-sm mt-0.5 text-charcoal">{material.material_name}</h3>
          </div>
          <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 shrink-0 ml-2">
            {material.collection_name}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {material.color_group && (
            <span className="text-[10px] text-charcoal border border-stone-200 px-1.5 py-0.5">
              {material.color_group}
            </span>
          )}
          {material.pattern && (
            <span className="text-[10px] text-charcoal border border-stone-200 px-1.5 py-0.5">
              {material.pattern}
            </span>
          )}
        </div>
        <div className="border-t border-stone-100 pt-2 grid grid-cols-3 gap-1 text-[10px] text-stone-400">
          <span>Roughness: {material.roughness}</span>
          <span>Metalness: {material.metalness}</span>
          <span>Sheen: {material.sheen}</span>
        </div>
      </div>
    </div>
  )
}

export default MaterialCard
