import { prisma } from '@/lib/db'
import { requireAdmin, requireAuth } from '@/lib/auth-helpers'
import { ORDER_STATUSES } from '@/lib/constants'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, 'api:orders', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await requireAuth(req.headers)
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        customer: true,
      },
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const isOwner = order.userId === session.user.id
    const isAdminUser = session.user.role === 'admin'

    if (!isOwner && !isAdminUser) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    return Response.json(order)
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error fetching order:', error)
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, 'api:orders:admin', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(req.headers)
    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!status || !ORDER_STATUSES.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    })

    return Response.json(order)
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error updating order:', error)
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  }
}