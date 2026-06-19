'use client'

import { useState } from 'react'
import AddToCartButton from '@/components/add-to-cart-button'
import WishlistButton from '@/components/wishlist-button'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { useWishlist } from '@/lib/use-wishlist'

interface ProductDetailActionsProps {
  product: {
    id: string
    name: string
    retailPrice: number
    image?: string | null
  }
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const { isWishlisted, toggle } = useWishlist()

  const decrement = () => setQuantity((q) => Math.max(1, q - 1))
  const increment = () => setQuantity((q) => Math.min(99, q + 1))

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Quantity</label>
        <div className="inline-flex items-center border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={decrement}
            className="p-3 hover:bg-muted active:bg-muted/80 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-14 text-center text-lg font-semibold tabular-nums select-none">
            {quantity}
          </div>
          <button
            type="button"
            onClick={increment}
            className="p-3 hover:bg-muted active:bg-muted/80 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Max 99 per order</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <AddToCartButton
          product={product}
          quantity={quantity}
          label="Add to Cart"
          className="flex-1 h-12 rounded-xl gradient-brand text-brand-foreground text-base font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
        />

        <WishlistButton
          productId={product.id}
          productName={product.name}
          isWishlisted={isWishlisted(product.id)}
          onToggle={toggle}
          size="lg"
          className="h-12 w-12 shrink-0"
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Need bulk pricing or a formal quote? <a href="/auth/signup" className="text-primary hover:underline font-medium">Create a B2B account</a>
      </p>
    </div>
  )
}