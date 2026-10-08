import * as UAParser from 'ua-parser-js'
import { getUvValue } from '../../utils/textureUtils'
import { categoryMeta, normalizeType } from '../../components/sections/FabricCategoriesSection'
import { getVerificationToken } from '../../lib/renderLimit'
import { safeKeyPart } from './renderCache'

// ── Dev toggle: set to true to skip OTP and go directly to result ─────────────
export const BYPASS_OTP = false

const API_BASE = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

/** Error message passed to onError when the Lambda rejects the mobile verification token. */
export const OTP_REQUIRED_ERROR = 'OTP_REQUIRED'

function buildDeviceInfo(): string {
  const ua = new UAParser.UAParser().getResult()
  return JSON.stringify({
    browser: { name: ua.browser.name, version: ua.browser.version },
    os: { name: ua.os.name, version: ua.os.version },
    device: { type: ua.device.type ?? 'desktop', vendor: ua.device.vendor, model: ua.device.model },
    screen: { width: window.screen.width, height: window.screen.height },
    language: navigator.language,
  })
}

/** Extract base64 data and mimeType from a data URL (already in memory) */
function extractFromDataUrl(dataUrl: string): { data: string; mimeType: string } {
  const [header, data] = dataUrl.split(',')
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  return { data, mimeType }
}

