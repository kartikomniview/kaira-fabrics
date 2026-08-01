import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCachedMedia } from '../../hooks/useCachedMedia'
import GeneratedImageModal from './GeneratedImageModal'
import { overlayLogo, type MaterialBadgeInfo } from '../aivisualizer/generateRender'

// interface DeviceInfo {
//   browser?: { name?: string; version?: string }
//   os?: { name?: string; version?: string }
//   device?: { type?: string; vendor?: string; model?: string }
//   screen?: { width?: number; height?: number }
//   language?: string
// }

interface VisualizerLog {
  id?: string
  name?: string
  mobile_number?: string
  output_url?: string
  device_info?: string
  collection_name?: string
  material_code?: string
  product_name?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'
const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'

// function parseDeviceInfo(raw?: string): DeviceInfo | null {
//   if (!raw) return null
//   try { return JSON.parse(raw) } catch { return null }
// }

/** Thin wrapper that resolves `src` through the shared media cache before mounting the <img>. */
function CachedThumbImg({ src, alt, className, onError }: {
  src: string
  alt: string
  className?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}) {
  const cachedSrc = useCachedMedia(src)
  if (!cachedSrc) return <div className={`${className ?? ''} bg-stone-100 animate-pulse`} />
  return <img src={cachedSrc} alt={alt} className={className} onError={onError} />
}

function StatusBadge({ status, compact = false }: { status?: string; compact?: boolean }) {
  const s = status?.toLowerCase() ?? ''
  const dotColor =
    s === 'success' || s === 'completed'
      ? 'bg-emerald-500'
      : s === 'failed' || s === 'error'
        ? 'bg-red-500'
        : s === 'pending' || s === 'processing'
          ? 'bg-amber-500'
          : 'bg-stone-300'

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wide text-stone-400">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {status ?? '—'}
      </span>
    )
  }

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

const compactFormatter = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })
const formatCount = (n: number) => compactFormatter.format(n)

const TILE_TINTS = {
  stone: 'bg-stone-100 text-stone-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
  teal: 'bg-teal-50 text-teal-600',
} as const

