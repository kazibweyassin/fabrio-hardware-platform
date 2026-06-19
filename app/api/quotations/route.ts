import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'
import { TAX_RATE } from '@/lib/constants'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:quotations', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(req.headers)
    const body = await req.json()
    const { customerId, items, discount, notes } = body

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let subtotal = 0
    for (const item of items) {
      if (!item.productId || !item.quantity || item.unitPrice == null) {
        return Response.json({ error: 'Invalid quotation item' }, { status: 400 })
      }
      subtotal += item.unitPrice * item.quantity
    }

    const discountPercent = Math.min(100, Math.max(0, discount || 0))
    const discountAmount = subtotal * (discountPercent / 100)
    const beforeTax = subtotal - discountAmount
    const tax = beforeTax * TAX_RATE
    const total = beforeTax + tax

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT-${Date.now()}`,
        customerId,
        status: 'draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal,
        discount: discountAmount,
        tax,
        total,
        notes,
        items: {
          create: items.map((item: { productId: string; quantity: number; unitPrice: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    return Response.json(quotation)
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error creating quotation:', error)
    return Response.json({ error: 'Failed to create quotation' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:quotations:write', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(req.headers)
    const body = await req.json()
    const { quotationId, status } = body

    if (!quotationId || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired']
    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatedQuotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: { status },
      include: { items: { include: { product: true } } },
    })

    return Response.json(updatedQuotation)
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error updating quotation:', error)
    return Response.json({ error: 'Failed to update quotation' }, { status: 500 })
  }
}