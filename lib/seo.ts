import type { Metadata } from 'next'
import { getAppUrl } from '@/lib/env'

export const SITE_NAME = 'Fabrio Hardware'
export const SITE_TAGLINE = 'Industrial Safety & Equipment'
export const DEFAULT_DESCRIPTION =
  'Premium construction hardware, OSHA-certified PPE, and industrial equipment in Uganda. Bulk pricing, fast fulfillment, and dedicated B2B support for contractors and enterprises.'

export const DEFAULT_KEYWORDS = [
  'industrial hardware Uganda',
  'PPE supplier Uganda',
  'construction equipment Kampala',
  'safety gear wholesale',
  'B2B hardware Uganda',
  'OSHA certified PPE',
  'power tools Uganda',
  'hand tools supplier',
  'Fabrio Hardware',
]

export function categoryNameToSlug(name: string): string {
  return name.toLowerCase().replace(/ /g, '-')
}

export function absoluteUrl(path = '/'): string {
  const base = getAppUrl().replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function truncateDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  return `${cleaned.slice(0, max - 1).trimEnd()}…`
}

export function buildCanonical(path: string): string {
  return absoluteUrl(path)
}

type PageMetadataInput = {
  title: string
  description?: string
  path?: string
  keywords?: string[]
  noIndex?: boolean
  image?: string | null
  type?: 'website' | 'product'
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  keywords = [],
  noIndex = false,
  image,
  type = 'website',
}: PageMetadataInput): Metadata {
  const desc = truncateDescription(description)
  const canonical = buildCanonical(path)
  const ogImage = image ? (image.startsWith('http') ? image : absoluteUrl(image)) : absoluteUrl('/fabrio-logo.png')
  const mergedKeywords = [...new Set([...DEFAULT_KEYWORDS, ...keywords])]

  return {
    title,
    description: desc,
    keywords: mergedKeywords,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: type === 'product' ? 'website' : 'website',
      locale: 'en_UG',
      url: canonical,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description: desc,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description: desc,
      images: [ogImage],
    },
  }
}

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/fabrio-logo.png'),
    description: DEFAULT_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bweyogerere',
      addressRegion: 'Kampala',
      addressCountry: 'UG',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+256-700-123-456',
      contactType: 'customer service',
      email: 'support@fabrio.com',
      areaServed: 'UG',
      availableLanguage: 'English',
    },
    sameAs: [],
  }
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/products')}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildProductJsonLd(product: {
  id: string
  name: string
  description?: string | null
  sku: string
  image?: string | null
  retailPrice: number
  categoryName?: string
  inStock: boolean
}) {
  const offers =
    product.retailPrice > 0
      ? {
          '@type': 'Offer',
          priceCurrency: 'UGX',
          price: product.retailPrice,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: absoluteUrl(`/products/${product.id}`),
          seller: { '@type': 'Organization', name: SITE_NAME },
        }
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — available from ${SITE_NAME}`,
    sku: product.sku,
    image: product.image ? (product.image.startsWith('http') ? product.image : absoluteUrl(product.image)) : undefined,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.categoryName,
    offers,
  }
}

export function buildItemListJsonLd(
  products: Array<{ id: string; name: string }>,
  listName: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/products/${product.id}`),
      name: product.name,
    })),
  }
}

export function buildProductsCanonicalPath(params: {
  category?: string
  search?: string
  page?: string
}): string {
  const qs = new URLSearchParams()
  if (params.category) qs.set('category', params.category)
  if (params.search) qs.set('search', params.search)
  if (params.page && params.page !== '1') qs.set('page', params.page)
  const query = qs.toString()
  return query ? `/products?${query}` : '/products'
}