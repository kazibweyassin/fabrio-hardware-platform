'use client'

import Link from 'next/link'
import AddToCartButton from '@/components/add-to-cart-button'
import WishlistButton from '@/components/wishlist-button'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { useWishlist } from '@/lib/use-wishlist'

interface HomeProductCardProps {
  product: {
    id: string
    name: string
    retailPrice: number
    basePrice: number
    image?: string | null
    category?: { name: string }
  }
  showDiscount?: boolean
  discountPercent?: number
}

export default function HomeProductCard({
  product,
  showDiscount = false,
  discountPercent,
}: HomeProductCardProps) {
  const { isWishlisted, toggle } = useWishlist()

  return (
    <article className="group card-elevated overflow-hidden transition-all duration-300 hover:-translate-y-1">
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
          {showDiscount && discountPercent && discountPercent > 0 && (
            <Badge variant="accent" className="absolute top-3 left-3 shadow-sm">
              -{discountPercent}% OFF
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
        {product.category && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {product.category.name}
          </p>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-3 mb-4">
          <span className="text-xl font-bold text-foreground">{formatCurrency(product.retailPrice)}</span>
          {showDiscount && product.basePrice < product.retailPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.basePrice)}
            </span>
          )}
        </div>

        <AddToCartButton
          product={product}
          label="Add to Cart"
          showIcon={false}
          className="w-full h-10 rounded-xl gradient-brand text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        />
      </div>
    </article>
  )
}