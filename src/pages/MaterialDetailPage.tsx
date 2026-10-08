import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { categoryMeta, normalizeType } from '../components/sections/FabricCategoriesSection'
import EnquiryFormModal from '../components/ui/EnquiryFormModal'
import InlineLoader from '../components/ui/InlineLoader'
import Material3DViewer from '../components/ui/Material3DViewer'
import Seo, { pageTitle, SITE_URL } from '../components/seo/Seo'
import { useMaterials } from '../contexts/MaterialsContext'
import { isTextureMapCode } from '../data/collections'
import { collectionSpecs, hasSpecs, SPEC_LABELS, type CollectionSpecs } from '../data/collectionSpecs'
import { materialTypeCopy } from '../data/materialTypeCopy'
import { type NewMaterial } from '../data/newmaterials'
import { useCachedMedia } from '../hooks/useCachedMedia'
import { MaterialThumb, RelatedCollectionCard } from './CollectionDetailPage'

const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'
const WHATSAPP_NUMBER = '918589925666'
const LOUPE_SIZE = 170
const LOUPE_ZOOM = 2.5
const LIGHTBOX_ZOOM = 2.5
const SHOW_SIMILAR_SHADES = false // set to true to re-enable "Similar shades from other collections"

const textureUrl = (m: NewMaterial) => `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`
const materialPath = (collectionId: string, m: NewMaterial) => `/collections/${collectionId}/${encodeURIComponent(m.material_code)}`
const byCode = (a: NewMaterial, b: NewMaterial) =>
  (a.material_code ?? '').localeCompare(b.material_code ?? '', undefined, { numeric: true, sensitivity: 'base' })

/** "Blues" → "blue", "Grays" → "grey" — for use inside a sentence. */
const colourWord = (group: string | null) => {
  if (!group) return ''
  const word = group.toLowerCase().replace(/s$/, '')
  return word === 'gray' ? 'grey' : word
}

/* ── Swatch with hover magnifier (mouse) — click / tap opens the full-screen zoom ── */
function SwatchLoupe({ src, alt, onOpen }: { src: string; alt: string; onOpen: () => void }) {
  const cachedSrc = useCachedMedia(src)
  const boxRef = useRef<HTMLButtonElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const onMove = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || !boxRef.current) return
    const r = boxRef.current.getBoundingClientRect()
    setLens({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height })
  }

  return (
    <button
      ref={boxRef}
      type="button"
      onClick={onOpen}
      onPointerMove={onMove}
      onPointerLeave={() => setLens(null)}
      aria-label={`Zoom into ${alt}`}
      className="relative block w-full h-full overflow-hidden cursor-zoom-in"
    >
      {(!cachedSrc || !loaded) && (
        <div className="absolute inset-0 flex items-center justify-center"><InlineLoader color="secondary" /></div>
      )}
      {cachedSrc && (
        <img
          key={src}
          src={cachedSrc}
          alt={alt}
          draggable={false}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover select-none transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {lens && cachedSrc && loaded && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute border-2 border-white shadow-2xl"
          style={{
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            left: lens.x - LOUPE_SIZE / 2,
            top: lens.y - LOUPE_SIZE / 2,
            backgroundImage: `url(${cachedSrc})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${lens.w * LOUPE_ZOOM}px ${lens.h * LOUPE_ZOOM}px`,
            backgroundPosition: `${-lens.x * LOUPE_ZOOM + LOUPE_SIZE / 2}px ${-lens.y * LOUPE_ZOOM + LOUPE_SIZE / 2}px`,
          }}
        />
      )}
      <span className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/55 text-white text-[9px] uppercase font-bold tracking-widest">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
        </svg>
        <span className="hidden md:inline">Hover to magnify · </span>Tap to zoom
      </span>
    </button>
  )
}

