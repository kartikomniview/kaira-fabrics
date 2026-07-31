import { useEffect, useRef } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { renderOverlayToCanvas, type MaterialBadgeInfo } from '../aivisualizer/generateRender'

const LOGO_URL = '/images/kaira.webp'

interface GeneratedImageModalProps {
  open: boolean
  imgZoom: number
  setImgZoom: Dispatch<SetStateAction<number>>
  cachedImageUrl: string | null
  isWatermarking: boolean
  stampSuccess: boolean
  materialInfo?: MaterialBadgeInfo | null
  /** Optional content (e.g. product/collection meta) rendered to the left of the Download button. */
  infoSlot?: ReactNode
  onClose: () => void
  onDownload: () => void
}

const GeneratedImageModal = ({
  open,
  imgZoom,
  setImgZoom,
  cachedImageUrl,
  isWatermarking,
  stampSuccess,
  materialInfo,
  infoSlot,
  onClose,
  onDownload,
}: GeneratedImageModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (stampSuccess || !cachedImageUrl || !canvasRef.current) return
    renderOverlayToCanvas(canvasRef.current, cachedImageUrl, LOGO_URL, materialInfo ?? undefined)
      .catch((err) => console.error('Failed to render overlay to canvas:', err))
  }, [stampSuccess, cachedImageUrl, materialInfo])

  const handleDownloadClick = () => {
    const canvas = canvasRef.current
    if (stampSuccess || !canvas) {
      onDownload()
      return
    }
    try {
      canvas.toBlob((blob) => {
        if (!blob) { onDownload(); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'kaira-render.jpg'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.95)
    } catch {
      // Canvas is CORS-tainted (source lacks Access-Control-Allow-Origin) — fall back to raw hotlink.
      onDownload()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-secondary-dark/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl flex flex-col">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white shadow-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
        >
          <svg className="w-5 h-5 color-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div
          className="overflow-hidden shadow-2xl border border-white/10 bg-secondary-dark flex items-center justify-center relative min-h-[300px]"
          style={{ maxHeight: '75vh' }}
          onWheel={(e) => {
            e.preventDefault()
            if (cachedImageUrl) setImgZoom(z => Math.min(4, Math.max(1, z - e.deltaY * 0.001)))
          }}
        >
          {isWatermarking ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-stone-600 border-t-white animate-spin" />
              <span className="text-white text-xs uppercase tracking-widest">Loading Image...</span>
            </div>
          ) : cachedImageUrl ? (
            <div
              className="relative transition-transform duration-150 flex items-center justify-center"
              style={{
                maxHeight: '75vh',
                width: '100%',
                transform: `scale(${imgZoom})`,
                transformOrigin: 'center center',
                cursor: imgZoom > 1 ? 'zoom-out' : 'zoom-in',
              }}
              onClick={() => setImgZoom(z => z > 1 ? 1 : 2)}
            >
              {stampSuccess ? (
                <img
                  src={cachedImageUrl}
                  alt="Generated render"
                  className="object-contain h-full w-full max-h-[75vh]"
                />
              ) : (
                // Overlay isn't baked into cachedImageUrl yet — draw it live so the
                // preview matches exactly what Download exports (see renderOverlayToCanvas).
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label="Generated render"
                  className="object-contain h-full w-full max-h-[75vh]"
                />
              )}
            </div>
          ) : null}
        </div>

        {cachedImageUrl && !isWatermarking && (
          <>
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-secondary-dark/80 backdrop-blur p-1 border border-white/10">
              <button
                onClick={() => setImgZoom(z => Math.max(1, +(z - 0.5).toFixed(1)))}
                disabled={imgZoom <= 1}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors text-lg leading-none"
                title="Zoom out"
              >−</button>
              <span className="text-[11px] font-mono w-10 text-center select-none text-white">{Math.round(imgZoom * 100)}%</span>
              <button
                onClick={() => setImgZoom(z => Math.min(4, +(z + 0.5).toFixed(1)))}
                disabled={imgZoom >= 4}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors text-lg leading-none"
                title="Zoom in"
              >+</button>
              {imgZoom > 1 && (
                <button
                  onClick={() => setImgZoom(1)}
                  className="w-7 h-7 flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors ml-0.5 text-stone-400"
                  title="Reset zoom"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16M4 20L20 4" /></svg>
                </button>
              )}
            </div>

            <div className={`mt-4 flex items-center gap-4 ${infoSlot ? 'justify-between' : 'justify-end'}`}>
              {infoSlot}
              <button
                onClick={handleDownloadClick}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-stone-100 color-secondary-dark text-[11px] uppercase font-bold tracking-widest hover:bg-white transition-colors shadow-lg rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default GeneratedImageModal
