import { Link } from 'react-router-dom'
import { materials } from '../../data/materials'

const categoryCounts = materials.reduce((acc, material) => {
  const type = material.material_type?.toUpperCase().replace(/\s+/g, '') || 'OTHER'
  if (!acc[type]) acc[type] = new Set<string>()
  acc[type].add(material.collection_name)
  return acc
}, {} as Record<string, Set<string>>)

const categoryCollectionCounts: Record<string, number> = Object.fromEntries(
  Object.entries(categoryCounts).map(([k, v]) => [k, v.size])
)

const categories = Object.entries(categoryCollectionCounts).sort((a, b) => a[0].localeCompare(b[0]))

const categoryImages: Record<string, string> = {
  'CHENILLE':     'https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/Ripple.webp',
  'DIGITALPRINT': 'https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/DigitalPrints2.webp',
  'LEATHERITE':   'https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/Adelaide.webp',
  'SUEDEFABRIC':  'https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/Krystal.webp',
  'SUEDELEATHER': 'https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/Ivana.webp',
  'DEFAULT':      'https://placehold.co/400x500/e7e5e4/a8a29e?text=Fabric',
}

const FabricCategoriesSection = () => {
  return (
    <div id="fabric-collections" className="scroll-mt-24">
      {/* Header */}
      <div className="text-center mb-5 md:mb-10">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-1 md:mb-2">Browse By Type</p>
        <h2 className="font-serif text-2xl md:text-4xl text-stone-900 font-medium">Fabric Collections</h2>
        <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
          <span className="h-px w-8 md:w-12 bg-stone-300" />
          <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
          <span className="h-px w-8 md:w-12 bg-stone-300" />
        </div>
      </div>

      {/* Mobile: horizontal scroll strip / Desktop: grid */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto flex gap-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map(([name, count]) => {
          const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
          return (
            <Link
              key={name}
              to={`/collections?category=${name}`}
              className="group flex-none flex flex-col items-center w-28"
            >
              <div className="w-28 h-36 overflow-hidden bg-stone-100 rounded-lg border border-stone-100 shadow-sm relative mb-2">
                <img
                  src={imgUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-300" />
              </div>
              <h3 className="text-[11px] font-serif text-stone-900 tracking-wide group-hover:text-secondary transition-colors text-center leading-tight">
                {name}
              </h3>
              <p className="mt-0.5 text-[9px] text-stone-400 uppercase tracking-widest text-center">
                {count} {count === 1 ? 'Collection' : 'Collections'}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
        {categories.map(([name, count]) => {
          const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
          return (
            <Link
              key={name}
              to={`/collections?category=${name}`}
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-full aspect-[4/5] overflow-hidden bg-stone-100 mb-4 relative rounded-sm border border-stone-100 shadow-sm">
                <img
                  src={imgUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-300" />
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
