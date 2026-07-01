import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductThumbnailProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-14 h-14 rounded-lg',
  md: 'w-20 h-20 sm:w-24 sm:h-24 rounded-xl',
  lg: 'w-28 h-28 rounded-xl',
}

export default function ProductThumbnail({
  src,
  alt,
  size = 'sm',
  className,
}: ProductThumbnailProps) {
  const sizeClass = sizeClasses[size]

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-gradient-to-br from-muted to-secondary/30',
        sizeClass,
        className
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="96px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
          <Package
            className={cn(
              'text-muted-foreground/35',
              size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'
            )}
            aria-hidden
          />
          {size !== 'sm' && (
            <span className="text-[10px] text-muted-foreground/70 leading-none">No image</span>
          )}
        </div>
      )}
    </div>
  )
}