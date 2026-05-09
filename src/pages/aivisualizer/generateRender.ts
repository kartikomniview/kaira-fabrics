import * as UAParser from 'ua-parser-js'

// ── Dev toggle: set to true to skip OTP and go directly to result ─────────────
export const BYPASS_OTP = false

/** Extract base64 data and mimeType from a data URL (already in memory) */
function extractFromDataUrl(dataUrl: string): { data: string; mimeType: string } {
  const [header, data] = dataUrl.split(',')
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  return { data, mimeType }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

async function overlayLogo(imageUrl: string, logoUrl: string): Promise<string> {
  const [mainImg, logoImg] = await Promise.all([loadImage(imageUrl), loadImage(logoUrl)])

  const canvas = document.createElement('canvas')
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

  return canvas.toDataURL('image/jpeg', 0.95)
}

export interface SelectedMaterial {
  id: string | number
  fabricName: string
  textureUrl: string
  collectionName: string
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
  onGeneratingChange: (value: boolean) => void
  onShowOTPChange: (value: boolean) => void
  onResult: (imageUrl: string) => void
  onError?: (message: string) => void
}

export async function generateRender({
  selectedMaterial,
  selectedProduct,
  mobileNumber,
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

    // The API uses only `prompt` for Gemini generateImages, so embed context in prompt.
    const prompt = [
      `You are a photorealistic furniture renderer.`,
      `Your task: apply the fabric texture (first image) onto the furniture product (second image) and produce a complete lifestyle render.`,
      `CRITICAL — do not alter the product in any way: preserve its exact silhouette, structure, leg style, arm style, back height, cushion count, and all design details. Only the upholstery fabric changes.`,
      `The fabric texture (color, weave, and pattern) must be replicated exactly as shown in the first image.`,
      `Study the product's style, scale, and design language, then build the ideal lifestyle scene around it — the room era, mood, color palette, lighting quality, and decor props must all be chosen to best complement this specific product.`,
      `The product should be prominently placed and the natural focal point of the fully rendered scene.`,
      `Output aspect ratio 1:1.`,
    ].join(' ')

    const ua = new UAParser.UAParser().getResult()
    const device_info = JSON.stringify({
      browser: { name: ua.browser.name, version: ua.browser.version },
      os: { name: ua.os.name, version: ua.os.version },
      device: { type: ua.device.type ?? 'desktop', vendor: ua.device.vendor, model: ua.device.model },
      screen: { width: window.screen.width, height: window.screen.height },
      language: navigator.language,
    })

    const logoUrl = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/Visualizer/KairaLogo.png'

    const response = await fetch('https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage/ai-visualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputImages: [fabricImage, productImage],
        prompt,
        mobile_number: mobileNumber,
        device_info,
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

    const composited = await overlayLogo(data.imageUrl, logoUrl)
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
