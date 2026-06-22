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

  const isCatalog = variant === 'catalog'

  return (
    <article
      className={cn(
        'group card-interactive overflow-hidden hover:-translate-y-0.5',
        isCatalog && 'text-sm',
        className
      )}
    >
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block">
          <ProductImage
            src={product.image}
            alt={product.name}
            aspectClass={isCatalog ? 'aspect-square' : 'aspect-[4/3]'}
            sizes={
              isCatalog
                ? '(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw'
                : '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
            }
          />
        </Link>
        {(showDiscount || computedDiscount > 0) && computedDiscount > 0 && (
          <Badge
            variant="accent"
            className={cn(
              'absolute shadow-sm z-10 pointer-events-none',
              isCatalog ? 'top-2 left-2 text-[10px] px-1.5 py-0' : 'top-3 left-3'
            )}
          >
            -{computedDiscount}%
          </Badge>
        )}
        <div className={cn('absolute z-10', isCatalog ? 'top-2 right-2' : 'top-3 right-3')}>
          <WishlistButton
            productId={product.id}
            productName={product.name}
            isWishlisted={isWishlisted(product.id)}
            onToggle={toggle}
            size={isCatalog ? 'sm' : 'md'}
          />
        </div>
      </div>

      <div className={cn(isCatalog ? 'p-3' : 'p-4 sm:p-5')}>
        {product.category && (
          <p
            className={cn(
              'font-semibold uppercase tracking-wider text-muted-foreground',
              isCatalog ? 'text-[10px] mb-1 line-clamp-1' : 'text-[11px] mb-2'
            )}
          >
            {product.category.name}
          </p>
        )}
        <Link href={`/products/${product.id}`}>
          <h3
            className={cn(
              'font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug',
              isCatalog ? 'text-sm' : 'text-base'
            )}
          >
            {product.name}
          </h3>
        </Link>
        {isCatalog && product.sku && (
          <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate">SKU: {product.sku}</p>
        )}

        <div className={cn('flex items-baseline gap-1.5 flex-wrap', isCatalog ? 'mt-2 mb-2.5' : 'mt-3 mb-4')}>
          {product.retailPrice > 0 ? (
            <span className={cn('font-bold text-foreground', isCatalog ? 'text-base' : 'text-xl')}>
              {formatCurrency(product.retailPrice)}
            </span>
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">Price on request</span>
          )}
          {(showDiscount || hasDiscount) && product.basePrice < product.retailPrice && (
            <span className={cn('text-muted-foreground line-through', isCatalog ? 'text-xs' : 'text-sm')}>
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
          <div className="flex flex-col gap-1.5">
            <Link href={`/products/${product.id}`} className="min-w-0">
              <Button variant="outline" className="w-full h-8 rounded-lg text-xs font-medium">
                Details
              </Button>
            </Link>
            <AddToCartButton
              product={product}
              label="Add"
              className="w-full h-8 rounded-lg gradient-brand text-brand-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm min-w-0"
            />
          </div>
        )}
      </div>
    </article>
  )
}