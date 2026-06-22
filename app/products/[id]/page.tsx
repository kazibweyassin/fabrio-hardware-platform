import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Shield, Tag, Truck } from 'lucide-react'
import { prisma } from '@/lib/db'
import ProductDetailActions from '@/components/products/product-detail-actions'
import RequestQuoteModal from '@/components/products/request-quote-modal'
import ReviewForm from '@/components/products/review-form'
import ProductDetailTabs from '@/components/products/product-detail-tabs'
import ProductImage from '@/components/products/product-image'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { getStockLabel, getStockStatus, getStockStatusClass } from '@/lib/stock'

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
    include: {
      category: true,
      inventory: true,
    },
  })

  if (!product) notFound()

  const totalStock = product.inventory.reduce((sum, row) => sum + row.quantity, 0)
  const reorderLevel = product.inventory[0]?.reorderLevel ?? 10
  const stockStatus = getStockStatus(totalStock, product.retailPrice, reorderLevel)
  const stockLabel = getStockLabel(stockStatus, totalStock)

  const discountPercent =
    product.retailPrice && product.basePrice && product.retailPrice > product.basePrice
      ? Math.round(((product.retailPrice - product.basePrice) / product.retailPrice) * 100)
      : 0

  const specsContent = (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between py-2 border-b border-border/60">
        <dt className="text-muted-foreground">SKU</dt>
        <dd className="font-mono font-medium">{product.sku}</dd>
      </div>
      {product.catalogId && (
        <div className="flex justify-between py-2 border-b border-border/60">
          <dt className="text-muted-foreground">Catalog ID</dt>
          <dd className="font-mono font-medium">{product.catalogId}</dd>
        </div>
      )}
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
      <div className="flex justify-between py-2 border-b border-border/60">
        <dt className="text-muted-foreground">Availability</dt>
        <dd className="font-medium">{stockLabel}</dd>
      </div>
    </dl>
  )

  const reviewsContent = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        No customer reviews yet. Be the first to share feedback after your purchase.
      </p>
      <ReviewForm />
    </div>
  )

  const bulkContent = product.wholesalePrice ? (
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
  ) : (
    <p className="text-sm text-muted-foreground">Contact us for volume pricing on large orders.</p>
  )

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto scrollbar-none whitespace-nowrap pb-0.5">
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
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[min(50vw,200px)] sm:max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-start">
          <div className="card-elevated overflow-hidden lg:sticky lg:top-24 relative">
            <ProductImage
              src={product.image}
              alt={product.name}
              aspectClass="aspect-square"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discountPercent > 0 && (
              <Badge variant="accent" className="absolute top-4 left-4 text-sm px-3 py-1 shadow-sm">
                Save {discountPercent}%
              </Badge>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {product.category && (
              <p className="type-eyebrow">{product.category.name}</p>
            )}
            <h1 className="type-h1 leading-tight">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className={`status-pill ${getStockStatusClass(stockStatus)}`}>{stockLabel}</span>
              <span className="text-muted-foreground font-mono">SKU: {product.sku}</span>
            </div>

            <div className="card-elevated p-4 sm:p-6">
              {product.retailPrice > 0 ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">
                    {formatCurrency(product.retailPrice)}
                  </span>
                  {product.basePrice && product.retailPrice > product.basePrice && (
                    <span className="text-lg line-through text-muted-foreground">
                      {formatCurrency(product.basePrice)}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-lg font-semibold text-muted-foreground">Price on request</p>
              )}
              {discountPercent > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold text-accent mt-2">
                  <Tag className="w-4 h-4" />
                  You save {discountPercent}% on this item
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
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
                  <p className="font-semibold text-sm">Nationwide Delivery</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Kampala & upcountry</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <ProductDetailActions product={product} disabled={stockStatus === 'out_of_stock'} />
              <RequestQuoteModal product={product} />
            </div>

            <ProductDetailTabs
              defaultTab="specs"
              tabs={[
                { id: 'specs', label: 'Specifications', content: specsContent },
                { id: 'bulk', label: 'Bulk Pricing', content: bulkContent },
                { id: 'reviews', label: 'Reviews', content: reviewsContent },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}