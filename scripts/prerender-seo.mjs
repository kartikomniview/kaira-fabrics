// Post-build step: writes static HTML snapshots (dist/collections/index.html and
// dist/collections/<slug>/index.html) with per-page title/description/OG/Twitter tags
// baked in, cloned from the built dist/index.html template. Social-preview bots and
// search crawlers read whatever HTML is returned by the first HTTP request and don't
// execute JS, so the client-side <Seo> component alone can't give them per-collection
// tags — these prerendered files fill that gap, and (being real files at the exact
// requested path) are served natively with HTTP 200 instead of the SPA's 404 fallback.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SITE_NAME = 'KAIRA'
const SITE_URL = 'https://kairafabrics.com'
const MATERIALS_URL = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/data/materials/v3/newmaterials.ts'
const S3_COVER = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics'
const DIST_DIR = path.resolve(import.meta.dirname, '..', 'dist')

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function loadCollections() {
  const res = await fetch(MATERIALS_URL)
  if (!res.ok) throw new Error(`Failed to fetch materials data: ${res.status} ${res.statusText}`)
  const text = await res.text()
  const match = text.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/)
  if (!match) throw new Error('Could not locate materials array in fetched data')
  const materials = JSON.parse(match[1])

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

function renderPage(template, { title, description, image, url }) {
  let html = template
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
  html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`)
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
  const collections = await loadCollections()

  await writePage('collections', renderPage(template, {
    title: `Collections | ${SITE_NAME}`,
    description: "Browse KAIRA's curated collections of premium fabrics and leathers — filter by material and texture to find the perfect fit for your interior project.",
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

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml')
  const sitemap = await readFile(sitemapPath, 'utf8')
  const collectionUrls = collections.map((c) => `${SITE_URL}/collections/${c.id}`)
  await writeFile(sitemapPath, appendSitemapEntries(sitemap, collectionUrls), 'utf8')

  console.log(`Prerendered ${collections.length + 1} collection pages (1 listing + ${collections.length} detail pages)`)
}

main().catch((err) => {
  console.error('[prerender-seo] failed:', err)
  process.exit(1)
})
