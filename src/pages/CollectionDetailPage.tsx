import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryMeta, normalizeType } from '../components/sections/FabricCategoriesSection'
import EnquiryFormModal from '../components/ui/EnquiryFormModal'
import InlineLoader from '../components/ui/InlineLoader'
import Seo, { pageTitle } from '../components/seo/Seo'
import { useMaterials } from '../contexts/MaterialsContext'
import { type Collection, isTextureMapCode } from '../data/collections'
import { materialTypeCopy, SWATCH_NOTE } from '../data/materialTypeCopy'
import { useCachedMedia } from '../hooks/useCachedMedia'

const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'

/* ── Material Thumbnail (lazy + per-image skeleton) ─────────────── */
export function MaterialThumb({
  src,
  alt,
  to,
  label,
  subLabel,
  show3DButton = true,
}: {
  src: string
  alt: string
  /** Material detail page URL; the 3D button links to the same page with ?view=3d. */
  to: string
  label: string
  subLabel?: string
  show3DButton?: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const thumbRef = useRef<HTMLAnchorElement>(null)
  const cachedSrc = useCachedMedia(inView ? src : undefined)

  useEffect(() => {
    const el = thumbRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { rootMargin: '150px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="group flex flex-col">
      <Link to={to} ref={thumbRef} className="block aspect-square overflow-hidden bg-stone-100 border border-stone-200  shadow-sm hover:shadow-md transition-all group-hover:border-primary/40 relative">
        {(!inView || !loaded) && !error && (
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div
              className="absolute inset-0 -translate-x-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.72) 50%, transparent 100%)',
                animation: 'kaira-shimmer 1.6s ease-in-out infinite',
              }}
            />
          </div>
        )}
        {inView && cachedSrc && !error && (
          <img
            src={cachedSrc}
            alt={alt}
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
            <svg className="w-5 h-5 text-color-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900/30">
          <span className="px-4 py-2 bg-white text-secondary-dark text-[10px] uppercase font-bold tracking-[0.15em] shadow-md">
            View Details
          </span>
        </div>
      </Link>
      <div className="mt-2 px-0.5 flex items-center justify-between gap-1.5">
        <Link to={to} className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-charcoal uppercase truncate leading-tight">{label}</p>
          {subLabel && <p className="text-[10px] text-color-secondary-dark truncate">{subLabel}</p>}
        </Link>
        {show3DButton && (
          <Link
            to={`${to}?view=3d`}
            className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap bg-secondary-dark text-white text-[8px] uppercase font-bold tracking-[0.1em] hover:bg-stone-800 transition-colors"
            title="View in 3D"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25m0-9L3 7.5m9 5.25v9M3 7.5v9l9 5.25" />
            </svg>
            View in 3D
          </Link>
        )}
      </div>
    </div>
  )
}

/* ── Related collection card ─────────────────────────────────────── */
export function RelatedCollectionCard({ col }: { col: Collection }) {
  const cachedSrc = useCachedMedia(col.image)
  return (
    <Link
      to={`/collections/${col.id}`}
      className="group block bg-white border border-stone-200 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300  shadow-sm"
    >
      <div className="aspect-[3/4] overflow-hidden bg-stone-100">
        {cachedSrc && (
          <img
            src={cachedSrc}
            alt={col.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-2.5 border-t border-stone-200">
        <p className="text-[11px] font-bold text-color-secondary-dark uppercase tracking-tight truncate">{col.name}</p>
        <p className="text-[10px] text-color-secondary-dark mt-0.5">{col.itemCount} variants</p>
      </div>
    </Link>
  )
}

function buildMetaDescription(collection: Collection): string {
  const meta = categoryMeta[normalizeType(collection.category)]
  const label = meta?.label ?? collection.category
  const plural = collection.itemCount === 1 ? '' : 's'
  return `Explore the ${collection.name} ${label} collection from KAIRA — ${collection.itemCount} fabric variant${plural}. View swatches in detail, preview in 3D, or request the full catalog.`
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { collections, newMaterials, isLoading: materialsLoading } = useMaterials()

  const collection = useMemo(() => collections.find((c) => c.id === slug), [collections, slug])

  const [showContactForm, setShowContactForm] = useState(false)
  const [materialSearch, setMaterialSearch] = useState('')

  const materials = useMemo(
    () =>
      collection
        ? newMaterials
          .filter((m) => m.collection_name === collection.name && !isTextureMapCode(m.material_code))
          .sort((a, b) =>
            (a.material_code ?? '').localeCompare(b.material_code ?? '', undefined, { numeric: true, sensitivity: 'base' })
          )
        : [],
    [newMaterials, collection]
  )

  const relatedCollections = useMemo(
    () =>
      collection
        ? collections.filter((c) => c.id !== collection.id && c.category === collection.category).slice(0, 4)
        : [],
    [collections, collection]
  )

  const cachedCoverSrc = useCachedMedia(collection?.image)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!collection) {
    if (materialsLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Seo title={pageTitle('Loading Collection')} description="Loading fabric collection details." />
          <InlineLoader color="secondary" />
        </div>
      )
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
        <Seo title={pageTitle('Collection Not Found')} description="This fabric collection could not be found." noindex />
        <p className="font-serif text-3xl text-color-secondary-dark mb-3">Collection Not Found</p>
        <p className="text-sm text-color-secondary-dark mb-8 max-w-md">
          We couldn't find the collection you're looking for. It may have been renamed or is no longer available.
        </p>
        <Link
          to="/collections"
          className="px-6 py-3 bg-secondary-dark text-white text-[11px] uppercase font-bold tracking-[0.2em] hover:bg-stone-800 transition-colors"
        >
          Browse All Collections
        </Link>
      </div>
    )
  }

  const meta = categoryMeta[normalizeType(collection.category)]
  const categoryLabel = meta?.label ?? collection.category
  const typeCopy = materialTypeCopy[normalizeType(collection.category)]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
      <Seo title={pageTitle(`${collection.name} Fabric Collection`)} description={buildMetaDescription(collection)} image={collection.image} />

      {/* ── Top bar: Back to Collections + breadcrumb ──────────────── */}
      <div className="pt-20 md:pt-24 max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-3">
        <Link
          to="/collections"
          className="group shrink-0 flex items-center gap-2 px-3 md:px-4 py-2 border border-secondary bg-secondary text-[10px] uppercase tracking-[0.2em] font-bold text-white hover:bg-secondary-dark hover:border-secondary-dark transition-all shadow-sm"
        >
          <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Collections</span>
        </Link>
        <nav className="min-w-0 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-color-secondary-dark/70" aria-label="Breadcrumb">
          <Link to="/" className="hidden sm:inline hover:text-primary transition-colors">Home</Link>
          <span className="hidden sm:inline">/</span>
          <Link to="/collections" className="shrink-0 hover:text-primary transition-colors">Collections</Link>
          <span>/</span>
          <span className="truncate text-color-secondary-dark">{collection.name}</span>
        </nav>
      </div>

      {/* ── Header: catalog image left, title/description right ───── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 pt-4 pb-6 flex flex-col md:flex-row gap-5 md:gap-10 items-start">
        {/* Image — full width at its natural ratio on mobile; fixed height on desktop */}
        <div className="w-full md:w-auto md:shrink-0 min-h-64 md:min-h-0 md:h-80 overflow-hidden bg-stone-100 border border-stone-200 shadow-sm flex items-center justify-center mx-auto md:mx-0">
          {cachedCoverSrc && (
            <img
              src={cachedCoverSrc}
              alt={collection.name}
              className="w-full h-auto max-h-[70vh] md:h-full md:w-auto md:max-w-full md:max-h-none object-contain"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement
                el.style.display = 'none'
                el.parentElement!.style.background = '#e7e5e4'
              }}
            />
          )}
        </div>

        {/* Title + description + details */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] tracking-[0.3em] font-bold uppercase text-primary mb-1">{categoryLabel}</p>
          <h1 className="font-serif text-2xl md:text-4xl text-color-secondary-dark leading-tight">{collection.name}</h1>
          {typeCopy && (
            <p className="mt-3 text-xs md:text-sm text-color-secondary-dark/80 font-light leading-relaxed">
              {typeCopy.showSwatchNote ? `${typeCopy.description} ${SWATCH_NOTE}` : typeCopy.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark/60">Variants</p>
              <p className="text-color-secondary-dark font-bold text-base">{collection.itemCount}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark/60">Category</p>
              <p className="text-color-secondary-dark font-bold text-base">{categoryLabel}</p>
            </div>
          </div>

          {/* Key features */}
          {typeCopy && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {typeCopy.features.map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-color-secondary-dark/80">
                  <svg className="w-3 h-3 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Colour tags */}
          {collection.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {collection.tags.map((tag) => (
                <span key={tag} className="text-[9px] font-bold px-2.5 py-1 border border-stone-300 text-color-secondary-dark tracking-[0.2em] uppercase">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mt-5">
            <button
              onClick={() => setShowContactForm(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-primary text-secondary-dark text-xs uppercase font-bold tracking-[0.2em] hover:bg-primary-dark transition-all shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Catalog
            </button>
            <a
              href={`https://wa.me/918589925666?text=${encodeURIComponent(`I'm interested in the ${collection.name} collection`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 border border-secondary text-secondary text-xs uppercase font-bold tracking-[0.2em] hover:bg-secondary hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Enquire Now
            </a>
          </div>
        </div>
      </div>

      {/* ── Materials — full width, below header ───────────────────── */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-10 pb-10">
        <div className="bg-white border border-stone-200 shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-stone-200 bg-white flex items-center gap-3 flex-wrap">
            <h2 className="font-serif text-lg md:text-xl text-color-secondary-dark shrink-0">
              Materials in this Collection
            </h2>
            <div className="flex items-center gap-2 border border-stone-200  bg-stone-50 px-2.5 py-1.5 flex-1 max-w-xs focus-within:border-stone-400 focus-within:bg-white transition-all">
              <svg className="w-3 h-3 text-color-secondary-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-base sm:text-[12px] text-color-secondary-dark placeholder-stone-400 focus:outline-none min-w-0"
              />
              {materialSearch && (
                <button onClick={() => setMaterialSearch('')} aria-label="Clear search" className="-m-1.5 p-1.5 text-color-secondary-dark hover:text-color-secondary-dark transition-colors">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                </button>
              )}
            </div>
            <span className="ml-auto text-[9px] font-bold bg-stone-100 text-color-secondary-dark px-2 py-0.5 tracking-[0.1em] uppercase shrink-0">
              {materialSearch ? `${materials.filter(m => (m.material_name?.toLowerCase().includes(materialSearch.toLowerCase()) || m.material_code?.toLowerCase().includes(materialSearch.toLowerCase()) || m.color_group?.toLowerCase().includes(materialSearch.toLowerCase()))).length} results` : `${materials.length} items`}
            </span>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-5 sm:gap-4 md:gap-6">
              {materials.filter(m =>
                !materialSearch ||
                m.material_name?.toLowerCase().includes(materialSearch.toLowerCase()) ||
                m.material_code?.toLowerCase().includes(materialSearch.toLowerCase()) ||
                m.color_group?.toLowerCase().includes(materialSearch.toLowerCase())
              ).map((m, idx) => (
                <MaterialThumb
                  key={idx}
                  src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                  alt={`${m.collection_name} ${m.material_name}`}
                  to={`/collections/${collection.id}/${encodeURIComponent(m.material_code)}`}
                  label={m.material_name}
                  subLabel={m.color_group ?? undefined}
                />
              ))}
            </div>

            {/* Colour disclaimer */}
            <p className="flex items-start gap-2 mt-6 md:mt-8 px-3 py-2 bg-stone-50 border border-stone-200 text-[10px] md:text-[11px] text-color-secondary-dark/80 leading-relaxed">
              <svg className="w-3.5 h-3.5 text-primary shrink-0 mt-px" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span>Colours shown are for reference only. Actual fabric colours may vary slightly due to screen settings, lighting and dye lots.</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Related Collections ────────────────────────────────────── */}
      {relatedCollections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 pt-6 md:pt-10 pb-12 md:pb-16">
          <div className="border-t border-stone-200 mb-6 md:mb-10" />
          <h2 className="font-serif text-xl md:text-2xl text-color-secondary-dark mb-5 md:mb-8 text-center">More {categoryLabel} Collections</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
            {relatedCollections.map((c) => (
              <RelatedCollectionCard key={c.id} col={c} />
            ))}
          </div>
        </div>
      )}

      {showContactForm && (
        <EnquiryFormModal
          eyebrow="Request Catalog"
          title={collection.name}
          intro={<>Fill in your details and we'll send the full catalog for <span className="text-color-secondary-dark font-semibold">{collection.name}</span>.</>}
          subject={`Catalog Request: ${collection.name}`}
          successText="Thank you! We'll get back to you with the catalog shortly."
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}
