import { prisma } from '@/lib/db'

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
      take: 50,
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