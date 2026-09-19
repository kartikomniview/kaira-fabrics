import '@google/model-viewer'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { categoryMeta, normalizeType } from '../sections/FabricCategoriesSection'
import InlineLoader from './InlineLoader'
import { type NewMaterial } from '../../data/newmaterials'
import { kairaProducts, type KairaProduct } from '../../data/products'
import { applyTextureToModel, fetchBlobUrl, getNormalMapURL, getRoughnessMapURL, getUvValue, NO_FABRIC_PARTS } from '../../utils/textureUtils'
import { useCachedMedia } from '../../hooks/useCachedMedia'

const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'
const S3_BASE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'
const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

function getSheenMapUrl(materialType: string) {
  if (materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('velvet')) {
    return `${S3_BASE}/textures/Common/SheenColorMap.webp`
  }
  return ''
}

function getRoughnessValue(materialType: string, collectionName: string, baseRoughness: number): number {
  if (materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('digitalprint')) return 0.8
  if (collectionName === 'Intense' || collectionName === 'Modello') return 0.6
  if (materialType.toLowerCase().includes('leather')) return 0.6
  return baseRoughness
}

/** One product thumbnail in the horizontally-scrollable strip. */
function ProductThumb({ product, isActive, onClick }: { product: KairaProduct; isActive: boolean; onClick: () => void }) {
  const cachedSrc = useCachedMedia(product.model_url)
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex flex-col items-center gap-1 w-20"
    >
      <div className={`w-20 aspect-[4/3] p-1 border-2 overflow-hidden bg-white shadow transition-colors ${isActive ? 'border-primary' : 'border-white/70'}`}>
        {cachedSrc && (
          <img
            src={cachedSrc}
            alt={product.product_name}
            className="w-full h-full object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>
      <span className={`text-[8px] uppercase font-bold tracking-wide truncate w-full text-center drop-shadow ${isActive ? 'text-primary' : 'text-white/80'}`}>
        {product.product_name}
      </span>
    </button>
  )
}

interface MaterialZoomOverlayProps {
  material: NewMaterial
  /** Full materials array (not just the current collection) — needed to resolve normal maps. */
  newMaterials: NewMaterial[]
  /** Open directly in 3D mode instead of the flat texture image. */
  initialShow3D?: boolean
  onClose: () => void
}

/** Full-screen viewer for a single material: texture image, optional 3D preview (on a choice of products), and its details. */
export default function MaterialZoomOverlay({ material: m, newMaterials, initialShow3D = false, onClose }: MaterialZoomOverlayProps) {
  const [show3D, setShow3D] = useState(initialShow3D)
  const [isTextureLoading, setIsTextureLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(initialShow3D)
  const [currentProduct, setCurrentProduct] = useState<KairaProduct>(kairaProducts[0])
  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const mvRef = useRef<HTMLElement>(null)
  const fabricMeshesRef = useRef<any[]>([])
  const isFirstProductRender = useRef(true)

  const zoomedTextureUrl = `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`
  const cachedZoomedUrl = useCachedMedia(zoomedTextureUrl)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Switching products swaps the model-viewer's src to a new GLB — show the
  // "Loading 3D Model" spinner again rather than the (misleading) texture one.
  useEffect(() => {
    if (isFirstProductRender.current) { isFirstProductRender.current = false; return }
    if (show3D) setIsModelLoading(true)
  }, [currentProduct, show3D])

  // Product picker: starts collapsed, and auto-collapses again a few seconds
  // after being (re)opened if nothing is picked in the meantime.
  useEffect(() => {
    if (!productPickerOpen) return
    const t = setTimeout(() => setProductPickerOpen(false), 3000)
    return () => clearTimeout(t)
  }, [productPickerOpen])

  // Applies the current material's texture to whichever meshes were captured off the loaded model.
  const applyTexture = useCallback(async (mv: any) => {
    setIsTextureLoading(true)
    try {
      const textureUrl = `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`
      const uvScale = getUvValue(m.collection_name, m.material_code)
      const roughness = getRoughnessValue(m.material_type ?? '', m.collection_name, (m as any).roughness ?? 0.8)
      const [baseBlobUrl, roughnessBlobUrl, normalBlobUrl, sheenBlobUrl] = await Promise.all([
        fetchBlobUrl(textureUrl),
        fetchBlobUrl(getRoughnessMapURL(m.collection_name)),
        fetchBlobUrl(getNormalMapURL(m.collection_name, newMaterials, m.material_code)),
        (() => { const u = getSheenMapUrl(m.material_type ?? ''); return u ? fetchBlobUrl(u) : Promise.resolve(null) })(),
      ])
      await applyTextureToModel(mv, {
        baseBlobUrl,
        roughness,
        metalness: (m as any).metalness ?? 0.0,
        uvScale,
        rotation: currentProduct.uvRotation ?? 0,
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
  }, [m, newMaterials, currentProduct])

  // Keep a ref to the latest applyTexture so the persistent 'load' listener below
  // never needs to be torn down and re-attached just because the material/product changed.
  const applyTextureRef = useRef(applyTexture)
  useEffect(() => { applyTextureRef.current = applyTexture }, [applyTexture])

  // Register the 'load' listener once per 3D session. The model-viewer element stays
  // mounted for as long as show3D is true, and fires a fresh 'load' event every time its
  // src changes (i.e. every product switch) — so a single persistent listener here is
  // exactly correct, and avoids racing against a stale mv.model reference mid-swap.
  useEffect(() => {
    if (!show3D) return
    const mv = mvRef.current as any
    if (!mv) return

    const onLoad = () => {
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
      applyTextureRef.current(mv)
    }

    mv.addEventListener('load', onLoad)
    return () => mv.removeEventListener('load', onLoad)
  }, [show3D])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { e.stopPropagation(); onClose() }}
    >
      <div
        className="relative flex flex-col items-stretch w-full max-w-lg bg-white overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — minimal: material code + other info, close button */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-200">
          <div className="min-w-0">
            <p className="text-[9px] tracking-[0.25em] uppercase font-bold text-primary truncate">{m.collection_name}</p>
            <p className="text-sm font-semibold text-color-secondary-dark truncate">
              {m.material_name}
              <span className="ml-2 font-normal text-color-secondary-dark/50">
                {[m.material_code, categoryMeta[normalizeType(m.material_type)]?.label ?? m.material_type, m.color_group, m.pattern]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            aria-label="Close"
            className="shrink-0 w-8 h-8 flex items-center justify-center text-color-secondary-dark hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Material image */}
        <div className="relative w-full aspect-square bg-stone-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                src={isIOSDevice ? currentProduct.ios_model_url : currentProduct.image_url}
                ios-src={currentProduct.ios_model_url}
                alt={`${m.material_name} on ${currentProduct.product_name}`}
                camera-controls
                auto-rotate
                disable-pan
                tone-mapping="neutral"
                exposure="0.4"
                shadow-intensity="0.6"
                shadow-softness="1"
                style={{ width: '100%', height: '100%', background: '#fafaf9' }}
              />
              {/* Product picker — overlaid on the canvas, horizontally scrollable, auto-collapses */}
              <div
                className={`absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-2 overflow-x-auto px-4 py-3 bg-gradient-to-t from-black/70 to-transparent [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-transform duration-300 ease-in-out ${productPickerOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {kairaProducts.map((p) => (
                  <ProductThumb
                    key={p.id}
                    product={p}
                    isActive={currentProduct.id === p.id}
                    onClick={() => { setCurrentProduct(p); setProductPickerOpen(false) }}
                  />
                ))}
              </div>
              {/* Reopen handle — shown once the picker has auto-collapsed */}
              {!productPickerOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); setProductPickerOpen(true) }}
                  aria-label="Show products"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white transition-colors rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
              )}
            </>
          ) : cachedZoomedUrl ? (
            <img
              key={m.id}
              src={cachedZoomedUrl}
              alt={m.material_name}
              className="w-full h-full object-cover select-none"
              draggable={false}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
            />
          ) : (
            <InlineLoader color="secondary" />
          )}
        </div>

        {/* Footer — View in 3D + Go Back, centered */}
        <div className="flex items-center justify-center gap-3 py-4 px-6 bg-white">
          <button
            onClick={(e) => { e.stopPropagation(); setShow3D((v) => !v) }}
            className="flex items-center gap-2 bg-primary border border-primary text-color-secondary-dark font-bold px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-primary-dark transition-colors shadow"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            {show3D ? 'Show Texture' : 'View in 3D'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="flex items-center gap-2 border border-stone-300 text-color-secondary-dark font-bold px-6 py-3 text-[11px] uppercase tracking-widest hover:border-stone-500 hover:bg-stone-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
