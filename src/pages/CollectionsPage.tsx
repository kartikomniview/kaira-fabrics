import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { categoryMeta, normalizeType } from '../components/sections/FabricCategoriesSection'
import Seo, { pageTitle } from '../components/seo/Seo'
import { useMaterials } from '../contexts/MaterialsContext'
import { type Collection } from '../data/collections'
import { useCachedMedia } from '../hooks/useCachedMedia'
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

const isValidIndianMobile = (num: string) => {
  const phone = parsePhoneNumberFromString(num, 'IN')
  return !!phone && phone.isValid() &&
    (phone.getType() === 'MOBILE' || phone.getType() === 'FIXED_LINE_OR_MOBILE')
}

/* ── Quote Modal ─────────────────────────────────────────────────── */
function QuoteModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidIndianMobile(formData.mobile)) {
      setError('Please enter a valid mobile number')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email || 'not provided',
          message: formData.message || 'not provided',
        }),
      })
      if (!res.ok) throw new Error('Failed to send message. Please try again.')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md shadow-2xl overflow-hidden  border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-secondary-dark flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-primary mb-1">Enquiry</p>
            <h3 className="font-serif text-xl text-white leading-tight">Get a Quote</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-color-secondary-dark hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-12 text-center bg-stone-50">
            <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h4 className="font-serif text-2xl text-color-secondary-dark mb-2">Request Sent</h4>
            <p className="text-xs text-color-secondary-dark leading-relaxed max-w-xs mx-auto">
              Thank you! Our team will get back to you with a quote shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors w-full sm:w-auto "
            >
              Close
            </button>
          </div>
        ) : (
          <form className="px-6 py-6 flex flex-col gap-5 bg-white" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Name <span className="text-primary">*</span></label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Your name"
                  className="border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all  shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Mobile <span className="text-primary">*</span></label>
                <input
                  required
                  type="tel"
                  pattern="^[0-9\-\+\s]{10,15}$"
                  title="Please enter a valid mobile number (10-15 digits)"
                  value={formData.mobile}
                  onChange={(e) => setFormData((d) => ({ ...d, mobile: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all  shadow-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Email <span className="text-color-secondary-dark font-normal normal-case tracking-normal ml-1">(Optional)</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                placeholder="you@company.com"
                className="border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all  shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Message <span className="text-color-secondary-dark font-normal normal-case tracking-normal ml-1">(Optional)</span></label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData((d) => ({ ...d, message: e.target.value }))}
                placeholder="Any specific requirements..."
                className="border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all resize-none  shadow-sm"
              />
            </div>

            {error && (
              <p className="text-red-600 text-[11px] font-medium border border-red-200 bg-red-50 px-3 py-2  shadow-sm">{error}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark hover:text-color-secondary-dark transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-secondary-dark text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-stone-800 transition-all  shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Collection Grid Card (lazy image + per-image skeleton) ─────── */
function CollectionGridCard({ col }: { col: Collection }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [inView, setInView] = useState(false)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const cachedSrc = useCachedMedia(inView ? col.image : undefined)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Link
      ref={cardRef}
      to={`/collections/${col.id}`}
      className="group cursor-pointer bg-white border border-stone-200 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300  shadow-sm flex flex-col"
    >
      {/* Top accent bar */}
      <span className="block h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-300" />

      {/* Cover image */}
      <div className="w-full aspect-[3/4] overflow-hidden bg-stone-100 relative">
        {/* Shimmer skeleton: shown until in-view AND loaded */}
        {(!inView || !imgLoaded) && !imgError && (
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
        {/* Only mount the <img> once the card is near the viewport */}
        {inView && cachedSrc && !imgError && (
          <img
            src={cachedSrc}
            alt={col.name}
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
        {imgError && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
            <svg className="w-8 h-8 text-color-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-color-secondary-dark text-white text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-2  shadow-sm">
            View Collection
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 md:p-3 border-t border-stone-200 bg-white flex-1 flex flex-col justify-center">
        <p className="text-[12px] md:text-[11px] font-bold text-color-secondary-dark group-hover:text-secondary transition-colors uppercase tracking-tight leading-tight truncate">{col.name}</p>
        <div className="flex items-center justify-between mt-1 md:mt-1.5">
          <span className="text-[10px] md:text-[10px] text-color-secondary-dark truncate max-w-[60%] font-semibold tracking-wider uppercase">{categoryMeta[normalizeType(col.category)]?.label ?? col.category}</span>
          <span className="text-[10px] md:text-[10px] text-secondary font-bold tracking-widest">{col.itemCount} var.</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */
const CollectionsPage = () => {
  const location = useLocation()
  const { collections, isLoading: materialsLoading } = useMaterials()

  const [collectionSearch, setCollectionSearch] = useState('')
  const [activeMaterialType, setActiveMaterialType] = useState('All')

  const CATEGORY_ORDER = ['SUEDEFABRIC', 'LEATHERITE', 'SUEDELEATHER', 'CHENILLE', 'DIGITALPRINT']
  const getTypeLabel = (type: string) => type === 'All' ? 'All' : (categoryMeta[normalizeType(type)]?.label ?? type)

  const materialTypeOptions = useMemo(
    () => ['All', ...Array.from(new Set(collections.map((c) => c.category))).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(normalizeType(a))
      const bi = CATEGORY_ORDER.indexOf(normalizeType(b))
      return (ai === -1 ? CATEGORY_ORDER.length : ai) - (bi === -1 ? CATEGORY_ORDER.length : bi)
    })],
    [collections]
  )

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

  const [minDelayDone, setMinDelayDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinDelayDone(true), 700)
    return () => clearTimeout(t)
  }, [])
  const isLoading = !minDelayDone || materialsLoading

  const filtered = useMemo(() => {
    let result = activeMaterialType === 'All' ? collections : collections.filter((c) => c.category === activeMaterialType)
    if (collectionSearch.trim()) {
      const q = collectionSearch.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))
    }
    return result
  }, [activeMaterialType, collectionSearch, collections])

  const [visibleCount, setVisibleCount] = useState(12)

  // Reset visible count whenever filters change
  useEffect(() => { setVisibleCount(12) }, [activeMaterialType, collectionSearch])

  const navigate = useNavigate()
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const chipsRef = useRef<HTMLDivElement>(null)
  const scrollChips = (dir: 'left' | 'right') => {
    if (chipsRef.current) chipsRef.current.scrollBy({ left: dir === 'right' ? 140 : -140, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
      <Seo
        title={pageTitle('Collections')}
        description="Browse KAIRA's curated collections of premium fabrics and leathers — filter by material and texture to find the perfect fit for your interior project."
        image="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/banner/v1/banner1.webp"
      />

      {/* ── Page Header ──────────────────────────────────── */}
      <div
        className="relative pt-24 pb-12 overflow-hidden"
        style={{
          backgroundImage: 'url(https://kairafabrics.s3.ap-south-1.amazonaws.com/site/banner/v1/banner1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-stone-950/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:border-white/60 hover:bg-white/20 transition-all text-[11px] font-medium tracking-wide"
            >
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:border-white/60 hover:bg-white/20 transition-all text-[11px] font-medium tracking-wide"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Get a Quote</span>
              </button>
              <a
                href="https://wa.me/918589925666"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-[#25D366]/90 backdrop-blur-sm text-white hover:bg-[#1ebe5d] transition-all text-[11px] font-medium tracking-wide shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight">
            Fabric Collections
          </h1>
          <p className="mt-3 text-xs md:text-sm text-white/60 font-light max-w-2xl leading-relaxed">
            Browse KAIRA's full range of upholstery fabrics and leathers — chenille, suede fabric, suede leather, artificial leather
            and digital-print collections, each available in multiple colourways and patterns. Every collection below has its own
            page with detailed swatches, a 3D sofa preview, and a downloadable catalog, so you can explore the exact material,
            share it with your team, or request samples before you decide.
          </p>
        </div>
      </div>

      {/* ── Filter & Grid ────────────────────────────────────────── */}
      <div className="py-6 md:py-10 lg:py-14 relative" style={{ background: 'linear-gradient(160deg, #f5f5f4 0%, #ffffff 50%, #e7e5e4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-stone-100/60 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-2 md:px-6 lg:px-10">

          {/* Filter bar */}
          <div className="mb-6 md:mb-8">
            {/* Row: chips left, search right */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4">
              {/* Left: type chips — horizontally scrollable */}
              <div className="flex-1 min-w-0 flex items-center gap-1">
                {/* Scroll left — mobile only */}
                <button
                  onClick={() => scrollChips('left')}
                  className="lg:hidden shrink-0 w-7 h-7 flex items-center justify-center bg-white border border-stone-200  shadow-sm text-color-secondary-dark hover:text-color-secondary-dark hover:border-stone-400 transition-colors"
                  aria-label="Scroll left"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div ref={chipsRef} className="flex-1 min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-2 pb-0.5">
                    {materialTypeOptions.map((type) => {
                      const isActive = activeMaterialType === type
                      const count = type === 'All'
                        ? collections.length
                        : collections.filter((c) => c.category === type).length
                      return (
                        <button
                          key={type}
                          onClick={() => setActiveMaterialType(type)}
                          className={`flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-200  shadow-sm whitespace-nowrap ${isActive
                            ? 'bg-color-secondary-dark text-white'
                            : 'bg-white border border-stone-200 text-color-secondary-dark hover:border-primary/40 hover:text-color-secondary-dark'
                            }`}
                        >
                          {getTypeLabel(type)}
                          <span className={`text-[8px] md:text-[9px] px-1.5 py-0.5  ${isActive ? 'bg-white/10 text-white' : 'bg-stone-100 text-color-secondary-dark'}`}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* Scroll right — mobile only */}
                <button
                  onClick={() => scrollChips('right')}
                  className="lg:hidden shrink-0 w-7 h-7 flex items-center justify-center bg-white border border-stone-200  shadow-sm text-color-secondary-dark hover:text-color-secondary-dark hover:border-stone-400 transition-colors"
                  aria-label="Scroll right"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Right: search input — pinned, bigger */}
              <div className="shrink-0 flex items-center gap-2 border border-stone-200  bg-white px-3 py-2 md:py-2.5 focus-within:border-stone-500 focus-within:shadow-sm transition-all shadow-sm w-full lg:w-auto">
                <svg className="w-4 h-4 text-color-secondary-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  placeholder="Search collections…"
                  className="bg-transparent text-xs md:text-sm text-color-secondary-dark placeholder-stone-400 focus:outline-none flex-1 lg:w-52"
                />
                {collectionSearch && (
                  <button onClick={() => setCollectionSearch('')} className="text-color-secondary-dark hover:text-color-secondary-dark transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom: count text */}
            <p className="mt-2 md:mt-3 text-[10px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-color-secondary-dark">
              {filtered.length} collection{filtered.length !== 1 ? 's' : ''}{collectionSearch ? ` matching "${collectionSearch}"` : ''}
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-5">
              {Array.from({ length: 12 }, (_, i) => {
                const d = i * 0.07
                const shimmer = {
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.72) 50%, transparent 100%)',
                  animation: `kaira-shimmer 1.6s ease-in-out ${d}s infinite`,
                } as React.CSSProperties
                return (
                  <div key={i} className="bg-white border border-stone-200 overflow-hidden shadow-sm " aria-hidden="true">
                    {/* thin top accent placeholder */}
                    <div className="h-0.5 w-full bg-stone-100" />
                    {/* Image area */}
                    <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full" style={shimmer} />
                    </div>
                    {/* Info area */}
                    <div className="p-2 md:p-3 border-t border-stone-100 space-y-1.5">
                      {/* name bone */}
                      <div className="relative h-3 w-4/5  bg-stone-200 overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full" style={shimmer} />
                      </div>
                      {/* category + count row */}
                      <div className="flex items-center justify-between">
                        <div className="relative h-2 w-2/5  bg-stone-150 overflow-hidden" style={{ background: '#e7e5e4' }}>
                          <div className="absolute inset-0 -translate-x-full" style={shimmer} />
                        </div>
                        <div className="relative h-2 w-10  overflow-hidden" style={{ background: '#e7e5e4' }}>
                          <div className="absolute inset-0 -translate-x-full" style={shimmer} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-5">
                {filtered.slice(0, visibleCount).map((col) => (
                  <CollectionGridCard key={col.name} col={col} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div className="flex flex-col items-center gap-2 mt-8 md:mt-10">
                  <button
                    onClick={() => setVisibleCount((v) => v + 12)}
                    className="group flex items-center gap-3 px-10 py-3.5 bg-color-secondary-dark text-white text-[11px] uppercase font-bold tracking-[0.2em] hover:bg-primary hover:text-color-secondary-dark transition-all duration-300  shadow-md"
                  >
                    Load More
                    <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-color-secondary-dark font-bold">
                    Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-dashed border-stone-200 bg-stone-50 ">
              <p className="font-serif text-2xl text-color-secondary-dark mb-3">No collections found</p>
              <button
                onClick={() => setActiveMaterialType('All')}
                className="text-xs uppercase tracking-[0.2em] font-bold text-primary border border-primary/40 px-5 py-2 hover:bg-stone-900 hover:text-white transition-colors "
              >
                View All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Visualizer Promo Strip ────────────────────────────── */}
      <div className="bg-secondary-dark border-t border-stone-800 relative overflow-hidden">
        {/* Subtle motion background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-8 md:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Left */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14  bg-secondary-dark border flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div>
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white leading-tight">
                Visualize any fabric on real products <span className="text-primary">instantly</span>
              </p>
            </div>
          </div>

          {/* Right */}
          <button
            onClick={() => navigate('/ai-visualizer')}
            className="shrink-0 flex items-center gap-3 px-10 py-4.5 md:px-12 md:py-5 bg-primary text-color-secondary-dark text-xs md:text-sm uppercase font-bold tracking-[0.2em] hover:bg-white transition-all  shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Try AI Visualizer
          </button>

        </div>
      </div>

      {/* ── Quote Modal ──────────────────────────────────────────── */}
      {showQuoteModal && (
        <QuoteModal onClose={() => setShowQuoteModal(false)} />
      )}
    </div>
  )
}

export default CollectionsPage
