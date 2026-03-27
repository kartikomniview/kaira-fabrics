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
        className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors text-xs"
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

const VisualizerLogsPanel = () => {
  const [logs, setLogs] = useState<VisualizerLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/visualizer-logs`, {
        headers: { 'admin-token': token },
      })
      console.log(token,`${API}/visualizer-logs`)
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

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    return !q || l.mobile_number?.toLowerCase().includes(q) || l.status?.toLowerCase().includes(q) || l.id?.toLowerCase().includes(q)
  })

  return (
    <div>
      {/* Panel heading */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-stone-900">Visualizer Logs</h1>
          <p className="text-stone-400 text-sm mt-1">
            {loading ? 'Loading…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}${search ? ' found' : ' total'}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search mobile, status, id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border border-stone-300 bg-white rounded px-4 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-600 transition-colors"
          />
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-xs uppercase tracking-widest text-stone-200 transition-colors rounded"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0120 15M19.418 15A8 8 0 014 9" />
            </svg>
            Refresh
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

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-stone-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-stone-900 text-stone-300 uppercase text-[10px] tracking-widest">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Output</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, idx) => (
                <tr
                  key={l.id ?? idx}
                  className="bg-white even:bg-stone-50 border-t border-stone-100 hover:bg-amber-50/40 transition-colors align-top"
                >
                  <td className="px-5 py-3 text-stone-400">{idx + 1}</td>
                  <td className="px-5 py-3 text-stone-400 font-mono text-xs max-w-[100px] truncate" title={l.id}>
                    {l.id ?? '—'}
                  </td>
                  <td className="px-5 py-3 font-medium text-stone-800">
                    {l.mobile_number ? (
                      <a href={`tel:${l.mobile_number}`} className="hover:text-amber-700 transition-colors">{l.mobile_number}</a>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    {l.output_url ? (
                      <a
                        href={l.output_url}
                        target="_blank"
                        rel="noopener noreferrer"
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
                      </a>
                    ) : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <DeviceInfoCell raw={l.device_info as string | undefined} />
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
      )}
    </div>
  )
}

export default VisualizerLogsPanel
