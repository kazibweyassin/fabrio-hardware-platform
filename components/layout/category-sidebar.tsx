import Link from 'next/link'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface CategorySidebarProps {
  categories: Category[]
  activeSlug?: string
  showAll?: boolean
  showCounts?: boolean
  counts?: Record<string, number>
}

export default function CategorySidebar({
  categories,
  activeSlug,
  showAll = true,
  showCounts = false,
  counts = {},
}: CategorySidebarProps) {
  return (
    <nav className="card-elevated p-5 sticky top-24">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Categories</h3>
      <ul className="space-y-1">
        {showAll && (
          <li>
            <Link
              href="/products"
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group',
                !activeSlug
                  ? 'bg-primary/5 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <span className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4" />
                All Products
              </span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </li>
        )}
        {categories.map((cat) => {
          const slug = cat.name.toLowerCase().replace(/ /g, '-')
          const isActive = activeSlug === slug
          const count = showCounts ? counts[cat.name] ?? 0 : null

          return (
            <li key={cat.id}>
              <Link
                href={`/products?category=${slug}`}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-primary/5 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <span>{cat.name}</span>
                <div className="flex items-center gap-1.5">
                  {count != null && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {count}
                    </span>
                  )}
                  <ChevronRight className={cn('w-4 h-4 transition-opacity', isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}