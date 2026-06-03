import { useState, useEffect, useCallback } from 'react'

interface DeviceInfo {
  browser?: { name?: string; version?: string }
  os?: { name?: string; version?: string }
  device?: { type?: string; vendor?: string; model?: string }
  screen?: { width?: number; height?: number }
  language?: string
}

interface VisualizerLog {
  id?: string
  name?: string
  mobile_number?: string
  output_url?: string
  device_info?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

function parseDeviceInfo(raw?: string): DeviceInfo | null {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() ?? ''
  const styles =
    s === 'success' || s === 'completed'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : s === 'failed' || s === 'error'
        ? 'bg-red-50 border-red-200 text-red-700'
        : s === 'pending' || s === 'processing'
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-stone-100 border-stone-200 text-stone-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
      {status ?? '—'}
    </span>
  )
}

function DeviceInfoCell({ raw }: { raw?: string }) {
  const [open, setOpen] = useState(false)
  const info = parseDeviceInfo(raw)
  if (!info) return <span className="text-stone-300">—</span>

  const summary = [
    info.browser?.name,
    info.os?.name,
    info.device?.type !== 'desktop' && info.device?.type ? info.device.type : null,
  ].filter(Boolean).join(' · ') || 'Unknown'

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-stone-600 hover:color-secondary-dark transition-colors text-xs"
      >
        <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="truncate max-w-[120px]">{summary}</span>
        <svg className={`w-3 h-3 text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-600 space-y-1 min-w-[220px]">
          {info.browser?.name && <div><span className="text-stone-400 font-medium">Browser: </span>{info.browser.name} {info.browser.version}</div>}
          {info.os?.name && <div><span className="text-stone-400 font-medium">OS: </span>{info.os.name} {info.os.version}</div>}
          {info.device?.type && <div><span className="text-stone-400 font-medium">Device: </span>{info.device.type}{info.device.vendor ? ` · ${info.device.vendor}` : ''}{info.device.model ? ` ${info.device.model}` : ''}</div>}
          {info.screen && <div><span className="text-stone-400 font-medium">Screen: </span>{info.screen.width}×{info.screen.height}</div>}
          {info.language && <div><span className="text-stone-400 font-medium">Language: </span>{info.language}</div>}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE = 20

const VisualizerLogsPanel = () => {
  const [logs, setLogs] = useState<VisualizerLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [showImageModal, setShowImageModal] = useState(false)
  const [imgZoom, setImgZoom] = useState(1)
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null)
  const [isWatermarking, setIsWatermarking] = useState(false)
  const [stampSuccess, setStampSuccess] = useState(false)

  const handleViewOutput = async (url: string) => {
    setShowImageModal(true)
    setIsWatermarking(true)
    setCachedImageUrl(null)
    setStampSuccess(false)
    setImgZoom(1)

    try {
      const mainImg = new Image()
      mainImg.crossOrigin = 'anonymous'

      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'

      await Promise.all([
        new Promise((resolve, reject) => {
          mainImg.onload = resolve;
          mainImg.onerror = reject;
          mainImg.src = url.includes('?') ? `${url}&v=${Date.now()}` : `${url}?v=${Date.now()}`
        }),
        new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = `https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/kaira.webp?v=${Date.now()}`
        })
      ])

      const canvas = document.createElement('canvas')
      canvas.width = mainImg.width
      canvas.height = mainImg.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(mainImg, 0, 0)

        // Increase logo size (30% of canvas width)
        const logoWidth = canvas.width * 0.20
        const logoRatio = logoImg.height / logoImg.width
        const logoHeight = logoWidth * logoRatio

        // Bottom right positioning
        const padding = canvas.width * 0.02
        const x = canvas.width - logoWidth - padding
        const y = canvas.height - logoHeight - padding

        ctx.drawImage(logoImg, x, y, logoWidth, logoHeight)

        await new Promise<void>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              setCachedImageUrl(URL.createObjectURL(blob))
              setStampSuccess(true)
              resolve()
            } else {
              reject(new Error('Canvas toBlob failed'))
            }
          }, 'image/jpeg', 0.95)
        })
      }
    } catch (err) {
      console.error('Failed to stamp image to cache:', err)
      // Fallback to raw hotlink
      setCachedImageUrl(url)
      setStampSuccess(false)
    } finally {
      setIsWatermarking(false)
    }
  }

  const handleDownload = async () => {
    if (!cachedImageUrl) return
    try {
      const res = await fetch(cachedImageUrl)
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
      window.open(cachedImageUrl, '_blank')
    }
  }

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/visualizer-logs`, {
        headers: { 'admin-token': token },
      })
      console.log(token, `${API}/visualizer-logs`)
      if (!res.ok) throw new Error(`Request failed — ${res.status} ${res.statusText}`)
      const json = await res.json()
      const rows: VisualizerLog[] = Array.isArray(json)
        ? json
        : (json.data ?? json.items ?? json.logs ?? [])
        console.log('Fetched logs:', rows)
      setLogs(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filtered = logs
    .filter((l) => {
      const q = search.toLowerCase()
      return !q || l.mobile_number?.toLowerCase().includes(q) || l.name?.toLowerCase().includes(q) || l.status?.toLowerCase().includes(q) || l.id?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return tb - ta
    })

  const visible = filtered.slice(0, visibleCount)

  return (
    <div>
      {/* Panel heading */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="hidden sm:block">
          <h1 className="font-serif text-2xl color-secondary-dark">Visualizer Logs</h1>
          <p className="text-stone-400 text-sm mt-1">
            {loading ? 'Loading…' : `${visible.length} of ${filtered.length} record${filtered.length !== 1 ? 's' : ''}${search ? ' found' : ' total'}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <input
            type="search"
            placeholder="Search mobile, status, id…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }}
            className="w-full sm:w-64 border border-stone-300 bg-white rounded px-4 py-2 text-sm color-secondary-dark placeholder:text-stone-400 focus:outline-none focus:border-stone-600 transition-colors"
          />
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary-dark hover:bg-secondary-dark/90 disabled:opacity-50 text-xs uppercase tracking-widest text-stone-200 transition-colors rounded shrink-0 w-full sm:w-auto h-[38px]"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0120 15M19.418 15A8 8 0 014 9" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded p-4">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-700 text-sm font-medium">Failed to fetch visualizer logs</p>
            <p className="text-red-500 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-white rounded border border-stone-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-24 text-stone-400">
          <svg className="w-10 h-10 mx-auto mb-3 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm">{search ? 'No records match your search.' : 'No visualizer logs yet.'}</p>
        </div>
      )}

      {/* Data Display */}
      {!loading && !error && filtered.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-stone-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-secondary-dark text-stone-300 uppercase text-[10px] tracking-widest">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Mobile</th>
                  <th className="px-5 py-3 font-medium">Output</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((l, idx) => (
                  <tr
                    key={l.id ?? idx}
                    className="bg-white even:bg-stone-50 border-t border-stone-100 hover:bg-amber-50/40 transition-colors align-top"
                  >
                    <td className="px-5 py-3 text-stone-400">{idx + 1}</td>
                    <td className="px-5 py-3 color-secondary-dark">{l.name || <span className="text-stone-300">—</span>}</td>
                    <td className="px-5 py-3 font-medium color-secondary-dark">
                      {l.mobile_number ? (
                        <a href={`tel:${l.mobile_number}`} className="hover:text-amber-700 transition-colors">{l.mobile_number}</a>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {l.output_url ? (
                        <button
                          onClick={() => handleViewOutput(l.output_url as string)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors text-xs"
                        >
                          <img
                            src={l.output_url}
                            alt="output"
                            className="w-10 h-10 rounded object-cover border border-stone-200 shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <span className="underline underline-offset-2">View</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      ) : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-5 py-3 text-stone-400 whitespace-nowrap text-xs">
                      {l.created_at
                        ? new Date(l.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="flex flex-col gap-3 lg:hidden mt-2">
            {visible.map((l, idx) => (
              <div
                key={l.id ?? idx}
                className="bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 flex flex-col gap-2.5 relative overflow-hidden"
              >
                {/* Accent border left */}
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary-dark opacity-[0.03]" />

                {/* Header: Avatar, Mobile, Date, Actions */}
                <div className="flex items-start justify-between gap-2 pl-1">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col truncate">
                      {l.name && <span className="text-xs text-stone-500 truncate">{l.name}</span>}
                      <span className="font-semibold color-secondary-dark text-sm truncate">{l.mobile_number || 'Unknown Mobile'}</span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        {l.created_at ? new Date(l.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Top Right: Status */}
                  <div className="shrink-0 pt-0.5">
                    <StatusBadge status={l.status} />
                  </div>
                </div>

                {/* Output Image / Link */}
                {l.output_url && (
                  <div className="bg-stone-50 rounded-lg p-2.5 ml-1 mt-1 border border-stone-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={l.output_url}
                        alt="output"
                        className="w-10 h-10 rounded object-cover border border-stone-200 shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <span className="text-xs text-stone-600 font-medium">Output Generated</span>
                    </div>
                    <button
                      onClick={() => handleViewOutput(l.output_url as string)}
                      className="flex items-center justify-center w-7 h-7 bg-secondary-dark text-stone-100 hover:bg-secondary-dark rounded-md transition-colors shrink-0"
                      aria-label="View Output"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Load More */}
      {!loading && !error && visibleCount < filtered.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            className="px-6 py-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs uppercase tracking-widest rounded transition-colors"
          >
            Load more ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* ── Generated Image Modal ── */}
      {showImageModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-secondary-dark/90 backdrop-blur-md" onClick={() => { setShowImageModal(false); setImgZoom(1) }} />
          <div className="relative w-full max-w-4xl flex flex-col">
            <button
              onClick={() => { setShowImageModal(false); setImgZoom(1) }}
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
                  <img
                    src={cachedImageUrl}
                    alt="Generated render"
                    className="object-contain h-full w-full max-h-[75vh]"
                  />
                  {/* Kaira Logo Overlay (Fallback if canvas stamping fails) */}
                  {!stampSuccess && (
                    <div className="absolute bottom-[4%] right-[4%] pointer-events-none opacity-90">
                      <img
                        src="https://kairafabrics.s3.ap-south-1.amazonaws.com/site/logos/kaira.webp"
                        alt="Kaira Logo"
                        className="w-28 sm:w-40"
                      />
                    </div>
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

                <div className="mt-4 flex items-center justify-end gap-4">
                  <button
                    onClick={handleDownload}
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
      )}

    </div>
  )
}

export default VisualizerLogsPanel
