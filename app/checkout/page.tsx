'use client'

import { useCart } from '@/lib/store/cart'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MobileMoneyPaymentForm from '@/components/checkout/mobile-money-payment-form'
import { calculateOrderTotals } from '@/lib/pricing'
import PageHeader from '@/components/layout/page-header'
import CheckoutSkeleton from '@/components/skeletons/checkout-skeleton'
import CheckoutStepper from '@/components/checkout/checkout-stepper'
import OrderSummaryCard from '@/components/layout/order-summary-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, ShieldCheck, Smartphone } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const { items, getTotalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [orderTotal, setOrderTotal] = useState<number>(0)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    country: 'Uganda',
    notes: '',
  })

  useEffect(() => {
    if (session?.user?.email) {
      setFormData((prev) => ({ ...prev, email: session.user.email }))
    }
  }, [session?.user?.email])

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth/login?redirect=/checkout')
    }
  }, [session, isPending, router])

  if (isPending) {
    return <CheckoutSkeleton />
  }
  if (!session?.user) return null

  if (items.length === 0 && !orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/products" className="text-primary font-semibold hover:underline">
          Continue shopping
        </Link>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const totals = calculateOrderTotals(subtotal)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const shippingAddress = [formData.address, formData.city, formData.district, formData.country]
        .filter(Boolean)
        .join(', ')

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress,
          notes: formData.notes || null,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok || !orderData.orderId) {
        toast.error(orderData.error || 'Failed to create order')
        setLoading(false)
        return
      }

      setOrderId(orderData.orderId)
      setOrderNumber(orderData.orderNumber)
      setOrderTotal(orderData.total)
      toast.success('Order created. Complete your mobile money payment below.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process checkout')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    if (orderId) router.push(`/orders/${orderId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <PageHeader
          eyebrow="Checkout"
          title="Complete Your Order"
          description="Pay securely with MTN or Airtel Mobile Money"
        />

        <CheckoutStepper currentStep={orderId ? 3 : 2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {!orderId ? (
              <form onSubmit={handleCreateOrder} className="space-y-6">
                <div className="card-elevated p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Delivery Information</h2>
                      <p className="text-sm text-muted-foreground">Where should we deliver your order?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone (Mobile Money number)</label>
                      <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0771234567" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address</label>
                      <Input type="text" name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City / Town</label>
                        <Input type="text" name="city" value={formData.city} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">District</label>
                        <Input type="text" name="district" value={formData.district} onChange={handleChange} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <Input type="text" name="country" value={formData.country} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order Notes (optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-border bg-surface p-3 text-sm min-h-[70px]"
                        placeholder="Delivery instructions, job site access, etc."
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold shadow-sm"
                >
                  {loading ? 'Creating order...' : (
                    <>
                      <span className="sm:hidden">Place Order & Pay</span>
                      <span className="hidden sm:inline">Place Order & Pay with Mobile Money</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="card-elevated p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 text-primary">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Mobile Money Payment</h2>
                    <p className="text-sm text-muted-foreground">Pay with MTN or Airtel, then submit your transaction ID</p>
                  </div>
                </div>
                <MobileMoneyPaymentForm
                  orderId={orderId}
                  orderNumber={orderNumber || ''}
                  total={orderTotal}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground p-4 rounded-xl bg-success/50 border border-success/30">
              <ShieldCheck className="w-4 h-4 text-success-foreground shrink-0" />
              Payments are verified before your order is processed. Use your order number as the payment reference.
            </div>
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <OrderSummaryCard
              items={orderId ? [] : items}
              subtotal={orderId ? orderTotal - totals.tax - totals.shipping : totals.subtotal}
              shipping={totals.shipping}
              tax={totals.tax}
              total={orderId ? orderTotal : totals.total}
              showCheckout={false}
              continueHref="/cart"
              continueLabel="Back to Cart"
            />
          </div>
        </div>
      </div>
    </div>
  )
}