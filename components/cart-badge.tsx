'use client'

import { useCart } from '@/lib/store/cart'
import { useEffect, useState } from 'react'

export default function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCart((state) => state.getTotalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || totalItems === 0) {
    return null
  }

  return (
    <span className="absolute -top-1.5 -right-1.5 gradient-brand text-brand-foreground text-[10px] font-bold rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center shadow-sm ring-2 ring-background">
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  )
}