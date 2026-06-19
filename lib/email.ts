import { formatCurrency } from './format'
import { getAppUrl } from './env'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{ name: string; quantity: number; total: number }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  orderId: string
  status: 'pending' | 'confirmed'
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Fabrio Hardware <orders@fabrio.com>'

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[email:dev]', { to, subject })
    }
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Email send failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

function buildOrderEmailHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name} x${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(item.total)}</td>
        </tr>`
    )
    .join('')

  const title =
    data.status === 'confirmed' ? 'Payment Confirmed' : 'Order Received'

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <h1 style="color:#1a56db;">Fabrio Hardware</h1>
      <h2>${title}</h2>
      <p>Hi ${data.customerName},</p>
      <p>Your order <strong>${data.orderNumber}</strong> has been ${data.status === 'confirmed' ? 'paid and is being processed' : 'received and is awaiting payment'}.</p>
      <table style="width:100%;margin:24px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;">Item</th>
            <th style="text-align:right;padding-bottom:8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <table style="width:100%;margin-bottom:24px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${formatCurrency(data.subtotal)}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right;">${formatCurrency(data.shipping)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right;">${formatCurrency(data.tax)}</td></tr>
        <tr><td><strong>Total</strong></td><td style="text-align:right;"><strong>${formatCurrency(data.total)}</strong></td></tr>
      </table>
      <p><a href="${getAppUrl()}/orders/${data.orderId}" style="color:#1a56db;">View your order</a></p>
      <p style="color:#666;font-size:12px;">Questions? Contact support@fabrio.com</p>
    </div>
  `
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const subject =
    data.status === 'confirmed'
      ? `Payment confirmed — Order ${data.orderNumber}`
      : `Order received — ${data.orderNumber}`

  await sendEmail({
    to: data.customerEmail,
    subject,
    html: buildOrderEmailHtml(data),
  })
}