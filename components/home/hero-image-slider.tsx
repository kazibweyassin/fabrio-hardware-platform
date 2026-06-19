'use client'

import { useCallback, useEffect, useState } from 'react'
import type { HeroImage } from '@/lib/hero-images'
import { cn } from '@/lib/utils'

const SLIDE_INTERVAL_MS = 5000

function slideAltText(src: string, index: number) {
  const filename = src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? `slide ${index + 1}`
  const readable = filename.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return readable || `Featured product ${index + 1}`
}

interface HeroImageSliderProps {
  images: HeroImage[]
}

export default function HeroImageSlider({ images }: HeroImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToSlide = useCallback(
    (index: number) => {
      if (images.length === 0) return
      setActiveIndex((index + images.length) % images.length)
    },
    [images.length],
  )

  const goToNext = useCallback(() => {
    goToSlide(activeIndex + 1)
  }, [activeIndex, goToSlide])

  useEffect(() => {
    if (images.length <= 1 || isPaused) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const timer = window.setInterval(goToNext, SLIDE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [goToNext, images.length, isPaused])

  useEffect(() => {
    images.forEach((image, index) => {
      if (index === activeIndex) return

      const preload = new window.Image()
      preload.decoding = 'async'
      preload.src = image.src
    })
  }, [activeIndex, images])

  if (images.length === 0) {
    return <div className="absolute inset-0 gradient-hero" aria-hidden />
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero background"
    >
      {images.map((image, index) => (
        <div
          key={image.src}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-[opacity]',
            index === activeIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0',
          )}
          aria-hidden={index !== activeIndex}
        >
          <img
            src={image.src}
            alt={slideAltText(image.src, index)}
            width={image.width}
            height={image.height}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding={index === activeIndex ? 'sync' : 'async'}
            className="hero-bg-image"
            draggable={false}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 z-[2] bg-gradient-to-r from-[oklch(0.14_0.03_250/0.88)] via-[oklch(0.16_0.03_250/0.72)] to-[oklch(0.18_0.04_260/0.45)]"
        aria-hidden
      />
      <div className="absolute inset-0 z-[2] grid-pattern opacity-25" aria-hidden />

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === activeIndex
                  ? 'w-6 bg-brand'
                  : 'w-2 bg-white/40 hover:bg-white/70',
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}