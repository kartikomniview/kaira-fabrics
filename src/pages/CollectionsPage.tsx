import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { type Collection } from '../data/collections'
import type { NewMaterial } from '../data/newmaterials'
import { useMaterials } from '../contexts/MaterialsContext'
import InlineLoader from '../components/ui/InlineLoader'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS } from '../utils/textureUtils'
import * as THREE from 'three'
import '@google/model-viewer'

const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'
const S3_BASE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'
const COMPANY = 'KairaFabrics'
const MODEL_URL = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/models/OVL/Sofa/SetSofas/Linda.glb'

function getRoughnessMapURL(collectionName: string) {
  return `${S3_BASE}/textures/${COMPANY}/${collectionName}/${collectionName}_Roughness.webp`
}

function getNormalMapURL(collectionName: string) {
  return `${S3_BASE}/textures/${COMPANY}/${collectionName}/${collectionName}_Normal.webp`
}

function getSheenMapUrl(materialType: string) {
  if (materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('velvet')) {
    return `${S3_BASE}/textures/Common/SheenColorMap.webp`
  }
  return ''
}

function getUvValue(collectionName: string): number {
  if (
    collectionName === 'Florious' || collectionName === 'Indigo' ||
    collectionName === 'Aboone' || collectionName === 'Perth' ||
    collectionName === 'Ibiza' || collectionName === 'Intense'
  ) return 8
  if (collectionName.includes('DigitalPrint') || collectionName === 'Kadillac') return 8
  if (collectionName === 'Impression') return 14
  return 16
}

function getRoughnessValue(materialType: string, collectionName: string, baseRoughness: number): number {
  if (materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('digitalprint')) return 0.8
  if (collectionName === 'Intense' || collectionName === 'Modello') return 0.6
  if (materialType.toLowerCase().includes('leather')) return 0.5
  return baseRoughness
}

/* ── Catalog Preview Modal ───────────────────────────────────────── */
function CatalogPreviewModal({
  collection,
  materials,
  onClose,
}: {
  collection: Collection
  materials: NewMaterial[]
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
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-secondary-dark flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2.5 md:gap-3.5">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-[10px] md:text-[13px] uppercase tracking-[0.2em] font-bold text-white/90 truncate max-w-[120px] md:max-w-none">
              {collection.name} &mdash; Catalog Preview
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setShowContactForm(true)}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] bg-primary text-color-secondary-dark hover:bg-white transition-all shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Get Full Catalog
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-color-secondary-dark hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable PDF area */}
        <div className="overflow-y-auto flex-1 bg-stone-300 p-3 md:p-5">
          {/* Document */}
          <div className="bg-white w-full shadow-xl mx-auto">

            {/* ── Cover ───────────────────────────────── */}
            <div className="relative overflow-hidden bg-stone-900 min-h-[140px] md:min-h-[180px]">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full object-contain opacity-35 block"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] md:text-[9px] tracking-[0.35em] text-primary uppercase font-medium">KAIRA FABRICS</span>
                  <span className="text-[6px] md:text-[8px] tracking-[0.2em] text-color-secondary-dark uppercase">Product Catalog</span>
                </div>
                <div>
                  <p className="text-[7px] md:text-[9px] tracking-[0.3em] text-primary/80 uppercase mb-1 md:mb-2">{collection.category}</p>
                  <h1 className="font-serif text-[20px] md:text-[32px] text-white leading-tight mb-1 md:mb-2">{collection.name}</h1>
                  <p className="text-[9px] md:text-[11px] text-color-secondary-dark leading-relaxed max-w-md" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {collection.description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />
            </div>

            {/* ── Collection Info ──────────────────────── */}
            <div className="px-4 md:px-8 py-5 md:py-8 border-b border-stone-100 flex items-start gap-4 md:gap-12">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-bold text-primary mb-2 md:mb-3">About this Collection</p>
                <p className="text-[13px] md:text-[15px] text-color-secondary-dark leading-relaxed font-medium">{collection.description}</p>
                {collection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 md:mt-5">
                    {collection.tags.map((tag) => (
                      <span key={tag} className="text-[9px] md:text-[10px] px-2.5 md:px-3 py-1 border border-stone-200 text-color-secondary-dark tracking-wider uppercase font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-right border-l border-stone-100 pl-4 md:pl-8">
                <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-color-secondary-dark mb-1 md:mb-2 text-right">Variants</p>
                <p className="font-serif text-4xl md:text-5xl text-gold leading-none">{collection.itemCount}</p>
                <p className="text-[10px] md:text-[11px] text-color-secondary-dark mt-1 md:mt-2 tracking-widest font-bold text-right">SKUs</p>
              </div>
            </div>

            {/* ── Materials Grid ───────────────────────── */}
            <div className="px-4 md:px-8 py-6 md:py-10">
              <div className="flex items-center justify-between mb-5 md:mb-8 border-b border-stone-50 pb-3">
                <p className="text-[10px] md:text-[12px] tracking-[0.3em] uppercase font-bold text-color-secondary-dark/40">Materials &amp; Swatches</p>
                <span className="text-[10px] md:text-[12px] text-color-secondary-dark font-bold tracking-widest">{materials.length} items</span>
              </div>
              {materials.length === 0 ? (
                <p className="text-xs md:text-sm text-color-secondary-dark text-center py-12 md:py-16">No materials listed for this collection.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {materials.map((m) => (
                    <div key={m.id} className="border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square overflow-hidden bg-stone-50">
                        <img
                          src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                          alt={m.material_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                      <div className="px-2 py-2 md:px-3 md:py-2.5 bg-white border-t border-stone-50">
                        <p className="text-[9px] md:text-[11px] font-bold text-charcoal uppercase truncate leading-tight tracking-wide">{m.material_name}</p>
                        <p className="text-[8px] md:text-[9px] text-gold font-bold truncate mt-1 tracking-widest">{m.material_code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Document Footer ──────────────────────── */}
            <div className="flex items-center justify-between px-4 md:px-8 py-2 md:py-3 bg-secondary-dark border-t border-stone-800">
              <span className="text-[7px] md:text-[8px] tracking-[0.3em] font-bold text-primary uppercase">KAIRA FABRICS</span>
              <span className="text-[6px] md:text-[7px] font-medium text-color-secondary-dark tracking-wide uppercase">Trade Use Only</span>
              <span className="text-[6px] md:text-[7px] font-medium text-color-secondary-dark uppercase">kairafabrics.com</span>
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
            className="bg-white w-full max-w-md shadow-2xl overflow-hidden  border border-stone-200"
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
                className="w-8 h-8 flex items-center justify-center text-color-secondary-dark hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {contactSubmitted ? (
              <div className="px-6 py-12 text-center bg-stone-50">
                <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h4 className="font-serif text-2xl text-color-secondary-dark mb-2">Request Sent</h4>
                <p className="text-xs text-color-secondary-dark leading-relaxed max-w-xs mx-auto">
                  Thank you! We'll get back to you with the catalog shortly.
                </p>
                <button
                  onClick={() => { setShowContactForm(false); setContactSubmitted(false) }}
                  className="mt-8 px-8 py-3 bg-secondary-dark text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors w-full sm:w-auto "
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                className="px-6 py-5 flex flex-col gap-4 bg-white"
                onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true) }}
              >
                <p className="text-[10px] text-color-secondary-dark leading-relaxed -mt-1">
                  Fill in your details and we'll send the full catalog for <span className="text-color-secondary-dark font-semibold">{collection.name}</span>.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Name <span className="text-primary">*</span></label>
                    <input
                      required
                      type="text"
                      value={contactData.name}
                      onChange={(e) => setContactData((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Your name"
                      className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Email <span className="text-primary">*</span></label>
                    <input
                      required
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData((d) => ({ ...d, email: e.target.value }))}
                      placeholder="you@company.com"
                      className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all "
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Company</label>
                  <input
                    type="text"
                    value={contactData.company}
                    onChange={(e) => setContactData((d) => ({ ...d, company: e.target.value }))}
                    placeholder="Your company (optional)"
                    className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all "
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Message</label>
                  <textarea
                    rows={3}
                    value={contactData.message}
                    onChange={(e) => setContactData((d) => ({ ...d, message: e.target.value }))}
                    placeholder="Any specific requirements..."
                    className="border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-color-secondary-dark placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all resize-none "
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark hover:text-color-secondary-dark transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-900 text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-stone-800 transition-all  shadow-sm"
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

/* ── Material Thumbnail (lazy + per-image skeleton) ─────────────── */
function MaterialThumb({
  src,
  alt,
  onClick,
  label,
  subLabel,
}: {
  src: string
  alt: string
  onClick: () => void
  label: string
  subLabel?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const thumbRef = useRef<HTMLDivElement>(null)

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
    <div className="group flex flex-col cursor-pointer" onClick={onClick}>
      <div ref={thumbRef} className="aspect-square overflow-hidden bg-stone-100 border border-stone-200  shadow-sm hover:shadow-md transition-all group-hover:border-primary/40 relative">
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
        {inView && !error && (
          <img
            src={src}
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
          <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0zm-2 0h-4m2-2v4" />
          </svg>
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="text-[10px] font-semibold text-charcoal uppercase truncate leading-tight">{label}</p>
        {subLabel && <p className="text-[9px] text-color-secondary-dark truncate">{subLabel}</p>}
      </div>
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
  const { newMaterials } = useMaterials()
  const [showCatalog, setShowCatalog] = useState(false)
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null)
  const [materialSearch, setMaterialSearch] = useState('')
  const materials = useMemo(
    () => newMaterials.filter((m) => m.collection_name === collection.name),
    [newMaterials, collection.name]
  )

  // ── Image zoom / pan state ──────────────────────────────────
  const [imgScale, setImgScale] = useState(1)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  // ── 3D viewer state ──────────────────────────────────────────
  const [show3D, setShow3D] = useState(false)
  const [isTextureLoading, setIsTextureLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const mvRef = useRef<HTMLElement>(null)
  const fabricMeshesRef = useRef<any[]>([])

  useEffect(() => {
    setImgScale(1)
    setImgOffset({ x: 0, y: 0 })
    setShow3D(false)
  }, [zoomedIndex])

  // Apply texture when model-viewer loads for the zoomed overlay
  useEffect(() => {
    if (!show3D || zoomedIndex === null) return
    const mv = mvRef.current as any
    if (!mv) return
    const m = materials[zoomedIndex]
    const textureUrl = `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`
    let applied = false
    const apply = async () => {
      if (applied) return
      applied = true

      // Setup meshes with MeshPhysicalMaterial — same as ThreeDVisualizerPage
      fabricMeshesRef.current = []
      const sceneSymbol: any = Object.getOwnPropertySymbols(mv).find((s: any) => s.description === 'scene')
      const scene = mv[sceneSymbol]
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const oldMaterial = child.material
          const newMaterial = new THREE.MeshPhysicalMaterial({
            map: oldMaterial.map,
            color: oldMaterial.color,
            normalMap: oldMaterial.normalMap,
            roughnessMap: oldMaterial.roughnessMap,
            metalnessMap: oldMaterial.metalnessMap,
            aoMap: oldMaterial.aoMap,
            aoMapIntensity: oldMaterial.aoMapIntensity ?? 1,
            roughness: oldMaterial.roughness ?? 0.5,
            metalness: oldMaterial.metalness ?? 0.5,
            transparent: oldMaterial.transparent,
            opacity: oldMaterial.opacity,
            side: oldMaterial.side,
          })
          child.material = newMaterial
          fabricMeshesRef.current.push(child)
        }
      })

      setIsModelLoading(false)
      setIsTextureLoading(true)
      try {
        const uvScale = getUvValue(m.collection_name)
        const roughness = getRoughnessValue(m.material_type ?? '', m.collection_name, (m as any).roughness ?? 0.8)
        const [baseBlobUrl, roughnessBlobUrl, normalBlobUrl, sheenBlobUrl] = await Promise.all([
          fetchBlobUrl(textureUrl),
          fetchBlobUrl(getRoughnessMapURL(m.collection_name)),
          fetchBlobUrl(getNormalMapURL(m.collection_name)),
          (() => { const u = getSheenMapUrl(m.material_type ?? ''); return u ? fetchBlobUrl(u) : Promise.resolve(null) })(),
        ])
        await applyTextureToModel(mv, {
          baseBlobUrl,
          roughness,
          metalness: (m as any).metalness ?? 0.0,
          uvScale,
          skipParts: NO_FABRIC_PARTS,
          roughnessBlobUrl,
          normalBlobUrl,
          sheenBlobUrl,
          meshes: fabricMeshesRef.current,
        })
        if (baseBlobUrl) URL.revokeObjectURL(baseBlobUrl)
        if (roughnessBlobUrl) URL.revokeObjectURL(roughnessBlobUrl)
        if (normalBlobUrl) URL.revokeObjectURL(normalBlobUrl)
        if (sheenBlobUrl) URL.revokeObjectURL(sheenBlobUrl)
      } catch { /* silent */ } finally {
        setIsTextureLoading(false)
      }
    }
    if (!mv.model) setIsModelLoading(true)
    mv.addEventListener('load', apply)
    if (mv.model) apply()
    return () => mv.removeEventListener('load', apply)
  }, [show3D, zoomedIndex, materials])

  const handleImgWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImgScale((s) => {
      const next = Math.min(4, Math.max(1, s - e.deltaY * 0.004))
      if (next === 1) setImgOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const handleImgMouseDown = useCallback((e: React.MouseEvent) => {
    if (imgScale <= 1) return
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: imgOffset.x, oy: imgOffset.y }
  }, [imgScale, imgOffset])

  const handleImgMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return
    setImgOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    })
  }, [])

  const handleImgMouseUp = useCallback(() => { dragStart.current = null }, [])

  const handleImgDblClick = useCallback(() => {
    setImgScale(1)
    setImgOffset({ x: 0, y: 0 })
  }, [])

  // Close on Escape, arrow-key navigation for zoom
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (zoomedIndex !== null) {
        if (e.key === 'Escape') { setZoomedIndex(null); return }
        if (e.key === 'ArrowRight') { setZoomedIndex((i) => ((i ?? 0) + 1) % materials.length); return }
        if (e.key === 'ArrowLeft') { setZoomedIndex((i) => ((i ?? 0) - 1 + materials.length) % materials.length); return }
      } else {
        if (e.key === 'Escape') onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, zoomedIndex, materials.length])

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
        className="relative bg-white w-full max-w-5xl max-h-[88vh] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden shadow-2xl  border border-stone-200"
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
              <p className="text-[11px] md:text-[10px] tracking-[0.3em] font-bold uppercase text-primary mb-1">{collection.category}</p>
              <h2 className="font-serif text-3xl md:text-2xl text-white leading-tight">{collection.name}</h2>
            </div>
            <p className="text-color-secondary-dark text-sm md:text-xs leading-relaxed">{collection.description}</p>
            {collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {collection.tags.map((tag) => (
                  <span key={tag} className="text-[10px] md:text-[9px] font-bold px-2 py-0.5 border border-stone-700 text-color-secondary-dark tracking-[0.2em] uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-stone-800 pt-4 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark">Variants</span>
              <span className="text-primary font-bold text-sm">{collection.itemCount}</span>
            </div>
            <button
              onClick={() => setShowCatalog(true)}
              className="mt-4 w-full py-3.5 bg-primary text-color-secondary-dark text-xs uppercase font-bold tracking-[0.2em] hover:bg-white hover:text-color-secondary-dark transition-all flex items-center justify-center gap-2.5  shadow-md"
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
        <div className="flex-1 flex flex-col md:min-h-0 bg-stone-50">
          <div className="pl-6 pr-14 py-3 border-b border-stone-200 bg-white flex items-center gap-3">
            <p className="text-[11px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-color-secondary-dark shrink-0">
              Materials in this collection
            </p>
            <div className="flex items-center gap-2 border border-stone-200  bg-stone-50 px-2.5 py-1 flex-1 max-w-xs focus-within:border-stone-400 focus-within:bg-white transition-all">
              <svg className="w-3 h-3 text-color-secondary-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-[12px] text-color-secondary-dark placeholder-stone-400 focus:outline-none min-w-0"
              />
              {materialSearch && (
                <button onClick={() => setMaterialSearch('')} className="text-color-secondary-dark hover:text-color-secondary-dark transition-colors">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                </button>
              )}
            </div>
            <span className="ml-auto text-[9px] font-bold bg-stone-100 text-color-secondary-dark px-2 py-0.5 tracking-[0.1em] uppercase shrink-0">
              {materialSearch ? `${materials.filter(m => m.material_name?.toLowerCase().includes(materialSearch.toLowerCase()) || m.material_code?.toLowerCase().includes(materialSearch.toLowerCase()) || m.color_group?.toLowerCase().includes(materialSearch.toLowerCase())).length} results` : `${materials.length} items`}
            </span>
          </div>
          <div className="md:overflow-y-auto flex-1 p-3 sm:p-5">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
              {materials.filter(m =>
                !materialSearch ||
                m.material_name?.toLowerCase().includes(materialSearch.toLowerCase()) ||
                m.material_code?.toLowerCase().includes(materialSearch.toLowerCase()) ||
                m.color_group?.toLowerCase().includes(materialSearch.toLowerCase())
              ).map((m, idx) => (
                <MaterialThumb
                  key={idx}
                  src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                  alt={m.material_name}
                  onClick={() => setZoomedIndex(materials.indexOf(m))}
                  label={m.material_name}
                  subLabel={m.color_group ?? undefined}
                />
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

      {/* ── Material Zoom Overlay ────────────────────────────────── */}
      {zoomedIndex !== null && (() => {
        const m = materials[zoomedIndex]
        return (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { e.stopPropagation(); setZoomedIndex(null) }}
          >
            <div
              className="relative flex flex-col items-stretch w-full max-w-lg overflow-hidden  shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image pane — big, on top */}
              <div
                className="relative w-full aspect-square bg-stone-900 flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ cursor: show3D ? 'default' : imgScale > 1 ? (dragStart.current ? 'grabbing' : 'grab') : 'zoom-in' }}
                onWheel={!show3D ? handleImgWheel : undefined}
                onMouseDown={!show3D ? handleImgMouseDown : undefined}
                onMouseMove={!show3D ? handleImgMouseMove : undefined}
                onMouseUp={!show3D ? handleImgMouseUp : undefined}
                onMouseLeave={!show3D ? handleImgMouseUp : undefined}
              >
                {show3D ? (
                  <>
                    {isModelLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                        <InlineLoader color="secondary" />
                        <p className="mt-2 text-[10px] uppercase tracking-widest text-white/60 animate-pulse">Loading 3D Model…</p>
                      </div>
                    )}
                    {!isModelLoading && isTextureLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                        <InlineLoader color="secondary" />
                        <p className="mt-2 text-[10px] uppercase tracking-widest text-white/60 animate-pulse">Applying Texture…</p>
                      </div>
                    )}
                    <model-viewer
                      ref={mvRef as any}
                      src={MODEL_URL}
                      alt={`${m.material_name} on sofa`}
                      camera-controls
                      auto-rotate
                      disable-pan
                      tone-mapping="commerce"
                      exposure="0.7"
                      shadow-intensity="0.6"
                      shadow-softness="1"
                      style={{ width: '100%', height: '100%', background: '#fafaf9' }}
                    />
                  </>
                ) : (
                  <img
                    key={m.id}
                    src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                    alt={m.material_name}
                    className="w-full h-full object-cover select-none"
                    style={{
                      transform: `scale(${imgScale}) translate(${imgOffset.x / imgScale}px, ${imgOffset.y / imgScale}px)`,
                      transition: dragStart.current ? 'none' : 'transform 0.15s ease',
                    }}
                    draggable={false}
                    onDoubleClick={handleImgDblClick}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
                  />
                )}
                {/* Zoom controls — hidden in 3D mode */}
                {!show3D && (
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setImgScale((s) => { const n = Math.min(4, s + 0.5); if (n === 1) setImgOffset({ x: 0, y: 0 }); return n }) }}
                      className="w-7 h-7 bg-stone-900/70 border border-stone-700 text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow"
                      aria-label="Zoom in"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setImgScale((s) => { const n = Math.max(1, s - 0.5); if (n === 1) setImgOffset({ x: 0, y: 0 }); return n }) }}
                      className="w-7 h-7 bg-stone-900/70 border border-stone-700 text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow"
                      aria-label="Zoom out"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
                      </svg>
                    </button>
                    {imgScale > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setImgScale(1); setImgOffset({ x: 0, y: 0 }) }}
                        className="w-7 h-7 bg-stone-900/70 border border-stone-700 text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow text-[9px] font-bold"
                        aria-label="Reset zoom"
                      >
                        1:1
                      </button>
                    )}
                  </div>
                )}
                {/* View in 3D button — bottom right */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShow3D((v) => !v) }}
                  className="absolute bottom-3 right-3 z-10 flex items-center gap-2 bg-primary border border-primary text-color-secondary-dark font-bold px-4 py-2.5 text-[11px] uppercase tracking-widest hover:bg-white transition-colors shadow"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  {show3D ? 'Show Texture' : 'View in 3D'}
                </button>
                {/* Zoom level badge — hidden in 3D mode */}
                {!show3D && imgScale > 1 && (
                  <span className="absolute top-3 left-3 text-[9px] font-bold tabular-nums text-white/80 bg-stone-900/60 px-2 py-0.5 tracking-wider">
                    {Math.round(imgScale * 100)}%
                  </span>
                )}
                {!show3D && imgScale === 1 && (
                  <span className="absolute top-3 left-3 text-[9px] text-white/40 bg-stone-900/40 px-2 py-0.5 tracking-wide">
                    scroll to zoom
                  </span>
                )}
                {/* Prev */}
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomedIndex((zoomedIndex - 1 + materials.length) % materials.length) }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-stone-900/70 text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
                  aria-label="Previous"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* Next */}
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomedIndex((zoomedIndex + 1) % materials.length) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-stone-900/70 text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
                  aria-label="Next"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Counter badge */}
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tabular-nums text-white/70 bg-stone-900/60 px-2.5 py-1 tracking-widest">
                  {zoomedIndex + 1} / {materials.length}
                </span>
              </div>

              {/* Info pane — compact, at bottom */}
              <div className="w-full bg-white px-6 py-4 flex flex-col gap-2.5">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase font-bold text-primary mb-0.5">{m.collection_name}</p>
                  <h3 className="font-serif text-xl text-color-secondary-dark leading-tight">{m.material_name}</h3>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-color-secondary-dark">Code</span>
                    <span className="text-[11px] font-bold text-color-secondary-dark tracking-wide">{m.material_code}</span>
                  </div>
                  {m.material_type && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-color-secondary-dark">Type</span>
                      <span className="text-[11px] text-color-secondary-dark">{m.material_type}</span>
                    </div>
                  )}
                  {m.color_group && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-color-secondary-dark">Colour</span>
                      <span className="text-[11px] text-color-secondary-dark">{m.color_group}</span>
                    </div>
                  )}
                  {m.pattern && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-color-secondary-dark">Pattern</span>
                      <span className="text-[11px] text-color-secondary-dark">{m.pattern}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomedIndex(null) }}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-secondary-dark text-white transition-all text-[11px] font-bold uppercase tracking-widest "
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
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
function CollectionGridCard({ col, onClick }: { col: Collection; onClick: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [inView, setInView] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

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
    <div
      ref={cardRef}
      onClick={onClick}
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
        {inView && !imgError && (
          <img
            src={col.image}
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
          <span className="text-[10px] md:text-[10px] text-color-secondary-dark truncate max-w-[60%] font-semibold tracking-wider uppercase">{col.category}</span>
          <span className="text-[10px] md:text-[10px] text-secondary font-bold tracking-widest">{col.itemCount} var.</span>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */
const CollectionsPage = () => {
  const location = useLocation()
  const { collections } = useMaterials()

  const [collectionSearch, setCollectionSearch] = useState('')
  const [activeMaterialType, setActiveMaterialType] = useState('All')

  const materialTypeOptions = useMemo(
    () => ['All', ...Array.from(new Set(collections.map((c) => c.category))).sort()],
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

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    let result = activeMaterialType === 'All' ? collections : collections.filter((c) => c.category === activeMaterialType)
    if (collectionSearch.trim()) {
      const q = collectionSearch.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))
    }
    return result
  }, [activeMaterialType, collectionSearch])

  const [visibleCount, setVisibleCount] = useState(12)

  // Reset visible count whenever filters change
  useEffect(() => { setVisibleCount(12) }, [activeMaterialType, collectionSearch])

  const navigate = useNavigate()
  const openModal = useCallback((col: Collection) => setSelectedCollection(col), [])
  const closeModal = useCallback(() => setSelectedCollection(null), [])
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const chipsRef = useRef<HTMLDivElement>(null)
  const scrollChips = (dir: 'left' | 'right') => {
    if (chipsRef.current) chipsRef.current.scrollBy({ left: dir === 'right' ? 140 : -140, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>

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
                href="https://wa.me/918589925111"
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

          <p className="text-[11px] tracking-[0.35em] uppercase font-semibold text-white/50 mb-2">Curated Textile Collections</p>
          <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            Fabric Collections
          </h1>
          <p className="mt-3 text-sm text-white/60 font-light max-w-md leading-relaxed">
            Explore our handpicked range of premium fabrics — from luxurious upholstery to delicate sheers, crafted for every space.
          </p>
        </div>
      </div>

      {/* ── Filter & Grid ────────────────────────────────────────── */}
      <div className="py-6 md:py-10 lg:py-14 relative" style={{ background: 'linear-gradient(160deg, #f5f5f4 0%, #ffffff 50%, #e7e5e4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-stone-100/60 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-10">

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
                          className={`flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-200  shadow-sm whitespace-nowrap ${isActive
                            ? 'bg-color-secondary-dark text-white'
                            : 'bg-white border border-stone-200 text-color-secondary-dark hover:border-primary/40 hover:text-color-secondary-dark'
                            }`}
                        >
                          {type}
                          <span className={`text-[10px] md:text-[9px] px-1.5 py-0.5  ${isActive ? 'bg-white/10 text-white' : 'bg-stone-100 text-color-secondary-dark'}`}>
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
                  className="bg-transparent text-sm text-color-secondary-dark placeholder-stone-400 focus:outline-none flex-1 lg:w-52"
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
                  <CollectionGridCard key={col.name} col={col} onClick={() => openModal(col)} />
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 animate-pulse" />
                <span className="text-[11px] md:text-xs text-gray-100 uppercase tracking-widest font-bold">AI Powered</span>
              </div>
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white leading-tight">
                Visualize any fabric on real products — <span className="text-primary">instantly</span>
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

      {/* ── Collection Detail Modal ──────────────────────────────── */}
      {selectedCollection && (
        <CollectionModal collection={selectedCollection} onClose={closeModal} />
      )}

      {/* ── Quote Modal ──────────────────────────────────────────── */}
      {showQuoteModal && (
        <QuoteModal onClose={() => setShowQuoteModal(false)} />
      )}
    </div>
  )
}

export default CollectionsPage
