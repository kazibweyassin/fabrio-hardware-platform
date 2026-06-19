import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Package, Shield, Star, Tag, Truck } from 'lucide-react'
import { prisma } from '@/lib/db'
import ProductDetailActions from '@/components/products/product-detail-actions'
import RequestQuoteModal from '@/components/products/request-quote-modal'
import ReviewForm from '@/components/products/review-form'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return { title: 'Product Not Found' }
  return { title: product.name, description: product.description }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) notFound()

  const discountPercent =
    product.retailPrice && product.basePrice
      ? Math.round(((product.retailPrice - product.basePrice) / product.retailPrice) * 100)
      : 0

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  href={`/products?category=${product.category.name.toLowerCase().replace(/ /g, '-')}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            {product.subcategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground/80">{product.subcategory}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="card-elevated overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-muted to-secondary/20 flex items-center justify-center relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-12">
                  <Package className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Product image</p>
                </div>
              )}
              {discountPercent > 0 && (
                <Badge variant="accent" className="absolute top-4 left-4 text-sm px-3 py-1 shadow-sm">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                {product.category.name}
              </p>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand text-brand" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.8 · 127 reviews</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-sm font-mono text-muted-foreground">SKU: {product.sku}</span>
            </div>

            {/* Pricing */}
            <div className="card-elevated p-6 mt-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">
                  {formatCurrency(product.retailPrice)}
                </span>
                {product.basePrice && product.retailPrice > product.basePrice && (
                  <span className="text-lg line-through text-muted-foreground">
                    {formatCurrency(product.basePrice)}
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold text-accent mt-2">
                  <Tag className="w-4 h-4" />
                  You save {discountPercent}% on this item
                </div>
              )}
            </div>

            {product.description && (
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Quality Assured</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Professional grade</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border">
                <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Same-day dispatch</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200/60">
              <p className="text-sm">
                <span className="font-semibold text-emerald-800">In Stock</span>
                <span className="text-emerald-700/70 ml-2">— Ready to ship within 24 hours</span>
              </p>
            </div>

            {/* Reviews (stub with nice presentation + leave review) */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Customer Reviews</h3>
                <span className="text-sm text-muted-foreground">4.8 (127)</span>
              </div>

              <div className="space-y-4 text-sm">
                {[
                  { name: 'Mike R.', company: 'Summit Construction', rating: 5, text: 'Excellent quality hard hats. Fast delivery and great bulk pricing.' },
                  { name: 'Sarah K.', company: 'Pacific Builders', rating: 5, text: 'These safety goggles are the best we\'ve used. Very comfortable for long shifts.' },
                  { name: 'David L.', company: 'Forge Industries', rating: 4, text: 'Solid tools. Wholesale pricing makes a big difference for our crews.' },
                ].map((review, i) => (
                  <div key={i} className="border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{review.name}</div>
                      <div className="text-xs text-muted-foreground">• {review.company}</div>
                    </div>
                    <div className="flex mb-2">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s < review.rating ? 'fill-brand text-brand' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">“{review.text}”</p>
                  </div>
                ))}
              </div>

              <details className="mt-3 group">
                <summary className="cursor-pointer text-sm font-medium text-primary hover:underline list-none">
                  Leave a review
                </summary>
                <ReviewForm />
              </details>
            </div>

            {product.wholesalePrice && (
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-4">Bulk Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-surface text-sm">
                    <span className="text-muted-foreground">Retail (1–9 units)</span>
                    <span className="font-semibold">{formatCurrency(product.retailPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm">
                    <span className="font-semibold text-primary">Wholesale (10+ units)</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(product.wholesalePrice)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <ProductDetailActions product={product} />
              <RequestQuoteModal product={product} />
            </div>

            <div className="mt-10 pt-8 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4">Specifications</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/60">
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd className="font-mono font-medium">{product.sku}</dd>
                </div>
                {product.leadTime && (
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <dt className="text-muted-foreground">Lead Time</dt>
                    <dd className="font-medium">{product.leadTime} days</dd>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <dt className="text-muted-foreground">Weight</dt>
                    <dd className="font-medium">{product.weight} kg</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}