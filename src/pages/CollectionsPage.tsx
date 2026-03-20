import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { collections, type Collection } from '../data/collections'
import { newMaterials } from '../data/newmaterials'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const materialTypeOptions = ['All', ...Array.from(new Set(collections.map((c) => c.category))).sort()]

/* ── Catalog Preview Modal ───────────────────────────────────────── */
function CatalogPreviewModal({
  collection,
  materials,
  onClose,
}: {
  collection: Collection
  materials: typeof newMaterials
  onClose: () => void
}) {
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [contactData, setContactData] = useState({ name: '', email: '', company: '', message: '' })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-[10px] uppercase tracking-widest text-stone-400">
              {collection.name} &mdash; Catalog Preview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowContactForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest bg-primary text-stone-900 hover:bg-primary/90 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Get this Catalog
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable PDF area */}
        <div className="overflow-y-auto flex-1 bg-stone-300 p-5">
          {/* Document */}
          <div className="bg-white w-full shadow-xl mx-auto">

            {/* ── Cover ───────────────────────────────── */}
            <div className="relative overflow-hidden bg-stone-900 min-h-[180px]">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full object-contain opacity-35 block"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-[0.35em] text-primary uppercase font-medium">KAIRA FABRICS</span>
                  <span className="text-[8px] tracking-[0.2em] text-stone-500 uppercase">Product Catalog</span>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.3em] text-primary/80 uppercase mb-2">{collection.category}</p>
                  <h1 className="font-serif text-[32px] text-white leading-tight mb-2">{collection.name}</h1>
                  <p className="text-[11px] text-stone-400 leading-relaxed max-w-md" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {collection.description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />
            </div>

            {/* ── Collection Info ──────────────────────── */}
            <div className="px-8 py-5 border-b border-stone-100 flex items-start gap-8">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] tracking-[0.3em] uppercase text-stone-400 mb-2">About this Collection</p>
                <p className="text-[11px] text-stone-600 leading-relaxed">{collection.description}</p>
                {collection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {collection.tags.map((tag) => (
                      <span key={tag} className="text-[8px] px-2 py-0.5 border border-stone-200 text-stone-400 tracking-wide uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-right border-l border-stone-100 pl-6">
                <p className="text-[8px] tracking-[0.2em] uppercase text-stone-400 mb-1">Variants</p>
                <p className="font-serif text-4xl text-gold leading-none">{collection.itemCount}</p>
                <p className="text-[8px] text-stone-400 mt-1 tracking-wide">SKUs Available</p>
              </div>
            </div>

            {/* ── Materials Grid ───────────────────────── */}
            <div className="px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[8px] tracking-[0.3em] uppercase text-stone-400">Materials &amp; Swatches</p>
                <span className="text-[8px] text-stone-400">{materials.length} items</span>
              </div>
              {materials.length === 0 ? (
                <p className="text-[11px] text-stone-400 text-center py-10">No materials listed for this collection.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {materials.map((m) => (
                    <div key={m.id} className="border border-stone-200 overflow-hidden">
                      <div className="aspect-square overflow-hidden bg-stone-100">
                        <img
                          src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                          alt={m.material_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 bg-stone-50 border-t border-stone-100">
                        <p className="text-[8px] font-bold text-charcoal uppercase truncate leading-tight tracking-tight">{m.material_name}</p>
                        <p className="text-[7px] text-gold truncate mt-0.5 tracking-wide">{m.material_code}</p>
                        {m.color_group && (
                          <p className="text-[7px] text-stone-400 truncate">{m.color_group}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Document Footer ──────────────────────── */}
            <div className="flex items-center justify-between px-8 py-3 bg-stone-900 border-t border-stone-800">
              <span className="text-[8px] tracking-[0.3em] font-bold text-primary uppercase">KAIRA FABRICS</span>
              <span className="text-[7px] font-medium text-stone-500 tracking-wide uppercase">Confidential &mdash; For Trade Use Only</span>
              <span className="text-[7px] font-medium text-stone-500 uppercase">kairafabrics.com</span>
            </div>

          </div>
        </div>
      </div>

      {showContactForm && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm"
          onClick={() => setShowContactForm(false)}
        >
          <div
            className="bg-white w-full max-w-md shadow-2xl overflow-hidden rounded-sm border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 bg-stone-900 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-primary mb-1">Request Catalog</p>
                <h3 className="font-serif text-xl text-white leading-tight">{collection.name}</h3>
              </div>
              <button
                onClick={() => { setShowContactForm(false); setContactSubmitted(false) }}
                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {contactSubmitted ? (
              <div className="px-6 py-12 text-center bg-stone-50">
                <div className="w-12 h-12 mx-auto mb-5 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h4 className="font-serif text-2xl text-stone-900 mb-2">Request Sent</h4>
                <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                  Thank you! We'll get back to you with the catalog shortly.
                </p>
                <button
                  onClick={() => { setShowContactForm(false); setContactSubmitted(false) }}
                  className="mt-8 px-8 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors w-full sm:w-auto rounded-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                className="px-6 py-5 flex flex-col gap-4 bg-white"
                onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true) }}
              >
                <p className="text-[10px] text-stone-500 leading-relaxed -mt-1">
                  Fill in your details and we'll send the full catalog for <span className="text-stone-900 font-semibold">{collection.name}</span>.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-900">Name <span className="text-primary">*</span></label>
                    <input
                      required
                      type="text"
                      value={contactData.name}
                      onChange={(e) => setContactData((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Your name"
                      className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-900">Email <span className="text-primary">*</span></label>
                    <input
                      required
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData((d) => ({ ...d, email: e.target.value }))}
                      placeholder="you@company.com"
                      className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all rounded-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-900">Company</label>
                  <input
                    type="text"
                    value={contactData.company}
                    onChange={(e) => setContactData((d) => ({ ...d, company: e.target.value }))}
                    placeholder="Your company (optional)"
                    className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all rounded-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-900">Message</label>
                  <textarea
                    rows={3}
                    value={contactData.message}
                    onChange={(e) => setContactData((d) => ({ ...d, message: e.target.value }))}
                    placeholder="Any specific requirements..."
                    className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all resize-none rounded-sm"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-900 text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-stone-800 transition-all rounded-sm shadow-sm"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Collection Detail Modal ──────────────────────────────────────── */
function CollectionModal({
  collection,
  onClose,
}: {
  collection: Collection
  onClose: () => void
}) {
  const [showCatalog, setShowCatalog] = useState(false)
  const materials = useMemo(
    () => newMaterials.filter((m) => m.collection_name === collection.name),
    [collection.name]
  )

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-5xl max-h-[88vh] flex flex-col md:flex-row overflow-hidden shadow-2xl rounded-sm border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-stone-900/80 text-white hover:bg-stone-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Left: Cover + Info ─────────────────────── */}
        <div className="md:w-72 lg:w-80 flex-shrink-0 bg-stone-900 flex flex-col">
          <div className="relative flex-1 min-h-52 md:min-h-0 overflow-hidden bg-stone-900 flex items-center justify-center">
            <img
              src={collection.image}
              alt={collection.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement
                el.style.display = 'none'
                el.parentElement!.style.background = '#1c1917'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
          </div>
          <div className="p-6 flex flex-col gap-3">
            <div>
              <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-primary mb-1">{collection.category}</p>
              <h2 className="font-serif text-2xl text-white leading-tight">{collection.name}</h2>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">{collection.description}</p>
            {collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {collection.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-bold px-2 py-0.5 border border-stone-700 text-stone-400 tracking-[0.2em] uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-stone-800 pt-4 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Variants</span>
              <span className="text-primary font-bold text-sm">{collection.itemCount}</span>
            </div>
            <button
              onClick={() => setShowCatalog(true)}
              className="mt-3 w-full py-2.5 bg-primary text-stone-900 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-white hover:text-stone-900 transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6" />
              </svg>
              Download Catalog
            </button>
          </div>
        </div>

        {/* ── Right: Materials List ──────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 bg-stone-50">
          <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Materials in this collection
            </p>
            <span className="text-[9px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 tracking-[0.1em] uppercase">
              {materials.length} items
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-5">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {materials.map((m) => (
                <div key={m.id} className="group flex flex-col">
                  <div className="aspect-square overflow-hidden bg-white border border-stone-200 rounded-sm shadow-sm hover:shadow-md transition-all group-hover:border-primary/40 relative">
                    <img
                      src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                      alt={m.material_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div className="mt-1.5 px-0.5">
                    <p className="text-[10px] font-semibold text-charcoal uppercase truncate leading-tight">{m.material_name}</p>
                    {m.color_group && (
                      <p className="text-[9px] text-stone-400 truncate">{m.color_group}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showCatalog && (
        <CatalogPreviewModal
          collection={collection}
          materials={materials}
          onClose={() => setShowCatalog(false)}
        />
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */
const CollectionsPage = () => {
  const location = useLocation()
  
  const [activeMaterialType, setActiveMaterialType] = useState(() => {
    const params = new URLSearchParams(location.search)
    const categoryQuery = params.get('category')
    if (categoryQuery) {
      const match = materialTypeOptions.find(
        (opt) => opt.toUpperCase().replace(/\s+/g, '') === categoryQuery || opt === categoryQuery
      )
      if (match) return match
    }
    return 'All'
  })

  // Close modal and set selection when URL search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const categoryQuery = params.get('category')
    if (categoryQuery) {
      const match = materialTypeOptions.find(
        (opt) => opt.toUpperCase().replace(/\s+/g, '') === categoryQuery || opt === categoryQuery
      )
      if (match) {
        setActiveMaterialType(match)
      } else {
        setActiveMaterialType('All')
      }
    } else {
      setActiveMaterialType('All')
    }
  }, [location.search])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(
    () =>
      activeMaterialType === 'All'
        ? collections
        : collections.filter((c) => c.category === activeMaterialType),
    [activeMaterialType]
  )

  const openModal = useCallback((col: Collection) => setSelectedCollection(col), [])
  const closeModal = useCallback(() => setSelectedCollection(null), [])

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Minimal Page Header ──────────────────────────────────── */}
      <div className="bg-stone-900 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary mb-3">Our Portfolio</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">Fabric Collections</h1>
          <p className="mt-3 text-stone-400 text-sm max-w-xl leading-relaxed">
            Explore our curated range of textile collections &mdash; click any collection to preview its swatches.
          </p>
        </div>
      </div>

      {/* ── Filter & Grid ────────────────────────────────────────── */}
      <div className="py-10 lg:py-14 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 mr-2 hidden sm:block">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {materialTypeOptions.map((type) => {
                  const isActive = activeMaterialType === type
                  const count = type === 'All'
                    ? collections.length
                    : collections.filter((c) => c.category === type).length
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveMaterialType(type)}
                      className={`group flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-200 rounded-sm shadow-sm ${
                        isActive
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:border-primary/40 hover:text-stone-900'
                      }`}
                    >
                      {type}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm ${isActive ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 bg-white px-3 py-1.5 border border-stone-200 rounded-sm shadow-sm">
              {filtered.length} collection{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="bg-white border border-stone-200 overflow-hidden shadow-sm rounded-sm" aria-hidden="true">
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <div
                      className="absolute inset-0 -translate-x-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
                        animation: `kaira-shimmer 1.6s ease-in-out ${i * 0.06}s infinite`,
                      }}
                    />
                  </div>
                  <div className="p-4 border-t border-stone-100 space-y-2">
                    <div className="relative h-2.5 w-3/4 rounded-sm bg-stone-200 overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)', animation: `kaira-shimmer 1.6s ease-in-out ${i * 0.06}s infinite` }} />
                    </div>
                    <div className="relative h-2 w-1/2 rounded-sm bg-stone-200 overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)', animation: `kaira-shimmer 1.6s ease-in-out ${i * 0.06}s infinite` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-5">
              {filtered.map((col) => (
                <div
                  key={col.name}
                  onClick={() => openModal(col)}
                  className="group cursor-pointer bg-white border border-stone-200 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300 rounded-sm shadow-sm flex flex-col"
                >
                  {/* Top accent bar */}
                  <span className="block h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-300" />

                  {/* Cover image */}
                  <div className="aspect-[4/3] overflow-hidden bg-stone-50 relative flex items-center justify-center">
                    <img
                      src={col.image}
                      alt={col.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement
                        el.style.display = 'none'
                        el.parentElement!.classList.add('bg-stone-200')
                      }}
                    />
                    {/* Overlay hint */}
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-stone-900/90 text-white text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-2 rounded-sm shadow-sm">
                        View Collection
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 border-t border-stone-200 bg-white">
                    <p className="text-[11px] font-bold text-stone-900 group-hover:text-secondary transition-colors uppercase tracking-tight leading-tight truncate">{col.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-stone-500 truncate max-w-[60%] font-semibold tracking-wider uppercase">{col.category}</span>
                      <span className="text-[10px] text-secondary font-bold tracking-widest">{col.itemCount} var.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-stone-200 bg-stone-50 rounded-sm">
              <p className="font-serif text-2xl text-stone-900 mb-3">No collections found</p>
              <button
                onClick={() => setActiveMaterialType('All')}
                className="text-xs uppercase tracking-[0.2em] font-bold text-primary border border-primary/40 px-5 py-2 hover:bg-stone-900 hover:text-white transition-colors rounded-sm"
              >
                View All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Collection Detail Modal ──────────────────────────────── */}
      {selectedCollection && (
        <CollectionModal collection={selectedCollection} onClose={closeModal} />
      )}
    </div>
  )
}

export default CollectionsPage
