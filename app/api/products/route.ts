import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const rateLimited = checkRateLimit(request, 'api:products', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where = {
      active: true,
      ...(category && {
        category: {
          name: { contains: category, mode: 'insensitive' as const },
        },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
          { catalogId: { contains: search, mode: 'insensitive' as const } },
          { subcategory: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, 'api:products:write', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(request.headers)
    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      subcategory,
      catalogId,
      sku,
      basePrice,
      retailPrice,
      wholesalePrice,
      image,
      active = true,
    } = body

    if (!name || !categoryId || !sku || retailPrice == null || basePrice == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        categoryId,
        subcategory,
        catalogId,
        sku,
        basePrice,
        retailPrice,
        wholesalePrice,
        image,
        active,
      },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}