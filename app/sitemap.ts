import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { getAppUrl } from '@/lib/env'
import { categoryNameToSlug } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/auth/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: { id: true, updatedAt: true },
        take: 5000,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.category.findMany({
        select: { name: true, updatedAt: true },
        orderBy: { name: 'asc' },
      }),
    ])

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/products?category=${categoryNameToSlug(category.name)}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...categoryRoutes, ...productRoutes]
  } catch {
    return staticRoutes
  }
}