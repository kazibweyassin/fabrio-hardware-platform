import { prisma } from '@/lib/db'
import ProductForm from '@/components/admin/product-form'
import Link from 'next/link'

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to Products
        </Link>
        <h2 className="text-3xl font-bold mt-2">Add Product</h2>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">No categories found. Run the database seed first.</p>
      ) : (
        <ProductForm categories={categories} mode="create" />
      )}
    </div>
  )
}