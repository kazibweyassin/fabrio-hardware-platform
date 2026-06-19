'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { formatUgandaPhoneDisplay } from '@/lib/mobile-money'
import { ORDER_STATUSES } from '@/lib/constants'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress?: string | null
  notes?: string | null
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    total: number
    product: { name: string; sku: string }
  }>
  payment?: {
    status: string
    method: string
    mobileProvider?: string | null
    payerPhone?: string | null
    transactionRef?: string | null
    amount: number
  } | null
  customer?: { businessName?: string | null; user?: { name?: string | null; email?: string } }
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const loadOrder = () => {
    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load order')
        setOrder(data)
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (orderId) loadOrder()
  }, [orderId])

  const updatePayment = async (status: 'completed' | 'failed') => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update payment')
        return
      }
      toast.success(status === 'completed' ? 'Payment confirmed' : 'Payment rejected')
      loadOrder()
    } catch {
      toast.error('Failed to update payment')
    } finally {
      setUpdating(false)
    }
  }

  const updateOrderStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update order')
        return
      }
      setOrder(data)
      toast.success('Order status updated')
    } catch {
      toast.error('Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading order...</div>
  }

  if (!order) {
    return (
      <div>
        <p className="text-muted-foreground mb-4">Order not found</p>
        <Link href="/admin/orders" className="text-primary hover:underline text-sm">← Back to orders</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Link>
        <h2 className="text-2xl font-bold">Order {order.orderNumber}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {order.customer?.businessName || order.customer?.user?.name || 'Customer'} ·{' '}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Order Status</p>
          <Badge className="capitalize">{order.status}</Badge>
        </div>
        <div className="card-elevated p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Payment</p>
          <Badge variant={order.payment?.status === 'completed' ? 'success' : 'warning'} className="capitalize">
            {order.payment?.status || 'pending'}
          </Badge>
        </div>
        <div className="card-elevated p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Total</p>
          <p className="text-xl font-bold">{formatCurrency(order.total)}</p>
        </div>
      </div>

      {order.payment && (
        <div className="card-elevated p-6 space-y-4">
          <h3 className="font-semibold text-lg">Mobile Money Payment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Provider</p>
              <p className="font-medium capitalize">{order.payment.mobileProvider || 'Not submitted yet'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payer phone</p>
              <p className="font-medium font-mono">
                {order.payment.payerPhone ? formatUgandaPhoneDisplay(order.payment.payerPhone) : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-medium font-mono">{order.payment.transactionRef || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">{formatCurrency(order.payment.amount)}</p>
            </div>
          </div>

          {order.payment.status === 'processing' && (
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => updatePayment('completed')}
                disabled={updating}
                className="gap-2 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Payment Received
              </Button>
              <Button
                variant="outline"
                onClick={() => updatePayment('failed')}
                disabled={updating}
                className="gap-2 rounded-xl"
              >
                <XCircle className="w-4 h-4" />
                Reject Payment
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-semibold text-lg">Order Items</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border/60 last:border-0">
            <span>
              {item.product.name} <span className="text-muted-foreground">×{item.quantity}</span>
            </span>
            <span className="font-medium">{formatCurrency(item.total)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-lg pt-2">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="card-elevated p-6">
          <h3 className="font-semibold text-lg mb-2">Delivery Address</h3>
          <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
        </div>
      )}

      <div className="card-elevated p-6">
        <h3 className="font-semibold text-lg mb-4">Update Order Status</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <Button
              key={status}
              variant={order.status === status ? 'default' : 'outline'}
              size="sm"
              className="capitalize rounded-xl"
              disabled={updating || order.status === status}
              onClick={() => updateOrderStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}