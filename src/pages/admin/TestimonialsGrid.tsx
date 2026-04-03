import { useState, useEffect, useRef } from 'react'

export interface GalleryItem {
  id: string
  asset_url: string
  asset_type: 'Gallery' | 'Image'
  type: 'testimonial' | 'other'
  isfeatured: boolean
  title?: string
  description?: string
  createdAt?: string
  [key: string]: unknown
}

interface Props {
  items: GalleryItem[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'
const LIMIT = 6
const SHOW_FILE_NAME = true
const PAGE_SIZE = 6

interface TestimonialCardProps {
  item: GalleryItem
  featured: boolean
  toggleState: string
  onToggle: () => void
  onEdit: () => void
  onPreview: () => void
}

const TestimonialCard = ({ item, featured, toggleState, onToggle, onEdit, onPreview }: TestimonialCardProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect() } },
      { rootMargin: '150px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleLoadedMetadata = () => {
    const v = videoRef.current
    if (v) v.currentTime = Math.min(1, v.duration * 0.1)
  }

  const handleMouseEnter = () => {
    const v = videoRef.current
    if (!v) return
    setPlaying(true)
    v.currentTime = 0
    v.play()
  }

  const handleMouseLeave = () => {
    const v = videoRef.current
    if (!v) return
    setPlaying(false)
    v.pause()
    v.currentTime = Math.min(1, v.duration * 0.1)
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[3/4.2]"
    >
      {inView && (
        <video
          ref={videoRef}
          src={item.asset_url + '#t=0.001'}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {/* Play icon overlay (idle) */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${playing ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-9 h-9 rounded-full bg-stone-900/50 flex items-center justify-center">
          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-colors flex items-center justify-center">
        <button
          onClick={e => { e.stopPropagation(); onPreview() }}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-stone-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          Play
        </button>
      </div>

      {/* Edit button */}
      <button
        onClick={e => { e.stopPropagation(); onEdit() }}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-stone-700 shadow z-10"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {/* Homepage toggle */}
      <div className="absolute bottom-0 inset-x-0 pt-6 pb-2 px-2.5 bg-white/10 backdrop-blur-sm">
        {item.title && (
          <p className="text-[11px] text-white/80 font-medium truncate mb-1.5">{item.title}</p>
        )}
        {toggleState && (
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-[10px] text-white font-medium italic">{toggleState}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/90 font-medium">Show on homepage</span>
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            disabled={!!toggleState}
            aria-pressed={featured}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 disabled:cursor-wait ${
              featured ? 'bg-amber-500' : 'bg-stone-500'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              featured ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  )
}

const TestimonialsGrid = ({ items, loading, error, onRefresh }: Props) => {
  const [featuredMap, setFeaturedMap] = useState<Partial<Record<string, boolean>>>(() =>
    Object.fromEntries(items.map(i => [i.id, i.isfeatured]))
  )
  const [toggling, setToggling] = useState<Record<string, string>>({})
  const [editItem, setEditItem]   = useState<GalleryItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [limitError, setLimitError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setFeaturedMap(Object.fromEntries(items.map(i => [i.id, i.isfeatured])))
  }, [items])

  const handleToggle = async (id: string) => {
    const isCurrentlyFeatured = featuredMap[id] ?? false
    const newVal = !isCurrentlyFeatured
    
    if (newVal && Object.values(featuredMap).filter(Boolean).length >= LIMIT) {
      setLimitError(true)
      setTimeout(() => setLimitError(false), 3000)
      return
    }
    
    setToggling(prev => ({ ...prev, [id]: newVal ? 'Enabling...' : 'Disabling...' }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const token = localStorage.getItem('adminToken') ?? ''
      const item = items.find(i => i.id === id)
      const res = await fetch(`${API}/gallery/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin-token': token },
        body: JSON.stringify({ 
          action: 'update', 
          id, 
          isfeatured: newVal,
          title: item?.title,
          description: item?.description
        }),
      })
      if (!res.ok) throw new Error('Update failed')
      
      setFeaturedMap(prev => ({ ...prev, [id]: newVal }))
    } catch {
      // featuredMap remains original on error
    } finally {
      setToggling(prev => ({ ...prev, [id]: '' }))
    }
  }

  const openEdit = (item: GalleryItem) => {
    setEditItem(item)
    setEditTitle(item.title ?? '')
    setEditDesc(item.description ?? '')
    setConfirmDelete(false)
  }

  const handleDelete = async () => {
    if (!editItem) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/gallery/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin-token': token },
        body: JSON.stringify({ action: 'delete', id: editItem.id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      setEditItem(null)
      onRefresh()
    } catch {
      // keep modal open on error
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editItem) return
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/gallery/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin-token': token },
        body: JSON.stringify({ action: 'update', id: editItem.id, title: editTitle, description: editDesc, isfeatured: featuredMap[editItem.id] ?? editItem.isfeatured }),
      })
      if (!res.ok) throw new Error('Save failed')
      setEditItem(null)
      onRefresh()
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = Object.values(featuredMap).filter(Boolean).length
  const sortedItems = [...items].sort((a, b) => {
    const aOn = (featuredMap[a.id] ?? a.isfeatured) ? 1 : 0
    const bOn = (featuredMap[b.id] ?? b.isfeatured) ? 1 : 0
    return bOn - aOn
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <p className="text-base text-stone-400 mb-4">
        Up to {LIMIT} testimonials can be shown on the homepage
        {' · '}
        <span className={enabledCount >= LIMIT ? 'text-amber-500 font-semibold' : 'text-stone-500'}>
          {enabledCount}/{LIMIT} enabled
        </span>
      </p>

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 transform ${
        limitError ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">
            Only {LIMIT} can be used. Disable one first.
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/4.2] rounded-xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
          <svg className="w-10 h-10 mb-3 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-stone-500">No testimonial videos yet</p>
          <p className="text-xs text-stone-400 mt-1">Upload a video to get started</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {sortedItems.slice(0, visibleCount).map(item => (
              <TestimonialCard
                key={item.id}
                item={item}
                featured={featuredMap[item.id] ?? item.isfeatured}
                toggleState={toggling[item.id] ?? ''}
                onToggle={() => handleToggle(item.id)}
                onEdit={() => openEdit(item)}
                onPreview={() => setPreviewUrl(item.asset_url)}
              />
            ))}
          </div>
          {sortedItems.length > visibleCount && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="px-6 py-2.5 rounded-full text-sm font-medium border border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors"
              >
                Load more · {sortedItems.length - visibleCount} remaining
              </button>
            </div>
          )}
        </>
      )}

      {/* Video Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }} onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <div className="flex justify-end mb-2 shrink-0">
              <button
                onClick={() => setPreviewUrl(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <video
              src={previewUrl}
              autoPlay
              controls
              playsInline
              className="w-full rounded-2xl shadow-2xl bg-black min-h-0"
              style={{ maxHeight: 'calc(100vh - 6rem)' }}
            />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setEditItem(null) }}
        >
          <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
              <h2 className="font-serif text-base text-stone-900">Edit Item</h2>
              <button
                onClick={() => setEditItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {SHOW_FILE_NAME && (() => {
                const fileName = decodeURIComponent(editItem.asset_url.split('/').pop() ?? '')
                return (
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl px-3.5 py-2.5">
                    <svg className="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-stone-500 truncate flex-1" title={fileName}>{fileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(fileName)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="shrink-0 text-stone-400 hover:text-stone-700 transition-colors"
                      title="Copy file name"
                    >
                      {copied ? (
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )
              })()}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Customer Name</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Description</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-colors resize-none"
                />
              </div>
            </div>
            {confirmDelete ? (
              <div className="px-6 pb-6">
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
                  <p className="text-sm font-medium text-red-700 mb-0.5">Delete this video?</p>
                  <p className="text-xs text-red-500">This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Deleting…
                      </>
                    ) : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
                <button
                  onClick={() => setEditItem(null)}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestimonialsGrid
