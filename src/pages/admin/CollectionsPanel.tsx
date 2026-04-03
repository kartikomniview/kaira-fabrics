import { useState, useMemo } from 'react'
import { useMaterials } from '../../contexts/MaterialsContext'
import { loadNewMaterials } from '../../data/newmaterials'
import AddCollectionModal from './AddCollectionModal'

const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'
const S3_COVER = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics'
const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

// ─── Materials drawer ────────────────────────────────────────────────────────

function MaterialsDrawer({
  collectionName,
  onClose,
}: {
  collectionName: string
  onClose: () => void
}) {
  const { newMaterials, refresh } = useMaterials()
  const [search, setSearch] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const existing = await loadNewMaterials(true)
      const updated = existing.filter((m) => m.collection_name !== collectionName)
      const tsContent = 'export const newMaterials = ' + JSON.stringify(updated, null, 4) + ';\n'
      const res = await fetch(`${API}/getuploadurl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin-token': token },
        body: JSON.stringify({ file_name: 'newmaterials.ts', mime_type: 'text/plain', asset_type: 'data' }),
      })
      if (!res.ok) throw new Error(`Could not get upload URL (${res.status})`)
      const { uploadUrl } = await res.json()
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: new Blob([tsContent], { type: 'text/plain' }),
      })
      if (!putRes.ok) throw new Error(`Failed to update data file (${putRes.status})`)
      await refresh()
      onClose()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong.')
      setIsDeleting(false)
    }
  }

  const materials = useMemo(
    () => newMaterials.filter((m) => m.collection_name === collectionName),
    [newMaterials, collectionName],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return materials
    return materials.filter(
      (m) =>
        m.material_name?.toLowerCase().includes(q) ||
        m.material_code?.toLowerCase().includes(q) ||
        m.color_group?.toLowerCase().includes(q) ||
        m.pattern?.toLowerCase().includes(q),
    )
  }, [materials, search])

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <aside className="relative w-full max-w-2xl bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold">Collection</p>
            <h2 className="text-lg font-semibold text-stone-900 mt-0.5">{collectionName}</h2>
            <p className="text-xs text-stone-500 mt-0.5">{materials.length} variants</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowDeleteConfirm(true); setDeleteConfirmText(''); setDeleteError(null) }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors border border-red-200 hover:border-red-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Delete confirmation overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="w-full max-w-sm mx-6 bg-white rounded-xl shadow-2xl border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Delete Collection</h3>
                  <p className="text-xs text-stone-500 mt-0.5">This will remove all {materials.length} materials from the data file.</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 mb-3">
                Type <span className="font-bold text-red-600">delete</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => { setDeleteConfirmText(e.target.value); setDeleteError(null) }}
                placeholder="delete"
                className="w-full border border-stone-200 rounded px-3 py-2 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-red-400 transition-colors mb-3"
                autoFocus
              />
              {deleteError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">{deleteError}</p>
              )}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== 'delete' || isDeleting}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Deleting…
                    </>
                  ) : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2 bg-stone-100 rounded px-3 py-2">
            <svg className="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, color, pattern…"
              className="bg-transparent flex-1 text-xs text-stone-800 placeholder-stone-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-stone-400 hover:text-stone-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Materials grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-12">No materials found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((m) => (
                <div key={m.id} className="group flex flex-col rounded border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-md transition-all">
                  <div className="aspect-square bg-stone-100 overflow-hidden">
                    <img
                      src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                      alt={m.material_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }}
                    />
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-[11px] font-semibold text-stone-800 truncate">{m.material_name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{m.material_code}</p>
                    {m.color_group && (
                      <p className="text-[9px] uppercase tracking-wide text-stone-400 mt-0.5 truncate">{m.color_group}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

// ─── Collections Panel ────────────────────────────────────────────────────────

const CollectionsPanel = () => {
  const { collections, isLoading, error, refresh } = useMaterials()
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest')
  const [visibleCount, setVisibleCount] = useState(10)
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = q
      ? collections.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q),
        )
      : [...collections]
    if (sortOrder === 'latest') result = [...result].reverse()
    return result
  }, [collections, search, sortOrder])

  const visible = filtered.slice(0, visibleCount)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400 text-sm">
        Loading collections…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-red-500 text-sm">
        Failed to load data: {error.message}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Collections</h1>
          <p className="text-xs text-stone-500 mt-0.5">{collections.length} collections loaded from S3</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Collection */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold uppercase tracking-[0.15em] rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Collection
          </button>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value as 'latest' | 'oldest'); setVisibleCount(10) }}
            className="text-xs text-stone-700 bg-stone-100 border-none rounded px-3 py-2 outline-none cursor-pointer hover:bg-stone-200 transition-colors"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>

          {/* Search */}
          <div className="flex items-center gap-2 bg-stone-100 rounded px-3 py-2 w-56">
          <svg className="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
            className="bg-transparent flex-1 text-xs text-stone-800 placeholder-stone-400 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-stone-400 hover:text-stone-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-16">No collections found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {visible.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveDrawer(col.name)}
              className="group flex flex-col text-left rounded-lg border border-stone-200 overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all duration-200 bg-white"
            >
              {/* Cover image */}
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden w-full">
                <img
                  src={`${S3_COVER}/${col.name}.webp`}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }}
                />
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-1">
                <p className="text-sm font-semibold text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                  {col.name}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-stone-400 truncate">{col.category}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-stone-500">{col.itemCount} variants</span>
                  <span className="text-[10px] text-amber-500 font-medium group-hover:underline">View →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Load More */}
      {visibleCount < filtered.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((v) => v + 10)}
            className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded transition-colors"
          >
            Load More ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Materials Drawer */}
      {activeDrawer && (
        <MaterialsDrawer
          collectionName={activeDrawer}
          onClose={() => setActiveDrawer(null)}
        />
      )}

      {/* Add Collection Modal */}
      {showAddModal && (
        <AddCollectionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            setShowAddModal(false)
            await refresh()
          }}
        />
      )}
    </div>
  )
}

export default CollectionsPanel
