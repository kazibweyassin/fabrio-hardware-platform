export default function ProductCardSkeleton() {
  return (
    <div className="card-elevated overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-14 bg-muted rounded" />
        <div className="h-3.5 w-4/5 bg-muted rounded" />
        <div className="h-2.5 w-1/2 bg-muted rounded" />
        <div className="flex items-center gap-2 pt-0.5">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-3 w-10 bg-muted rounded" />
        </div>
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="h-8 w-full bg-muted rounded-lg" />
          <div className="h-8 w-full bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  )
}