/* ── Full-screen zoom: tap toggles zoom, move / drag pans ── */
function ZoomLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const cachedSrc = useCachedMedia(src)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const setOriginFrom = (e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/95" role="dialog" aria-label={alt}>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold truncate">{alt}</p>
        <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center hover:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        className={`relative flex-1 overflow-hidden touch-none ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onClick={(e) => { setOriginFrom(e); setZoomed((z) => !z) }}
        onPointerMove={(e) => { if (zoomed) setOriginFrom(e) }}
      >
        {cachedSrc ? (
          <img
            src={cachedSrc}
            alt={alt}
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain select-none transition-transform duration-200 ease-out"
            style={{ transform: zoomed ? `scale(${LIGHTBOX_ZOOM})` : 'none', transformOrigin: origin }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><InlineLoader color="secondary" /></div>
        )}
      </div>
      <p className="py-3 text-center text-[10px] uppercase tracking-widest text-white/50">
        {zoomed ? 'Move or drag to explore · tap to zoom out' : 'Tap to zoom in'}
      </p>
    </div>
  )
}

/* ── Small thumbnail for the "other shades" strip ── */
function ShadeThumb({ m, to, isActive }: { m: NewMaterial; to: string; isActive: boolean }) {
  // Lazy: a collection can have 60+ shades, and each thumbnail is the full texture file.
  const ref = useRef<HTMLAnchorElement>(null)
  const [inView, setInView] = useState(false)
  const cachedSrc = useCachedMedia(inView ? textureUrl(m) : undefined)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { rootMargin: '0px 200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Link
      ref={ref}
      to={to}
      replace
      state={{ keepScroll: true }}
      title={`${m.collection_name} ${m.material_name}`}
      aria-current={isActive ? 'true' : undefined}
      className="shrink-0 w-16 snap-start flex flex-col items-center gap-1"
    >
      <span className={`block w-16 h-16 overflow-hidden bg-stone-100 border-2 transition-colors ${isActive ? 'border-primary' : 'border-transparent hover:border-stone-300'}`}>
        {cachedSrc && <img src={cachedSrc} alt="" className="w-full h-full object-cover" />}
      </span>
      <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full text-center ${isActive ? 'text-primary' : 'text-color-secondary-dark/70'}`}>
        {m.material_name}
      </span>
    </Link>
  )
}

