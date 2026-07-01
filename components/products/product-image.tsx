'use client'

import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
  aspectClass?: string
  priority?: boolean
  sizes?: string
}

export default function ProductImage({
  src,
  alt,
  className,
  aspectClass = 'aspect-[4/3]',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw',
}: ProductImageProps) {
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br from-muted to-secondary/30', aspectClass, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <Package className="w-10 h-10 text-muted-foreground/35" aria-hidden />
          <p className="text-xs text-muted-foreground/80">Image coming soon</p>
        </div>
      )}
    </div>
  )
}