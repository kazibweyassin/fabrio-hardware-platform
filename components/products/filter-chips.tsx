'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface FilterChipsProps {
  search?: string
  category?: string
  categoryLabel?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

const sortLabels: Record<string, string> = {
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
  newest: 'Newest',
}

function buildHref(omit: string, props: FilterChipsProps) {
  const params = new URLSearchParams()
  if (props.search && omit !== 'search') params.set('search', props.search)
  if (props.category && omit !== 'category') params.set('category', props.category)
  if (props.sort && props.sort !== 'name-asc' && omit !== 'sort') params.set('sort', props.sort)
  if (props.minPrice != null && omit !== 'minPrice') params.set('minPrice', String(props.minPrice))
  if (props.maxPrice != null && omit !== 'maxPrice') params.set('maxPrice', String(props.maxPrice))
  if (props.inStock && omit !== 'inStock') params.set('inStock', 'true')
  const qs = params.toString()
  return qs ? `/products?${qs}` : '/products'
}

export default function FilterChips(props: FilterChipsProps) {
  const chips: Array<{ key: string; label: string; href: string }> = []

  if (props.search) {
    chips.push({ key: 'search', label: `Search: "${props.search}"`, href: buildHref('search', props) })
  }
  if (props.category) {
    chips.push({
      key: 'category',
      label: props.categoryLabel || props.category.replace(/-/g, ' '),
      href: buildHref('category', props),
    })
  }
  if (props.sort && props.sort !== 'name-asc') {
    chips.push({
      key: 'sort',
      label: sortLabels[props.sort] || props.sort,
      href: buildHref('sort', props),
    })
  }
  if (props.minPrice != null || props.maxPrice != null) {
    const min = props.minPrice != null ? formatCurrency(props.minPrice) : '…'
    const max = props.maxPrice != null ? formatCurrency(props.maxPrice) : '…'
    chips.push({
      key: 'price',
      label: `${min} – ${max}`,
      href: buildHref('minPrice', { ...props, minPrice: undefined, maxPrice: undefined }),
    })
  }
  if (props.inStock) {
    chips.push({ key: 'inStock', label: 'In stock', href: buildHref('inStock', props) })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-medium text-muted-foreground mr-1">Active:</span>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
        >
          {chip.label}
          <X className="w-3 h-3 opacity-60" />
        </Link>
      ))}
      <Link href="/products" className="text-xs font-medium text-muted-foreground hover:text-primary ml-1">
        Clear all
      </Link>
    </div>
  )
}