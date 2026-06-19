'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import AddToCartButton from '@/components/add-to-cart-button'
import WishlistButton from '@/components/wishlist-button'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/lib/use-wishlist'

interface Product {
  id: string
  name: string
  description: string | null
  sku: string
  basePrice: number
  wholesalePrice: number | null
  retailPrice: number
  image: string | null
  category: {
    id: string
    name: string
  }
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { isWishlisted, toggle } = useWishlist()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => {
        const hasDiscount = product.basePrice < product.retailPrice
        const discountPercent = hasDiscount
          ? Math.round(((product.retailPrice - product.basePrice) / product.retailPrice) * 100)
          : 0

        return (
          <article
            key={product.id}
            className="group card-elevated overflow-hidden transition-all duration-300 hover:-translate-y-1"
          >
            <Link href={`/products/${product.id}`} className="block">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-secondary/30 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                {discountPercent > 0 && (
                  <Badge variant="accent" className="absolute top-3 left-3 shadow-sm">
                    -{discountPercent}%
                  </Badge>
                )}
                <div className="absolute top-3 right-3">
                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                    isWishlisted={isWishlisted(product.id)}
                    onToggle={toggle}
                  />
                </div>
              </div>
            </Link>

            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {product.category.name}
              </p>
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {product.name}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-1.5 font-mono">SKU: {product.sku}</p>

              <div className="flex items-baseline gap-2 mt-3 mb-4">
                <span className="text-xl font-bold text-foreground">{formatCurrency(product.retailPrice)}</span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.basePrice)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/products/${product.id}`} className="flex-1">
                  <Button variant="outline" className="w-full h-10 rounded-xl font-medium">
                    Details
                  </Button>
                </Link>
                <AddToCartButton
                  product={product}
                  className="flex-1 w-full h-10 rounded-xl gradient-brand text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}