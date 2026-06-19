'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/format'
import { formatUgandaPhoneDisplay } from '@/lib/mobile-money'
import { MOBILE_MONEY_PROVIDERS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Smartphone } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  total: number
  product: { name: string; sku: string }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress?: string | null
  createdAt: string
  items: OrderItem[]
  payment?: {
    status: string
    method: string
    mobileProvider?: string | null
    payerPhone?: string | null
    transactionRef?: string | null
    amount: number
  } | null
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { data: session, isPending } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/auth/login?redirect=/orders/${orderId}`)
    }
  }, [session, isPending, router, orderId])

  useEffect(() => {
    if (!session?.user || !orderId) return

    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to load order')
          return
        }
        setOrder(data)
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [session?.user, orderId])

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading order...</div>
      </div>
    )
  }

  if (!session?.user) return null

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">{error || 'Order not found'}</p>
        <Link href="/account" className="text-primary font-semibold hover:underline">
          Back to account
        </Link>
      </div>
    )
  }

  const paymentPending = !order.payment || order.payment.status === 'pending'
  const paymentProcessing = order.payment?.status === 'processing'
  const paymentCompleted = order.payment?.status === 'completed'
  const provider =
    order.payment?.mobileProvider &&
    MOBILE_MONEY_PROVIDERS[order.payment.mobileProvider as keyof typeof MOBILE_MONEY_PROVIDERS]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="text-center mb-10 animate-slide-up">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${
              paymentCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {paymentCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            {paymentCompleted ? 'Order Confirmed' : paymentProcessing ? 'Payment Submitted' : 'Awaiting Payment'}
          </p>
          <h1 className="text-3xl font-bold mb-2">
            {paymentCompleted
              ? 'Thank you for your order'
              : paymentProcessing
                ? 'We are verifying your payment'
                : 'Complete your mobile money payment'}
          </h1>
          <p className="text-muted-foreground">
            {paymentCompleted
              ? "We'll begin processing your order shortly."
              : paymentProcessing
                ? 'Our team will confirm your mobile money transaction and update your order.'
                : 'Go back to checkout to pay with MTN or Airtel Mobile Money.'}
          </p>
        </div>

        {paymentProcessing && provider && (
          <div className="card-elevated p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Payment details submitted</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Provider</p>
                <p className="font-medium">{provider.label}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium font-mono">
                  {order.payment?.payerPhone ? formatUgandaPhoneDisplay(order.payment.payerPhone) : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-medium font-mono">{order.payment?.transactionRef}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">{formatCurrency(order.payment?.amount || order.total)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card-elevated p-6 lg:p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
              <p className="font-mono font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              <Badge variant="success" className="capitalize">{order.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Payment</p>
              <Badge
                variant={paymentCompleted ? 'success' : paymentProcessing ? 'warning' : 'secondary'}
                className="capitalize"
              >
                {order.payment?.status || 'pending'}
              </Badge>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="mb-8 pb-8 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Delivery Address</p>
              <p className="text-sm">{order.shippingAddress}</p>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Items</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border/60 last:border-0">
                <span className="text-muted-foreground">
                  {item.product.name} <span className="text-foreground/60">×{item.quantity}</span>
                </span>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t border-border mt-4">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {paymentPending && (
            <Link href="/checkout">
              <Button className="h-11 px-8 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold w-full sm:w-auto">
                Complete Mobile Money Payment
              </Button>
            </Link>
          )}
          <Link href="/products">
            <Button
              variant={paymentPending ? 'outline' : 'default'}
              className={`h-11 px-8 rounded-xl font-semibold w-full sm:w-auto ${
                paymentPending ? '' : 'gradient-brand text-brand-foreground border-0'
              }`}
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}