function loadImage(url: string, anonymous = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (anonymous) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

export interface MaterialBadgeInfo {
  collectionName: string
  materialCode?: string
  thumbnailUrl: string
  /** Part the fabric is on (e.g. "Seat Cushion"), shown as a prefix when rendering several fabrics */
  partLabel?: string
}

const toBadgeList = (info?: MaterialBadgeInfo | MaterialBadgeInfo[]): MaterialBadgeInfo[] =>
  !info ? [] : Array.isArray(info) ? info : [info]

const BADGE_FONT_STACK = '"ITC Avant Garde Gothic BT", "Century Gothic", "Trebuchet MS", sans-serif'

/** Draws a rounded-rect path (ctx.roundRect isn't available in every supported browser). */
function tracePillPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Draws the collection/material badge (+ optional fabric thumbnail) top-right of the canvas,
 * starting at `badgeY`. Returns the badge height so callers can stack several.
 */
function drawMaterialBadge(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  thumbImg: HTMLImageElement | null,
  info: MaterialBadgeInfo,
  badgeY: number,
): number {
  const { collectionName, materialCode, partLabel } = info
  const fabricLabel = materialCode ? `${collectionName} - ${materialCode}` : collectionName
  const label = (partLabel ? `${partLabel} · ${fabricLabel}` : fabricLabel).toUpperCase()

  const thumbSize = thumbImg ? Math.round(canvas.height * 0.06) : 0
  const fontSize = Math.round(canvas.height * 0.022)
  const padding = Math.round(canvas.height * 0.015)
  const gap = thumbImg ? Math.round(canvas.height * 0.015) : 0

  ctx.font = `700 ${fontSize}px ${BADGE_FONT_STACK}`
  const textWidth = ctx.measureText(label).width

  const contentHeight = Math.max(thumbSize, fontSize)
  const badgeHeight = padding * 2 + contentHeight
  const badgeWidth = padding * 2 + thumbSize + gap + textWidth
  const badgeX = Math.round(canvas.width * 0.98 - badgeWidth)

  tracePillPath(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2)
  ctx.fillStyle = 'rgba(87, 73, 41, 0.75)'
  ctx.fill()

  let cursorX = badgeX + padding
  const centerY = badgeY + badgeHeight / 2

  if (thumbImg) {
    const thumbY = centerY - thumbSize / 2
    const thumbRadius = thumbSize * 0.25
    ctx.save()
    tracePillPath(ctx, cursorX, thumbY, thumbSize, thumbSize, thumbRadius)
    ctx.clip()
    // Cover-fit crop of the thumbnail into the square slot
    const scale = Math.max(thumbSize / thumbImg.naturalWidth, thumbSize / thumbImg.naturalHeight)
    const drawW = thumbImg.naturalWidth * scale
    const drawH = thumbImg.naturalHeight * scale
    ctx.drawImage(thumbImg, cursorX + (thumbSize - drawW) / 2, thumbY + (thumbSize - drawH) / 2, drawW, drawH)
    ctx.restore()
    ctx.lineWidth = Math.max(1, canvas.height * 0.002)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    tracePillPath(ctx, cursorX, thumbY, thumbSize, thumbSize, thumbRadius)
    ctx.stroke()
    cursorX += thumbSize + gap
  }

  ctx.font = `700 ${fontSize}px ${BADGE_FONT_STACK}`
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(label, cursorX, centerY)
  return badgeHeight
}

/** Draws a subtle "AI Generated" watermark bottom-right of the canvas. */
function drawAiWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const fontSize = Math.round(canvas.height * 0.018)
  const margin = Math.round(canvas.height * 0.02)

  ctx.font = `600 ${fontSize}px ${BADGE_FONT_STACK}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'

  const x = canvas.width - margin
  const y = canvas.height - margin

  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = fontSize * 0.3
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillText('For visualization purposes only. Actual fabric appearance may vary.', x, y)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}

/** Draws the base image + logo + optional material badge(s) + AI watermark onto an existing canvas. */
function composeOverlay(
  canvas: HTMLCanvasElement,
  mainImg: HTMLImageElement,
  logoImg: HTMLImageElement,
  thumbImgs: (HTMLImageElement | null)[],
  badges: MaterialBadgeInfo[],
): void {
  canvas.width = mainImg.naturalWidth
  canvas.height = mainImg.naturalHeight

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(mainImg, 0, 0)

  // Logo height ~7% of image, centered horizontally, 2% margin from top
  const logoHeight = Math.round(mainImg.naturalHeight * 0.12)
  const logoWidth = Math.round(logoImg.naturalWidth * (logoHeight / logoImg.naturalHeight))
  const logoX = Math.round((canvas.width - logoWidth) / 2)
  const logoY = Math.round(canvas.height * 0.02)

  ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight)

  let badgeY = Math.round(canvas.height * 0.02)
  const badgeGap = Math.round(canvas.height * 0.01)
  badges.forEach((info, i) => {
    badgeY += drawMaterialBadge(ctx, canvas, thumbImgs[i] ?? null, info, badgeY) + badgeGap
  })

  drawAiWatermark(ctx, canvas)
}

export async function overlayLogo(imageUrl: string, logoUrl: string, materialInfo?: MaterialBadgeInfo | MaterialBadgeInfo[]): Promise<string> {
  const badges = toBadgeList(materialInfo)
  const [mainImg, logoImg] = await Promise.all([loadImage(imageUrl), loadImage(logoUrl)])

  const thumbImgs = await Promise.all(badges.map((b) => loadImage(b.thumbnailUrl).catch(() => null)))

  if (badges.length > 0) {
    await document.fonts.load(`700 20px ${BADGE_FONT_STACK}`).catch(() => {})
  }

  const canvas = document.createElement('canvas')
  composeOverlay(canvas, mainImg, logoImg, thumbImgs, badges)

  return canvas.toDataURL('image/jpeg', 0.95)
}

/**
 * Live-preview variant of overlayLogo(): draws the same base image + overlay onto a
 * caller-supplied, on-screen <canvas> instead of an offscreen one. Used as the fallback
 * when the upfront overlayLogo() call failed (e.g. the render's hotlink can't be loaded
 * with crossOrigin='anonymous'), so images load in non-anonymous mode here — they'll
 * always display, but this taints the canvas, meaning canvas.toBlob()/toDataURL() on it
 * may throw a SecurityError. Callers should catch that and fall back to a plain hotlink download.
 */
export async function renderOverlayToCanvas(
  canvas: HTMLCanvasElement,
  imageUrl: string,
  logoUrl: string,
  materialInfo?: MaterialBadgeInfo | MaterialBadgeInfo[],
): Promise<void> {
  const badges = toBadgeList(materialInfo)
  const [mainImg, logoImg] = await Promise.all([loadImage(imageUrl, false), loadImage(logoUrl, false)])

  const thumbImgs = await Promise.all(badges.map((b) => loadImage(b.thumbnailUrl, false).catch(() => null)))

  if (badges.length > 0) {
    await document.fonts.load(`700 20px ${BADGE_FONT_STACK}`).catch(() => {})
  }

  composeOverlay(canvas, mainImg, logoImg, thumbImgs, badges)
}

export interface SelectedMaterial {
  id: string | number
  fabricName: string
  textureUrl: string
  collectionName: string
  materialCode?: string
  materialType?: string
  isCustom?: boolean
}

export interface SelectedProduct {
  id: string | number
  productName: string
  imageUrl: string
  isCustom?: boolean
}

/** A fabric applied to one part of the product, on top of the base (whole-product) fabric. */
export interface PartFabric {
  /** Part key as used by the 3D model meshes, e.g. "Seat" */
  part: string
  /** Human label sent to the AI and shown on the badge, e.g. "Seat Cushion" */
  partLabel: string
  material: SelectedMaterial
}

/**
 * Deterministic, S3-safe id for a part combination, e.g. "Back-Linen_L5__Seat-Velvet_V2".
 * Returns undefined for a plain whole-product render so the original cache key is used.
 */
export function buildVariantKey(partFabrics?: PartFabric[]): string | undefined {
  if (!partFabrics?.length) return undefined
  return [...partFabrics]
    .sort((a, b) => a.part.localeCompare(b.part))
    .map((pf) => `${safeKeyPart(pf.part)}-${safeKeyPart(pf.material.collectionName)}_${safeKeyPart(String(pf.material.materialCode ?? 'NA'))}`)
    .join('__')
}

/** Badge list for the result image: the base fabric, then one pill per part override. */
export function buildBadges(material: SelectedMaterial, partFabrics?: PartFabric[]): MaterialBadgeInfo[] {
  const base: MaterialBadgeInfo = {
    collectionName: material.collectionName,
    materialCode: material.materialCode,
    thumbnailUrl: material.textureUrl,
  }
  if (!partFabrics?.length) return [base]
  return [
    { ...base, partLabel: 'All' },
    ...partFabrics.map((pf) => ({
      collectionName: pf.material.collectionName,
      materialCode: pf.material.materialCode,
      thumbnailUrl: pf.material.textureUrl,
      partLabel: pf.partLabel,
    })),
  ]
}

/** Compact JSON stored on the AI log so admins can see which fabric went on which part. */
export function serializePartFabrics(partFabrics?: PartFabric[]): string | undefined {
  if (!partFabrics?.length) return undefined
  return JSON.stringify(partFabrics.map((pf) => ({
    part: pf.part,
    part_label: pf.partLabel,
    collection_name: pf.material.collectionName,
    material_code: pf.material.materialCode,
  })))
}

const materialTypeLabelOf = (m: SelectedMaterial) =>
  m.materialType ? (categoryMeta[normalizeType(m.materialType)]?.label ?? m.materialType) : null

const resolveFabricImage = (m: SelectedMaterial) => (m.isCustom ? extractFromDataUrl(m.textureUrl) : m.textureUrl)

/** Original single-fabric prompt — unchanged so whole-product renders behave exactly as before. */
function buildSingleFabricPrompt(material: SelectedMaterial): string {
  const uvScale = getUvValue(material.collectionName)
  const materialTypeLabel = materialTypeLabelOf(material)
  return [
    `You are a photorealistic furniture renderer.`,
    `Your task: apply the fabric texture (first image) onto the furniture product (second image) and produce a complete lifestyle render.`,
    `CRITICAL — do not alter the product in any way: preserve its exact silhouette, structure, leg style, arm style, back height, cushion count, and all design details. Only the upholstery fabric changes.`,
    `The fabric texture (color, weave, and pattern) must be replicated exactly as shown in the first image.`,
    materialTypeLabel
      ? `This fabric is a ${materialTypeLabel} material — render its surface properties (sheen, texture depth, and light response) true to that material type.`
      : ``,
    `Use the correct UV mapping and tiling scale for the fabric: repeat the texture pattern approximately ${uvScale} times across the full upholstered surface, matching real-world fabric scale — do not stretch, shrink, or distort the weave/pattern to fit the surface.`,
    `Study the product's style, scale, and design language, then build the ideal lifestyle scene around it — the room era, mood, color palette, lighting quality, and decor props must all be chosen to best complement this specific product.`,
    `The product should be prominently placed and the natural focal point of the fully rendered scene.`,
  ].filter(Boolean).join(' ')
}

