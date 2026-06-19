import { prisma } from '@/lib/db'
import ProductGrid from '@/components/products/product-grid'
import CategorySidebar from '@/components/layout/category-sidebar'
import PageHeader from '@/components/layout/page-header'
import ProductFilters from '@/components/products/product-filters'
import ProductPagination from '@/components/products/product-pagination'
import { Badge } from '@/components/ui/badge'
import { Suspense } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import ProductCardSkeleton from '@/components/skeletons/product-card-skeleton'

const PAGE_SIZE = 20

type SortOption = 'name-asc' | 'name-desc' | 'price-low' | 'price-high' | 'newest'

async function getProducts(
  categorySlug?: string,
  search?: string,
  sort: SortOption = 'name-asc',
  minPrice?: number,
  maxPrice?: number,
  inStock?: boolean,
  page: number = 1
) {
  try {
    const where: any = {
      active: true,
    }

    if (categorySlug) {
      where.category = {
        name: {
          equals: categorySlug.replace(/-/g, ' '),
          mode: 'insensitive',
        },
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (minPrice != null || maxPrice != null) {
      where.retailPrice = {}
      if (minPrice != null) where.retailPrice.gte = minPrice
      if (maxPrice != null) where.retailPrice.lte = maxPrice
    }

    // Note: We don't have a stock field on Product in current schema.
    // Using a simple active + price > 0 as "in stock" proxy for now.
    if (inStock) {
      where.retailPrice = { ...(where.retailPrice || {}), gt: 0 }
    }

    let orderBy: any = { name: 'asc' }
    switch (sort) {
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
      case 'price-low':
        orderBy = { retailPrice: 'asc' }
        break
      case 'price-high':
        orderBy = { retailPrice: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { name: 'asc' }
    }

    const skip = (page - 1) * PAGE_SIZE

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ])

    return { products, total }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0 }
  }
}

async function getCategoriesWithCounts() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  page?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const category = params.category
  const search = params.search
  const sort = (params.sort as SortOption) || 'name-asc'
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const inStock = params.inStock === 'true'
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const [categories, { products, total }] = await Promise.all([
    getCategoriesWithCounts(),
    getProducts(category, search, sort, minPrice, maxPrice, inStock, page),
  ])

  const activeCategory = category
    ? categories.find((c) => c.name.toLowerCase().replace(/ /g, '-') === category)
    : null

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  const pageTitle = search
    ? `Results for "${search}"`
    : activeCategory
      ? activeCategory.name
      : 'Industrial Catalog'

  const pageDescription = search
    ? `${total} product${total !== 1 ? 's' : ''} matching your search`
    : activeCategory
      ? `Browse ${activeCategory.name.toLowerCase()} from our certified inventory`
      : 'Browse our complete catalog of industrial hardware, PPE, and equipment'

  const hasFilters = !!(search || category || sort !== 'name-asc' || minPrice || maxPrice || inStock)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <PageHeader
          eyebrow="Product Catalog"
          title={pageTitle}
          description={pageDescription}
        >
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {total} products
          </Badge>
        </PageHeader>

        {/* Top Filters Bar */}
        <div className="mb-6">
          <ProductFilters
            currentSort={sort}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentInStock={inStock}
            currentSearch={search}
            currentCategory={category}
            hasActiveFilters={hasFilters}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <CategorySidebar
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
              activeSlug={category}
              showCounts
              counts={Object.fromEntries(categories.map((c) => [c.name, c._count.products]))}
            />
          </div>

          <div className="lg:col-span-4">
            {products.length === 0 ? (
              <div className="card-elevated p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {search || category || minPrice || maxPrice || inStock
                    ? 'Try adjusting your filters or search term.'
                    : 'No products in this category yet.'}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                >
                  Clear all filters →
                </Link>
              </div>
            ) : (
              <>
                <Suspense
                  fallback={
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </div>
                  }
                >
                  <ProductGrid products={products} />
                </Suspense>

                {totalPages > 1 && (
                  <div className="mt-10">
                    <ProductPagination
                      currentPage={page}
                      totalPages={totalPages}
                      basePath="/products"
                      searchParams={{ category, search, sort, minPrice: minPrice?.toString(), maxPrice: maxPrice?.toString(), inStock: inStock ? 'true' : undefined }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}