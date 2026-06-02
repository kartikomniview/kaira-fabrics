import { useEffect, useRef, useState } from 'react'
import { useMaterials } from '../../contexts/MaterialsContext'
import { kairaProducts } from '../../data/products'
import type { KairaProduct } from '../../data/products'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS } from '../../utils/textureUtils'
import * as THREE from 'three'
import '@google/model-viewer'
import MaterialSelector, { type SelectedMaterial, S3_THUMB } from './MaterialSelector'

export type { SelectedMaterial } from './MaterialSelector'

const S3_BASE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'
const COMPANY = 'KairaFabrics'

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
  if (materialType.toLowerCase().includes('leather')) return 0.6
  return baseRoughness
}

interface EngineProps {
  currentProduct: KairaProduct
  setCurrentProduct: (p: KairaProduct) => void
  selected: SelectedMaterial | null
  setSelected: (m: SelectedMaterial | null) => void
  isApplying: boolean
  setIsApplying: (v: boolean) => void
  modelLoaded: boolean
  setModelLoaded: (v: boolean) => void
}

const ThreeDVisualizerEngine = ({
  currentProduct,
  setCurrentProduct,
  selected,
  setSelected,
  isApplying,
  setIsApplying,
  modelLoaded,
  setModelLoaded,
}: EngineProps) => {
  const { newMaterials } = useMaterials()
  const mvRef = useRef<HTMLElement>(null)
  const fabricMeshesRef = useRef<any[]>([])
  const autoAppliedRef = useRef(false)
  const [productPanelOpen, setProductPanelOpen] = useState(false)
  const [meshNames, setMeshNames] = useState<string[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ msg, type })
    requestAnimationFrame(() => setToastVisible(true))
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 300)
    }, 2200)
  }

  const [applyRoughnessMap] = useState(true)
  const [applyNormalMap] = useState(true)
  const [applySheenMap] = useState(true)
  const [currSelectedPartForFinish, setCurrSelectedPartForFinish] = useState('All')

  const modelUrl = currentProduct.image_url

  const applyTexture = async (mat: SelectedMaterial) => {
    const mv = mvRef.current as any
    if (!mv) return
    setIsApplying(true)
    const [baseBlobUrl, roughnessBlobUrl, normalBlobUrl, sheenBlobUrl] = await Promise.all([
      fetchBlobUrl(mat.textureUrl),
      applyRoughnessMap ? fetchBlobUrl(getRoughnessMapURL(mat.collectionName)) : Promise.resolve(null),
      applyNormalMap ? fetchBlobUrl(getNormalMapURL(mat.collectionName)) : Promise.resolve(null),
      applySheenMap ? (() => { const u = getSheenMapUrl(mat.materialType); return u ? fetchBlobUrl(u) : Promise.resolve(null) })() : Promise.resolve(null),
    ])
    const uvScale = getUvValue(mat.collectionName)
    const roughness = getRoughnessValue(mat.materialType, mat.collectionName, mat.roughness)
    console.log(roughness)
    await applyTextureToModel(mv, {
      baseBlobUrl,
      roughness,
      metalness: mat.metalness,
      uvScale,
      skipParts: NO_FABRIC_PARTS,
      onlyParts: currSelectedPartForFinish !== 'All' ? [currSelectedPartForFinish] : [],
      roughnessBlobUrl,
      normalBlobUrl,
      sheenBlobUrl,
      meshes: fabricMeshesRef.current,
    })
    if (baseBlobUrl) URL.revokeObjectURL(baseBlobUrl)
    if (roughnessBlobUrl) URL.revokeObjectURL(roughnessBlobUrl)
    if (normalBlobUrl) URL.revokeObjectURL(normalBlobUrl)
    if (sheenBlobUrl) URL.revokeObjectURL(sheenBlobUrl)
    setIsApplying(false)
  }

  useEffect(() => {
    const mv = mvRef.current as any
    if (!mv) return
    const onLoad = () => {
      fabricMeshesRef.current = []

      const sceneSymbol: any = Object.getOwnPropertySymbols(mv).find(s => s.description === 'scene')
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

      setMeshNames(fabricMeshesRef.current.map((m: any) => m.name ?? ''))
      setModelLoaded(true)
    }
    mv.addEventListener('load', onLoad)
    return () => mv.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if (modelLoaded && selected) applyTexture(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelLoaded])

  // Auto-apply first Koral material on initial load
  useEffect(() => {
    if (autoAppliedRef.current || newMaterials.length === 0) return
    const firstKoral = newMaterials.find(m => m.collection_name === 'Koral')
    if (!firstKoral) return
    autoAppliedRef.current = true
    const mat: SelectedMaterial = {
      id: firstKoral.id,
      fabricName: `${firstKoral.collection_name} ${firstKoral.material_name}`,
      textureUrl: `${S3_THUMB}/${firstKoral.collection_name}/${firstKoral.material_code}.webp`,
      roughness: firstKoral.roughness ?? 0.5,
      metalness: firstKoral.metalness ?? 0,
      collectionName: firstKoral.collection_name,
      materialCode: firstKoral.material_code,
      materialType: firstKoral.material_type ?? '',
      colorGroup: firstKoral.color_group,
    }
    setSelected(mat)
    if (modelLoaded) applyTexture(mat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMaterials])

  useEffect(() => {
    setModelLoaded(false)
    fabricMeshesRef.current = []
    setMeshNames([])
  }, [currentProduct])

  useEffect(() => {
    if (currSelectedPartForFinish === 'All' || !modelLoaded) return
    const meshes = fabricMeshesRef.current.filter((m: any) =>
      (m.name ?? '').toLowerCase().includes(currSelectedPartForFinish.toLowerCase())
    )
    if (meshes.length === 0) return
    const originals = meshes.map((m: any) => ({
      emissive: (m.material as THREE.MeshPhysicalMaterial).emissive.clone(),
      intensity: (m.material as THREE.MeshPhysicalMaterial).emissiveIntensity,
    }))
    const on = () => meshes.forEach((m: any) => {
      (m.material as THREE.MeshPhysicalMaterial).emissive.set(0xffffff)
      ;(m.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.7
    })
    const off = () => meshes.forEach((m: any, i: number) => {
      (m.material as THREE.MeshPhysicalMaterial).emissive.copy(originals[i].emissive)
      ;(m.material as THREE.MeshPhysicalMaterial).emissiveIntensity = originals[i].intensity
    })
    on()
    const t1 = setTimeout(off, 300)
    const t2 = setTimeout(on, 550)
    const t3 = setTimeout(off, 850)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [currSelectedPartForFinish, modelLoaded])

  return (
    <>
      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6">

        {/* ── LEFT: Material Selector ── */}
        <MaterialSelector
          selectedId={selected?.id ?? null}
          onSelect={(mat) => { setSelected(mat); if (modelLoaded) applyTexture(mat) }}
          selectedPart={currSelectedPartForFinish}
          onPartChange={setCurrSelectedPartForFinish}
          availableMeshNames={meshNames}
          onToast={showToast}
        />

        {/* ── RIGHT: 3D Viewport ── */}
        <div className="flex-1 flex flex-col bg-stone-50 rounded-none shadow-sm border border-stone-200 overflow-hidden relative">

          {/* Viewport title bar */}
          <div className="h-12 shrink-0 bg-white border-b border-stone-200/80 flex items-center px-4 gap-4 z-10 relative">
            <button
              onClick={() => setProductPanelOpen(true)}
              className="flex items-center gap-2 h-8 px-4 bg-secondary-dark hover:bg-stone-800 text-white transition-all rounded-none shrink-0 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[11px] tracking-[0.1em] uppercase font-bold">Change Product</span>
            </button>

            <div className="w-px h-5 bg-stone-200" />
            <div className="flex-1" />
            <span className="text-[11px] color-secondary-dark/40 tracking-wider select-none font-medium">Drag to orbit · Scroll to zoom</span>
          </div>

          {/* model-viewer fills remaining space */}
          <div className="flex-1 relative bg-stone-50">

            {/* Toast */}
            <div className={`absolute top-4 right-4 z-20 pointer-events-none transition-all duration-300 ease-out ${toastVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
              {toast && (
                <div className={`flex items-center gap-2.5 px-4 py-2.5 shadow-2xl whitespace-nowrap border-l-4 ${toast.type === 'success' ? 'bg-secondary-dark border-primary' : 'bg-secondary-dark border-red-400'}`}>
                  {toast.type === 'success' ? (
                    <svg className="w-3.5 h-3.5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">{toast.msg}</span>
                </div>
              )}
            </div>
            {/* @ts-ignore */}
            <model-viewer
              ref={mvRef as any}
              src={modelUrl}
              alt={`${currentProduct.product_name} 3D model`}
              camera-controls
              disable-pan
              tone-mapping="neutral"
              exposure="0.5"
              shadow-intensity="0.6"
              shadow-softness="1"
              max-camera-orbit="Infinity 90deg auto"
              camera-orbit="auto auto 4m"
              ar
              ar-modes="scene-viewer quick-look"
              style={{ width: '100%', height: '100%', background: '#fafaf9' }}
            />

            {/* ── Product selector slide panel ── */}
            <div
              className={`absolute inset-0 z-20 bg-stone-900/30 backdrop-blur-[1px] transition-opacity duration-300 ${productPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setProductPanelOpen(false)}
            />
            <div
              className={`absolute inset-y-0 left-0 z-30 w-72 flex flex-col bg-white border-r border-stone-200 shadow-2xl transition-transform duration-300 ease-in-out ${productPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="h-12 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-5 justify-between">
                <p className="text-[10px] color-secondary-dark font-bold uppercase tracking-[0.2em]">Products</p>
                <button
                  onClick={() => setProductPanelOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-stone-200 color-secondary-dark/50 hover:color-secondary-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {kairaProducts.map((p) => {
                  const isActive = currentProduct.id === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setCurrentProduct(p); setProductPanelOpen(false); setCurrSelectedPartForFinish('All') }}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 transition-all border-l-[3px] border-b border-stone-50/50 ${isActive
                        ? 'bg-stone-50 text-stone-900 border-l-stone-900'
                        : 'hover:bg-stone-50 border-l-transparent text-stone-600'
                        }`}
                    >
                      <div className="w-20 h-20 p-1 shrink-0 rounded-none overflow-hidden border border-stone-200 bg-white">
                        <img
                          src={p.model_url}
                          alt={p.product_name}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-xs font-bold uppercase tracking-widest truncate ${isActive ? 'color-secondary-dark' : 'color-secondary-dark/70'}`}>
                          {p.product_name}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 rounded-none bg-secondary-dark flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Corner bracket decorations */}
            <div className="absolute top-5 left-5 w-6 h-6 border-t border-l border-stone-300 pointer-events-none" />
            <div className="absolute top-5 right-5 w-6 h-6 border-t border-r border-stone-300 pointer-events-none" />
            <div className="absolute bottom-5 left-5 w-6 h-6 border-b border-l border-stone-300 pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-6 h-6 border-b border-r border-stone-300 pointer-events-none" />

            {/* Model loading overlay */}
            {!modelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10 pointer-events-none">
                <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-secondary-dark rounded-full animate-spin mb-6" />
                <p className="color-secondary-dark text-[12px] font-bold tracking-[0.3em] uppercase">Loading 3D Model</p>
                <p className="color-secondary-dark/50 text-[11px] mt-2 font-medium tracking-widest">{currentProduct.product_name}</p>
              </div>
            )}

            {/* Texture applying overlay */}
            {isApplying && modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-10 pointer-events-none">
                <div className="bg-white border border-stone-200/50 px-8 py-4 flex items-center gap-4 shadow-xl rounded-none">
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-secondary-dark rounded-full animate-spin" />
                  <span className="color-secondary-dark text-[11px] font-bold tracking-[0.2em] uppercase">Applying Texture…</span>
                </div>
              </div>
            )}

            {/* Bottom info bar */}
            {selected && modelLoaded && !isApplying && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl px-5 py-3 pointer-events-none flex items-center gap-4 rounded-none">
                <img
                  src={selected.textureUrl}
                  alt=""
                  className="w-8 h-8 rounded-none object-cover border border-stone-200"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div>
                  <span className="text-[12px] font-bold color-secondary-dark tracking-[0.2em] uppercase block mb-0.5">{selected.fabricName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ThreeDVisualizerEngine
