import { prisma } from '@/lib/db'
import { mapMtnStatusToPaymentStatus } from '@/lib/mtn-momo'
import { applyPaymentStatus } from '@/lib/payment-updates'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:webhooks:mtn-momo', RATE_LIMITS.webhooks.limit, RATE_LIMITS.webhooks.windowMs)
  if (rateLimited) return rateLimited

  try {
    const referenceId = req.headers.get('x-reference-id')
    if (!referenceId) {
      return Response.json({ error: 'Missing X-Reference-Id header' }, { status: 400 })
    }

    const body = (await req.json()) as {
      status?: string
      financialTransactionId?: string
      reason?: { message?: string }
    }

    const payment = await prisma.payment.findUnique({
      where: { mtnReferenceId: referenceId },
      include: { order: true },
    })

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 })
    }

    const mtnStatus = (body.status || 'PENDING') as 'PENDING' | 'SUCCESSFUL' | 'FAILED'
    const paymentStatus = mapMtnStatusToPaymentStatus(mtnStatus)

    await applyPaymentStatus(payment.orderId, paymentStatus, {
      transactionRef: body.financialTransactionId,
      notes: body.reason?.message,
    })

    return Response.json({ received: true })
  } catch (error) {
    console.error('MTN MoMo webhook error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}