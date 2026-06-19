import { prisma } from '@/lib/db'
import ProductForm from '@/components/admin/product-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })
  } catch {
    return null
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories] = await Promise.all([getProduct(id), getCategories()])

  if (!product) notFound()

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to Products
        </Link>
        <h2 className="text-3xl font-bold mt-2">Edit Product</h2>
        <p className="text-muted-foreground text-sm mt-1">SKU: {product.sku}</p>
      </div>

      <ProductForm
        categories={categories}
        mode="edit"
        initialData={{
          id: product.id,
          catalogId: product.catalogId || '',
          name: product.name,
          description: product.description || '',
          categoryId: product.categoryId,
          subcategory: product.subcategory || '',
          sku: product.sku,
          basePrice: String(product.basePrice),
          retailPrice: String(product.retailPrice),
          wholesalePrice: product.wholesalePrice ? String(product.wholesalePrice) : '',
          image: product.image || '',
          active: product.active,
        }}
      />
    </div>
  )
}