/**
 * Multi-fabric prompt + image list. Fabrics are de-duplicated so the same fabric used on several
 * parts is sent once; image order is [fabric 1 (base), fabric 2, …, product].
 */
function buildPartFabricRequest(material: SelectedMaterial, partFabrics: PartFabric[]) {
  const fabrics: SelectedMaterial[] = [material]
  const fabricIndexOf = (m: SelectedMaterial) => {
    const idx = fabrics.findIndex((f) => f.textureUrl === m.textureUrl)
    if (idx >= 0) return idx
    fabrics.push(m)
    return fabrics.length - 1
  }
  const assignments = partFabrics.map((pf) => ({ label: pf.partLabel, n: fabricIndexOf(pf.material) + 1 }))
  const productImageNo = fabrics.length + 1

  const fabricLines = fabrics.map((f, i) => {
    const typeLabel = materialTypeLabelOf(f)
    return [
      `Fabric ${i + 1} is image ${i + 1}${typeLabel ? ` (a ${typeLabel} material — render its sheen, texture depth, and light response true to that type)` : ''};`,
      `repeat its pattern approximately ${getUvValue(f.collectionName)} times across the surfaces it covers.`,
    ].join(' ')
  })

  const prompt = [
    `You are a photorealistic furniture renderer.`,
    `You are given ${productImageNo} images: images 1 to ${fabrics.length} are fabric textures, and image ${productImageNo} is the furniture product.`,
    ...fabricLines,
    `Your task: reupholster the product (image ${productImageNo}) using these fabrics and produce a complete lifestyle render.`,
    `Fabric assignment — the entire upholstery uses Fabric 1, EXCEPT: ${assignments.map((a) => `${a.label} → Fabric ${a.n}`).join('; ')}.`,
    `Each part must show only its assigned fabric, with clean, natural seams where different fabrics meet. Do not blend fabrics together and do not apply a fabric to any part it is not assigned to.`,
    `CRITICAL — do not alter the product in any way: preserve its exact silhouette, structure, leg style, arm style, back height, cushion count, and all design details. Only the upholstery fabric changes.`,
    `Each fabric's color, weave, and pattern must be replicated exactly as shown in its image — do not stretch, shrink, or distort the weave/pattern to fit the surface.`,
    `Study the product's style, scale, and design language, then build the ideal lifestyle scene around it — the room era, mood, color palette, lighting quality, and decor props must all be chosen to best complement this specific product.`,
    `The product should be prominently placed and the natural focal point of the fully rendered scene.`,
  ].join(' ')

  return { prompt, fabricImages: fabrics.map(resolveFabricImage) }
}

