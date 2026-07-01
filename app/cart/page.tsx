'use client'

import { useCart } from '@/lib/store/cart'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import ProductThumbnail from '@/components/products/product-thumbnail'
import { formatCurrency } from '@/lib/format'
import { calculateOrderTotals } from '@/lib/pricing'
import { useEffect, useState } from 'react'
import PageHeader from '@/components/layout/page-header'
import CheckoutStepper from '@/components/checkout/checkout-stepper'
import OrderSummaryCard from '@/components/layout/order-summary-card'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          <div className="h-9 w-48 bg-muted rounded mb-3 animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-elevated p-5 h-28 animate-pulse bg-muted/40 rounded-2xl" />
              ))}
            </div>
            <div className="lg:col-span-1 h-64 card-elevated animate-pulse bg-muted/40 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          <PageHeader eyebrow="Your Cart" title="Shopping Cart" description="Review items before checkout" />
          <div className="card-elevated p-16 text-center max-w-lg mx-auto">
            <ShoppingBag className="w-14 h-14 text-muted-foreground/30 mx-auto mb-5" />
            <h2 className="font-semibold text-xl mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Browse our catalog to find industrial hardware and safety equipment for your team.
            </p>
            <Link href="/products">
              <Button className="h-11 px-8 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalPrice = getTotalPrice()
  const totals = calculateOrderTotals(totalPrice)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <PageHeader
          eyebrow="Your Cart"
          title="Shopping Cart"
          description={`${items.length} item${items.length !== 1 ? 's' : ''} ready for checkout`}
        />

        <CheckoutStepper currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {items.map((item) => (
              <div key={item.productId} className="card-elevated p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5">
                <div className="flex gap-4 sm:block">
                <ProductThumbnail src={item.image} alt={item.productName} size="md" />

                <div className="flex-grow min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 pr-2">{item.productName}</h3>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1 sm:hidden touch-target"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{formatCurrency(item.price)} each</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2.5 hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2.5 hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-bold text-lg">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="hidden sm:block text-muted-foreground hover:text-destructive transition-colors shrink-0 self-start p-1 touch-target"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-destructive hover:underline font-medium"
            >
              Clear entire cart
            </button>
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <OrderSummaryCard
              subtotal={totals.subtotal}
              shipping={totals.shipping}
              tax={totals.tax}
              total={totals.total}
            />
          </div>
        </div>
      </div>
    </div>
  )
}