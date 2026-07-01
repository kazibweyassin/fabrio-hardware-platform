import PageHeaderSkeleton from '@/components/skeletons/page-header-skeleton'

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <PageHeaderSkeleton />

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="hidden sm:block h-3 w-16 bg-muted rounded" />
              {i < 2 && <div className="w-8 h-0.5 bg-muted hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div className="card-elevated p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-3 w-56 bg-muted rounded" />
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-11 w-full bg-muted rounded-xl" />
                </div>
              ))}
            </div>
            <div className="h-12 w-full bg-muted rounded-xl" />
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="card-elevated p-6 space-y-4">
              <div className="h-5 w-32 bg-muted rounded" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-12 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}