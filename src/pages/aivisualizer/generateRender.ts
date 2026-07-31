import * as UAParser from 'ua-parser-js'
import { getUvValue } from '../../utils/textureUtils'
import { categoryMeta, normalizeType } from '../../components/sections/FabricCategoriesSection'

// ── Dev toggle: set to true to skip OTP and go directly to result ─────────────
export const BYPASS_OTP = false

const API_BASE = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

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
}

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

/** Draws the collection/material badge (+ optional fabric thumbnail) top-right of the canvas. */
function drawMaterialBadge(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  thumbImg: HTMLImageElement | null,
  collectionName: string,
  materialCode: string | undefined,
): void {
  const label = (materialCode ? `${collectionName} - ${materialCode}` : collectionName).toUpperCase()

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
  const badgeY = Math.round(canvas.height * 0.02)

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

/** Draws the base image + logo + optional material badge + AI watermark onto an existing canvas. */
function composeOverlay(
  canvas: HTMLCanvasElement,
  mainImg: HTMLImageElement,
  logoImg: HTMLImageElement,
  thumbImg: HTMLImageElement | null,
  materialInfo?: MaterialBadgeInfo,
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

  if (materialInfo) {
    drawMaterialBadge(ctx, canvas, thumbImg, materialInfo.collectionName, materialInfo.materialCode)
  }

  drawAiWatermark(ctx, canvas)
}

export async function overlayLogo(imageUrl: string, logoUrl: string, materialInfo?: MaterialBadgeInfo): Promise<string> {
  const [mainImg, logoImg] = await Promise.all([loadImage(imageUrl), loadImage(logoUrl)])

  const thumbImg = materialInfo
    ? await loadImage(materialInfo.thumbnailUrl).catch(() => null)
    : null

  if (materialInfo) {
    await document.fonts.load(`700 20px ${BADGE_FONT_STACK}`).catch(() => {})
  }

  const canvas = document.createElement('canvas')
  composeOverlay(canvas, mainImg, logoImg, thumbImg, materialInfo)

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
  materialInfo?: MaterialBadgeInfo,
): Promise<void> {
  const [mainImg, logoImg] = await Promise.all([loadImage(imageUrl, false), loadImage(logoUrl, false)])

  const thumbImg = materialInfo
    ? await loadImage(materialInfo.thumbnailUrl, false).catch(() => null)
    : null

  if (materialInfo) {
    await document.fonts.load(`700 20px ${BADGE_FONT_STACK}`).catch(() => {})
  }

  composeOverlay(canvas, mainImg, logoImg, thumbImg, materialInfo)
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

export interface GenerateRenderParams {
  selectedMaterial: SelectedMaterial
  selectedProduct: SelectedProduct
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
    // Resolve fabric image: base64 object for custom uploads, plain URL for inventory
    const fabricImage = selectedMaterial.isCustom
      ? extractFromDataUrl(selectedMaterial.textureUrl)
      : selectedMaterial.textureUrl

    // Resolve product image: base64 object for custom uploads, plain URL for inventory
    const productImage = selectedProduct.isCustom
      ? extractFromDataUrl(selectedProduct.imageUrl)
      : selectedProduct.imageUrl

    const uvScale = getUvValue(selectedMaterial.collectionName)

    const materialTypeLabel = selectedMaterial.materialType
      ? (categoryMeta[normalizeType(selectedMaterial.materialType)]?.label ?? selectedMaterial.materialType)
      : null

    // The API uses only `prompt` for Gemini generateImages, so embed context in prompt.
    const prompt = [
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

    const device_info = buildDeviceInfo()

    const logoUrl = '/images/kaira.webp'

    const response = await fetch(`${API_BASE}/ai-visualize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputImages: [fabricImage, productImage],
        prompt,
        mobile_number: mobileNumber,
        name,
        device_info,
        collection_name: selectedMaterial.collectionName,
        material_code: selectedMaterial.materialCode,
        product_name: selectedProduct.productName,
      }),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      throw new Error(errBody.message || `API error: ${response.status}`)
    }


    const data = await response.json()

    if (!data.imageUrl) {
      throw new Error('API returned no image URL')
    }

    const composited = await overlayLogo(data.imageUrl, logoUrl, {
      collectionName: selectedMaterial.collectionName,
      materialCode: selectedMaterial.materialCode,
      thumbnailUrl: selectedMaterial.textureUrl,
    })
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
  mobileNumber: string
  name: string
  outputUrl: string
}

/** Records a log entry for a cache-hit render, which never calls /ai-visualize so is never logged there. */
export async function logCachedRender({
  selectedMaterial,
  selectedProduct,
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
