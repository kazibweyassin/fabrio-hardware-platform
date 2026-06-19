export default function ProductCardSkeleton() {
  return (
    <div className="card-elevated overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-10 flex-1 bg-muted rounded-xl" />
          <div className="h-10 flex-1 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  )
}
