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
  { id: 1, src: 'https://placehold.co/600x400/3B2A1A/C5A552?text=Living+Room', alt: 'Luxury living room with Royal Velvet', span: 'col-span-2 row-span-2' },
  { id: 2, src: 'https://placehold.co/400x300/2C3E50/C5A552?text=Bedroom+Suite', alt: 'Elegant bedroom suite', span: '' },
  { id: 3, src: 'https://placehold.co/400x300/3D5A47/FAF8F5?text=Dining+Room', alt: 'Formal dining room', span: '' },
  { id: 4, src: 'https://placehold.co/400x300/4A1942/C5A552?text=Study+Library', alt: 'Private study library', span: '' },
  { id: 5, src: 'https://placehold.co/400x300/1C1917/C5A552?text=Lounge+Area', alt: 'Luxurious lounge area', span: '' },
  { id: 6, src: 'https://placehold.co/600x400/6B3A2A/FAF8F5?text=Master+Suite', alt: 'Master bedroom suite', span: 'col-span-2' },
]

const HomePage = () => {
  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. 3D Studio Banner */}
      <StudioBannerSection />

      {/* 3. Collections Grid */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionTitle
            subtitle="Curated Ranges"
            title="Fabric Collections"
            description="From opulent velvets to breathable linens, each collection is carefully curated to bring a distinct character to your interior."
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.slice(0, 6).map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal border-b border-charcoal pb-1 hover:text-gold hover:border-gold transition-colors duration-200"
            >
              View All Collections
              <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Fabric Discovery */}
      <FabricDiscoverySection />

      {/* 5. AI Visualizer Section */}
      <AIVisualizerSection />

      {/* 6. Gallery */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionTitle
            subtitle="Interior Inspirations"
            title="KAIRA Gallery"
            description="A curated portfolio of real spaces adorned with KAIRA fabrics and leather—where luxury meets lived-in beauty."
            className="mb-14"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className={`overflow-hidden group ${img.span}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 min-h-[200px]"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal border-b border-charcoal pb-1 hover:text-gold hover:border-gold transition-colors duration-200"
            >
              Explore Full Gallery
              <span className="text-base">→</span>
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