function NotFound({ title, message, to, cta }: { title: string; message: string; to: string; cta: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
      <Seo title={pageTitle(title)} description={message} noindex />
      <p className="font-serif text-3xl text-color-secondary-dark mb-3">{title}</p>
      <p className="text-sm text-color-secondary-dark mb-8 max-w-md">{message}</p>
      <Link
        to={to}
        className="px-6 py-3 bg-secondary-dark text-white text-[11px] uppercase font-bold tracking-[0.2em] hover:bg-stone-800 transition-colors"
      >
        {cta}
      </Link>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function MaterialDetailPage() {
  const { slug = '', code = '' } = useParams<{ slug: string; code: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { collections, newMaterials, isLoading } = useMaterials()

  const show3D = searchParams.get('view') === '3d'
  const [showZoom, setShowZoom] = useState(false)
  const [showSampleForm, setShowSampleForm] = useState(false)
  const [shareNote, setShareNote] = useState<string | null>(null)

  const collection = useMemo(() => collections.find((c) => c.id === slug), [collections, slug])

  const shades = useMemo(
    () => collection
      ? newMaterials.filter((m) => m.collection_name === collection.name && !isTextureMapCode(m.material_code)).sort(byCode)
      : [],
    [newMaterials, collection]
  )

  const material = useMemo(() => {
    const c = code.toLowerCase()
    return shades.find((m) => m.material_code.toLowerCase() === c)
  }, [shades, code])

  // Similar shades from other collections: same colour group when known (else same type),
  // same material type first, at most 2 per collection so the row stays varied.
  const similar = useMemo(() => {
    if (!SHOW_SIMILAR_SHADES || !material || !collection) return []
    const type = normalizeType(material.material_type)
    const pool = newMaterials.filter((m) =>
      m.collection_name !== collection.name &&
      !isTextureMapCode(m.material_code) &&
      (material.color_group ? m.color_group === material.color_group : normalizeType(m.material_type) === type)
    )
    pool.sort((a, b) =>
      Number(normalizeType(b.material_type) === type) - Number(normalizeType(a.material_type) === type) ||
      a.collection_name.localeCompare(b.collection_name) || byCode(a, b)
    )
    const perCollection = new Map<string, number>()
    const picked: NewMaterial[] = []
    for (const m of pool) {
      const n = perCollection.get(m.collection_name) ?? 0
      if (n >= 2) continue
      perCollection.set(m.collection_name, n + 1)
      picked.push(m)
      if (picked.length === 8) break
    }
    return picked
  }, [newMaterials, material, collection])

  const relatedCollections = useMemo(
    () => collection ? collections.filter((c) => c.id !== collection.id && c.category === collection.category).slice(0, 4) : [],
    [collections, collection]
  )

  // Scroll to top on a new material — except when switching shades from the strip.
  useEffect(() => {
    if (!(location.state as { keepScroll?: boolean } | null)?.keepScroll) window.scrollTo(0, 0)
  }, [slug, code, location.state])

  useEffect(() => {
    if (!shareNote) return
    const t = setTimeout(() => setShareNote(null), 2500)
    return () => clearTimeout(t)
  }, [shareNote])

  // Keep the active shade visible in the strip (e.g. landing directly on shade 40 of 60).
  const shadeStripRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const strip = shadeStripRef.current
    const active = strip?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!strip || !active) return
    strip.scrollTo({ left: active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2, behavior: 'smooth' })
  }, [material?.id])

  if (!collection || !material) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Seo title={pageTitle('Loading Material')} description="Loading fabric details." />
          <InlineLoader color="secondary" />
        </div>
      )
    }
    if (!collection) {
      return <NotFound title="Collection Not Found" message="We couldn't find the collection you're looking for. It may have been renamed or is no longer available." to="/collections" cta="Browse All Collections" />
    }
    return <NotFound title="Shade Not Found" message={`We couldn't find shade "${code}" in the ${collection.name} collection. It may have been discontinued.`} to={`/collections/${collection.id}`} cta={`View ${collection.name} Collection`} />
  }

  const m = material
  const typeKey = normalizeType(m.material_type)
  const categoryLabel = categoryMeta[typeKey]?.label ?? m.material_type
  const typeCopy = materialTypeCopy[typeKey]
  const specs = collectionSpecs[collection.id]
  const specRows = (Object.keys(SPEC_LABELS) as (keyof CollectionSpecs)[]).filter((k) => specs?.[k])
  const displayName = `${collection.name} ${m.material_name}`
  const pageUrl = `${SITE_URL}${materialPath(collection.id, m)}`
  const colour = colourWord(m.color_group)

  const summary =
    `${displayName} is a${colour ? ` ${colour}` : ''}${m.pattern ? ` ${m.pattern.toLowerCase()}` : ''} ${categoryLabel.toLowerCase()} ` +
    `from KAIRA's ${collection.name} collection${shades.length > 1 ? `, available in ${shades.length} shades` : ''}.`

  const whatsappText = `Hi, I'm interested in ${displayName} (${categoryLabel}). ${pageUrl}`

  const setView = (view: '3d' | 'texture') => {
    const next = new URLSearchParams(searchParams)
    if (view === '3d') next.set('view', '3d')
    else next.delete('view')
    setSearchParams(next, { replace: true, state: { keepScroll: true } })
  }

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: displayName, text: `${displayName} — ${categoryLabel} by KAIRA`, url: pageUrl }) } catch { /* cancelled */ }
      return
    }
    try {
      await navigator.clipboard.writeText(pageUrl)
      setShareNote('Link copied')
    } catch {
      setShareNote('Could not copy link')
    }
  }

  const viewSuffix = show3D ? '?view=3d' : ''

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
      <Seo
        title={pageTitle(`${displayName} ${categoryLabel}`)}
        description={`${summary} View it up close, preview it in 3D on a sofa, or request a physical sample.`}
        image={textureUrl(m)}
        noindex={!hasSpecs(collection.id)}
        nofollow={false}
      />

      {/* ── Top bar: back + breadcrumb ─────────────────────────────── */}
      <div className="pt-20 md:pt-24 max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-3">
        <Link
          to={`/collections/${collection.id}`}
          className="group shrink-0 flex items-center gap-2 px-3 md:px-4 py-2 border border-secondary bg-secondary text-[10px] uppercase tracking-[0.2em] font-bold text-white hover:bg-secondary-dark hover:border-secondary-dark transition-all shadow-sm"
        >
          <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">{collection.name} Collection</span>
        </Link>
        <nav className="min-w-0 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-color-secondary-dark/70" aria-label="Breadcrumb">
          <Link to="/" className="hidden sm:inline hover:text-primary transition-colors">Home</Link>
          <span className="hidden sm:inline">/</span>
          <Link to="/collections" className="shrink-0 hover:text-primary transition-colors">Collections</Link>
          <span>/</span>
          <Link to={`/collections/${collection.id}`} className="truncate hover:text-primary transition-colors">{collection.name}</Link>
          <span>/</span>
          <span className="shrink-0 text-color-secondary-dark">{m.material_name}</span>
        </nav>
      </div>

      {/* ── Main: viewer left, details right ───────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 pt-4 pb-8 md:pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">

        {/* Left — viewer */}
        <div className="lg:sticky lg:top-24 min-w-0">
          <div className="relative w-full aspect-square bg-stone-100 border border-stone-200 shadow-sm overflow-hidden">
            {/* Preview-mode toggle — overlaid bottom-centre inside the viewer */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex border border-stone-200 bg-white/95 backdrop-blur-sm shadow-md" role="tablist" aria-label="Preview mode">
              {(['texture', '3d'] as const).map((v) => {
                const active = (v === '3d') === show3D
                return (
                  <button
                    key={v}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setView(v)}
                    className={`px-4 sm:px-5 py-2 whitespace-nowrap text-[10px] uppercase font-bold tracking-[0.2em] transition-colors ${active ? 'bg-secondary-dark text-white' : 'text-color-secondary-dark hover:bg-stone-100'}`}
                  >
                    {v === '3d' ? 'View in 3D' : 'Texture'}
                  </button>
                )
              })}
            </div>
            {show3D
              ? <Material3DViewer material={m} newMaterials={newMaterials} />
              : <SwatchLoupe src={textureUrl(m)} alt={displayName} onOpen={() => setShowZoom(true)} />}
          </div>

          {shades.length > 1 && (
            <div className="mt-4">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">
                  {shades.length} shades in {collection.name}
                </p>
                <Link to={`/collections/${collection.id}`} className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:underline">
                  View all
                </Link>
              </div>
              {/* Edge-to-edge on mobile so the strip reads as swipeable */}
              <div ref={shadeStripRef} className="relative flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-px-4 md:scroll-px-0 snap-x [scrollbar-width:thin]">
                {shades.map((s) => (
                  <ShadeThumb key={s.id} m={s} to={`${materialPath(collection.id, s)}${viewSuffix}`} isActive={s.id === m.id} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — details */}
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.3em] font-bold uppercase text-primary mb-1">{categoryLabel}</p>
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 font-serif text-3xl md:text-4xl text-color-secondary-dark leading-tight">{displayName}</h1>
            {/* Mobile share — the labelled Share button sits in the CTA grid from sm up */}
            <button
              onClick={share}
              aria-label="Share"
              className="sm:hidden relative shrink-0 w-10 h-10 flex items-center justify-center border border-stone-300 bg-white text-color-secondary-dark"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              {shareNote && (
                <span role="status" className="absolute top-full right-0 mt-1.5 whitespace-nowrap px-2 py-1 bg-secondary-dark text-white text-[9px] uppercase font-bold tracking-widest">
                  {shareNote}
                </span>
              )}
            </button>
          </div>

          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
            {[
              ['Shade code', m.material_code],
              ['Collection', collection.name],
              ['Colour', m.color_group],
              ['Pattern', m.pattern],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <dt className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark/60">{label}</dt>
                <dd className="text-color-secondary-dark font-bold text-sm">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-sm text-color-secondary-dark/90 leading-relaxed">{summary}</p>
          {typeCopy && <p className="mt-2 text-xs md:text-sm text-color-secondary-dark/80 font-light leading-relaxed">{typeCopy.description}</p>}

          {/* CTAs */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowSampleForm(true)}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-primary text-secondary-dark text-xs uppercase font-bold tracking-[0.2em] hover:bg-primary-dark transition-all shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Request Sample
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-6 py-3.5 border border-secondary text-secondary text-[11px] sm:text-xs uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap hover:bg-secondary hover:text-white transition-all"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="sm:hidden">Enquire</span>
              <span className="hidden sm:inline">Enquiry Now</span>
            </a>
            <Link
              to={`/ai-visualizer/studio?collection=${encodeURIComponent(m.collection_name)}&code=${encodeURIComponent(m.material_code)}`}
              className="flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-6 py-3.5 sm:py-3 border border-secondary bg-secondary text-white text-[11px] uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap hover:bg-secondary-dark hover:border-secondary-dark transition-all"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25m0-9L3 7.5m9 5.25v9M3 7.5v9l9 5.25" />
              </svg>
              <span className="sm:hidden">3D Studio</span>
              <span className="hidden sm:inline">Try in 3D Studio</span>
            </Link>
            <button
              onClick={share}
              className="hidden sm:flex relative items-center justify-center gap-2.5 px-6 py-3 border border-stone-300 bg-white text-color-secondary-dark text-[11px] uppercase font-bold tracking-[0.2em] hover:border-stone-500 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              {shareNote ?? 'Share'}
            </button>
          </div>

          {/* Specs — only collections with data in collectionSpecs.json */}
          {specRows.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-color-secondary-dark mb-2">Specifications</h2>
              <dl className="border border-stone-200 bg-white divide-y divide-stone-200">
                {specRows.map((k) => (
                  <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-2.5 text-xs">
                    <dt className="text-color-secondary-dark/70">{SPEC_LABELS[k]}</dt>
                    <dd className="text-color-secondary-dark font-semibold">{specs?.[k]}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {typeCopy && (
            <section className="mt-8">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-color-secondary-dark mb-2">Key features</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
                {typeCopy.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-color-secondary-dark/80">
                    <svg className="w-3 h-3 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="flex items-start gap-2 mt-6 px-3 py-2 bg-stone-50 border border-stone-200 text-[10px] md:text-[11px] text-color-secondary-dark/80 leading-relaxed">
            <svg className="w-3.5 h-3.5 text-primary shrink-0 mt-px" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span>Colours shown are for reference only. Actual fabric colours may vary slightly due to screen settings, lighting and dye lots.</span>
          </p>
        </div>
      </div>

      {/* ── Similar shades in other collections ────────────────────── */}
      {SHOW_SIMILAR_SHADES && similar.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 pb-10">
          <div className="border-t border-stone-200 mb-8" />
          <h2 className="font-serif text-xl md:text-2xl text-color-secondary-dark mb-6 text-center">
            {colour ? `Similar ${colour} shades` : `More ${categoryLabel} shades`} from other collections
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {similar.map((s) => {
              const sCollection = collections.find((c) => c.name === s.collection_name)
              if (!sCollection) return null
              return (
                <MaterialThumb
                  key={s.id}
                  src={textureUrl(s)}
                  alt={`${s.collection_name} ${s.material_name}`}
                  to={materialPath(sCollection.id, s)}
                  label={`${s.collection_name} ${s.material_name}`}
                  subLabel={categoryMeta[normalizeType(s.material_type)]?.label ?? s.material_type}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ── Related collections ────────────────────────────────────── */}
      {relatedCollections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 pb-12 md:pb-16">
          <div className="border-t border-stone-200 mb-6 md:mb-8" />
          <h2 className="font-serif text-xl md:text-2xl text-color-secondary-dark mb-5 md:mb-6 text-center">More {categoryLabel} Collections</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
            {relatedCollections.map((c) => <RelatedCollectionCard key={c.id} col={c} />)}
          </div>
        </div>
      )}

      {showZoom && <ZoomLightbox src={textureUrl(m)} alt={displayName} onClose={() => setShowZoom(false)} />}

      {showSampleForm && (
        <EnquiryFormModal
          eyebrow="Request Sample"
          title={displayName}
          intro={<>Fill in your details and we'll arrange a physical sample of <span className="text-color-secondary-dark font-semibold">{displayName}</span> ({categoryLabel}).</>}
          subject={`Sample Request: ${collection.name} / ${m.material_code} (${categoryLabel})`}
          successText="Thank you! Our team will contact you shortly to arrange your sample."
          onClose={() => setShowSampleForm(false)}
        />
      )}
    </div>
  )
}