function StatTile({ label, value, sub, icon, tint, onExpand, onToggle, active }: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  tint: keyof typeof TILE_TINTS
  onExpand?: () => void
  onToggle?: () => void
  active?: boolean
}) {
  return (
    <div
      onClick={onToggle}
      onKeyDown={onToggle ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } } : undefined}
      role={onToggle ? 'button' : undefined}
      tabIndex={onToggle ? 0 : undefined}
      className={`flex items-start gap-2 sm:gap-3 min-w-0 -m-2 p-2 rounded-lg transition-colors ${onToggle ? 'cursor-pointer' : ''} ${active ? 'bg-primary/10 ring-1 ring-primary' : onToggle ? 'hover:bg-stone-50' : ''}`}
    >
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${TILE_TINTS[tint]}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-400">
          {label}
          {onExpand && (
            <span
              onClick={(e) => { e.stopPropagation(); onExpand() }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onExpand() } }}
              role="button"
              tabIndex={0}
              className="text-black hover:text-stone-600 cursor-pointer transition-colors p-1.5 -m-1.5"
              aria-label={`View all — ${label}`}
              title={`View all — ${label}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="10" fill="currentColor" />
                <rect x="8.5" y="8.5" width="3" height="6.5" rx="1" fill="white" />
                <rect x="8.5" y="4" width="3" height="3" rx="1" fill="white" />
              </svg>
            </span>
          )}
        </span>
        <span className="text-base sm:text-lg font-semibold color-secondary-dark truncate" title={value}>{value}</span>
        {sub && <span className="text-[11px] text-stone-400 truncate">{sub}</span>}
      </div>
    </div>
  )
}

function BreakdownPanel({ title, subtitle, rows, onClose, renderLabel, onRowClick }: {
  title: string
  subtitle: string
  rows: { value: string; count: number }[]
  onClose: () => void
  renderLabel?: (value: string) => React.ReactNode
  onRowClick?: (value: string) => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 shrink-0">
          <div className="min-w-0">
            <h3 className="text-base font-semibold color-secondary-dark truncate">{title}</h3>
            <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:color-secondary-dark hover:bg-stone-100 rounded-full transition-colors shrink-0"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
          {rows.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-10">No data yet.</p>
          ) : (
            rows.map((r) => (
              <div
                key={r.value}
                onClick={onRowClick ? () => onRowClick(r.value) : undefined}
                className={`flex items-center justify-between gap-3 px-5 py-3 ${onRowClick ? 'cursor-pointer hover:bg-stone-50 transition-colors' : ''}`}
              >
                <span className="text-sm color-secondary-dark truncate min-w-0">
                  {renderLabel ? renderLabel(r.value) : r.value}
                </span>
                <span className="text-sm font-semibold text-stone-500 shrink-0">{formatCount(r.count)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// function DeviceInfoCell({ raw }: { raw?: string }) {
//   const [open, setOpen] = useState(false)
//   const info = parseDeviceInfo(raw)
//   if (!info) return <span className="text-stone-300">—</span>

//   const summary = [
//     info.browser?.name,
//     info.os?.name,
//     info.device?.type !== 'desktop' && info.device?.type ? info.device.type : null,
//   ].filter(Boolean).join(' · ') || 'Unknown'

//   return (
//     <div>
//       <button
//         onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-1.5 text-stone-600 hover:color-secondary-dark transition-colors text-xs"
//       >
//         <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//         </svg>
//         <span className="truncate max-w-[120px]">{summary}</span>
//         <svg className={`w-3 h-3 text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>
//       {open && (
//         <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-600 space-y-1 min-w-[220px]">
//           {info.browser?.name && <div><span className="text-stone-400 font-medium">Browser: </span>{info.browser.name} {info.browser.version}</div>}
//           {info.os?.name && <div><span className="text-stone-400 font-medium">OS: </span>{info.os.name} {info.os.version}</div>}
//           {info.device?.type && <div><span className="text-stone-400 font-medium">Device: </span>{info.device.type}{info.device.vendor ? ` · ${info.device.vendor}` : ''}{info.device.model ? ` ${info.device.model}` : ''}</div>}
//           {info.screen && <div><span className="text-stone-400 font-medium">Screen: </span>{info.screen.width}×{info.screen.height}</div>}
//           {info.language && <div><span className="text-stone-400 font-medium">Language: </span>{info.language}</div>}
//         </div>
//       )}
//     </div>
//   )
// }

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
  const [viewMaterialInfo, setViewMaterialInfo] = useState<MaterialBadgeInfo | null>(null)

  const [deleteLogId, setDeleteLogId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showUsersPanel, setShowUsersPanel] = useState(false)
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null)
  const [materialFilter, setMaterialFilter] = useState<string | null>(null)
  const [showCollectionsPanel, setShowCollectionsPanel] = useState(false)

  const deleteLog = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/visualizer-logs/delete`, {
        method: 'POST',
        headers: { 'admin-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error(`Delete failed — ${res.status} ${res.statusText}`)
      setLogs((prev) => prev.filter((l) => l.id !== id))
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete log.')
    }
  }, [])

  const handleViewOutput = async (log: VisualizerLog) => {
    const url = log.output_url
    if (!url) return

    setShowImageModal(true)
    setIsWatermarking(true)
    setCachedImageUrl(null)
    setStampSuccess(false)
    setImgZoom(1)

    const materialInfo: MaterialBadgeInfo | null = log.collection_name
      ? {
          collectionName: log.collection_name,
          materialCode: log.material_code,
          thumbnailUrl: `${S3_THUMB}/${log.collection_name}/${log.material_code ?? ''}.webp`,
        }
      : null
    setViewMaterialInfo(materialInfo)

    try {
      const bustedUrl = url.includes('?') ? `${url}&v=${Date.now()}` : `${url}?v=${Date.now()}`
      const composited = await overlayLogo(bustedUrl, '/images/kaira.webp', materialInfo ?? undefined)
      setCachedImageUrl(composited)
      setStampSuccess(true)
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
      if (!res.ok) throw new Error(`Request failed — ${res.status} ${res.statusText}`)
      const json = await res.json()
      const rows: VisualizerLog[] = Array.isArray(json)
        ? json
        : (json.data ?? json.items ?? json.logs ?? [])
      setLogs(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const analytics = useMemo(() => {
    const DAY_MS = 24 * 60 * 60 * 1000
    const now = Date.now()
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const weekAgo = now - 7 * DAY_MS
    const monthAgo = now - 30 * DAY_MS

    const generated = logs.filter((l) => l.output_url)

    const countSince = (ts: number) =>
      generated.filter((l) => l.created_at && new Date(l.created_at).getTime() >= ts).length

    type Key = 'mobile_number' | 'collection_name' | 'material_code'
    const breakdownBy = (key: Key, since?: number) => {
      const counts = new Map<string, number>()
      for (const l of generated) {
        const value = l[key]
        if (!value) continue
        if (since && (!l.created_at || new Date(l.created_at).getTime() < since)) continue
        counts.set(value, (counts.get(value) ?? 0) + 1)
      }
      return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count)
    }

    const usersBreakdown = breakdownBy('mobile_number')
    const collectionsBreakdown = breakdownBy('collection_name')
    const materialsThisMonth = breakdownBy('material_code', monthAgo)

    return {
      total: generated.length,
      today: countSince(startOfToday.getTime()),
      week: countSince(weekAgo),
      month: countSince(monthAgo),
      topUser: usersBreakdown[0] ?? null,
      topCollection: collectionsBreakdown[0] ?? null,
      trendingMaterial: materialsThisMonth[0] ?? breakdownBy('material_code')[0] ?? null,
      usersBreakdown,
      collectionsBreakdown,
    }
  }, [logs])

  const filtered = logs
    .filter((l) => !userFilter || l.mobile_number === userFilter)
    .filter((l) => !collectionFilter || l.collection_name === collectionFilter)
    .filter((l) => !materialFilter || l.material_code === materialFilter)
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
        <div>
          <h1 className="hidden sm:block font-serif text-2xl color-secondary-dark">Visualizer Logs</h1>
          <p className="text-stone-400 text-xs sm:text-sm sm:mt-1">
            {loading ? 'Loading…' : `${visible.length} of ${filtered.length} record${filtered.length !== 1 ? 's' : ''}${search || userFilter || collectionFilter || materialFilter ? ' found' : ' total'}`}
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

      {/* Analytics */}
      {!error && logs.length > 0 && (
        <div className="mb-6 bg-white border border-stone-200 rounded-lg shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-x-3 gap-y-4 sm:gap-x-6">
            <StatTile
              label="Total generated"
              value={formatCount(analytics.total)}
              tint="stone"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M4 4h16v16H4V4z" />
                </svg>
              }
            />
            <StatTile
              label="Today"
              value={formatCount(analytics.today)}
              tint="amber"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatTile
              label="Last 7 days"
              value={formatCount(analytics.week)}
              tint="sky"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatTile
              label="Last 30 days"
              value={formatCount(analytics.month)}
              tint="violet"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatTile
              label="Top user"
              value={analytics.topUser?.value ?? '—'}
              sub={analytics.topUser ? `${formatCount(analytics.topUser.count)} renders` : undefined}
              tint="emerald"
              onExpand={() => setShowUsersPanel(true)}
              onToggle={analytics.topUser ? () => {
                const mobile = analytics.topUser!.value
                setUserFilter((f) => (f === mobile ? null : mobile))
                setCollectionFilter(null)
                setMaterialFilter(null)
                setVisibleCount(PAGE_SIZE)
              } : undefined}
              active={!!userFilter}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <StatTile
              label="Top collection"
              value={analytics.topCollection?.value ?? '—'}
              sub={analytics.topCollection ? `${formatCount(analytics.topCollection.count)} renders` : undefined}
              tint="rose"
              onExpand={() => setShowCollectionsPanel(true)}
              onToggle={analytics.topCollection ? () => {
                const collection = analytics.topCollection!.value
                setCollectionFilter((f) => (f === collection ? null : collection))
                setUserFilter(null)
                setMaterialFilter(null)
                setVisibleCount(PAGE_SIZE)
              } : undefined}
              active={!!analytics.topCollection && collectionFilter === analytics.topCollection.value}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              }
            />
            <StatTile
              label="Trending material"
              value={analytics.trendingMaterial?.value ?? '—'}
              sub={analytics.trendingMaterial ? `${formatCount(analytics.trendingMaterial.count)} renders` : undefined}
              tint="teal"
              onToggle={analytics.trendingMaterial ? () => {
                const material = analytics.trendingMaterial!.value
                setMaterialFilter((f) => (f === material ? null : material))
                setUserFilter(null)
                setCollectionFilter(null)
                setVisibleCount(PAGE_SIZE)
              } : undefined}
              active={!!analytics.trendingMaterial && materialFilter === analytics.trendingMaterial.value}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </div>
        </div>
      )}

      {/* Active tile filters */}
      {(userFilter || collectionFilter || materialFilter) && (
        <div className="mb-6 -mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">Active filters:</span>
          {userFilter && (
            <button
              onClick={() => { setUserFilter(null); setVisibleCount(PAGE_SIZE) }}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full pl-3 pr-2 py-1 hover:bg-emerald-100 transition-colors"
            >
              User: {userFilter}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {collectionFilter && (
            <button
              onClick={() => { setCollectionFilter(null); setVisibleCount(PAGE_SIZE) }}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-full pl-3 pr-2 py-1 hover:bg-rose-100 transition-colors"
            >
              Collection: {collectionFilter}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {materialFilter && (
            <button
              onClick={() => { setMaterialFilter(null); setVisibleCount(PAGE_SIZE) }}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full pl-3 pr-2 py-1 hover:bg-teal-100 transition-colors"
            >
              Material: {materialFilter}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-stone-200 overflow-hidden bg-white">
              <div className="aspect-square bg-stone-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-stone-100 rounded animate-pulse w-2/3" />
                <div className="h-2.5 bg-stone-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
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

      {/* Data Display — Gallery Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((l, idx) => (
            <div
              key={l.id ?? idx}
              className="group bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
            >
              {/* Image — main focus */}
              <div className="relative aspect-square bg-stone-100">
                {l.output_url ? (
                  <button
                    onClick={() => handleViewOutput(l)}
                    className="absolute inset-0 w-full h-full"
                    aria-label="View output"
                  >
                    <CachedThumbImg
                      src={l.output_url}
                      alt="Generated output"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-secondary-dark/0 group-hover:bg-secondary-dark/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-white text-[10px] uppercase tracking-widest font-semibold bg-secondary-dark/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M4 4h16v16H4V4z" />
                    </svg>
                  </div>
                )}

                {/* Collection / Material Code */}
                <div className="absolute top-2 left-2 max-w-[75%] pointer-events-none">
                  <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm max-w-full">
                    <div className="text-[11px] font-semibold color-secondary-dark truncate">{l.collection_name || 'NA'}</div>
                    <div className="text-[10px] text-stone-500 truncate">{l.material_code || 'NA'}</div>
                  </div>
                </div>

                {/* Overflow menu */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setOpenMenuId(m => m === (l.id ?? String(idx)) ? null : (l.id ?? String(idx)))}
                    className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur text-stone-600 hover:bg-white rounded-full shadow-sm transition-colors"
                    aria-label="More options"
                    title="More options"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="1.75" />
                      <circle cx="12" cy="12" r="1.75" />
                      <circle cx="12" cy="19" r="1.75" />
                    </svg>
                  </button>

                  {openMenuId === (l.id ?? String(idx)) && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 top-8 z-20 bg-white border border-stone-200 rounded-lg shadow-lg py-1 min-w-[110px]">
                        <button
                          onClick={() => { if (l.id) setDeleteLogId(l.id); setOpenMenuId(null) }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Info footer */}
              <div className="p-3 flex flex-col gap-1">
                {l.mobile_number ? (
                  <a href={`tel:${l.mobile_number}`} className="text-sm font-semibold color-secondary-dark hover:text-amber-700 transition-colors truncate">
                    {l.mobile_number}
                  </a>
                ) : (
                  <span className="text-sm text-stone-300">—</span>
                )}
                {l.product_name && (
                  <div className="text-[11px] text-stone-400 truncate">{l.product_name}</div>
                )}
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-[10px] text-stone-400 truncate">
                    {l.created_at
                      ? new Date(l.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                      : '—'}
                  </span>
                  <StatusBadge status={l.status} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
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
      <GeneratedImageModal
        open={showImageModal}
        imgZoom={imgZoom}
        setImgZoom={setImgZoom}
        cachedImageUrl={cachedImageUrl}
        isWatermarking={isWatermarking}
        stampSuccess={stampSuccess}
        materialInfo={viewMaterialInfo}
        onClose={() => { setShowImageModal(false); setImgZoom(1) }}
        onDownload={handleDownload}
      />

      {/* Delete Confirmation Modal */}
      {deleteLogId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary-dark/60 backdrop-blur-sm" onClick={() => setDeleteLogId(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold color-secondary-dark">Delete Log</h3>
                <p className="text-sm text-stone-500 mt-1">
                  Are you sure you want to delete this visualizer log? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteLogId(null)}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:color-secondary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteLog(deleteLogId)
                  setDeleteLogId(null)
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Overview Panel */}
      {showUsersPanel && (
        <BreakdownPanel
          title="Users Overview"
          subtitle={`${analytics.usersBreakdown.length} user${analytics.usersBreakdown.length !== 1 ? 's' : ''} · ${formatCount(analytics.total)} renders total`}
          rows={analytics.usersBreakdown}
          onClose={() => setShowUsersPanel(false)}
          onRowClick={(value) => {
            setUserFilter((f) => (f === value ? null : value))
            setCollectionFilter(null)
            setMaterialFilter(null)
            setVisibleCount(PAGE_SIZE)
            setShowUsersPanel(false)
          }}
        />
      )}

      {/* Collections Overview Panel */}
      {showCollectionsPanel && (
        <BreakdownPanel
          title="Collections Overview"
          subtitle={`${analytics.collectionsBreakdown.length} collection${analytics.collectionsBreakdown.length !== 1 ? 's' : ''} · ${formatCount(analytics.total)} renders total`}
          rows={analytics.collectionsBreakdown}
          onClose={() => setShowCollectionsPanel(false)}
        />
      )}

      {/* Success Toast Notification */}
      <div className={`fixed bottom-8 inset-x-0 z-[60] flex justify-center px-4 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}>
        <div className="bg-emerald-600 text-white px-5 sm:px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-full">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">
            Log deleted successfully.
          </span>
        </div>
      </div>
    </div>
  )
}

export default VisualizerLogsPanel
