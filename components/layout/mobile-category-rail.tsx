'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface MobileCategoryRailProps {
  categories: Category[]
  activeSlug?: string
  counts?: Record<string, number>
}

export default function MobileCategoryRail({
  categories,
  activeSlug,
  counts = {},
}: MobileCategoryRailProps) {
  return (
    <nav
      aria-label="Browse categories"
      className="lg:hidden -mx-4 px-4 mb-6 overflow-x-auto scrollbar-none"
    >
      <div className="flex gap-2 w-max min-w-full pb-1">
        <Link
          href="/products"
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors',
            !activeSlug
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-surface border-border text-muted-foreground'
          )}
        >
          All
        </Link>
        {categories.map((cat) => {
          const slug = cat.name.toLowerCase().replace(/ /g, '-')
          const isActive = activeSlug === slug
          const count = counts[cat.name]

          return (
            <Link
              key={cat.id}
              href={`/products?category=${slug}`}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted-foreground'
              )}
            >
              {cat.name}
              {count != null && (
                <span className={cn('ml-1.5 text-xs opacity-70', isActive && 'opacity-90')}>
                  ({count})
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}