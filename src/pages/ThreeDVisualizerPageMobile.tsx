import { useEffect, useRef, useState } from 'react'
import { useMaterials } from '../contexts/MaterialsContext'
import { kairaProducts } from '../data/products'
import type { KairaProduct } from '../data/products'
import {
  fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS,
  getRoughnessMapURL, getNormalMapURL, getSheenMapUrl, getUvValue, getRoughnessValue,
} from '../utils/textureUtils'
import * as THREE from 'three'
import MaterialSelector, { type SelectedMaterial, S3_THUMB } from './threedvisualizer/MaterialSelector'

const ThreeDVisualizerPageMobile = ({ embedded = false }: { embedded?: boolean }) => {
  const { newMaterials } = useMaterials()
  const mvRef = useRef<HTMLElement>(null)
  const fabricMeshesRef = useRef<any[]>([])
  const autoAppliedRef = useRef(false)
  const [selected, setSelected] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<KairaProduct>(kairaProducts[0])
  const [productPanelOpen, setProductPanelOpen] = useState(false)
  const [quotationOpen, setQuotationOpen] = useState(false)
  const [currSelectedPartForFinish, setCurrSelectedPartForFinish] = useState('All')
  const [meshNames, setMeshNames] = useState<string[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const addDebugLog = (log: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${log}`])
  }

  // Keep track of active blob URLs so GLTFExporter can fetch them for AR
  const activeBlobUrlsRef = useRef<string[]>([])

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
    // Cleanup previous blob URLs
    activeBlobUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    
    // Store new active blob URLs
    const newBlobs: string[] = []
    if (baseBlobUrl) newBlobs.push(baseBlobUrl)
    if (roughnessBlobUrl) newBlobs.push(roughnessBlobUrl)
    if (normalBlobUrl) newBlobs.push(normalBlobUrl)
    if (sheenBlobUrl) newBlobs.push(sheenBlobUrl)
    activeBlobUrlsRef.current = newBlobs
    
    addDebugLog(`Textures applied (Blobs: ${newBlobs.length})`)

    // Trick model-viewer into knowing the model is dirty for AR export
    try {
      if (mv.model?.materials?.[0]) {
        const m = mv.model.materials[0]
        const c = m.pbrMetallicRoughness.baseColorFactor
        // Change a value slightly to bypass equality check and force dirty flag
        m.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], c[3] === 1 ? 0.99 : 1])
      }
    } catch (e) {}

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
      addDebugLog(`Model loaded, ${fabricMeshesRef.current.length} fabric meshes found.`)
    }
    mv.addEventListener('load', onLoad)
    return () => {
      mv.removeEventListener('load', onLoad)
      activeBlobUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    if (modelLoaded && selected) applyTexture(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelLoaded])

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
    <div
      className="flex flex-col overflow-hidden bg-stone-100"
      style={embedded ? { height: '100%' } : { height: 'calc(100dvh - 64px)', marginTop: '64px' }}
    >
      {/* ── Toolbar ── */}
      <div className="h-10 shrink-0 bg-white border-b border-stone-200 flex items-center px-3 gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 select-none">
          <div className="w-1.5 h-1.5 bg-secondary" />
          <span className="text-[10px] text-stone-700 tracking-widest uppercase font-medium">3D Fabric Studio</span>
        </div>

        <div className="flex-1" />

        {selected && (
          <div className="flex items-center gap-1.5 max-w-[130px]">
            <img
              src={selected.textureUrl}
              alt=""
              className="w-4 h-4 object-cover border border-stone-200 shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-[9px] text-stone-500 truncate">{selected.fabricName}</span>
            {isApplying && (
              <div className="w-3 h-3 border border-secondary/40 border-t-secondary animate-spin shrink-0" />
            )}
          </div>
        )}

        <div className="flex items-center gap-1 ml-2">
          <div className={`w-1.5 h-1.5 transition-colors ${modelLoaded ? 'bg-emerald-500' : 'bg-stone-300 animate-pulse'}`} />
          <span className="text-[9px] text-stone-400">{modelLoaded ? 'Ready' : 'Loading'}</span>
        </div>
      </div>

      {/* ── Dynamic split ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">

        {/* ── 3D Viewport ── */}
        <div className="relative bg-white min-h-0" style={{ flex: '45 1 0%' }}>
          {/* @ts-ignore */}
          <model-viewer
            ref={mvRef as any}
            src={modelUrl}
            alt={`${currentProduct.product_name} 3D model`}
            camera-controls
            disable-pan
            tone-mapping="commerce"
            exposure="0.7"
            shadow-intensity="0.6"
            shadow-softness="1"
            max-camera-orbit="Infinity 90deg auto"
            camera-orbit="auto auto 4m"
            ar
            ar-modes="scene-viewer quick-look"
            style={{ width: '100%', height: '100%', background: '#ffffff', touchAction: 'manipulation' }}
          >
            {/* Custom AR button */}
            <button
              slot="ar-button"
              onClick={async (e) => {
                const mv = mvRef.current as any
                if (!mv) return
                addDebugLog("AR Button Clicked.")
                try {
                  addDebugLog("Testing manual exportScene()...")
                  const gltf = await mv.exportScene()
                  addDebugLog(`exportScene Success! Blob size: ${gltf ? gltf.size || gltf.byteLength : 0}`)
                } catch (err: any) {
                  addDebugLog(`exportScene ERROR: ${err?.message || err}`)
                }
              }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-2 bg-secondary text-white font-semibold text-[11px] uppercase tracking-wider px-5 py-3 shadow-lg active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              View in your space
            </button>
          </model-viewer>

          {/* Change Product button */}
          <button
            onClick={() => setProductPanelOpen(true)}
            style={{ touchAction: 'manipulation' }}
            className="absolute top-3 left-3 z-10 flex items-center gap-1 pl-2 pr-2.5 min-h-[28px] bg-secondary hover:bg-[#b8943f] text-white shadow-sm transition-all active:scale-95"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[10px] font-semibold tracking-wide truncate max-w-[90px]">{currentProduct.product_name}</span>
          </button>



          {/* Toast */}
          <div className={`absolute top-14 right-3 z-20 pointer-events-none transition-all duration-300 ease-out ${toastVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
            {toast && (
              <div className={`flex items-center gap-2 px-3 py-2 shadow-2xl whitespace-nowrap border-l-4 ${toast.type === 'success' ? 'bg-stone-900 border-emerald-400' : 'bg-stone-900 border-red-400'}`}>
                {toast.type === 'success' ? (
                  <svg className="w-3 h-3 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-3 h-3 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">{toast.msg}</span>
              </div>
            )}
          </div>

          {/* Debug Overlay */}
          <div className="absolute top-16 left-3 right-3 z-20 pointer-events-none">
            <div className="bg-black/80 backdrop-blur text-green-400 text-[9px] p-2 font-mono h-32 overflow-y-auto rounded shadow-xl pointer-events-auto">
              <div className="flex justify-between items-center mb-1 border-b border-green-400/30 pb-1">
                <span className="font-bold text-white uppercase tracking-widest">AR Debugger</span>
                <button onClick={() => setDebugLogs([])} className="text-white bg-white/20 px-1 rounded hover:bg-white/40">Clear</button>
              </div>
              {debugLogs.length === 0 ? <span className="text-stone-400 opacity-50">Waiting for actions...</span> : null}
              {debugLogs.map((log, i) => (
                <div key={i} className="mb-0.5 break-words whitespace-pre-wrap">{log}</div>
              ))}
            </div>
          </div>

          {/* Corner bracket decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-secondary/30 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-secondary/30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-secondary/30 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-secondary/30 pointer-events-none" />

          {/* Product panel backdrop */}
          <div
            className={`absolute inset-0 z-20 bg-black/25 transition-opacity duration-300 ${productPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setProductPanelOpen(false)}
          />

          {/* Product panel */}
          <div
            className={`absolute inset-y-0 left-0 z-30 w-56 flex flex-col bg-white border-r border-stone-200 shadow-2xl transition-transform duration-300 ease-out ${productPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="h-10 shrink-0 bg-stone-50 border-b border-stone-200 flex items-center px-3 justify-between">
              <p className="text-[10px] text-stone-600 font-semibold uppercase tracking-widest">Products</p>
              <button
                onClick={() => setProductPanelOpen(false)}
                style={{ touchAction: 'manipulation' }}
                className="w-10 h-10 flex items-center justify-center hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {kairaProducts.map((p) => {
                const isActive = currentProduct.id === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => { setCurrentProduct(p); setProductPanelOpen(false); setCurrSelectedPartForFinish('All') }}
                    style={{ touchAction: 'manipulation' }}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-all border-l-2 active:bg-stone-100 ${isActive ? 'bg-secondary/10 border-l-secondary' : 'hover:bg-stone-50 border-l-transparent'}`}
                  >
                    <div className="w-14 h-14 p-1 shrink-0 overflow-hidden border border-stone-200 bg-stone-100">
                      <img
                        src={p.model_url}
                        alt={p.product_name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-[10px] font-semibold uppercase tracking-tight truncate ${isActive ? 'text-secondary' : 'text-stone-700'}`}>{p.product_name}</p>
                    </div>
                    {isActive && (
                      <div className="w-3.5 h-3.5 bg-secondary flex items-center justify-center shrink-0">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Model loading overlay */}
          {!modelLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 pointer-events-none">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-secondary animate-spin mb-3" />
              <p className="text-stone-400 text-[10px] tracking-[0.2em] uppercase">Loading 3D Model</p>
              <p className="text-stone-300 text-[9px] mt-1">{currentProduct.product_name}</p>
            </div>
          )}

          {/* Texture applying overlay */}
          {isApplying && modelLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10 pointer-events-none">
              <div className="bg-white border border-stone-200 px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                <div className="w-4 h-4 border-2 border-stone-200 border-t-secondary animate-spin" />
                <span className="text-stone-500 text-[10px] tracking-[0.15em] uppercase">Applying…</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Materials Panel ── */}
        <div className="min-h-0" style={{ flex: '55 1 0%' }}>
          <MaterialSelector
            selectedId={selected?.id ?? null}
            onSelect={(mat) => { setSelected(mat); if (modelLoaded) applyTexture(mat) }}
            selectedPart={currSelectedPartForFinish}
            onPartChange={setCurrSelectedPartForFinish}
            availableMeshNames={meshNames}
            onToast={showToast}
            className="w-full h-full flex flex-col overflow-hidden bg-white border-t-2 border-stone-200"
          />
        </div>
      </div>

      {/* ── Quotation Modal (bottom sheet) ── */}
      {quotationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setQuotationOpen(false) }}
        >
          <div
            className="bg-white shadow-2xl w-full max-w-lg overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-1 bg-stone-200" />
            </div>

            <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-secondary uppercase tracking-widest font-semibold">Contact Us</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">Get a Quotation</p>
              </div>
              <button
                onClick={() => setQuotationOpen(false)}
                style={{ touchAction: 'manipulation' }}
                className="w-10 h-10 flex items-center justify-center hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selected && (
              <div className="px-4 py-2.5 bg-secondary/5 border-b border-secondary/15 flex items-center gap-3">
                <img
                  src={selected.textureUrl}
                  alt={selected.fabricName}
                  className="w-9 h-9 object-cover border border-stone-200 shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-stone-700 truncate">{selected.fabricName}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">on {currentProduct.product_name} · {selected.materialType}</p>
                </div>
              </div>
            )}

            <form
              className="px-4 py-3.5 space-y-3"
              onSubmit={(e) => { e.preventDefault(); setQuotationOpen(false) }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    autoComplete="name"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    autoComplete="tel"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Email *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 font-medium mb-1.5 uppercase tracking-wide">Message</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your requirements…"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-[12px] px-3 py-2.5 focus:outline-none focus:border-secondary/60 transition-colors placeholder-stone-300 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuotationOpen(false)}
                  style={{ touchAction: 'manipulation' }}
                  className="flex-1 py-3 border border-stone-200 hover:bg-stone-50 text-stone-500 text-[12px] font-medium transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ touchAction: 'manipulation' }}
                  className="flex-1 py-3 bg-secondary hover:bg-[#b8943f] text-white text-[12px] font-semibold transition-colors shadow-sm active:scale-95"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThreeDVisualizerPageMobile
