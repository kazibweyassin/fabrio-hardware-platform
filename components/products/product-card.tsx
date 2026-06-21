'use client'

import Link from 'next/link'
import AddToCartButton from '@/components/add-to-cart-button'
import WishlistButton from '@/components/wishlist-button'
import ProductImage from '@/components/products/product-image'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/lib/use-wishlist'
import { cn } from '@/lib/utils'

export interface ProductCardData {
  id: string
  name: string
  description?: string | null
  sku?: string
  retailPrice: number
  basePrice: number
  image?: string | null
  category?: { name: string }
}

interface ProductCardProps {
  product: ProductCardData
  variant?: 'home' | 'catalog'
  showDiscount?: boolean
  discountPercent?: number
  className?: string
}

export default function ProductCard({
  product,
  variant = 'catalog',
  showDiscount = false,
  discountPercent,
  className,
}: ProductCardProps) {
  const { isWishlisted, toggle } = useWishlist()
  const hasDiscount = product.basePrice < product.retailPrice
  const computedDiscount =
    discountPercent ??
    (hasDiscount ? Math.round(((product.retailPrice - product.basePrice) / product.retailPrice) * 100) : 0)

  return (
    <article className={cn('group card-interactive overflow-hidden hover:-translate-y-1', className)}>
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block">
          <ProductImage src={product.image} alt={product.name} />
        </Link>
        {(showDiscount || computedDiscount > 0) && computedDiscount > 0 && (
          <Badge variant="accent" className="absolute top-3 left-3 shadow-sm z-10 pointer-events-none">
            -{computedDiscount}%
          </Badge>
        )}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton
            productId={product.id}
            productName={product.name}
            isWishlisted={isWishlisted(product.id)}
            onToggle={toggle}
          />
        </div>
      </div>

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
        {variant === 'catalog' && product.sku && (
          <p className="text-xs text-muted-foreground mt-1.5 font-mono">SKU: {product.sku}</p>
        )}

        <div className="flex items-baseline gap-2 mt-3 mb-4">
          {product.retailPrice > 0 ? (
            <span className="text-xl font-bold text-foreground">{formatCurrency(product.retailPrice)}</span>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">Price on request</span>
          )}
          {(showDiscount || hasDiscount) && product.basePrice < product.retailPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.basePrice)}
            </span>
          )}
        </div>

        {variant === 'home' ? (
          <AddToCartButton
            product={product}
            label="Add to Cart"
            showIcon={false}
            className="w-full h-10 rounded-xl gradient-brand text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          />
        ) : (
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
        )}
      </div>
    </article>
  )
}