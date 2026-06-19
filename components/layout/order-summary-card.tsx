import Link from 'next/link'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

interface OrderSummaryCardProps {
  items?: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  checkoutHref?: string
  continueHref?: string
  continueLabel?: string
  showCheckout?: boolean
  className?: string
}

export default function OrderSummaryCard({
  items,
  subtotal,
  shipping,
  tax,
  total,
  checkoutHref = '/checkout',
  continueHref = '/products',
  continueLabel = 'Continue Shopping',
  showCheckout = true,
  className,
}: OrderSummaryCardProps) {
  return (
    <div className={cn('card-elevated p-6 sticky top-24', className)}>
      <h2 className="text-lg font-semibold mb-5">Order Summary</h2>

      {items && items.length > 0 && (
        <div className="space-y-3 mb-5 pb-5 border-b border-border">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm gap-4">
              <span className="text-muted-foreground line-clamp-1">
                {item.productName} <span className="text-foreground/60">×{item.quantity}</span>
              </span>
              <span className="font-medium shrink-0">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 mb-5 pb-5 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      </div>

      <div className="flex justify-between font-bold text-xl mb-6">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {showCheckout && (
        <Link href={checkoutHref} className="block mb-3">
          <Button className="w-full h-11 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold shadow-sm">
            Proceed to Checkout
          </Button>
        </Link>
      )}

      <Link href={continueHref}>
        <Button variant="outline" className="w-full h-11 rounded-xl font-medium">
          {continueLabel}
        </Button>
      </Link>
    </div>
  )
}