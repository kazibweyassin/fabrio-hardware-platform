'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface ProductDetailTabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export default function ProductDetailTabs({ tabs, defaultTab }: ProductDetailTabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id)

  const current = tabs.find((tab) => tab.id === active) || tabs[0]

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <div className="flex gap-1 p-1 rounded-xl bg-muted/60 w-fit mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              active === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  )
}