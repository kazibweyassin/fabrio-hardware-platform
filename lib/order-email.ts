import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function notifyOrderByEmail(
  orderId: string,
  status: 'pending' | 'confirmed'
): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        customer: { include: { user: true } },
      },
    })

    if (!order?.customer?.user?.email) return

    await sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customer.user.name || order.customer.businessName || 'Customer',
      customerEmail: order.customer.user.email,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        total: item.total,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      orderId: order.id,
      status,
    })
  } catch (error) {
    console.error('Order email notification failed:', error)
  }
}