import '@google/model-viewer'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import InlineLoader from './InlineLoader'
import { type NewMaterial } from '../../data/newmaterials'
import { kairaProducts, type KairaProduct } from '../../data/products'
import { applyTextureToModel, fetchBlobUrl, getNormalMapURL, getRoughnessMapURL, getUvValue, NO_FABRIC_PARTS } from '../../utils/textureUtils'
import { useCachedMedia } from '../../hooks/useCachedMedia'

const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'
const S3_BASE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'
const SHOW_PRODUCT_PICKER = false // set to true to re-enable the "Change product" picker on the 3D view

const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

function getSheenMapUrl(materialType: string) {
  if (materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('boucle') || materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('velvet')) {
    return `${S3_BASE}/textures/Common/SheenColorMap.webp`
  }
  return ''
}

function getRoughnessValue(materialType: string, collectionName: string, baseRoughness: number): number {
  if (materialType.toLowerCase().includes('boucle') || materialType.toLowerCase().includes('chenille') || materialType.toLowerCase().includes('fabric') || materialType.toLowerCase().includes('digitalprint')) return 0.8
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

interface Material3DViewerProps {
  material: NewMaterial
  /** Full materials array (not just the current collection) — needed to resolve normal maps. */
  newMaterials: NewMaterial[]
}

/** 3D preview of a single material on a choice of products. Fills its parent — the parent sets the size. */
export default function Material3DViewer({ material: m, newMaterials }: Material3DViewerProps) {
  const [isTextureLoading, setIsTextureLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [currentProduct, setCurrentProduct] = useState<KairaProduct>(kairaProducts[0])
  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const mvRef = useRef<HTMLElement>(null)
  const fabricMeshesRef = useRef<any[]>([])
  const modelReadyRef = useRef(false)
  const isFirstProductRender = useRef(true)

  // Switching products swaps the model-viewer's src to a new GLB — show the
  // "Loading 3D Model" spinner again rather than the (misleading) texture one.
  useEffect(() => {
    if (isFirstProductRender.current) { isFirstProductRender.current = false; return }
    modelReadyRef.current = false
    setIsModelLoading(true)
  }, [currentProduct])

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
      const roughness = getRoughnessValue(m.material_type ?? '', m.collection_name, m.roughness ?? 0.8)
      const [baseBlobUrl, roughnessBlobUrl, normalBlobUrl, sheenBlobUrl] = await Promise.all([
        fetchBlobUrl(textureUrl),
        fetchBlobUrl(getRoughnessMapURL(m.collection_name)),
        fetchBlobUrl(getNormalMapURL(m.collection_name, newMaterials, m.material_code)),
        (() => { const u = getSheenMapUrl(m.material_type ?? ''); return u ? fetchBlobUrl(u) : Promise.resolve(null) })(),
      ])
      await applyTextureToModel(mv, {
        baseBlobUrl,
        roughness,
        metalness: m.metalness ?? 0.0,
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

  // Material switched while the model is already loaded — re-texture without reloading the GLB.
  useEffect(() => {
    if (modelReadyRef.current && mvRef.current) applyTextureRef.current(mvRef.current)
  }, [m.id])

  // Register the 'load' listener once. model-viewer fires a fresh 'load' event every
  // time its src changes (i.e. every product switch), so a single persistent listener
  // is exactly correct, and avoids racing against a stale mv.model reference mid-swap.
  useEffect(() => {
    const mv = mvRef.current as any
    if (!mv) return

    const onLoad = () => {
      // Setup meshes with MeshPhysicalMaterial — same as ThreeDVisualizerEngine
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

      modelReadyRef.current = true
      setIsModelLoading(false)
      applyTextureRef.current(mv)
    }

    mv.addEventListener('load', onLoad)
    return () => mv.removeEventListener('load', onLoad)
  }, [])

  return (
    <div className="relative w-full h-full">
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
        alt={`${m.collection_name} ${m.material_name} on ${currentProduct.product_name}`}
        camera-controls
        auto-rotate
        disable-pan
        tone-mapping="neutral"
        exposure="0.4"
        shadow-intensity="0.6"
        shadow-softness="1"
        style={{ width: '100%', height: '100%', background: '#fafaf9' }}
      />
      {SHOW_PRODUCT_PICKER && (
        <>
          {/* Product picker — overlaid on the canvas, horizontally scrollable, auto-collapses */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-2 overflow-x-auto px-4 py-3 bg-gradient-to-t from-black/70 to-transparent [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-transform duration-300 ease-in-out ${productPickerOpen ? 'translate-y-0' : 'translate-y-full'}`}
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
              onClick={() => setProductPickerOpen(true)}
              aria-label="Show products"
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 h-8 px-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-[9px] uppercase font-bold tracking-widest transition-colors rounded-full"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              Change product
            </button>
          )}
        </>
      )}
    </div>
  )
}
