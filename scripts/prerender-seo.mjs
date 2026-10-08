// Post-build step: writes static HTML snapshots (dist/collections/index.html,
// dist/collections/<slug>/index.html and dist/collections/<slug>/<code>/index.html)
// with per-page title/description/OG/Twitter tags
// baked in, cloned from the built dist/index.html template. Social-preview bots and
// search crawlers read whatever HTML is returned by the first HTTP request and don't
// execute JS, so the client-side <Seo> component alone can't give them per-collection
// tags — these prerendered files fill that gap, and (being real files at the exact
// requested path) are served natively with HTTP 200 instead of the SPA's 404 fallback.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SITE_NAME = 'KAIRA'
const SITE_URL = 'https://kairafabrics.com'
// Must match S3_URL in src/data/newmaterials.ts
const MATERIALS_URL = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/data/materials/v5/newmaterials.ts'
const S3_COVER = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics'
const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'
const DIST_DIR = path.resolve(import.meta.dirname, '..', 'dist')
const SPECS_PATH = path.resolve(import.meta.dirname, '..', 'src', 'data', 'collectionSpecs.json')

// Mirrors categoryMeta labels in src/components/sections/FabricCategoriesSection.tsx
const CATEGORY_LABELS = {
  BOUCLE: 'Boucle',
  DIGITALPRINT: 'Digital Print',
  LEATHERITE: 'Artificial Leather',
  ARTIFICIALLEATHER: 'Artificial Leather',
  SUEDEFABRIC: 'Suede Fabric',
  SUEDELEATHER: 'Suede Leather',
}
const categoryLabel = (type) => CATEGORY_LABELS[(type ?? '').toUpperCase().replace(/\s+/g, '')] ?? type

// Mirrors isTextureMapCode in src/data/collections.ts
const isTextureMapCode = (code) => /roughness|normal|displacement/i.test(code ?? '')

// Mirrors colourWord in src/pages/MaterialDetailPage.tsx
const colourWord = (group) => {
  if (!group) return ''
  const word = group.toLowerCase().replace(/s$/, '')
  return word === 'gray' ? 'grey' : word
}

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function loadMaterials() {
  const res = await fetch(MATERIALS_URL)
  if (!res.ok) throw new Error(`Failed to fetch materials data: ${res.status} ${res.statusText}`)
  const text = await res.text()
  const match = text.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/)
  if (!match) throw new Error('Could not locate materials array in fetched data')
  return JSON.parse(match[1])
}

function buildCollections(materials) {
  const collectionMap = new Map()
  for (const m of materials) {
    if (!collectionMap.has(m.collection_name)) {
      collectionMap.set(m.collection_name, { count: 0, materialType: m.material_type })
    }
    collectionMap.get(m.collection_name).count++
  }

  return Array.from(collectionMap.entries()).map(([name, data]) => ({
    id: slugify(name),
    name,
    description: `Premium ${data.materialType} collection featuring ${data.count} unique fabric variants.`,
    image: `${S3_COVER}/${name}.webp`,
  }))
}

function renderPage(template, { title, description, image, url, noindex = false }) {
  let html = template
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
  const robots = noindex ? '\n    <meta name="robots" content="noindex, follow" />' : ''
  html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />${robots}`)
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
  // og:image:width/height are only accurate for the default 1200x630 hero image;
  // strip them since per-collection cover images aren't guaranteed that aspect ratio.
  html = html.replace(/\s*<meta property="og:image:width" content="1200" \/>/, '')
  html = html.replace(/\s*<meta property="og:image:height" content="630" \/>/, '')
  html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${image}" />`)
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
  html = html.replace(/<meta property="og:site_name" content=".*?" \/>/, `<meta property="og:site_name" content="${SITE_NAME}" />`)
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`)
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${image}" />`)
  return html
}

async function writePage(relDir, html) {
  const dir = path.join(DIST_DIR, relDir)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), html, 'utf8')
}

function appendSitemapEntries(sitemap, urls) {
  const entries = urls
    .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
    .join('\n')
  return sitemap.replace('</urlset>', `${entries}\n</urlset>`)
}

async function main() {
  const template = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8')
  const materials = await loadMaterials()
  const collections = buildCollections(materials)
  const specs = JSON.parse(await readFile(SPECS_PATH, 'utf8'))
  const hasSpecs = (id) => Object.values(specs[id] ?? {}).some(Boolean)

  await writePage('collections', renderPage(template, {
    title: `Fabric & Leather Collections | ${SITE_NAME}`,
    description: "Browse KAIRA's boucle, suede fabric, suede leather, artificial leather and digital-print collections. Filter by material, request samples or a trade catalog.",
    image: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/banner/v1/banner1.webp',
    url: `${SITE_URL}/collections`,
  }))

  for (const collection of collections) {
    await writePage(`collections/${collection.id}`, renderPage(template, {
      title: `${collection.name} Fabric Collection | ${SITE_NAME}`,
      description: collection.description,
      image: collection.image,
      url: `${SITE_URL}/collections/${collection.id}`,
    }))
  }

  // Material (shade) pages — noindex until their collection has specs in collectionSpecs.json,
  // but always prerendered so shared links return 200 with the swatch as the preview image.
  const indexableMaterialUrls = []
  let materialCount = 0
  for (const collection of collections) {
    const shades = materials.filter((m) => m.collection_name === collection.name && !isTextureMapCode(m.material_code))
    const indexable = hasSpecs(collection.id)
    for (const m of shades) {
      const label = categoryLabel(m.material_type)
      const displayName = `${collection.name} ${m.material_name}`
      const colour = colourWord(m.color_group)
      const summary =
        `${displayName} is a${colour ? ` ${colour}` : ''}${m.pattern ? ` ${m.pattern.toLowerCase()}` : ''} ${label.toLowerCase()} ` +
        `from KAIRA's ${collection.name} collection${shades.length > 1 ? `, available in ${shades.length} shades` : ''}.`
      const url = `${SITE_URL}/collections/${collection.id}/${encodeURIComponent(m.material_code)}`
      await writePage(`collections/${collection.id}/${m.material_code}`, renderPage(template, {
        title: `${displayName} ${label} | ${SITE_NAME}`,
        description: `${summary} View it up close, preview it in 3D on a sofa, or request a physical sample.`,
        image: `${S3_THUMB}/${encodeURIComponent(m.collection_name)}/${encodeURIComponent(m.material_code)}.webp`,
        url,
        noindex: !indexable,
      }))
      materialCount++
      if (indexable) indexableMaterialUrls.push(url)
    }
  }

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml')
  const sitemap = await readFile(sitemapPath, 'utf8')
  const collectionUrls = collections.map((c) => `${SITE_URL}/collections/${c.id}`)
  await writeFile(sitemapPath, appendSitemapEntries(sitemap, [...collectionUrls, ...indexableMaterialUrls]), 'utf8')

  console.log(`Prerendered ${collections.length + 1} collection pages (1 listing + ${collections.length} detail pages)`)
  console.log(`Prerendered ${materialCount} material pages (${indexableMaterialUrls.length} indexable, added to sitemap)`)
}

main().catch((err) => {
  console.error('[prerender-seo] failed:', err)
  process.exit(1)
})
