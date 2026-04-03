import { useState, useRef, useCallback } from 'react'
import { loadNewMaterials } from '../../data/newmaterials'
import type { NewMaterial } from '../../data/newmaterials'

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'
const MAX_MATERIALS = 100

const MATERIAL_TYPES = [
  'CHENILLE',
  'DIGITALPRINT',
  'LEATHERITE',
  'SUEDEFABRIC',
  'SUEDELEATHER',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaterialFile {
  file: File
  /** filename without extension = material code */
  code: string
  preview: string
}

type Step = 1 | 2 | 3

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isWebp(file: File) {
  return file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')
}

async function getPresignedUrl(
  token: string,
  fileName: string,
  assetType: string,
): Promise<{ uploadUrl: string }> {
  const res = await fetch(`${API}/getuploadurl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'admin-token': token },
    body: JSON.stringify({ file_name: fileName, mime_type: 'image/webp', asset_type: assetType }),
  })
  if (!res.ok) throw new Error(`Could not get upload URL for ${fileName} (${res.status})`)
  return res.json()
}

async function putToS3(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/webp' },
    body: file,
  })
  if (!res.ok) throw new Error(`S3 upload failed for ${file.name} (${res.status})`)
}

// ─── Step indicators ─────────────────────────────────────────────────────────

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2, 3] as Step[]).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s
                ? 'bg-amber-400 text-stone-900'
                : step > s
                ? 'bg-stone-800 text-white'
                : 'bg-stone-200 text-stone-500'
            }`}
          >
            {step > s ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : s}
          </div>
          {s < 3 && <div className={`h-px w-8 ${step > s ? 'bg-stone-800' : 'bg-stone-200'}`} />}
        </div>
      ))}
      <span className="ml-2 text-xs text-stone-400 font-medium">
        {step === 1 ? 'Collection Name' : step === 2 ? 'Cover Image' : 'Materials'}
      </span>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddCollectionModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [collectionName, setCollectionName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [materialType, setMaterialType] = useState('')

  // Step 2
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverError, setCoverError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Step 3
  const [materialFiles, setMaterialFiles] = useState<MaterialFile[]>([])
  const [matError, setMatError] = useState<string | null>(null)
  const matInputRef = useRef<HTMLInputElement>(null)

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  // ── Step 1 ──────────────────────────────────────────────────────────────────

  const handleStep1Next = () => {
    const trimmed = collectionName.trim()
    if (!trimmed) { setNameError('Collection name is required.'); return }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setNameError('Use only letters, numbers, hyphens and underscores.')
      return
    }
    if (!materialType) { setNameError('Please select a material type.'); return }
    setNameError(null)
    setStep(2)
  }

  // ── Step 2 ──────────────────────────────────────────────────────────────────

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setCoverError(null)
    if (!f) { setCoverFile(null); setCoverPreview(null); return }
    if (!isWebp(f)) { setCoverError('Only .webp files are accepted.'); return }
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
  }

  const handleStep2Next = () => {
    if (!coverFile) { setCoverError('Cover image is required.'); return }
    setCoverError(null)
    setStep(3)
  }

  // ── Step 3 ──────────────────────────────────────────────────────────────────

  const handleMaterialsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? [])
    setMatError(null)

    const invalid = incoming.filter((f) => !isWebp(f))
    if (invalid.length > 0) {
      setMatError(`${invalid.length} file(s) rejected — only .webp files are accepted.`)
      if (matInputRef.current) matInputRef.current.value = ''
      return
    }

    setMaterialFiles((prev) => {
      const existing = new Set(prev.map((m) => m.code))
      const toAdd: MaterialFile[] = []
      for (const f of incoming) {
        const code = f.name.replace(/\.webp$/i, '')
        if (!existing.has(code)) {
          toAdd.push({ file: f, code, preview: URL.createObjectURL(f) })
          existing.add(code)
        }
      }
      const merged = [...prev, ...toAdd]
      if (merged.length > MAX_MATERIALS) {
        setMatError(`Maximum ${MAX_MATERIALS} materials allowed. Only the first ${MAX_MATERIALS} were kept.`)
        return merged.slice(0, MAX_MATERIALS)
      }
      return merged
    })

    if (matInputRef.current) matInputRef.current.value = ''
  }, [])

  const removeMaterial = (code: string) => {
    setMaterialFiles((prev) => {
      const item = prev.find((m) => m.code === code)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((m) => m.code !== code)
    })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (materialFiles.length === 0) { setMatError('Add at least one material image.'); return }

    setSubmitError(null)
    setSubmitting(true)

    const token = localStorage.getItem('adminToken') ?? ''
    const name = collectionName.trim()
    const totalUploads = 1 + materialFiles.length // cover + materials
    let done = 0
    setProgress({ done: 0, total: totalUploads + 1 }) // +1 for JSON update

    try {
      // ── 1. Upload cover image ─────────────────────────────────────────────
      const { uploadUrl: coverUrl } = await getPresignedUrl(token, `${name}.webp`, 'coverpages/KairaFabrics')
      await putToS3(coverUrl, coverFile!)
      done++
      setProgress({ done, total: totalUploads + 1 })

      // ── 2. Upload material thumbnails ─────────────────────────────────────
      for (const mat of materialFiles) {
        const { uploadUrl: matUrl } = await getPresignedUrl(token, `${mat.code}.webp`, `textures/KairaFabrics/${name}`)
        await putToS3(matUrl, mat.file)
        done++
        setProgress({ done, total: totalUploads + 1 })
      }

      // ── 3. Fetch current newmaterials.ts from S3, parse, append, re-upload ─
      const existing = await loadNewMaterials(true)

      // Find the highest existing id so we can assign sequential ids
      const maxId = existing.reduce((m, x) => Math.max(m, x.id ?? 0), 0)

      const newRows: NewMaterial[] = materialFiles.map((mat, i) => ({
        id: maxId + i + 1,
        material_name: mat.code,
        company_name: 'KairaFabrics',
        collection_name: name,
        material_code: mat.code,
        uv_scale: null,
        sheen: 0,
        company_collection_materialtype_id: 0,
        company_id: 179,
        collection_id: 0,
        material_type_id: 0,
        roughness: 0.5,
        metalness: 0,
        specular: 0.5,
        clearcoat: 0,
        transmission: 0,
        color_group: null,
        pattern: null,
        material_type: materialType,
        storefront_id: null,
      }))

      const updated = [...existing, ...newRows]

      // Serialise back to the same TypeScript module format
      const tsContent =
        'export const newMaterials = ' + JSON.stringify(updated, null, 4) + ';\n'

      // Get a presigned URL for the data file
      const { uploadUrl: dataUrl } = await getPresignedUrl(token, 'newmaterials.ts', 'data')
      // PUT as text/plain (the bucket serves it as-is)
      const dataBlob = new Blob([tsContent], { type: 'text/plain' })
      const dataFile = new File([dataBlob], 'newmaterials.ts', { type: 'text/plain' })
      const dataRes = await fetch(dataUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: dataFile,
      })
      if (!dataRes.ok) throw new Error(`Failed to update newmaterials.ts (${dataRes.status})`)

      done++
      setProgress({ done, total: totalUploads + 1 })

      onSuccess()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose() }}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="font-semibold text-stone-900 text-lg">Add New Collection</h2>
            <p className="text-xs text-stone-400 mt-0.5">All uploads happen on final submit</p>
          </div>
          {!submitting && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <StepDots step={step} />

          {/* ── Step 1: Collection Name ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                Enter a unique name for the new collection. It will be used as the S3 folder name and cover image filename.
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-500">
                  Collection Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => { setCollectionName(e.target.value); setNameError(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleStep1Next() }}
                  placeholder="e.g. Riviera"
                  className="w-full border border-stone-200 rounded px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  autoFocus
                />
                {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                <p className="text-[10px] text-stone-400">Letters, numbers, hyphens and underscores only.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-500">
                  Material Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full border border-stone-200 rounded px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors bg-white"
                >
                  <option value="">— Select material type —</option>
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Step 2: Cover Image ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                Upload the cover image for <span className="font-semibold text-stone-900">{collectionName}</span>.
                It will be stored at{' '}
                <code className="text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">
                  coverpages/KairaFabrics/{collectionName}.webp
                </code>
              </p>
              <label
                className={`flex flex-col items-center justify-center gap-3 w-full border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  coverFile
                    ? 'border-amber-400 bg-amber-50/40'
                    : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                }`}
                style={{ minHeight: 180 }}
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept=".webp,image/webp"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="cover preview"
                    className="max-h-48 object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.909-1.909a2.25 2.25 0 013.182 0l2.909 2.909M3.375 20.25h17.25a1.125 1.125 0 001.125-1.125V6.375a1.125 1.125 0 00-1.125-1.125H3.375A1.125 1.125 0 002.25 6.375v12.75c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <p className="text-sm text-stone-400">Click to upload cover image</p>
                    <p className="text-xs text-stone-300">.webp only</p>
                  </>
                )}
              </label>
              {coverFile && (
                <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-50 rounded px-3 py-2">
                  <span className="truncate">{coverFile.name}</span>
                  <button
                    onClick={() => { setCoverFile(null); setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = '' }}
                    className="ml-3 text-stone-400 hover:text-red-500 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
              {coverError && <p className="text-xs text-red-500">{coverError}</p>}
            </div>
          )}

          {/* ── Step 3: Materials ─────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                Upload material thumbnail images for <span className="font-semibold text-stone-900">{collectionName}</span>.
                Each filename (without extension) becomes the <strong>Material Code</strong>.
                Files will be stored at{' '}
                <code className="text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">
                  textures/KairaFabrics/{collectionName}/{'<code>'}.webp
                </code>
              </p>

              {/* Drop zone */}
              <label
                className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-stone-200 bg-stone-50 hover:border-stone-300 rounded-xl cursor-pointer transition-colors"
              >
                <input
                  ref={matInputRef}
                  type="file"
                  accept=".webp,image/webp"
                  multiple
                  onChange={handleMaterialsChange}
                  className="hidden"
                  disabled={materialFiles.length >= MAX_MATERIALS}
                />
                <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p className="text-xs text-stone-400">
                  {materialFiles.length >= MAX_MATERIALS
                    ? `Maximum ${MAX_MATERIALS} files reached`
                    : 'Click to add .webp files (multi-select allowed)'}
                </p>
              </label>

              {matError && <p className="text-xs text-red-500">{matError}</p>}

              {/* Count badge */}
              {materialFiles.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-500">
                    <span className="font-semibold text-stone-900">{materialFiles.length}</span> / {MAX_MATERIALS} materials added
                  </p>
                  <button
                    onClick={() => {
                      materialFiles.forEach((m) => URL.revokeObjectURL(m.preview))
                      setMaterialFiles([])
                    }}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Grid preview */}
              {materialFiles.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
                  {materialFiles.map((m) => (
                    <div key={m.code} className="relative group rounded overflow-hidden border border-stone-200 aspect-square bg-stone-100">
                      <img
                        src={m.preview}
                        alt={m.code}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <button
                          onClick={() => removeMaterial(m.code)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 text-[8px] text-white bg-black/50 px-1 py-0.5 truncate">
                        {m.code}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit progress */}
              {submitting && progress && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {progress.done < 1
                        ? 'Uploading cover image…'
                        : progress.done < progress.total - 1
                        ? `Uploading material ${progress.done} / ${materialFiles.length}…`
                        : 'Updating materials data…'}
                    </span>
                    <span>{Math.round((progress.done / progress.total) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {submitError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {submitError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 shrink-0 bg-stone-50">
          <button
            onClick={() => {
              if (step === 1) onClose()
              else setStep((s) => (s - 1) as Step)
            }}
            disabled={submitting}
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors disabled:opacity-40"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={step === 1 ? handleStep1Next : handleStep2Next}
              className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-[0.15em] rounded hover:bg-stone-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || materialFiles.length === 0}
              className="px-5 py-2.5 bg-amber-400 text-stone-900 text-xs font-bold uppercase tracking-[0.15em] rounded hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading…
                </>
              ) : (
                'Submit & Upload'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
