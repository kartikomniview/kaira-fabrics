const S3_OUTPUTS_BASE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ai-visualizer/outputs'

// Mirrors the Lambda's safeKeyPart() so the S3 key we probe matches the one it writes to.
const safeKeyPart = (v: string) => (v || 'NA').trim().replace(/[^a-zA-Z0-9-_]+/g, '_') || 'NA'

// Lambda's `ext` comes from the Gemini response mimeType, so a cached output may be png or webp.
const EXTENSIONS = ['png', 'webp']

const probe = async (url: string): Promise<boolean> => {
  try {
    // S3's CORS rule here only allows GET (not HEAD), so probe with a 1-byte range request instead.
    const res = await fetch(url, { headers: { Range: 'bytes=0-0' }, cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}

/** Check S3 directly for a previously rendered output, avoiding a round trip through the logs API. */
export async function findCachedRender(collectionName: string, materialCode: string, productName: string): Promise<string | null> {
  const collectionKeyPart = safeKeyPart(collectionName)
  const productKeyPart = safeKeyPart(productName)
  const materialKeyPart = safeKeyPart(materialCode)
  const keyBase = `${collectionKeyPart}/${productKeyPart}/${collectionKeyPart}_${materialKeyPart}`

  for (const ext of EXTENSIONS) {
    const url = `${S3_OUTPUTS_BASE}/${keyBase}.${ext}`
    if (await probe(url)) return url
  }
  return null
}
