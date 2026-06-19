'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  productName?: string
  isWishlisted: boolean
  onToggle: (productId: string, productName?: string) => void | Promise<void>
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function WishlistButton({
  productId,
  productName,
  isWishlisted,
  onToggle,
  className,
  size = 'md',
  showLabel = false,
}: WishlistButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle(productId, productName)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isWishlisted}
      className={cn(
        'flex items-center justify-center rounded-xl border transition-all active:scale-95',
        'bg-background/80 backdrop-blur border-border/60 hover:bg-background hover:border-border',
        isWishlisted && 'bg-accent/10 border-accent/30',
        sizeClasses[size],
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-colors',
          isWishlisted ? 'fill-accent text-accent' : 'text-muted-foreground'
        )}
      />
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isWishlisted ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
