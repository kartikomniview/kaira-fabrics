import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import InlineLoader from './InlineLoader'
import type { Material } from '../../data/materials'
import { getCollectionImageUrl } from '../../data/materials'
import { collections } from '../../data/collections'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS } from '../../utils/textureUtils'

const MODEL_URL =
  'https://supoassets.s3.ap-south-1.amazonaws.com/public/models/OVL/Sofa/SetSofas/Linda.glb'
const S3_THUMB =
  'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

const COLOR_MAP: Record<string, string> = {
  Whites: '#f5f0eb',
  Creams: '#f2e9d0',
  Beiges: '#c9b49a',
  Browns: '#8b5a2b',
  Tans: '#d2b48c',
  Grays: '#8a8a8a',
  'Light Grays': '#c4c4c4',
  'Dark Grays': '#555555',
  Blacks: '#1c1c1c',
  Blues: '#3b6ea5',
  Navys: '#1b2f6b',
  Teals: '#19787d',
  Greens: '#2e7d32',
  Reds: '#c0392b',
  Oranges: '#e07020',
  Yellows: '#d4a017',
  Pinks: '#d4607a',
  Purples: '#7b3fa0',
  Mauves: '#9e7b9b',
  Coals: '#3c3c3c',
}

function getCollectionStats(collectionName: string) {
  const col = collections.find((c) => c.name === collectionName)
  const itemCount = col?.itemCount ?? 1
  const maxItems = Math.max(...collections.map((c) => c.itemCount), 1)

  // Deterministic pseudo-rating seeded from collection name
  let hash = 0
  for (const ch of collectionName) hash = ((hash * 31) + ch.charCodeAt(0)) & 0xffff
  const rating = +(3.5 + (hash % 16) * 0.1).toFixed(1)
  const popularity = Math.round((itemCount / maxItems) * 100)

  return { itemCount, rating, popularity }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${rating >= i ? 'text-gold' : rating >= i - 0.5 ? 'text-gold' : 'text-stone-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l2.85 6.65L22 9.24l-5.5 4.73 1.68 7.03L12 17.27 5.82 21l1.68-7.03L2 9.24l7.15-.59L12 2z" />
        </svg>
      ))}
      <span className="ml-1.5 text-xs font-semibold text-charcoal">{rating}</span>
    </div>
  )
}

interface MaterialDetailModalProps {
  material: Material
  onClose: () => void
}

