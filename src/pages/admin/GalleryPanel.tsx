import { useState, useEffect, useCallback } from 'react'
import GalleryUploadModal, { type GalleryTab } from './GalleryUploadModal'
import TestimonialsGrid, { type GalleryItem } from './TestimonialsGrid'
import OtherGrid from './OtherGrid'

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

const GalleryPanel = () => {
  const [activeTab, setActiveTab]     = useState<GalleryTab>('testimonial')
  const [showUpload, setShowUpload]   = useState(false)
  const [items, setItems]             = useState<GalleryItem[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError]     = useState<string | null>(null)
  const isShowAddButton             = false

  const fetchGallery = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const res = await fetch(`${API}/gallery`, {
        headers: { 'admin-token': token },
      })
      if (!res.ok) throw new Error(`Failed to load gallery — ${res.status} ${res.statusText}`)
      const json = await res.json()
      setItems(Array.isArray(json) ? json : (json.items ?? []))
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : 'Could not load gallery.')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => { fetchGallery() }, [fetchGallery])

  const testimonials = items.filter(i => i.type === 'testimonial')
  const others       = items.filter(i => i.type === 'other')

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl text-stone-900">Gallery</h1>
          <p className="text-stone-400 text-sm mt-0.5">Upload and manage your gallery assets.</p>
        </div>
        {isShowAddButton && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 hover:shadow-md shadow-sm transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Gallery Item
          </button>
        )}
      </div>

      {/* Tab Chips */}
      <div className="flex items-center gap-2 mb-8">
        {(['testimonial', 'other'] as GalleryTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              activeTab === tab
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800'
            }`}
          >
            {tab === 'testimonial' ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Testimonial Videos
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Other
              </>
            )}
            {!listLoading && (tab === 'testimonial' ? testimonials : others).length > 0 && (
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
              }`}>
                {(tab === 'testimonial' ? testimonials : others).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <GalleryUploadModal
          activeTab={activeTab}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={() => { setShowUpload(false); fetchGallery() }}
        />
      )}

      {/* Grid for active tab */}
      {activeTab === 'testimonial' ? (
        <TestimonialsGrid
          items={testimonials}
          loading={listLoading}
          error={listError}
          onRefresh={fetchGallery}
        />
      ) : (
        <OtherGrid
          items={others}
          loading={listLoading}
          error={listError}
          onRefresh={fetchGallery}
        />
      )}
    </div>
  )
}

export default GalleryPanel
