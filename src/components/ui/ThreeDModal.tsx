import { useEffect, useRef, useState } from 'react'
import InlineLoader from './InlineLoader'
import { fetchBlobUrl, applyTextureToModel, NO_FABRIC_PARTS } from '../../utils/textureUtils'
// model-viewer is loaded via CDN script in index.html

const MODEL_URL = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/models/OVL/Sofa/SetSofas/Linda.glb'

interface ThreeDModalProps {
  fabricName: string
  textureUrl: string
  roughness: number
  metalness: number
  onClose: () => void
}

const ThreeDModal = ({ fabricName, textureUrl, roughness, metalness, onClose }: ThreeDModalProps) => {
  const mvRef = useRef<HTMLElement>(null)
  const [isTextureLoading, setIsTextureLoading] = useState(true)

  // Apply the fabric texture once the model finishes loading
  useEffect(() => {
    const mv = mvRef.current as any
    if (!mv) return

    const applyTexture = async () => {
      setIsTextureLoading(true)
      try {
        const baseBlobUrl = await fetchBlobUrl(textureUrl)
        await applyTextureToModel(mv, { baseBlobUrl, roughness, metalness, skipParts: NO_FABRIC_PARTS })
        if (baseBlobUrl) URL.revokeObjectURL(baseBlobUrl)
      } catch {
        // texture apply failed silently — model still visible
      } finally {
        setIsTextureLoading(false)
      }
    }

    mv.addEventListener('load', applyTexture)
    return () => mv.removeEventListener('load', applyTexture)
  }, [textureUrl, roughness, metalness])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">3D Preview</p>
            <p className="text-sm font-bold text-stone-800 uppercase tracking-tight leading-tight mt-0.5">{fabricName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* model-viewer */}
        <div className="bg-stone-100 w-full relative h-[350px] sm:h-[420px] md:h-[480px]">
          {isTextureLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
              <InlineLoader color="secondary" />
              <p className="mt-2 text-[10px] font-medium text-stone-500 uppercase tracking-widest animate-pulse">
                Applying Texture...
              </p>
            </div>
          )}
          <model-viewer
            ref={mvRef as any}
            src={MODEL_URL}
            alt={`${fabricName} fabric on 3D sofa model`}
            camera-controls
            auto-rotate
            shadow-intensity="1"
            exposure="0.9"
            environment-image="neutral"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Fabric swatch + info */}
        <div className="flex items-center gap-4 px-5 py-4 border-t border-stone-200 shrink-0">
          <img
            src={textureUrl}
            alt={fabricName}
            className="w-12 h-12 rounded-md object-cover border border-stone-200 shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <p className="text-[11px] font-bold text-stone-800 uppercase tracking-tight">{fabricName}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Texture applied · Roughness {roughness.toFixed(1)} · Metalness {metalness.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeDModal
