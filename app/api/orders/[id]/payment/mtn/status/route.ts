import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { isMtnMomoConfigured } from '@/lib/env'
import { getRequestToPayStatus, mapMtnStatusToPaymentStatus } from '@/lib/mtn-momo'
import { applyPaymentStatus } from '@/lib/payment-updates'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, 'api:orders:payment:mtn:status', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  if (!isMtnMomoConfigured()) {
    return Response.json({ error: 'MTN MoMo API is not configured' }, { status: 503 })
  }

  try {
    const session = await requireAuth(req.headers)
    const { id } = await params

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

    if (!order.payment?.mtnReferenceId) {
      return Response.json({ error: 'No MTN payment request found for this order' }, { status: 404 })
    }

    const mtnStatus = await getRequestToPayStatus(order.payment.mtnReferenceId)
    const paymentStatus = mapMtnStatusToPaymentStatus(mtnStatus.status)

    const payment = await applyPaymentStatus(order.id, paymentStatus, {
      transactionRef: mtnStatus.financialTransactionId,
      notes: mtnStatus.reason,
    })

    return Response.json({
      mtnStatus: mtnStatus.status,
      paymentStatus,
      payment,
    })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('MTN MoMo status check error:', error)
    return Response.json({ error: 'Failed to check payment status' }, { status: 500 })
  }
}