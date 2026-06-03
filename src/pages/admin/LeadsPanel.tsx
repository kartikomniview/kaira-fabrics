import { useState, useEffect, useCallback } from 'react'

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

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

const LeadsPanel = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  const deleteSubmission = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/contact/delete`, {
        method: 'POST',
        headers: { 'admin-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error(`Delete failed — ${res.status} ${res.statusText}`)
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission.')
    }
  }, [])

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/getsubmissions`, {
        headers: { 'admin-token': token },
      })
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

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const filtered = submissions
    .filter((s) => {
      const q = search.toLowerCase()
      return (
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.mobile?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.message?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      }
      if (sortBy === 'oldest') {
        return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0)
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '')
      }
      return 0
    })

  return (
    <div>
      {/* Panel heading */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="hidden sm:block">
          <h1 className="font-serif text-2xl text-secondary-dark">Leads</h1>
          <p className="text-stone-400 text-sm mt-1">
            {loading ? 'Loading…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}${search ? ' found' : ' total'}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <input
            type="search"
            placeholder="Search name, mobile, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border border-stone-300 bg-white rounded px-4 py-2 text-sm text-secondary-dark placeholder:text-stone-400 focus:outline-none focus:border-secondary-dark transition-colors"
          />
          <div className="flex w-full sm:w-auto items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full sm:w-36 border border-stone-300 bg-white rounded px-3 py-2 text-sm text-secondary-dark focus:outline-none focus:border-secondary-dark transition-colors appearance-none pr-8 cursor-pointer relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231c1917%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-secondary-dark hover:bg-secondary-dark/90 disabled:opacity-50 text-xs uppercase tracking-widest text-stone-200 transition-colors rounded shrink-0 h-[38px]"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0120 15M19.418 15A8 8 0 014 9" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
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
                    <td className="px-5 py-3 font-medium text-secondary-dark">{s.name ?? '—'}</td>
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
                        <button
                          onClick={() => s.id && setDeleteLeadId(s.id)}
                          className="flex items-center justify-center w-7 h-7 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded transition-colors"
                          aria-label="Delete"
                          title="Delete Lead"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((s, idx) => (
              <div
                key={s.id ?? idx}
                className="bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 flex flex-col gap-2.5 relative overflow-hidden"
              >
                {/* Accent border left */}
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary-dark opacity-[0.03]" />
                
                {/* Header: Avatar, Name, Date, Actions */}
                <div className="flex items-start justify-between gap-2 pl-1">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-secondary-dark font-medium text-xs shrink-0">
                      {s.name ? s.name[0].toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-secondary-dark text-sm truncate">{s.name ?? 'Unknown Lead'}</span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        {s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {s.mobile && (
                      <a
                        href={`tel:${s.mobile}`}
                        className="flex items-center justify-center w-7 h-7 bg-secondary-dark text-stone-100 hover:bg-secondary-dark/90 rounded-md transition-colors"
                        aria-label="Call"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </a>
                    )}
                    {s.email && (
                      <a
                        href={`mailto:${s.email}`}
                        className="flex items-center justify-center w-7 h-7 bg-stone-100 text-secondary-dark hover:bg-stone-200 border border-stone-200 rounded-md transition-colors"
                        aria-label="Email"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => s.id && setDeleteLeadId(s.id)}
                      className="flex items-center justify-center w-7 h-7 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                      aria-label="Delete"
                      title="Delete Lead"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col gap-1 pl-1 mt-0.5">
                  {s.mobile && (
                    <a href={`tel:${s.mobile}`} className="text-xs text-stone-600 hover:text-secondary-dark flex items-center gap-1.5 w-fit">
                      <svg className="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {s.mobile}
                    </a>
                  )}
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="text-xs text-stone-600 hover:text-secondary-dark flex items-center gap-1.5 w-fit truncate max-w-[250px]">
                      <svg className="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{s.email}</span>
                    </a>
                  )}
                </div>

                {/* Message Box */}
                <div className="bg-stone-50 rounded-lg p-2.5 ml-1 border border-stone-100">
                  <p className="text-xs text-stone-600 line-clamp-3 leading-snug">
                    {s.message || <span className="italic text-stone-400">No message provided.</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteLeadId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary-dark/60 backdrop-blur-sm" onClick={() => setDeleteLeadId(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-dark">Delete Lead</h3>
                <p className="text-sm text-stone-500 mt-1">
                  Are you sure you want to delete this lead? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteLeadId(null)}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-secondary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSubmission(deleteLeadId)
                  setDeleteLeadId(null)
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}>
        <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">
            Lead deleted successfully.
          </span>
        </div>
      </div>
    </div>
  )
}

export default LeadsPanel
