'use client'

import { useCart } from '@/lib/store/cart'
import Link from 'next/link'
import { ShoppingCart, X, Plus, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function MiniCart() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const total = getTotalPrice()
  const itemCount = getTotalItems()

  // During SSR and the first client render (before useEffect), always render the
  // empty-cart Link. This guarantees the server HTML matches the initial client
  // render, avoiding hydration mismatch when persisted cart state (from localStorage)
  // would otherwise cause a <Link> vs <div>+<button> difference.
  if (!mounted || itemCount === 0) {
    return (
      <Link
        href="/cart"
        className="relative flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-surface hover:bg-muted transition-colors"
        aria-label="Cart"
      >
        <ShoppingCart className="w-5 h-5 text-foreground" />
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-surface hover:bg-muted transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5 text-foreground" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
          {itemCount}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-14 z-50 w-80 card-elevated border shadow-xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="font-semibold">Your Cart ({itemCount})</div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-auto p-2 space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-2 rounded-lg hover:bg-surface">
                  <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="font-medium line-clamp-2 pr-6">{item.productName}</div>
                    <div className="text-muted-foreground mt-0.5">{formatCurrency(item.price)} × {item.quantity}</div>

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center border border-border rounded-md overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-1.5 py-0.5 hover:bg-muted"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-1.5 py-0.5 hover:bg-muted"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-medium text-sm whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Link href="/cart" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full h-10 rounded-xl">
                  View Full Cart
                </Button>
              </Link>
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-10 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold">
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
