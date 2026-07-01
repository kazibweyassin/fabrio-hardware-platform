import PageHeaderSkeleton from '@/components/skeletons/page-header-skeleton'
import ProductCardSkeleton from '@/components/skeletons/product-card-skeleton'

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <PageHeaderSkeleton />

        <div className="h-10 w-full bg-muted rounded-xl mb-6 lg:hidden" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <div className="card-elevated p-5 space-y-3">
              <div className="h-4 w-24 bg-muted rounded" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-full bg-muted rounded-xl" />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="h-11 w-full bg-muted rounded-xl mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}