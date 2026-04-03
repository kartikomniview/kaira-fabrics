import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMaterials } from '../../contexts/MaterialsContext'

const categoryImages: Record<string, string> = {
  'CHENILLE':     'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Ripple.webp',
  'DIGITALPRINT': 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/DigitalPrints2.webp',
  'LEATHERITE':   'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Adelaide.webp',
  'SUEDEFABRIC':  'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Krystal.webp',
  'SUEDELEATHER': 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Ivana.webp',
  'DEFAULT':      'https://placehold.co/400x500/e7e5e4/a8a29e?text=Fabric',
}



const FabricCategoriesSection = () => {
  const { materials } = useMaterials()

  const categories = useMemo(() => {
    const counts = materials.reduce((acc, m) => {
      const type = m.material_type?.toUpperCase().replace(/\s+/g, '') || 'OTHER'
      if (!acc[type]) acc[type] = new Set<string>()
      acc[type].add(m.collection_name)
      return acc
    }, {} as Record<string, Set<string>>)
    return Object.entries(
      Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v.size]))
    ).sort((a, b) => a[0].localeCompare(b[0]))
  }, [materials])

  return (
    <div id="fabric-collections" className="scroll-mt-24">
      {/* Mobile: horizontal scroll strip / Desktop: grid */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto flex gap-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map(([name, count]) => {
          const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
          return (
            <Link
              key={name}
              to={`/collections?category=${name}`}
              className="group flex-none flex flex-col items-center w-48 transition-all duration-300"
            >
              <div className="w-48 h-60 mb-2 relative overflow-hidden rounded-sm shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <img
                  src={imgUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-center pb-4">
                  <span className="text-white text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 transform">Explore →</span>
                </div>
              </div>
              <h3 className="text-sm font-serif text-stone-900 tracking-wide group-hover:text-secondary transition-colors text-center leading-tight mt-3">
                {name}
              </h3>
              <p className="mt-0.5 text-[11px] text-stone-400 uppercase tracking-widest text-center">
                {count} {count === 1 ? 'Collection' : 'Collections'}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-12">
        {categories.map(([name, count]) => {
          const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
          return (
            <Link
              key={name}
              to={`/collections?category=${name}`}
              className="group flex flex-col items-center cursor-pointer transition-all duration-300"
            >
              <div className="w-full aspect-[4/5] mb-4 relative overflow-hidden rounded-sm shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <img
                  src={imgUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-center pb-5">
                  <span className="text-white text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 transform">Browse {count} collections →</span>
                </div>
              </div>
              <div className="text-center w-full px-2">
                <h3 className="font-serif text-lg text-stone-900 tracking-wide group-hover:text-secondary transition-colors">
                  {name}
                </h3>
                <p className="mt-1 text-[11px] text-stone-500 uppercase tracking-widest">
                  {count} {count === 1 ? 'Collection' : 'Collections'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default FabricCategoriesSection
