import { prisma } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Prisma } from '@prisma/client'

export type ProductSortOption = 'name-asc' | 'name-desc' | 'price-low' | 'price-high' | 'newest'

export type ProductQueryParams = {
  categorySlug?: string
  search?: string
  sort?: ProductSortOption
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  page?: number
  limit?: number
}

export function categorySlugToName(slug: string) {
  return slug.replace(/-/g, ' ')
}

export function buildProductWhereClause(params: ProductQueryParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true }

  if (params.categorySlug) {
    where.category = {
      name: {
        equals: categorySlugToName(params.categorySlug),
        mode: 'insensitive',
      },
    }
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { sku: { contains: params.search, mode: 'insensitive' } },
      { catalogId: { contains: params.search, mode: 'insensitive' } },
      { subcategory: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  if (params.minPrice != null || params.maxPrice != null || params.inStock) {
    where.retailPrice = {
      ...(params.minPrice != null ? { gte: params.minPrice } : {}),
      ...(params.maxPrice != null ? { lte: params.maxPrice } : {}),
      ...(params.inStock ? { gt: 0 } : {}),
    }
  }

  return where
}

export function buildProductOrderBy(sort: ProductSortOption = 'name-asc'): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'name-desc':
      return { name: 'desc' }
    case 'price-low':
      return { retailPrice: 'asc' }
    case 'price-high':
      return { retailPrice: 'desc' }
    case 'newest':
      return { createdAt: 'desc' }
    default:
      return { name: 'asc' }
  }
}

export async function getProductsPaginated(params: ProductQueryParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(100, Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE))
  const skip = (page - 1) * limit
  const where = buildProductWhereClause(params)
  const orderBy = buildProductOrderBy(params.sort)

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return { products, total, page, limit, pages: Math.ceil(total / limit) || 1 }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0, page, limit, pages: 1 }
  }
}

export async function getFeaturedProducts(limit = 6) {
  try {
    const withImages = await prisma.product.findMany({
      where: {
        active: true,
        image: { not: null },
        retailPrice: { gt: 0 },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
      take: limit,
    })

    if (withImages.length >= limit) {
      return withImages
    }

    const fallback = await prisma.product.findMany({
      where: {
        active: true,
        retailPrice: { gt: 0 },
        id: { notIn: withImages.map((product) => product.id) },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
      take: limit - withImages.length,
    })

    return [...withImages, ...fallback]
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getFlashSaleProducts(limit = 3) {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        retailPrice: { gt: 0 },
      },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    })

    return products
      .filter((p) => p.retailPrice > p.basePrice)
      .map((p) => ({
        ...p,
        discountPercent: Math.round(((p.retailPrice - p.basePrice) / p.retailPrice) * 100),
      }))
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching flash sale products:', error)
    return []
  }
}

export async function getCategoriesWithCounts() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}