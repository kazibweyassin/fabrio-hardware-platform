import { prisma } from './db'
import { notifyOrderByEmail } from './order-email'

export async function applyPaymentStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  extra?: {
    transactionRef?: string
    notes?: string
  }
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  })

  if (!order?.payment) return null

  if (order.payment.status === status && status === 'completed') {
    return order.payment
  }

  const payment = await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status,
      ...(extra?.transactionRef ? { transactionRef: extra.transactionRef } : {}),
      ...(extra?.notes ? { notes: extra.notes } : {}),
    },
  })

  if (status === 'completed' && order.status === 'pending') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'processing' },
    })
    notifyOrderByEmail(order.id, 'confirmed').catch(console.error)
  }

  if (status === 'failed' && order.status === 'pending') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' },
    })
  }

  return payment
}