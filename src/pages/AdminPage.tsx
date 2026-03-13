import { useState, useEffect, useCallback } from 'react'
import AdminLoginPage from './AdminLoginPage'

interface Submission {
  id?: string
  name?: string
  mobile?: string
  email?: string
  message?: string
  createdAt?: string
  [key: string]: unknown
}

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('adminToken'))
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/getsubmissions`, {
        headers: { 'admin-token': token },
      })
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken')
        setIsAuthenticated(false)
        return
      }
      if (!res.ok) throw new Error(`Request failed — ${res.status} ${res.statusText}`)
      const json = await res.json()
      const rows: Submission[] = Array.isArray(json)
        ? json
        : (json.data ?? json.items ?? json.submissions ?? [])
      setSubmissions(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchSubmissions()
  }, [isAuthenticated, fetchSubmissions])

  if (!isAuthenticated) {
    return <AdminLoginPage onSuccess={() => setIsAuthenticated(true)} />
  }

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase()
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.mobile?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.message?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-stone-100 font-sans">
      {/* Top bar */}
      <header className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl tracking-wide text-amber-400">KAIRA</span>
          <span className="text-stone-500 text-sm">|</span>
          <span className="text-stone-300 text-sm uppercase tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-3">
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-xs uppercase tracking-widest text-stone-200 transition-colors rounded"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0120 15M19.418 15A8 8 0 014 9" />
          </svg>
          Refresh
        </button>
        <button
          onClick={() => { localStorage.removeItem('adminToken'); setIsAuthenticated(false) }}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800 text-xs uppercase tracking-widest text-red-300 transition-colors rounded"
        >
          Logout
        </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-stone-900">Contact Submissions</h1>
            <p className="text-stone-400 text-sm mt-1">
              {loading ? 'Loading…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}${search ? ' found' : ' total'}`}
            </p>
          </div>
          <input
            type="search"
            placeholder="Search name, mobile, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 border border-stone-300 bg-white rounded px-4 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-600 transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded p-4">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-700 text-sm font-medium">Failed to fetch submissions</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">{search ? 'No records match your search.' : 'No submissions yet.'}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-stone-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-stone-900 text-stone-300 uppercase text-[10px] tracking-widest">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Mobile</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Message</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr
                    key={s.id ?? idx}
                    className="bg-white even:bg-stone-50 border-t border-stone-100 hover:bg-amber-50/40 transition-colors"
                  >
                    <td className="px-5 py-3 text-stone-400">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-stone-800">{s.name ?? '—'}</td>
                    <td className="px-5 py-3 text-stone-600">
                      {s.mobile ? (
                        <a href={`tel:${s.mobile}`} className="hover:text-amber-700 transition-colors">{s.mobile}</a>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-stone-600">
                      {s.email ? (
                        <a href={`mailto:${s.email}`} className="hover:text-amber-700 transition-colors">{s.email}</a>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-stone-500 max-w-xs">
                      <span className="line-clamp-2">{s.message || '—'}</span>
                    </td>
                    <td className="px-5 py-3 text-stone-400 whitespace-nowrap">
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {s.mobile && (
                          <a
                            href={`tel:${s.mobile}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[10px] uppercase tracking-wider rounded transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </a>
                        )}
                        {s.email && (
                          <a
                            href={`mailto:${s.email}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[10px] uppercase tracking-wider rounded transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPage
