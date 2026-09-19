import { useEffect, useRef, useState } from 'react'
import { useMaterials } from '../../contexts/MaterialsContext'
import { kairaProducts } from '../../data/products'
import type { KairaProduct } from '../../data/products'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS, getNormalMapURL, getRoughnessMapURL, getUvValue } from '../../utils/textureUtils'
import * as THREE from 'three'
import '@google/model-viewer'
import MaterialSelector, { type SelectedMaterial, S3_THUMB, CachedThumbImg } from './MaterialSelector'
import { AI_VISUALIZER_PRODUCTS } from '../aivisualizer/AiVisualizerEngine'
import { useAiGenerationFlow, OTP_VALIDATION_ENABLED, DEFAULT_GENERATION_LIMIT } from '../aivisualizer/useAiGenerationFlow'
import type { SelectedProduct as AiSelectedProduct } from '../aivisualizer/generateRender'
import LeadFormModal from '../aivisualizer/LeadFormModal'
import MyGalleryPanel from '../aivisualizer/MyGalleryPanel'
import GeneratedImageModal from '../admin/GeneratedImageModal'
import { isVerified } from '../../lib/renderLimit'
import TourGuide, { type TourStep } from '../../components/ui/TourGuide'

export type { SelectedMaterial } from './MaterialSelector'

const S3_BASE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'

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

const TOUR_STEPS: TourStep[] = [
  { id: 'tour-material-selector', title: 'Pick a Fabric', subtitle: 'Browse Kaira\'s collection here and tap any swatch to apply it to the product.' },
  { id: 'tour-change-product', title: 'Change Product', subtitle: 'Switch to a different sofa or chair to preview your fabric on.' },
  { id: 'tour-3d-canvas', title: 'Explore in 3D', subtitle: 'Drag to orbit around the model and scroll to zoom in for a closer look.' },
  { id: 'tour-visualize-ai', title: 'Visualize with AI', subtitle: 'Generate a realistic AI render of your product with the selected fabric.' },
]

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
  const [showGalleryPanel, setShowGalleryPanel] = useState(false)
  const [showTour, setShowTour] = useState(true)
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

  // Whole-product fabric, plus any per-part overrides layered on top of it
  const [baseMaterial, setBaseMaterial] = useState<SelectedMaterial | null>(null)
  const [partOverrides, setPartOverrides] = useState<Record<string, SelectedMaterial>>({})

  const {
    showLeadForm, mobileNumber, setMobileNumber, mobileError,
    otpCode, setOtpCode, leadStep,
    sendingOtp, verifyingOtp, otpError,
    isGenerating, generatedImage, generateError, setGenerateError, cyclingMsg,
    limitInfo,
    showImageModal, setShowImageModal, imgZoom, setImgZoom,
    handleGenerateClick, closeLeadForm, handleSendOtp, handleVerifyOtp, handleChangeMobile, handleDownload,
  } = useAiGenerationFlow()

  const handleVisualizeWithAI = () => {
    if (!selected) return
    const match = AI_VISUALIZER_PRODUCTS.find((p) => p.productName === currentProduct.product_name)
    const product: AiSelectedProduct = match
      ? { id: match.productName, productName: match.productName, imageUrl: match.productImageUrl }
      : { id: currentProduct.id, productName: currentProduct.product_name, imageUrl: currentProduct.model_url }
    handleGenerateClick({ material: selected, product })
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const modelUrl = isIOS ? currentProduct.ios_model_url : currentProduct.image_url

  const applyTexture = async (mat: SelectedMaterial) => {
    const mv = mvRef.current as any
    if (!mv) return
    setIsApplying(true)
    const [baseBlobUrl, roughnessBlobUrl, normalBlobUrl, sheenBlobUrl] = await Promise.all([
      fetchBlobUrl(mat.textureUrl),
      applyRoughnessMap ? fetchBlobUrl(getRoughnessMapURL(mat.collectionName)) : Promise.resolve(null),
      applyNormalMap ? fetchBlobUrl(getNormalMapURL(mat.collectionName, newMaterials, mat.materialCode)) : Promise.resolve(null),
      applySheenMap ? (() => { const u = getSheenMapUrl(mat.materialType); return u ? fetchBlobUrl(u) : Promise.resolve(null) })() : Promise.resolve(null),
    ])
    const uvScale = getUvValue(mat.collectionName,mat.materialCode)
    const roughness = getRoughnessValue(mat.materialType, mat.collectionName, mat.roughness)
    await applyTextureToModel(mv, {
      baseBlobUrl,
      roughness,
      metalness: mat.metalness,
      uvScale,
      rotation: currentProduct.uvRotation ?? 0,
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
    // Applying to "All" repaints every fabric mesh, so it supersedes any earlier part overrides
    if (currSelectedPartForFinish === 'All') {
      setBaseMaterial(mat)
      setPartOverrides({})
    } else {
      setPartOverrides((prev) => ({ ...prev, [currSelectedPartForFinish]: mat }))
    }
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
    setBaseMaterial(null)
    setPartOverrides({})
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
          id="tour-material-selector"
          selectedId={selected?.id ?? null}
          onSelect={(mat) => { setSelected(mat); if (modelLoaded) applyTexture(mat) }}
          selectedPart={currSelectedPartForFinish}
          onPartChange={setCurrSelectedPartForFinish}
          availableMeshNames={meshNames}
          onToast={showToast}
          disabled={isApplying}
        />

        {/* ── RIGHT: 3D Viewport ── */}
        <div className="flex-1 flex flex-col bg-stone-50 rounded-none shadow-sm border border-stone-200 overflow-hidden relative">

          {/* Viewport title bar */}
          <div className="h-12 shrink-0 bg-white border-b border-stone-200/80 flex items-center px-4 gap-4 z-10 relative">
            <button
              id="tour-change-product"
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

            {mobileNumber.length === 10 && isVerified(mobileNumber.replace(/\D/g, '').slice(0, 10)) && (
              <button
                onClick={() => setShowGalleryPanel(true)}
                className="flex items-center gap-2 h-8 px-4 border border-primary text-primary hover:bg-stone-50 transition-all rounded-none shrink-0 shadow-sm"
                title="My Gallery"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16l5-5a2 2 0 012.83 0L16 16m-2-2l1.17-1.17a2 2 0 012.83 0L21 16M8.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span className="hidden lg:inline text-[11px] tracking-[0.1em] uppercase font-bold">My Gallery</span>
              </button>
            )}
          </div>

          {/* model-viewer fills remaining space */}
          <div id="tour-3d-canvas" className="flex-1 relative bg-stone-50">

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
              ios-src={currentProduct.ios_model_url}
              alt={`${currentProduct.product_name} 3D model`}
              camera-controls
              disable-pan
              tone-mapping="commerce"
              exposure="0.4"
              environment-image="neutral"
              shadow-intensity="0.6"
              shadow-softness="1"
              max-camera-orbit="Infinity 90deg auto"
              camera-orbit="auto auto 4m"
              ar
              ar-modes="scene-viewer webxr"
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
                        <CachedThumbImg
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

            {/* Selected fabric info */}
            {modelLoaded && !isApplying && (baseMaterial || Object.keys(partOverrides).length > 0) && (
              <div className="absolute top-5 left-5 bg-white/85 backdrop-blur-sm border border-stone-200 shadow-sm px-2.5 py-2 pointer-events-none flex flex-col gap-1 rounded-none max-w-[180px]">
                {baseMaterial && (
                  <div className="flex items-center gap-1.5">
                    <img
                      src={baseMaterial.textureUrl}
                      alt=""
                      className="w-4 h-4 rounded-none object-cover border border-stone-200 shrink-0"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    <span className="text-[9px] color-secondary-dark/70 tracking-wide truncate">
                      {Object.keys(partOverrides).length > 0 ? `All · ${baseMaterial.fabricName}` : baseMaterial.fabricName}
                    </span>
                  </div>
                )}
                {Object.entries(partOverrides).map(([part, mat]) => (
                  <div key={part} className="flex items-center gap-1.5">
                    <img
                      src={mat.textureUrl}
                      alt=""
                      className="w-4 h-4 rounded-none object-cover border border-stone-200 shrink-0"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    <span className="text-[9px] color-secondary-dark/70 tracking-wide truncate">{part} · {mat.fabricName}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-[10px] color-secondary-dark/40 tracking-wider select-none font-medium">
                For visualization only · Actual product may vary
              </span>
            </div>

            {/* Visualize with AI */}
            <button
              id="tour-visualize-ai"
              onClick={handleVisualizeWithAI}
              disabled={!selected || !modelLoaded || isApplying}
              className="absolute bottom-6 right-6 z-20 flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 color-secondary-dark transition-all rounded-none shadow-xl disabled:opacity-40 disabled:pointer-events-none"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[11px] tracking-[0.1em] uppercase font-bold">Visualize with AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Visualize: Lead Form / Generating Modal ── */}
      {showLeadForm && (
        <LeadFormModal
          isGenerating={isGenerating}
          generateError={generateError}
          cyclingMsg={cyclingMsg}
          mobileNumber={mobileNumber}
          setMobileNumber={setMobileNumber}
          mobileError={mobileError}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          leadStep={leadStep}
          dailyLimit={limitInfo?.limit ?? DEFAULT_GENERATION_LIMIT}
          isKnownVerifiedNumber={mobileNumber.length === 10 && isVerified(mobileNumber.replace(/\D/g, '').slice(0, 10))}
          otpValidationEnabled={OTP_VALIDATION_ENABLED}
          sendingOtp={sendingOtp}
          verifyingOtp={verifyingOtp}
          otpError={otpError}
          onClose={closeLeadForm}
          onDismissError={() => { setGenerateError(null); closeLeadForm() }}
          onSendOtp={handleSendOtp}
          onVerifyOtp={handleVerifyOtp}
          onChangeMobile={handleChangeMobile}
        />
      )}

      {/* ── AI Visualize: Result ── */}
      <GeneratedImageModal
        open={showImageModal && !!generatedImage}
        imgZoom={imgZoom}
        setImgZoom={setImgZoom}
        cachedImageUrl={generatedImage}
        isWatermarking={false}
        stampSuccess
        infoSlot={selected && (
          <div className="flex items-center gap-3">
            <img src={selected.textureUrl} className="w-9 h-9 object-cover border border-white/20 shadow-sm" alt="" />
            <div>
              <p className="text-[10px] color-secondary-dark uppercase tracking-widest">Fabric Applied</p>
              <p className="text-xs font-bold text-white truncate max-w-[180px]">{selected.fabricName}</p>
            </div>
          </div>
        )}
        onClose={() => { setShowImageModal(false); setImgZoom(1) }}
        onDownload={handleDownload}
      />

      {/* ── My Gallery Panel ── */}
      {showGalleryPanel && (
        <MyGalleryPanel
          mobileNumber={mobileNumber.replace(/\D/g, '').slice(0, 10)}
          onClose={() => setShowGalleryPanel(false)}
        />
      )}

      {/* ── Onboarding Tour ── */}
      <TourGuide
        tourId="3d-visualizer"
        steps={TOUR_STEPS}
        active={showTour}
        onFinish={() => setShowTour(false)}
      />
    </>
  )
}

export default ThreeDVisualizerEngine
