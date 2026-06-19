import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Edit2, ImageOff, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'

async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { category: true },
      orderBy: [{ category: { name: 'asc' } }, { subcategory: 'asc' }, { name: 'asc' }],
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts()
  const needsPricing = products.filter((p) => p.retailPrice <= 0).length
  const needsImage = products.filter((p) => !p.image).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">Catalog</p>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} products · {needsPricing} need pricing · {needsImage} need images
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground mb-4">No products yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Run <code className="px-1.5 py-0.5 rounded bg-muted text-xs">npm run db:seed-catalogue</code> to import the product catalogue.
          </p>
          <Link href="/admin/products/new" className="text-primary font-semibold hover:underline text-sm">
            Create the first product →
          </Link>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">SKU</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/60 last:border-0 hover:bg-surface/80 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                    <td className="p-4">
                      <div className="font-medium text-sm">{product.name}</div>
                      {product.subcategory && (
                        <div className="text-xs text-muted-foreground mt-0.5">{product.subcategory}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{product.category.name}</td>
                    <td className="p-4">
                      {product.retailPrice > 0 ? (
                        <span className="font-semibold text-sm">{formatCurrency(product.retailPrice)}</span>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Set price</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={product.active ? 'success' : 'secondary'}>
                        {product.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}