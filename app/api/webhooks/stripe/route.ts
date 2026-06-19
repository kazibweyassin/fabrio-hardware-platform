import { prisma } from '@/lib/db'
import { getStripeSecretKey, getStripeWebhookSecret } from '@/lib/env'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { notifyOrderByEmail } from '@/lib/order-email'
import Stripe from 'stripe'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:webhooks', RATE_LIMITS.webhooks.limit, RATE_LIMITS.webhooks.windowMs)
  if (rateLimited) return rateLimited

  const secretKey = getStripeSecretKey()
  const endpointSecret = getStripeWebhookSecret()

  if (!secretKey || !endpointSecret) {
    return Response.json({ error: 'Stripe webhook is not configured' }, { status: 503 })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' })
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'completed' },
        })

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        })

        if (payment) {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'processing' },
          })
          notifyOrderByEmail(payment.orderId, 'confirmed').catch(console.error)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'failed' },
        })
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        if (charge.payment_intent) {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: charge.payment_intent as string },
            data: { status: 'refunded' },
          })
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Error processing webhook:', err)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}