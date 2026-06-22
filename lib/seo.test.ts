import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  truncateDescription,
  categoryNameToSlug,
  buildProductsCanonicalPath,
  buildPageMetadata,
} from './seo'

describe('truncateDescription', () => {
  it('truncates long text with ellipsis', () => {
    const long = 'a'.repeat(200)
    expect(truncateDescription(long, 160).length).toBeLessThanOrEqual(160)
    expect(truncateDescription(long, 160).endsWith('…')).toBe(true)
  })
})

describe('categoryNameToSlug', () => {
  it('converts category names to URL slugs', () => {
    expect(categoryNameToSlug('Safety & PPE')).toBe('safety-&-ppe')
  })
})

describe('buildProductsCanonicalPath', () => {
  it('builds canonical catalog paths', () => {
    expect(buildProductsCanonicalPath({ category: 'hand-tools', page: '2' })).toBe(
      '/products?category=hand-tools&page=2'
    )
    expect(buildProductsCanonicalPath({})).toBe('/products')
  })
})

describe('buildPageMetadata', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://fabrio.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('marks noindex pages correctly', () => {
    const meta = buildPageMetadata({ title: 'Cart', path: '/cart', noIndex: true })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })
})