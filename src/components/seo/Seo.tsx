import { useLocation } from 'react-router-dom'

export const SITE_NAME = 'KAIRA'
export const SITE_URL = 'https://kairafabrics.in'
export const pageTitle = (page: string) => `${page} | ${SITE_NAME}`

type SeoProps = {
  title: string
  description: string
  /** Set true only for pages that must not be indexed (e.g. /admin) */
  noindex?: boolean
}

export default function Seo({ title, description, noindex = false }: SeoProps) {
  const { pathname } = useLocation()
  const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const canonicalUrl = `${SITE_URL}${canonicalPath}`

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </>
  )
}
