import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(request, 'api:products', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(request, 'api:products:write', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(request.headers)
    const { id } = await params
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        categoryId: body.categoryId,
        subcategory: body.subcategory,
        catalogId: body.catalogId,
        sku: body.sku,
        basePrice: body.basePrice,
        retailPrice: body.retailPrice,
        wholesalePrice: body.wholesalePrice,
        image: body.image,
        active: body.active,
      },
      include: { category: true },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Product PUT error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(request, 'api:products:write', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(request.headers)
    const { id } = await params

    await prisma.product.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Product DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}