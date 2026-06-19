import { prisma } from '@/lib/db'
import { requireAdmin, requireAuth } from '@/lib/auth-helpers'
import { MOBILE_MONEY_PROVIDERS, PAYMENT_STATUSES } from '@/lib/constants'
import { isValidUgandaPhone, normalizeUgandaPhone } from '@/lib/mobile-money'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { applyPaymentStatus } from '@/lib/payment-updates'

type MobileMoneyProvider = keyof typeof MOBILE_MONEY_PROVIDERS

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, 'api:orders:payment', 10, RATE_LIMITS.orders.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await requireAuth(req.headers)
    const { id } = await params
    const body = await req.json()
    const { provider, payerPhone, transactionRef } = body

    if (!provider || !MOBILE_MONEY_PROVIDERS[provider as MobileMoneyProvider]) {
      return Response.json({ error: 'Select MTN or Airtel Mobile Money' }, { status: 400 })
    }

    if (!payerPhone || !isValidUgandaPhone(payerPhone)) {
      return Response.json({ error: 'Enter a valid Uganda mobile number (e.g. 0771234567)' }, { status: 400 })
    }

    if (!transactionRef || String(transactionRef).trim().length < 4) {
      return Response.json({ error: 'Enter the transaction ID from your mobile money SMS' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!order.payment) {
      return Response.json({ error: 'Payment record not found' }, { status: 404 })
    }

    if (order.payment.status === 'completed') {
      return Response.json({ error: 'Payment already confirmed' }, { status: 400 })
    }

    const payment = await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        method: `mobile_money_${provider}`,
        mobileProvider: provider,
        payerPhone: normalizeUgandaPhone(payerPhone),
        transactionRef: String(transactionRef).trim(),
        status: 'processing',
      },
    })

    return Response.json({
      success: true,
      payment,
      message: 'Payment submitted. We will verify your mobile money transaction shortly.',
    })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error submitting mobile money payment:', error)
    return Response.json({ error: 'Failed to submit payment' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, 'api:orders:payment:admin', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(req.headers)
    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!status || !PAYMENT_STATUSES.includes(status)) {
      return Response.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    })

    if (!order?.payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = await applyPaymentStatus(order.id, status)
    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 })
    }

    return Response.json({ payment })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error updating payment:', error)
    return Response.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}