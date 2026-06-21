import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { getProductsPaginated, type ProductSortOption } from '@/lib/products'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const VALID_SORTS: ProductSortOption[] = ['name-asc', 'name-desc', 'price-low', 'price-high', 'newest']

export async function GET(request: NextRequest) {
  const rateLimited = checkRateLimit(request, 'api:products', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const { searchParams } = new URL(request.url)
    const sortParam = searchParams.get('sort') as ProductSortOption | null
    const sort = sortParam && VALID_SORTS.includes(sortParam) ? sortParam : 'newest'

    const result = await getProductsPaginated({
      categorySlug: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      sort,
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
      limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10))),
    })

    return NextResponse.json({
      products: result.products,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
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