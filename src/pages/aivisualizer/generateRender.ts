// ── Dev toggle: set to true to skip OTP and go directly to result ─────────────
export const BYPASS_OTP = false

/** Extract base64 data and mimeType from a data URL (already in memory) */
function extractFromDataUrl(dataUrl: string): { data: string; mimeType: string } {
  const [header, data] = dataUrl.split(',')
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  return { data, mimeType }
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
  onGeneratingChange: (value: boolean) => void
  onShowOTPChange: (value: boolean) => void
  onResult: (imageUrl: string) => void
  onError?: (message: string) => void
}

export async function generateRender({
  selectedMaterial,
  selectedProduct,
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
      `Apply the fabric texture (first image) onto the furniture product (second image).`,
      `Produce a single photorealistic product render with the fabric fully applied.`,
      `The fabric texture (color, weave, pattern) must match exactly.`,
      `Keep the product shape, proportions, and lighting realistic.`,
      `Place the sofa in a warm, modern living room lifestyle setting — soft natural light from a side window, subtle interior decor in the background (plants, a rug, a side table).`,
      `The background should be tasteful and slightly out of focus (shallow depth of field) so the sofa and its fabric remain the clear hero of the image.`,
      `Do not let any background element distract from the sofa or its fabric detail.`,
      `Output aspect ratio 1:1.`,
    ].join(' ')

    const response = await fetch('https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage/ai-visualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputImages: [fabricImage, productImage],
        prompt,
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

    onResult(data.imageUrl)
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