export interface GenerateRenderParams {
  selectedMaterial: SelectedMaterial
  selectedProduct: SelectedProduct
  /** Per-part fabric overrides; selectedMaterial is then the base fabric for all other parts */
  partFabrics?: PartFabric[]
  mobileNumber: string
  name: string
  onGeneratingChange: (value: boolean) => void
  onShowOTPChange: (value: boolean) => void
  onResult: (imageUrl: string) => void
  onError?: (message: string) => void
}

export async function generateRender({
  selectedMaterial,
  selectedProduct,
  partFabrics,
  mobileNumber,
  name,
  onGeneratingChange,
  onShowOTPChange,
  onResult,
  onError,
}: GenerateRenderParams): Promise<void> {
  onShowOTPChange(true)
  onGeneratingChange(true)
  let hasError = false
  try {
    // Resolve product image: base64 object for custom uploads, plain URL for inventory
    const productImage = selectedProduct.isCustom
      ? extractFromDataUrl(selectedProduct.imageUrl)
      : selectedProduct.imageUrl

    // The API uses only `prompt` for Gemini generateImages, so embed context in prompt.
    const { prompt, fabricImages } = partFabrics?.length
      ? buildPartFabricRequest(selectedMaterial, partFabrics)
      : { prompt: buildSingleFabricPrompt(selectedMaterial), fabricImages: [resolveFabricImage(selectedMaterial)] }

    const device_info = buildDeviceInfo()

    const logoUrl = '/images/kaira.webp'

    const response = await fetch(`${API_BASE}/ai-visualize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputImages: [...fabricImages, productImage],
        prompt,
        mobile_number: mobileNumber,
        name,
        device_info,
        collection_name: selectedMaterial.collectionName,
        material_code: selectedMaterial.materialCode,
        product_name: selectedProduct.productName,
        part_fabrics: serializePartFabrics(partFabrics),
        variant_key: buildVariantKey(partFabrics),
        verification_token: getVerificationToken(mobileNumber),
      }),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      if (errBody.code === OTP_REQUIRED_ERROR) throw new Error(OTP_REQUIRED_ERROR)
      throw new Error(errBody.message || `API error: ${response.status}`)
    }


    const data = await response.json()

    if (!data.imageUrl) {
      throw new Error('API returned no image URL')
    }

    const composited = await overlayLogo(data.imageUrl, logoUrl, buildBadges(selectedMaterial, partFabrics))
    onResult(composited)
  } catch (err) {
    hasError = true
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('AI generation failed:', err)
    onError?.(message)
  } finally {
    onGeneratingChange(false)
    // Keep modal open on error so the error panel stays visible
    if (!hasError) onShowOTPChange(false)
  }
}

export interface LogCachedRenderParams {
  selectedMaterial: SelectedMaterial
  selectedProduct: SelectedProduct
  partFabrics?: PartFabric[]
  mobileNumber: string
  name: string
  outputUrl: string
}

/** Records a log entry for a cache-hit render, which never calls /ai-visualize so is never logged there. */
export async function logCachedRender({
  selectedMaterial,
  selectedProduct,
  partFabrics,
  mobileNumber,
  name,
  outputUrl,
}: LogCachedRenderParams): Promise<void> {
  try {
    await fetch(`${API_BASE}/create-ai-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile_number: mobileNumber,
        output_url: outputUrl,
        device_info: buildDeviceInfo(),
        status: 'success',
        name,
        collection_name: selectedMaterial.collectionName,
        material_code: selectedMaterial.materialCode,
        product_name: selectedProduct.productName,
        part_fabrics: serializePartFabrics(partFabrics),
        verification_token: getVerificationToken(mobileNumber),
      }),
    })
  } catch (err) {
    console.error('Failed to log cached render:', err)
  }
}

export interface GenerationLimitInfo {
  limit: number
  used: number
  remaining: number
}

/** Fetches the server-computed daily generation limit/usage for a mobile number. */
export async function fetchGenerationLimit(mobileNumber: string): Promise<GenerationLimitInfo> {
  const res = await fetch(`${API_BASE}/generation-limit?mobile=${encodeURIComponent(mobileNumber)}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
