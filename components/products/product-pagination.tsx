'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
  searchParams?: Record<string, string | undefined>
}

export default function ProductPagination({
  currentPage,
  totalPages,
  basePath = '/products',
  searchParams = {},
}: ProductPaginationProps) {
  const currentSearchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(currentSearchParams.toString())

    // Apply passed search params overrides
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }

    const qs = params.toString()
    return `${basePath}${qs ? `?${qs}` : ''}`
  }

  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{currentPage}</span> of {totalPages}
      </div>

      <div className="flex items-center gap-1">
        <Link
          href={createPageUrl(currentPage - 1)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border border-border text-sm transition-colors',
            currentPage === 1
              ? 'pointer-events-none opacity-40'
              : 'hover:bg-muted'
          )}
          aria-disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <Link
              key={idx}
              href={createPageUrl(p)}
              className={cn(
                'flex h-10 min-w-10 items-center justify-center rounded-xl border text-sm font-medium transition-colors',
                p === currentPage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              )}
            >
              {p}
            </Link>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground">…</span>
          )
        )}

        <Link
          href={createPageUrl(currentPage + 1)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border border-border text-sm transition-colors',
            currentPage === totalPages
              ? 'pointer-events-none opacity-40'
              : 'hover:bg-muted'
          )}
          aria-disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  )
}
