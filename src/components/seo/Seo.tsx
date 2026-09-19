import { useLocation } from 'react-router-dom'

export const SITE_NAME = 'KAIRA'
export const SITE_URL = 'https://kairafabrics.com'
export const DEFAULT_OG_IMAGE = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/hero/v1/h2.webp'
export const pageTitle = (page: string) => `${page} | ${SITE_NAME}`

type SeoProps = {
  title: string
  description: string
  /** Absolute URL to a social-preview image. Defaults to the site's default OG image. */
  image?: string
  /** Set true only for pages that must not be indexed (e.g. /admin) */
  noindex?: boolean
}

export default function Seo({ title, description, image = DEFAULT_OG_IMAGE, noindex = false }: SeoProps) {
  const { pathname } = useLocation()
  const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const canonicalUrl = `${SITE_URL}${canonicalPath}`

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  )
}
