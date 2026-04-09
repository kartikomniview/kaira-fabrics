/**
 * Shared model-viewer texture utilities used by the 3D Visualizer, ThreeDModal,
 * and MaterialDetailModal.
 */
import * as THREE from 'three'

const S3_ORIGIN = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'

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
  'support', 'stand', 'caster', 'wheel', 'arm_rest_wood', 'armrest_wood','piping',
]

export const FABRIC_PARTS = [
  'seat', 'back', 'cushion', 'pad', 'upholstery', 'fabric', 'cover', 'body', 'armrest', 'base', 'armrest_pad', 'headrest', 'ottoman',
]

export interface SheenOptions {
  /** Amount to brighten the lightness (0–1). Default: 0.3 */
  lighten?: number
  /** Factor to reduce saturation (0 = fully desaturated, 1 = unchanged). Default: 0.5 */
  desaturate?: number
  /** Fractional hue rotation (-1 to 1). Default: 0 */
  hueShift?: number
}

/**
 * Calculates the average color of an image, then adjusts it via HSL
 * to produce a pleasant sheen tint.
 */
export function getAverageColorHex(image: HTMLImageElement, options: SheenOptions = {}): THREE.Color {
  const { lighten = 0.3, desaturate = 0.5, hueShift = 0 } = options
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context || !image) return new THREE.Color(0xffffff)

    canvas.width = image.width || 64
    canvas.height = image.height || 64
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const data = context.getImageData(0, 0, canvas.width, canvas.height).data
    let r = 0, g = 0, b = 0
    const pixelCount = data.length / 4

    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }

    r /= pixelCount
    g /= pixelCount
    b /= pixelCount

    const color = new THREE.Color(r / 255, g / 255, b / 255)
    const hsl = { h: 0, s: 0, l: 0 }
    color.getHSL(hsl)

    hsl.l = Math.min(1, hsl.l + lighten)
    hsl.s *= desaturate
    hsl.h = ((hsl.h + hueShift) % 1 + 1) % 1

    return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l)
  } catch {
    return new THREE.Color(0xffffff)
  }
}

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
  /** Three.js mesh objects collected at model-load time. When provided, textures
   * are applied directly to their MeshPhysicalMaterial instead of going through
   * the model-viewer abstraction layer. */
  meshes?: any[]
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
    meshes,
  } = options

  // ── Fast path: apply directly to Three.js MeshPhysicalMaterial instances ──
  if (meshes && meshes.length > 0) {
    const loader = new THREE.TextureLoader()
    const loadTex = (url: string): Promise<THREE.Texture | null> =>
      new Promise((resolve) => loader.load(url, resolve, undefined, () => resolve(null)))

    const [baseTex, roughTex, normalTex, sheenTex] = await Promise.all([
      baseBlobUrl ? loadTex(baseBlobUrl) : Promise.resolve(null),
      roughnessBlobUrl ? loadTex(roughnessBlobUrl) : Promise.resolve(null),
      normalBlobUrl ? loadTex(normalBlobUrl) : Promise.resolve(null),
      sheenBlobUrl ? loadTex(sheenBlobUrl) : Promise.resolve(null),
    ])

    if (baseTex) {
      baseTex.colorSpace = THREE.SRGBColorSpace
      baseTex.flipY = false
    }
    if (roughTex) {
      roughTex.colorSpace = THREE.LinearSRGBColorSpace
      roughTex.flipY = false
    }
    if (normalTex) {
      normalTex.colorSpace = THREE.LinearSRGBColorSpace
      normalTex.flipY = false
    }
    if (sheenTex) {
      sheenTex.colorSpace = THREE.SRGBColorSpace
      sheenTex.flipY = false
    }

   
    for (const tex of [baseTex, roughTex, normalTex, sheenTex]) {
      if (!tex) continue
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      if (uvScale !== 1) tex.repeat.set(uvScale, uvScale)
      tex.needsUpdate = true
    }

    for (const mesh of meshes) {
      const partName = (mesh.name ?? '').toLowerCase()
      if (!partName) continue
      if (partName.includes('shadow')) continue
      if (skipParts.length > 0 && skipParts.some((p) => partName.includes(p))) continue

      const isAllowed = FABRIC_PARTS.some((p) => partName.includes(p) || p.includes(partName))
      if (!isAllowed) continue

      const mat = mesh.material as THREE.MeshPhysicalMaterial
      if (baseTex) mat.map = baseTex
      if (roughTex) mat.roughnessMap = roughTex
      if (normalTex) mat.normalMap = normalTex
      if (sheenTex) {
         let avgBaseColor = new THREE.Color(0xffffff)
        if (baseTex && baseTex.image) {
          if(mat.map && (mat.map as any).image) {
            avgBaseColor = getAverageColorHex((mat.map as any).image, { lighten: 0.25, desaturate: 0.4, hueShift: -0.02 })
          }
        }

        mat.sheenColorMap = sheenTex
        mat.sheen = 1.0
        mat.sheenColor = avgBaseColor
      } else {
        mat.sheen = 0.0
        mat.sheenColorMap = null
      }
      mat.roughness = roughness
      console.log(roughness,mat.roughness)
      mat.metalness = metalness
      mat.color.set(0xffffff)
      mat.needsUpdate = true
    }

    // Force render update for direct Three.js modifications
    try {
      const sceneSymbol = Object.getOwnPropertySymbols(mv).find((s: any) => s.description === 'scene')
      if (sceneSymbol && mv[sceneSymbol]) {
        const scn = mv[sceneSymbol] as any
        if (typeof scn.queueRender === 'function') scn.queueRender()
        else if (typeof scn.markDirty === 'function') scn.markDirty()
      }
    } catch { /* silent */ }

    return
  }

  const model = mv.model
  if (!model) return

  // Create shared texture objects once — they can be safely reused across materials.
  const baseTexture = baseBlobUrl ? await mv.createTexture(baseBlobUrl) : null
  const roughnessTexture = roughnessBlobUrl ? await mv.createTexture(roughnessBlobUrl) : null
  const normalTexture = normalBlobUrl ? await mv.createTexture(normalBlobUrl) : null
  const sheenTexture = sheenBlobUrl ? await mv.createTexture(sheenBlobUrl) : null

  for (const m of model.materials) {
    const partName = (m.name ?? '').toLowerCase()
    if (!partName) continue
    if (partName.includes('shadow')) continue
    if (skipParts.length > 0 && skipParts.some((part) => partName.includes(part))) continue

    const isAllowed = FABRIC_PARTS.some((p) => partName.includes(p) || p.includes(partName))
    if (!isAllowed) continue

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
