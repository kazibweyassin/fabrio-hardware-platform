'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, SlidersHorizontal } from 'lucide-react'

interface ProductFiltersProps {
  currentSort: string
  currentMinPrice?: number
  currentMaxPrice?: number
  currentInStock: boolean
  currentSearch?: string
  currentCategory?: string
  hasActiveFilters: boolean
}

const sortOptions = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
]

export default function ProductFilters({
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
  currentSearch,
  currentCategory,
  hasActiveFilters,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || '')
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || '')
  const [inStock, setInStock] = useState(currentInStock)

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'false') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    startTransition(() => {
      router.push(`/products?${params.toString()}`)
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sort: e.target.value })
  }

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    })
  }

  const toggleInStock = (checked: boolean) => {
    setInStock(checked)
    updateFilters({ inStock: checked ? 'true' : undefined })
  }

  const clearAll = () => {
    setMinPrice('')
    setMaxPrice('')
    setInStock(false)
    startTransition(() => {
      router.push('/products')
    })
  }

  return (
    <div className="card-elevated p-4 lg:p-5">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Sort */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Sort by
          </label>
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="w-full h-11 rounded-xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            disabled={isPending}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Price Range
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="h-11"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="h-11"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={applyPriceFilter}
              className="h-11 px-4"
              disabled={isPending}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* In Stock */}
        <div className="flex items-center gap-3 pt-1 lg:pt-0">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => toggleInStock(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <span>In stock only</span>
          </label>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-11 gap-1.5 text-muted-foreground hover:text-foreground"
            disabled={isPending}
          >
            <X className="w-4 h-4" />
            Clear filters
          </Button>
        )}
      </div>

      {(currentSearch || currentCategory) && (
        <div className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          Active filters: {currentSearch && `Search: "${currentSearch}"`} {currentCategory && `Category: ${currentCategory}`}
        </div>
      )}
    </div>
  )
}
