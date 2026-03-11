import { Link } from 'react-router-dom'
import HeroSection from '../components/sections/HeroSection'
import StudioBannerSection from '../components/sections/StudioBannerSection'
import FabricDiscoverySection from '../components/sections/FabricDiscoverySection'
import AIVisualizerSection from '../components/sections/AIVisualizerSection'
import CTASection from '../components/sections/CTASection'
import CollectionCard from '../components/ui/CollectionCard'
import SectionTitle from '../components/ui/SectionTitle'
import { collections } from '../data/collections'

// Gallery images for the homepage
const galleryImages = [
  { id: 1, src: 'https://placehold.co/600x400/EDE9E4/74623C?text=Living+Room', alt: 'Living Room — Royal Velvet Collection' },
  { id: 2, src: 'https://placehold.co/600x400/E8EDF0/74623C?text=Bedroom+Suite', alt: 'Bedroom Suite — Cashmere Touch' },
  { id: 3, src: 'https://placehold.co/600x400/EDF0EA/74623C?text=Dining+Room', alt: 'Formal Dining — Italian Leather' },
  { id: 4, src: 'https://placehold.co/600x400/F0EBE8/74623C?text=Study+Library', alt: 'Private Study — Contemporary Weave' },
  { id: 5, src: 'https://placehold.co/600x400/EAEAE8/74623C?text=Lounge+Area', alt: 'Lounge Area — Silk Heritage' },
  { id: 6, src: 'https://placehold.co/600x400/EDE0D8/74623C?text=Master+Suite', alt: 'Master Suite — Linen Masters' },
]

const HomePage = () => {
  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. 3D Studio Banner */}
      <StudioBannerSection />

      {/* 3. Collections Grid */}
      <section className="bg-white py-14 lg:py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-8">
            <SectionTitle
              subtitle="Curated Ranges"
              title="Fabric Collections"
              description="From velvets to linens, each collection is curated to bring a distinct character to any interior specification."
              align="left"
              className="mb-0 max-w-xl"
            />
            <Link
              to="/collections"
              className="hidden lg:inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal border-b border-charcoal pb-1 hover:text-gold hover:border-gold transition-colors duration-200 shrink-0"
            >
              View All Collections →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {collections.slice(0, 6).map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
          <div className="text-center mt-8 lg:hidden">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal border-b border-charcoal pb-1 hover:text-gold hover:border-gold transition-colors duration-200"
            >
              View All Collections →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Fabric Discovery */}
      <FabricDiscoverySection />

      {/* 5. AI Visualizer Section */}
      <AIVisualizerSection />

      {/* 6. Gallery */}
      <section className="bg-stone-50 py-14 lg:py-20 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-8">
            <SectionTitle
              subtitle="Product Applications"
              title="Project Portfolio"
              description="KAIRA fabrics and leather specified across residential and commercial interiors worldwide."
              align="left"
              className="mb-0 max-w-xl"
            />
            <Link
              to="/gallery"
              className="hidden lg:inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal border-b border-charcoal pb-1 hover:text-gold hover:border-gold transition-colors duration-200 shrink-0"
            >
              View All Projects →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((img) => (
              <div key={img.id} className="group overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-stone-200 border border-stone-200">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="bg-white border border-t-0 border-stone-200 px-3 py-2.5">
                  <p className="text-xs text-stone-500 tracking-wide">{img.alt}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 lg:hidden">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal border-b border-charcoal pb-1 hover:text-gold hover:border-gold transition-colors duration-200"
            >
              View All Projects →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <CTASection />
    </>
  )
}

export default HomePage
