import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { MOBILE_MONEY_BUSINESS_NAME } from '@/lib/constants'
import { isValidUgandaPhone, normalizeUgandaPhone } from '@/lib/mobile-money'
import { getMtnMomoConfig, isMtnMomoConfigured } from '@/lib/env'
import { requestToPay } from '@/lib/mtn-momo'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, 'api:orders:payment:mtn', 5, RATE_LIMITS.orders.windowMs)
  if (rateLimited) return rateLimited

  if (!isMtnMomoConfigured()) {
    return Response.json({ error: 'MTN MoMo API is not configured' }, { status: 503 })
  }

  try {
    const session = await requireAuth(req.headers)
    const { id } = await params
    const body = await req.json()
    const { payerPhone } = body

    if (!payerPhone || !isValidUgandaPhone(payerPhone)) {
      return Response.json({ error: 'Enter a valid Uganda MTN number (e.g. 0771234567)' }, { status: 400 })
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

    if (order.payment.status === 'processing' && order.payment.mtnReferenceId) {
      return Response.json({
        success: true,
        referenceId: order.payment.mtnReferenceId,
        message: 'Payment request already sent. Check your phone to approve.',
      })
    }

    const referenceId = randomUUID()
    const config = getMtnMomoConfig()
    const msisdn = normalizeUgandaPhone(payerPhone)

    await requestToPay({
      referenceId,
      amount: order.total,
      currency: config.currency,
      externalId: order.orderNumber,
      payerMsisdn: msisdn,
      payerMessage: `Payment for ${order.orderNumber}`,
      payeeNote: MOBILE_MONEY_BUSINESS_NAME,
      callbackUrl: config.callbackUrl,
    })

    const payment = await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        method: 'mobile_money_mtn',
        mobileProvider: 'mtn',
        payerPhone: msisdn,
        mtnReferenceId: referenceId,
        status: 'processing',
      },
    })

    return Response.json({
      success: true,
      referenceId,
      payment,
      message: 'Payment request sent. Approve the prompt on your MTN phone.',
    })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('MTN MoMo requestToPay error:', error)
    const message = error instanceof Error ? error.message : 'Failed to initiate MTN payment'
    return Response.json({ error: message }, { status: 500 })
  }
}