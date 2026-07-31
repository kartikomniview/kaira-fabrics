import { useState, useEffect, useCallback } from 'react'
import { overlayLogo, type MaterialBadgeInfo } from './generateRender'
import GeneratedImageModal from '../admin/GeneratedImageModal'

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'
const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'

interface VisualizerLogRow {
  id: string
  mobile_number?: string
  name?: string
  output_url?: string
  collection_name?: string
  material_code?: string
  product_name?: string
  status: string
  created_at: string
}

interface MyGalleryPanelProps {
  /** Already cleaned to digits-only, max 10 chars. */
  mobileNumber: string
  onClose: () => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

const MyGalleryPanel = ({ mobileNumber, onClose }: MyGalleryPanelProps) => {
  const [logs, setLogs] = useState<VisualizerLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [brandedImages, setBrandedImages] = useState<Record<string, string>>({})
  const [brandingFailed, setBrandingFailed] = useState<Record<string, true>>({})

  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const [imgZoom, setImgZoom] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/visualizer-logs?mobile=${encodeURIComponent(mobileNumber)}`, {
        headers: { 'admin-token': import.meta.env.VITE_ADMIN_TOKEN },
      })
      if (!res.ok) throw new Error(`Request failed — ${res.status} ${res.statusText}`)
      const json = await res.json()
      const rows: VisualizerLogRow[] = Array.isArray(json) ? json : (json.data ?? json.items ?? json.logs ?? [])
      const myRows = rows
        .filter(r => r.status === 'success' && r.mobile_number === mobileNumber && !!r.output_url)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setLogs(myRows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your gallery.')
    } finally {
      setLoading(false)
    }
  }, [mobileNumber])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Brand each raw output_url (logo + collection/material badge + AI-generated
  // watermark) once, lazily.
  useEffect(() => {
    let cancelled = false
    logs.forEach((log) => {
      if (!log.output_url || brandedImages[log.id] || brandingFailed[log.id]) return
      const materialInfo: MaterialBadgeInfo | undefined = log.collection_name
        ? {
            collectionName: log.collection_name,
            materialCode: log.material_code,
            thumbnailUrl: `${S3_THUMB}/${log.collection_name}/${log.material_code ?? ''}.webp`,
          }
        : undefined
      overlayLogo(log.output_url, '/images/kaira.webp', materialInfo)
        .then((dataUrl) => { if (!cancelled) setBrandedImages(prev => ({ ...prev, [log.id]: dataUrl })) })
        .catch(() => { if (!cancelled) setBrandingFailed(prev => ({ ...prev, [log.id]: true })) })
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs])

  const lightboxLog = logs.find(l => l.id === lightboxId) ?? null
  const lightboxSrc = lightboxLog ? (brandedImages[lightboxLog.id] ?? lightboxLog.output_url ?? null) : null
  const lightboxStampSuccess = !!(lightboxLog && brandedImages[lightboxLog.id])
  const lightboxMaterialInfo: MaterialBadgeInfo | null = lightboxLog?.collection_name
    ? {
        collectionName: lightboxLog.collection_name,
        materialCode: lightboxLog.material_code,
        thumbnailUrl: `${S3_THUMB}/${lightboxLog.collection_name}/${lightboxLog.material_code ?? ''}.webp`,
      }
    : null

  const handleDownload = async () => {
    if (!lightboxSrc) return
    try {
      const res = await fetch(lightboxSrc)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'kaira-render.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(lightboxSrc, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 mt-16 lg:mt-20">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[85vh] sm:h-[80vh] bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="shrink-0 bg-white/70 backdrop-blur border-b border-stone-100 px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-base font-bold tracking-widest uppercase text-secondary">My Gallery</h1>
            <p className="text-[11px] color-secondary-dark uppercase tracking-widest mt-0.5">
              {loading ? 'Loading…' : `${logs.length} generation${logs.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
          >
            <svg className="w-4 h-4 color-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-4">
              <span>{error}</span>
              <button
                onClick={fetchLogs}
                className="shrink-0 px-3 py-1.5 border border-red-300 text-[10px] uppercase font-bold tracking-widest hover:bg-red-100 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-16">
              <p className="text-sm font-semibold color-secondary-dark uppercase tracking-widest">No generations yet</p>
              <p className="text-[11px] color-secondary-dark max-w-xs">
                Create your first AI render to see it here.
              </p>
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {logs.map((log) => {
                const thumbSrc = brandedImages[log.id] ?? log.output_url
                return (
                  <button
                    key={log.id}
                    onClick={() => { setLightboxId(log.id); setImgZoom(1) }}
                    className="group relative aspect-square overflow-hidden border border-stone-200 bg-stone-50 text-left"
                  >
                    {thumbSrc && (
                      <img
                        src={thumbSrc}
                        alt={log.product_name ?? 'Generated render'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent p-2 pt-6">
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">
                        {log.product_name ?? 'NA'}
                      </p>
                      <p className="text-[9px] text-white/70 uppercase tracking-widest truncate">
                        {[log.collection_name, log.material_code].filter(Boolean).join(' · ') || 'NA'}
                      </p>
                      <p className="text-[9px] text-white/50 mt-0.5">{formatDate(log.created_at)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      <GeneratedImageModal
        open={!!lightboxLog}
        imgZoom={imgZoom}
        setImgZoom={setImgZoom}
        cachedImageUrl={lightboxSrc}
        isWatermarking={false}
        stampSuccess={lightboxStampSuccess}
        materialInfo={lightboxMaterialInfo}
        infoSlot={lightboxLog && (
          <div>
            <p className="text-[10px] color-secondary-dark uppercase tracking-widest">
              {[lightboxLog.collection_name, lightboxLog.material_code].filter(Boolean).join(' · ') || 'NA'}
            </p>
            <p className="text-xs font-bold text-white truncate max-w-[220px]">{lightboxLog.product_name ?? 'NA'}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{formatDate(lightboxLog.created_at)}</p>
          </div>
        )}
        onClose={() => { setLightboxId(null); setImgZoom(1) }}
        onDownload={handleDownload}
      />
    </div>
  )
}

export default MyGalleryPanel