const MaterialDetailModal = ({ material, onClose }: MaterialDetailModalProps) => {
  const [show3D, setShow3D] = useState(false)
  const [isTextureLoading, setIsTextureLoading] = useState(false)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const mvRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const textureUrl = `${S3_THUMB}/${material.collection_name}/${material.material_code}.webp`
  const coverUrl = getCollectionImageUrl(material.collection_name)
  const stats = getCollectionStats(material.collection_name)
  const colorSwatch = COLOR_MAP[material.color_group ?? ''] ?? '#d0c8c0'

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Apply texture when 3D model loads
  useEffect(() => {
    if (!show3D) return
    const mv = mvRef.current as any
    if (!mv) return

    const applyTexture = async () => {
      setIsTextureLoading(true)
      try {
        const baseBlobUrl = await fetchBlobUrl(textureUrl)
        await applyTextureToModel(mv, {
          baseBlobUrl,
          roughness: material.roughness,
          metalness: material.metalness,
          skipParts: NO_FABRIC_PARTS,
        })
        if (baseBlobUrl) URL.revokeObjectURL(baseBlobUrl)
      } catch {
        // silent — model still renders without texture
      } finally {
        setIsTextureLoading(false)
      }
    }

    mv.addEventListener('load', applyTexture)
    return () => mv.removeEventListener('load', applyTexture)
  }, [show3D, textureUrl, material.roughness, material.metalness])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative bg-white w-full max-w-5xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-5 w-0.5 bg-gold shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
                {material.material_type}
              </p>
              <p className="font-serif text-[13px] md:text-base text-charcoal mt-0.5 truncate">
                {material.collection_name}
                <span className="text-stone-400 mx-1.5">·</span>
                {material.material_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-400 hover:text-charcoal rounded-full shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row overflow-y-auto min-h-0 flex-1">

          {/* Left – Image / 3D Viewer */}
          <div
            className={`w-full md:w-[48%] bg-stone-50 relative shrink-0 h-[350px] sm:h-[420px] md:h-[480px] overflow-hidden${!show3D ? ' md:cursor-crosshair' : ''}`}
            onMouseMove={!show3D ? handleImageMouseMove : undefined}
            onMouseLeave={!show3D ? () => setZoomPos(null) : undefined}
          >
            {show3D ? (
              <>
                {isTextureLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                    <InlineLoader color="secondary" />
                    <p className="mt-2 text-[11px] uppercase tracking-widest text-stone-500 animate-pulse">
                      Applying Texture…
                    </p>
                  </div>
                )}
                <model-viewer
                  ref={mvRef as any}
                  src={MODEL_URL}
                  alt={`${material.material_name} on sofa`}
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  exposure="0.9"
                  environment-image="neutral"
                  style={{ width: '100%', height: '100%', background: 'transparent' }}
                />
              </>
            ) : (
              <>
                <img
                  src={textureUrl}
                  alt={material.material_name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.2'
                  }}
                />
                {zoomPos ? (
                  <div
                    className="absolute inset-0 z-[5]"
                    style={{
                      backgroundImage: `url(${textureUrl})`,
                      backgroundSize: '260%',
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                ) : (
                  <div className="hidden md:flex absolute bottom-10 right-3 z-[5] items-center gap-1.5 bg-charcoal/60 text-cream px-2.5 py-1.5 pointer-events-none">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-[9px] uppercase tracking-widest">Hover to zoom</span>
                  </div>
                )}
              </>
            )}

            {/* Material code badge */}
            <span className="absolute bottom-3 left-3 bg-charcoal/75 text-cream text-[11px] px-2.5 py-1 uppercase tracking-widest font-mono z-10">
              {material.material_code}
            </span>
          </div>

          {/* Right – Info panel */}
          <div className="md:w-[52%] p-4 md:p-7 flex flex-col gap-4 md:gap-6 overflow-y-auto">

            {/* Material properties */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold mb-3">
                Material Details
              </p>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div className="bg-stone-50 border border-stone-100 p-3 md:p-4">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Type</p>
                  <p className="text-[13px] md:text-sm font-semibold text-charcoal leading-tight">{material.material_type}</p>
                </div>
                <div className="bg-stone-50 border border-stone-100 p-3 md:p-4">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Color</p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-stone-300/60"
                      style={{ background: colorSwatch }}
                    />
                    <p className="text-[13px] md:text-sm font-semibold text-charcoal leading-tight truncate">
                      {material.color_group ?? '–'}
                    </p>
                  </div>
                </div>
                <div className="bg-stone-50 border border-stone-100 p-3 md:p-4">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Pattern</p>
                  <p className="text-[13px] md:text-sm font-semibold text-charcoal leading-tight">{material.pattern ?? '–'}</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-stone-100" />

            {/* Collection info */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold mb-3">
                Collection
              </p>
              <div className="flex gap-5 items-start">
                <img
                  src={coverUrl}
                  alt={material.collection_name}
                  className="w-20 h-20 md:w-28 md:h-28 object-cover border border-stone-200 shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
                />
                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  <p className="font-serif text-[17px] md:text-base text-charcoal">{material.collection_name}</p>
                  <StarRating rating={stats.rating} />
                  <p className="text-[13px] md:text-xs text-stone-400">
                    {stats.itemCount} fabric variant{stats.itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-stone-100" />

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 mt-auto">
              <button
                onClick={() => { setShow3D((v) => !v); setZoomPos(null) }}
                className={`flex items-center justify-center gap-2 border text-[11px] uppercase tracking-widest py-4 transition-colors duration-200 font-medium ${
                  show3D
                    ? 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-charcoal'
                    : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-cream'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                  />
                </svg>
                {show3D ? 'Show Fabric Texture' : 'View in 3D Model'}
              </button>

              <button
                onClick={() => navigate('/ai-visualizer')}
                className="flex items-center justify-center gap-2 bg-gold text-charcoal text-[11px] uppercase tracking-widest py-4 hover:bg-gold/80 transition-colors duration-200 font-bold"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" />
                </svg>
                Visualize with AI
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialDetailModal
