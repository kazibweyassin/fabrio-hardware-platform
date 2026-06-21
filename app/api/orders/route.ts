import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { calculateOrderTotals } from '@/lib/pricing'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { notifyOrderByEmail } from '@/lib/order-email'
import { MAX_LINE_ITEM_QUANTITY } from '@/lib/constants'
import { generateOrderNumber } from '@/lib/reference-numbers'

const orderInclude = {
  items: { include: { product: true } },
  payment: true,
  customer: { include: { user: true } },
} as const

export async function GET(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:orders', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await requireAuth(req.headers)
    const isAdmin = session.user.role === 'admin'
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    if (isAdmin) {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          include: orderInclude,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count(),
      ])

      return Response.json({
        orders,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
      })
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    })

    if (!customer) {
      return Response.json({ orders: [], pagination: { total: 0, page: 1, limit, pages: 1 } })
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: customer.id },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { customerId: customer.id } }),
    ])

    return Response.json({
      orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:orders:create', RATE_LIMITS.orders.limit, RATE_LIMITS.orders.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await requireAuth(req.headers)
    const body = await req.json()
    const { items, shippingAddress, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!customer) {
      return Response.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    })

    if (products.length !== productIds.length) {
      return Response.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const productMap = new Map(products.map((product) => [product.id, product]))

    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId)
      const quantity = Number(item.quantity)

      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_ITEM_QUANTITY) {
        throw new Error('Invalid cart item quantity')
      }

      if (product.retailPrice <= 0) {
        throw new Error(`Product "${product.name}" does not have a price yet`)
      }

      const unitPrice = product.retailPrice
      return {
        productId: product.id,
        quantity,
        unitPrice,
        total: unitPrice * quantity,
      }
    })

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
    const totals = calculateOrderTotals(subtotal)

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          userId: customer.userId,
          status: 'pending',
          subtotal: totals.subtotal,
          tax: totals.tax,
          shipping: totals.shipping,
          total: totals.total,
          shippingAddress: shippingAddress || null,
          notes: notes || null,
          items: { create: orderItems },
        },
        include: { items: true },
      })

      await tx.payment.create({
        data: {
          orderId: created.id,
          method: 'mobile_money',
          amount: totals.total,
          status: 'pending',
        },
      })

      return created
    })

    notifyOrderByEmail(order.id, 'pending').catch(console.error)

    return Response.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: totals.total,
      paymentMethod: 'mobile_money',
    })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error creating order:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return Response.json({ error: message }, { status: 500 })
  }
}