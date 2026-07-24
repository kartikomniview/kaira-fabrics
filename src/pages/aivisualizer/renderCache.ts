const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

/** Look up the most recent successful render for a given collection + material code + product. */
export async function findCachedRender(collectionName: string, materialCode: string, productName: string): Promise<string | null> {
  try {
    const token = import.meta.env.VITE_ADMIN_TOKEN ?? ''
    const res = await fetch(`${API}/visualizer-logs`, { headers: { 'admin-token': token } })
    if (!res.ok) return null
    const json = await res.json()
    const rows: Array<Record<string, unknown>> = Array.isArray(json)
      ? json
      : (json.data ?? json.items ?? json.logs ?? [])

    const matches = rows.filter((r) => {
      const status = String(r.status ?? '').toLowerCase()
      return r.collection_name === collectionName
        && r.material_code === materialCode
        && r.product_name === productName
        && (status === 'success' || status === 'completed')
        && !!r.output_url
    })
    if (matches.length === 0) return null

    matches.sort((a, b) => new Date(String(b.created_at ?? 0)).getTime() - new Date(String(a.created_at ?? 0)).getTime())
    return matches[0].output_url as string
  } catch {
    return null
  }
}
