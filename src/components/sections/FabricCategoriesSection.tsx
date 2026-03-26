import { Link } from 'react-router-dom'
import { materials, getMaterialImageUrl } from '../../data/materials'

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
  // Helper to get preview materials for a specific category
  const getPreviewMaterials = (categoryName: string, count: number) => {
    return materials
      .filter(m => (m.material_type?.toUpperCase().replace(/\s+/g, '') || 'OTHER') === categoryName)
      .slice(0, count);
  }

  return (
    <div id="fabric-collections" className="scroll-mt-24">
      {/* Mobile: horizontal scroll strip / Desktop: grid */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto flex gap-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map(([name, count]) => {
          const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
          const previewMaterials = getPreviewMaterials(name, 6)
          return (
            <Link
              key={name}
              to={`/collections?category=${name}`}
              className="group flex-none flex flex-col items-center w-48 transition-all duration-300"
            >
              <div className="w-48 h-60 mb-2 relative [perspective:1500px]">
                {/* Inside Page (Catalog Info) */}
                <div className="absolute inset-0 bg-stone-50 rounded-sm border border-stone-200 shadow-inner flex flex-col items-center justify-center p-3 z-0 overflow-hidden">
                  <p className="text-stone-700 font-serif text-xs text-center leading-tight mb-2 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] delay-150 transform translate-y-2 group-hover:translate-y-0">{name}</p>
                  
                  {/* Swatch Grid */}
                  <div className="grid grid-cols-3 gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] delay-250 transform translate-y-3 group-hover:translate-y-0">
                    {previewMaterials.map((mat, idx) => (
                      <div key={idx} className="w-12 h-12 overflow-hidden border border-stone-200 shadow-sm bg-stone-100 rounded-sm" style={{ transitionDelay: `${300 + idx * 40}ms` }}>
                        <img 
                          src={getMaterialImageUrl(mat)} 
                          alt={mat.material_name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/48x48/e7e5e4/a8a29e?text=' + mat.material_name.substring(0, 1) }}
                        />
                      </div>
                    ))}
                  </div>

                  <span className="text-[7px] uppercase tracking-widest text-stone-400 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] delay-500 transform translate-y-2 group-hover:translate-y-0">Tap to explore collection</span>
                </div>

                {/* Cover Page */}
                <div className="absolute inset-0 z-10 origin-left transition-all duration-[1600ms] ease-[cubic-bezier(0.65,0,0.15,1)] group-hover:[-webkit-transform:rotateY(-160deg)] group-hover:[transform:rotateY(-160deg)] [transform-style:preserve-3d] shadow-md group-hover:shadow-[20px_10px_30px_rgba(0,0,0,0.15)] rounded-r-md">
                  {/* Front of Cover */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] bg-stone-100 rounded-r-md rounded-l-sm overflow-hidden border border-stone-200">
                    <img
                      src={imgUrl}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                    />
                    {/* Book spine shadow */}
                    <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/40 via-black/10 to-transparent mix-blend-multiply" />
                  </div>
                  
                  {/* Back of Cover */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] bg-[#f5f5f4] rounded-l-md rounded-r-sm [transform:rotateY(180deg)] [-webkit-transform:rotateY(180deg)] border border-stone-200 shadow-inner">
                    {/* Spine shadow on inside cover */}
                    <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/10 to-transparent" />
                  </div>
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
          const previewMaterials = getPreviewMaterials(name, 9)
          return (
            <Link
              key={name}
              to={`/collections?category=${name}`}
              className="group flex flex-col items-center cursor-pointer transition-all duration-300"
            >
              <div className="w-full aspect-[4/5] mb-4 relative [perspective:1500px]">
                {/* Inside Page (Catalog Info) */}
                <div className="absolute inset-0 bg-stone-50 rounded-sm border border-stone-200 shadow-inner flex flex-col items-center justify-center p-3 z-0 overflow-hidden">
                  <p className="text-stone-700 font-serif text-sm lg:text-base text-center leading-tight mb-3 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] delay-150 transform translate-y-2 group-hover:translate-y-0">{name}</p>
                  
                  {/* Swatch Grid — 3×3 on desktop */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] delay-250 transform translate-y-3 group-hover:translate-y-0">
                    {previewMaterials.map((mat, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 lg:w-14 lg:h-14 overflow-hidden border border-stone-200 bg-stone-100 rounded-sm shadow-sm"
                        style={{ transitionDelay: `${300 + idx * 35}ms` }}
                      >
                        <img 
                          src={getMaterialImageUrl(mat)} 
                          alt={mat.material_name} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/56x56/e7e5e4/a8a29e?text=' + mat.material_name.substring(0, 1) }}
                        />
                      </div>
                    ))}
                  </div>

                  <span className="text-[9px] uppercase tracking-widest text-stone-400 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] delay-[600ms] transform translate-y-2 group-hover:translate-y-0">Browse {count} collections →</span>
                </div>

                {/* Cover Page */}
                <div className="absolute inset-0 z-10 origin-left transition-all duration-[1600ms] ease-[cubic-bezier(0.65,0,0.15,1)] group-hover:[-webkit-transform:rotateY(-160deg)] group-hover:[transform:rotateY(-160deg)] [transform-style:preserve-3d] shadow-md group-hover:shadow-[25px_15px_30px_rgba(0,0,0,0.15)] rounded-r-md">
                  {/* Front of Cover */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] bg-stone-100 rounded-r-md rounded-l-sm overflow-hidden border border-stone-200">
                    <img
                      src={imgUrl}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                    />
                    {/* Book spine shadow */}
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/40 via-black/10 to-transparent mix-blend-multiply" />
                  </div>
                  
                  {/* Back of Cover */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] bg-[#f5f5f4] rounded-l-md rounded-r-sm [transform:rotateY(180deg)] [-webkit-transform:rotateY(180deg)] border border-stone-200 shadow-inner">
                    {/* Spine shadow on inside cover */}
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent" />
                  </div>
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
