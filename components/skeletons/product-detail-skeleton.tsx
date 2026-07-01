export default function ProductDetailSkeleton() {
  return (
    <div className="bg-background min-h-screen animate-pulse">
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 w-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16">
          <div className="card-elevated aspect-square bg-muted rounded-2xl" />

          <div className="space-y-6">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-10 w-4/5 bg-muted rounded" />
            <div className="flex gap-3">
              <div className="h-7 w-24 bg-muted rounded-full" />
              <div className="h-7 w-32 bg-muted rounded" />
            </div>

            <div className="card-elevated p-6 space-y-3">
              <div className="h-10 w-36 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted rounded-xl" />
              <div className="h-20 bg-muted rounded-xl" />
            </div>

            <div className="flex gap-3">
              <div className="h-12 flex-1 bg-muted rounded-xl" />
              <div className="h-12 w-12 bg-muted rounded-xl" />
            </div>

            <div className="card-elevated p-1">
              <div className="flex gap-2 p-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-9 flex-1 bg-muted rounded-lg" />
                ))}
              </div>
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border/60">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}