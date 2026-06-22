'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SlidersHorizontal, X } from 'lucide-react'

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

function FilterFields({
  currentSort,
  minPrice,
  maxPrice,
  inStock,
  setMinPrice,
  setMaxPrice,
  setInStock,
  updateFilters,
  applyPriceFilter,
  toggleInStock,
  isPending,
}: {
  currentSort: string
  minPrice: string
  maxPrice: string
  inStock: boolean
  setMinPrice: (v: string) => void
  setMaxPrice: (v: string) => void
  setInStock: (v: boolean) => void
  updateFilters: (updates: Record<string, string | undefined>) => void
  applyPriceFilter: () => void
  toggleInStock: (checked: boolean) => void
  isPending: boolean
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end gap-4">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Sort by
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
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

      <div className="flex-1">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Price Range (UGX)
        </label>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex gap-2 items-center flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="h-11 flex-1 min-w-0"
            />
            <span className="text-muted-foreground shrink-0">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="h-11 flex-1 min-w-0"
            />
          </div>
          <Button variant="outline" size="sm" onClick={applyPriceFilter} className="h-11 px-4 w-full sm:w-auto shrink-0" disabled={isPending}>
            Apply
          </Button>
        </div>
      </div>

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
    </div>
  )
}

export default function ProductFilters({
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
  hasActiveFilters,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

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
    params.delete('page')
    startTransition(() => {
      router.push(`/products?${params.toString()}`)
      setMobileOpen(false)
    })
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
      setMobileOpen(false)
    })
  }

  const filterFields = (
    <FilterFields
      currentSort={currentSort}
      minPrice={minPrice}
      maxPrice={maxPrice}
      inStock={inStock}
      setMinPrice={setMinPrice}
      setMaxPrice={setMaxPrice}
      setInStock={setInStock}
      updateFilters={updateFilters}
      applyPriceFilter={applyPriceFilter}
      toggleInStock={toggleInStock}
      isPending={isPending}
    />
  )

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl justify-between"
          onClick={() => setMobileOpen(true)}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters & Sort
          </span>
          {hasActiveFilters && <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">Active</span>}
        </Button>
      </div>

      <div className="hidden lg:block card-elevated p-4 lg:p-5">
        {filterFields}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border/60 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5" disabled={isPending}>
              <X className="w-4 h-4" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="type-h3">Filters & Sort</h3>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterFields}
            <div className="flex gap-3 mt-6">
              {hasActiveFilters && (
                <Button variant="outline" className="flex-1 rounded-xl" onClick={clearAll}>
                  Clear
                </Button>
              )}
              <Button className="flex-1 rounded-xl gradient-brand text-brand-foreground border-0" onClick={() => setMobileOpen(false)}>
                Show results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}