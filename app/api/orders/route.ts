import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { calculateOrderTotals } from '@/lib/pricing'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { notifyOrderByEmail } from '@/lib/order-email'

export async function GET(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:orders', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await requireAuth(req.headers)
    const isAdmin = session.user.role === 'admin'

    if (isAdmin) {
      const orders = await prisma.order.findMany({
        include: {
          items: { include: { product: true } },
          payment: true,
          customer: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return Response.json({ orders })
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    })

    if (!customer) {
      return Response.json({ orders: [] })
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ orders })
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
      if (!product || item.quantity < 1) {
        throw new Error('Invalid cart item')
      }

      if (product.retailPrice <= 0) {
        throw new Error(`Product "${product.name}" does not have a price yet`)
      }

      const unitPrice = product.retailPrice
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        total: unitPrice * item.quantity,
      }
    })

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
    const totals = calculateOrderTotals(subtotal)

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId: customer.id,
        userId: customer.userId,
        status: 'pending',
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        shippingAddress: shippingAddress || null,
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    })

    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'mobile_money',
        amount: totals.total,
        status: 'pending',
      },
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