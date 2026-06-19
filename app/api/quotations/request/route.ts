import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { TAX_RATE } from '@/lib/constants'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:quotations:request', 20, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return Response.json({ error: 'Please log in to request a quote' }, { status: 401 })
    }

    // Find or create customer record
    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: session.user.id,
          businessName: session.user.name || undefined,
          creditLimit: 50000,
        },
      })
    }

    const body = await req.json()
    const { productId, quantity = 1, notes } = body

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    const qty = Math.max(1, parseInt(quantity) || 1)
    const unitPrice = product.wholesalePrice || product.retailPrice
    const subtotal = unitPrice * qty
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT-${Date.now()}`,
        customerId: customer.id,
        status: 'draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal,
        discount: 0,
        tax,
        total,
        notes: notes || `Customer quote request for ${product.name} (qty: ${qty})`,
        items: {
          create: [
            {
              productId: product.id,
              quantity: qty,
              unitPrice,
              total: subtotal,
            },
          ],
        },
      },
      include: { items: { include: { product: true } } },
    })

    return Response.json({ success: true, quotationId: quotation.id })
  } catch (error) {
    console.error('Customer quote request error:', error)
    return Response.json({ error: 'Failed to submit quote request' }, { status: 500 })
  }
}
