import { useState, useRef } from 'react'

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

export type GalleryTab = 'testimonial' | 'other'

const MAX_VIDEO = 6 * 1024 * 1024
const MAX_IMAGE = 5 * 1024 * 1024

interface Props {
  activeTab: GalleryTab
  onClose: () => void
  onUploadSuccess: () => void
}

const GalleryUploadModal = ({ activeTab, onClose, onUploadSuccess }: Props) => {
  const [file, setFile]           = useState<File | null>(null)
  const [isFeatured, setIsFeatured] = useState(false)
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const fileInputRef              = useRef<HTMLInputElement>(null)

  const accept = activeTab === 'testimonial' ? 'video/*' : 'image/*,video/*'
  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : null

  const reset = () => {
    setFile(null)
    setTitle('')
    setDesc('')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => { reset(); onClose() }

  const validate = (f: File): string | null => {
    const isVideo = f.type.startsWith('video/')
    const isImage = f.type.startsWith('image/')
    if (activeTab === 'testimonial') {
      if (!isVideo) return 'Only video files are allowed for testimonials.'
      if (f.size > MAX_VIDEO) return `Video must not exceed ${MAX_VIDEO / 1024 / 1024} MB.`
    } else {
      if (!isVideo && !isImage) return 'Only image or video files are allowed.'
      if (isVideo && f.size > MAX_VIDEO) return `Video must not exceed ${MAX_VIDEO / 1024 / 1024} MB.`
      if (isImage && f.size > MAX_IMAGE) return `Image must not exceed ${MAX_IMAGE / 1024 / 1024} MB.`
    }
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setError(null)
    if (!f) { setFile(null); return }
    const err = validate(f)
    if (err) { setError(err); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; return }
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem('adminToken') ?? ''
      const asset_type = file.type.startsWith('video/') ? 'Gallery' : 'Image'

      // 1. Get presigned upload URL
      const urlRes = await fetch(`${API}/getuploadurl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin-token': token },
        body: JSON.stringify({ file_name: file.name, mime_type: file.type, asset_type }),
      })
      if (!urlRes.ok) throw new Error(`Could not get upload URL — ${urlRes.status} ${urlRes.statusText}`)
      const { uploadUrl, fileUrl, id } = await urlRes.json()

      // 2. Upload directly to S3
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!s3Res.ok) throw new Error(`S3 upload failed — ${s3Res.status} ${s3Res.statusText}`)

      // 3. Register in backend
      const addRes = await fetch(`${API}/gallery/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin-token': token },
        body: JSON.stringify({ id, asset_url: fileUrl, asset_type, type: activeTab, isfeatured: isFeatured, title, description }),
      })
      if (!addRes.ok) throw new Error(`API error — ${addRes.status} ${addRes.statusText}`)

      reset()
      setIsFeatured(false)
      onUploadSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-lg text-stone-900">
              {activeTab === 'testimonial' ? 'Upload Testimonial Video' : 'Upload Gallery Item'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {activeTab === 'testimonial'
                ? 'Video files only · max 6 MB'
                : 'Images (max 5 MB) · Videos (max 6 MB)'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Drop zone */}
          <label
            className={`flex flex-col items-center justify-center gap-2 w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              file
                ? 'border-amber-400 bg-amber-50/60'
                : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            {file ? (
              <>
                <svg className="w-8 h-8 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-stone-700 font-medium px-6 truncate w-full text-center">{file.name}</span>
                <span className="text-xs text-stone-400">{fileSizeMB} MB</span>
              </>
            ) : (
              <>
                <svg className="w-9 h-9 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm text-stone-500 font-medium">Click to select a file</span>
                <span className="text-xs text-stone-400">
                  {activeTab === 'testimonial' ? 'MP4, MOV, WEBM · max 6 MB' : 'JPG, PNG, WEBP · max 5 MB · MP4, MOV · max 6 MB'}
                </span>
              </>
            )}
          </label>

          {/* Title & Description */}
          <div className="mt-5 flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Title <span className="text-stone-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Add a title"
                className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Description <span className="text-stone-400 font-normal">(optional)</span></label>
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="Add a description"
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Featured toggle */}
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              role="switch"
              aria-checked={isFeatured}
              onClick={() => setIsFeatured(v => !v)}
              className={`relative shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none ${
                isFeatured ? 'bg-amber-500' : 'bg-stone-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  isFeatured ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-stone-600">Mark as Featured</span>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GalleryUploadModal
