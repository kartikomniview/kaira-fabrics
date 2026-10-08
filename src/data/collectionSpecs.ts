import specsData from './collectionSpecs.json'

/** Technical specs per collection, keyed by collection id (slug, e.g. 'alaska'), stored in
 *  collectionSpecs.json so scripts/prerender-seo.mjs can read the same data at build time.
 *  Example entry: "alaska": { "composition": "...", "width": "...", "weight": "...", "martindale": "..." }
 *  Every field is optional — the material page only shows rows that have a value,
 *  and hides the whole specs table for collections with no entry here.
 *
 *  Material pages are `noindex` until their collection has specs filled in
 *  (see `hasSpecs` and scripts/prerender-seo.mjs) to avoid hundreds of thin, near-identical pages. */
export interface CollectionSpecs {
  composition?: string
  width?: string
  weight?: string
  martindale?: string
  backing?: string
  fireRating?: string
  rollLength?: string
  moq?: string
}

export const SPEC_LABELS: Record<keyof CollectionSpecs, string> = {
  composition: 'Composition',
  width: 'Width',
  weight: 'Weight (GSM)',
  martindale: 'Martindale rub count',
  backing: 'Backing',
  fireRating: 'Fire rating',
  rollLength: 'Roll length',
  moq: 'Minimum order',
}

export const collectionSpecs: Record<string, CollectionSpecs> = specsData

export const hasSpecs = (collectionId: string) =>
  Object.values(collectionSpecs[collectionId] ?? {}).some(Boolean)
