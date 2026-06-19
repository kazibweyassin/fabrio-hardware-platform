import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:wishlist', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const products = wishlists.map((w) => w.product).filter(Boolean)

    return Response.json({ products })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return Response.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:wishlist:write', 60, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await req.json()

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 })
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId, active: true },
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      create: {
        userId: session.user.id,
        productId,
      },
      update: {},
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return Response.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:wishlist:write', 60, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await req.json()

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 })
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return Response.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
