/**
 * Shared model-viewer texture utilities used by the 3D Visualizer, ThreeDModal,
 * and MaterialDetailModal.
 */

const S3_ORIGIN = 'https://supoassets.s3.ap-south-1.amazonaws.com'

/**
 * Fetches a remote S3 asset through the /s3proxy rewrite and returns a blob URL.
 * The caller is responsible for calling URL.revokeObjectURL() when done.
 */
export async function fetchBlobUrl(url: string): Promise<string | null> {
  try {
    const proxyUrl = url.replace(S3_ORIGIN, '/s3proxy')
    const res = await fetch(proxyUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

/**
 * Sets UV repeat tiling on a model-viewer texture info slot via its internal
 * transform symbol. Safe to call even if the texture is shared across materials
 * because the transform lives on the per-material texture info object.
 */
export function applyTiling(texture: any, uvScale: number): void {
  if (!texture) return
  try {
    const symbols = Object.getOwnPropertySymbols(texture)
    const transformSymbol = symbols.find((s) => s.toString().includes('transform'))
    if (transformSymbol) {
      const transform = (texture as any)[transformSymbol]
      transform.scale['x'] = uvScale
      transform.scale['y'] = uvScale
      texture.applyTextureTransform()
    }
  } catch {
    // silent
  }
}

/** Material name fragments that must not receive fabric texturing (structural parts). */
export const NO_FABRIC_PARTS = [
  'leg', 'legs', 'foot', 'feet', 'frame', 'wood', 'metal',
  'support', 'stand', 'caster', 'wheel', 'arm_rest_wood', 'armrest_wood',
]

export interface ApplyTextureOptions {
  /** Pre-fetched blob URL for the base/diffuse texture. Pass null to skip. */
  baseBlobUrl: string | null
  roughness: number
  metalness: number
  /** UV repeat scale applied to every map. Defaults to 1 (no tiling). */
  uvScale?: number
  /** Material name fragments to skip (e.g. legs, frame). */
  skipParts?: string[]
  /** Pre-fetched blob URL for the metallic-roughness map. Pass null to skip. */
  roughnessBlobUrl?: string | null
  /** Pre-fetched blob URL for the normal map. Pass null to skip. */
  normalBlobUrl?: string | null
  /** Pre-fetched blob URL for the sheen color map. Pass null to skip. */
  sheenBlobUrl?: string | null
}

/**
 * Applies a fabric texture (and optional PBR maps) to all eligible materials
 * on a model-viewer element.
 *
 * Blob URLs passed in are NOT revoked by this function — the caller owns them
 * and must revoke them after this call resolves.
 */
export async function applyTextureToModel(mv: any, options: ApplyTextureOptions): Promise<void> {
  const {
    baseBlobUrl,
    roughness,
    metalness,
    uvScale = 1,
    skipParts = [],
    roughnessBlobUrl = null,
    normalBlobUrl = null,
    sheenBlobUrl = null,
  } = options

  const model = mv.model
  if (!model) return

  // Create shared texture objects once — they can be safely reused across materials.
  const baseTexture = baseBlobUrl ? await mv.createTexture(baseBlobUrl) : null
  const roughnessTexture = roughnessBlobUrl ? await mv.createTexture(roughnessBlobUrl) : null
  const normalTexture = normalBlobUrl ? await mv.createTexture(normalBlobUrl) : null
  const sheenTexture = sheenBlobUrl ? await mv.createTexture(sheenBlobUrl) : null
console.log(sheenTexture);

  for (const m of model.materials) {
    const partName = (m.name ?? '').toLowerCase()
    if (skipParts.length > 0 && skipParts.some((part) => partName.includes(part))) continue
    try {
      m.pbrMetallicRoughness.setRoughnessFactor(roughness)
      m.pbrMetallicRoughness.setMetallicFactor(metalness)
      m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1])

      if (baseTexture) {
        await m.pbrMetallicRoughness.baseColorTexture.setTexture(baseTexture)
        if (uvScale !== 1) applyTiling(m.pbrMetallicRoughness.baseColorTexture, uvScale)
      }
      if (roughnessTexture) {
        await m.pbrMetallicRoughness.metallicRoughnessTexture.setTexture(roughnessTexture)
        if (uvScale !== 1) applyTiling(m.pbrMetallicRoughness.metallicRoughnessTexture, uvScale)
      }
      if (normalTexture) {
        await m.normalTexture.setTexture(normalTexture)
        if (uvScale !== 1) applyTiling(m.normalTexture, uvScale)
      }

      if (sheenTexture && false) {
        try {
          if (m.sheenColorTexture) {
            await m.sheenColorTexture.setTexture(sheenTexture)
            if (typeof m.setSheenColorFactor === 'function') {
              m.setSheenColorFactor([1, 1, 1])
            }
            if (typeof m.setSheenRoughnessFactor === 'function') {
              m.setSheenRoughnessFactor(0.5)
            }
          }
        } catch(error) {
          console.log(error)
        }
      }
    } catch(error) {
          console.log(error)
    }
  }
}
