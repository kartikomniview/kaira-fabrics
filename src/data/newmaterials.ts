// ─── Materials Loader ────────────────────────────────────────────────────────
// Data is fetched at runtime from S3 and cached in module memory.
// ─────────────────────────────────────────────────────────────────────────────

const S3_URL =
  'https://kairafabrics.s3.ap-south-1.amazonaws.com/data/newmaterials.ts'

export interface NewMaterial {
  id: number
  material_name: string
  company_name: string
  collection_name: string
  material_code: string
  uv_scale: number | null
  sheen: number
  company_collection_materialtype_id: number
  company_id: number
  collection_id: number
  material_type_id: number
  roughness: number
  metalness: number
  specular: number
  clearcoat: number
  transmission: number
  color_group: string | null
  pattern: string | null
  material_type: string
  storefront_id: number | null
}

let _cache: NewMaterial[] | null = null
let _promise: Promise<NewMaterial[]> | null = null

/** Clears the module-level cache so the next `loadNewMaterials()` call re-fetches from S3. */
export function clearNewMaterialsCache() {
  _cache = null
  _promise = null
}

/** Loads materials from S3, caching the result in module memory.
 *  Pass `bustCache = true` to bypass both the module cache and the browser
 *  HTTP cache (appends a timestamp query param to the S3 URL). */
export function loadNewMaterials(bustCache = false): Promise<NewMaterial[]> {
  if (!bustCache && _cache !== null) return Promise.resolve(_cache)
  if (!bustCache && _promise !== null) return _promise

  if (bustCache) {
    _cache = null
    _promise = null
  }

  const url = bustCache ? `${S3_URL}?t=${Date.now()}` : S3_URL
  _promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch materials: HTTP ${res.status}`)
      return res.text()
    })
    .then((text) => {
      // The S3 file is a TypeScript module — strip the export wrapper to obtain
      // a pure JSON array: "export const newMaterials = [...];"
      const json = text.replace(/^[\s\S]*?=\s*/, '').replace(/;?\s*$/, '').trim()
      return JSON.parse(json) as NewMaterial[]
    })
    .then((data) => {
      _cache = data
      _promise = null
      return data
    })
    .catch((err) => {
      _promise = null // allow a future retry
      throw err
    })

  return _promise
}

/** Returns the already-cached array (empty array if not yet loaded). */
export function getNewMaterialsCache(): NewMaterial[] {
  return _cache ?? []
}

// Pre-fetch immediately when the module is imported so data is ready by first render.
loadNewMaterials().catch(() => {
  // Silently ignore; MaterialsProvider will surface the error to consumers.
})
