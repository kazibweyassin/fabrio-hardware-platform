import ProductGrid from '@/components/products/product-grid'
import CategorySidebar from '@/components/layout/category-sidebar'
import MobileCategoryRail from '@/components/layout/mobile-category-rail'
import PageHeader from '@/components/layout/page-header'
import ProductFilters from '@/components/products/product-filters'
import ProductPagination from '@/components/products/product-pagination'
import { Badge } from '@/components/ui/badge'
import { Suspense } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import ProductCardSkeleton from '@/components/skeletons/product-card-skeleton'
import FilterChips from '@/components/products/filter-chips'
import { getCategoriesWithCounts, getProductsPaginated, type ProductSortOption } from '@/lib/products'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import JsonLd from '@/components/seo/json-ld'
import {
  buildItemListJsonLd,
  buildPageMetadata,
  buildProductsCanonicalPath,
  truncateDescription,
} from '@/lib/seo'
import type { Metadata } from 'next'

type SortOption = ProductSortOption

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  page?: string
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const category = params.category
  const search = params.search
  const page = params.page

  let activeCategory: { name: string } | null = null
  if (category) {
    const categories = await getCategoriesWithCounts()
    activeCategory =
      categories.find((c) => c.name.toLowerCase().replace(/ /g, '-') === category) ?? null
  }

  const title = search
    ? `Search: ${search}`
    : activeCategory
      ? activeCategory.name
      : 'Industrial Catalog'

  const description = search
    ? `Browse products matching "${search}" in the Fabrio Hardware industrial catalog.`
    : activeCategory
      ? `Shop ${activeCategory.name.toLowerCase()} from Fabrio Hardware — certified inventory, bulk pricing, and fast delivery across Uganda.`
      : 'Browse Fabrio Hardware\'s full catalog of industrial tools, PPE, power equipment, and safety gear for B2B buyers in Uganda.'

  const noIndex = Boolean(
    search || params.minPrice || params.maxPrice || params.inStock === 'true'
  )

  return buildPageMetadata({
    title,
    description: truncateDescription(description),
    path: buildProductsCanonicalPath({ category, search, page }),
    keywords: activeCategory ? [activeCategory.name, `${activeCategory.name} Uganda`] : ['product catalog', 'industrial supplies'],
    noIndex,
  })
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

  const [categories, { products, total, pages: totalPages }] = await Promise.all([
    getCategoriesWithCounts(),
    getProductsPaginated({
      categorySlug: category,
      search,
      sort,
      minPrice,
      maxPrice,
      inStock,
      page,
      limit: DEFAULT_PAGE_SIZE,
    }),
  ])

  const activeCategory = category
    ? categories.find((c) => c.name.toLowerCase().replace(/ /g, '-') === category)
    : null

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

  const listJsonLd = products.length
    ? buildItemListJsonLd(
        products.map((p) => ({ id: p.id, name: p.name })),
        pageTitle
      )
    : null

  return (
    <div className="min-h-screen bg-background">
      {listJsonLd && <JsonLd data={listJsonLd} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <PageHeader
          eyebrow="Product Catalog"
          title={pageTitle}
          description={pageDescription}
        >
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {total} products
          </Badge>
        </PageHeader>

        <MobileCategoryRail
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          activeSlug={category}
          counts={Object.fromEntries(categories.map((c) => [c.name, c._count.products]))}
        />

        <FilterChips
          search={search}
          category={category}
          categoryLabel={activeCategory?.name}
          sort={sort}
          minPrice={minPrice}
          maxPrice={maxPrice}
          inStock={inStock}
        />

        <div className="mb-4 sm:mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="hidden lg:block lg:col-span-1">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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