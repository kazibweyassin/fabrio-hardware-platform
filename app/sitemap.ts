import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { getAppUrl } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/auth/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
      take: 2000,
      orderBy: { updatedAt: 'desc' },
    })

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...productRoutes]
  } catch {
    return staticRoutes
  }
}