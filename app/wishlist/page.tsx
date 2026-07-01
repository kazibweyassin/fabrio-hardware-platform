'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import ProductImage from '@/components/products/product-image'
import { formatCurrency } from '@/lib/format'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/page-header'
import toast from 'react-hot-toast'

interface WishlistProduct {
  id: string
  name: string
  sku: string
  retailPrice: number
  basePrice: number
  image: string | null
  category: { name: string } | null
}

export default function WishlistPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const addToCart = useCart((s) => s.addItem)

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth/login?redirect=/wishlist')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (!session?.user) return

    setLoading(true)
    fetch('/api/wishlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products)
      })
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false))
  }, [session?.user?.id])

  const removeFromWishlist = async (productId: string, name: string) => {
    setRemoving(productId)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) throw new Error()
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      toast.success(`Removed ${name} from wishlist`)
    } catch {
      toast.error('Failed to remove item')
    } finally {
      setRemoving(null)
    }
  }

  const addItemToCart = (product: WishlistProduct) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.retailPrice,
      image: product.image || undefined,
    })
    toast.success(`Added ${product.name} to cart`)
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="h-9 w-48 bg-muted rounded mb-3 animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-elevated h-80 animate-pulse bg-muted/30 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <PageHeader
          eyebrow="Saved Items"
          title="Your Wishlist"
          description={
            products.length > 0
              ? `${products.length} item${products.length === 1 ? '' : 's'} saved for later`
              : 'Items you want to come back to'
          }
        />

        {products.length === 0 ? (
          <div className="card-elevated p-16 text-center max-w-lg mx-auto">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <h2 className="font-semibold text-2xl mb-2">No saved items yet</h2>
            <p className="text-muted-foreground mb-8">
              Tap the heart icon on any product to save it here for easy access later.
            </p>
            <Link href="/products">
              <Button className="h-11 px-8 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold">
                Browse Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const hasDiscount = product.basePrice < product.retailPrice
              const discountPercent = hasDiscount
                ? Math.round(((product.retailPrice - product.basePrice) / product.retailPrice) * 100)
                : 0

              return (
                <article key={product.id} className="group card-elevated overflow-hidden flex flex-col">
                  <Link href={`/products/${product.id}`} className="block relative">
                    <ProductImage src={product.image} alt={product.name} aspectClass="aspect-[4/3]" />
                      {discountPercent > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground shadow-sm">
                            -{discountPercent}%
                          </span>
                        </div>
                      )}
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    {product.category && (
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {product.category.name}
                      </p>
                    )}
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">SKU: {product.sku}</p>

                    <div className="flex items-baseline gap-2 mt-3 mb-4">
                      <span className="text-xl font-bold">{formatCurrency(product.retailPrice)}</span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.basePrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 rounded-xl"
                        onClick={() => addItemToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <button
                        onClick={() => removeFromWishlist(product.id, product.name)}
                        disabled={removing === product.id}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
            Continue browsing the catalog →
          </Link>
        </div>
      </div>
    </div>
  )
}
