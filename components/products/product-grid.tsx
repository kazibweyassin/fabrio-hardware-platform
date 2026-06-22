'use client'

import ProductCard, { type ProductCardData } from '@/components/products/product-card'

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product as ProductCardData} variant="catalog" />
      ))}
    </div>
  )
}