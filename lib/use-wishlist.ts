'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/lib/auth-client'
import toast from 'react-hot-toast'

export function useWishlist() {
  const { data: session } = useSession()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Load wishlist from server when user is logged in
  useEffect(() => {
    if (!session?.user) {
      setWishlistIds(new Set())
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetch('/api/wishlist')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load wishlist')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const ids = new Set<string>((data.products || []).map((p: { id: string }) => p.id))
        setWishlistIds(ids)
      })
      .catch(() => {
        // Silent fail - wishlist just won't be prefilled
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  )

  const toggle = useCallback(
    async (productId: string, productName?: string) => {
      if (!session?.user) {
        // Redirect to login with return
        window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
        return
      }

      const currentlyWishlisted = wishlistIds.has(productId)
      const newSet = new Set(wishlistIds)

      // Optimistic update
      if (currentlyWishlisted) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      setWishlistIds(newSet)

      try {
        const method = currentlyWishlisted ? 'DELETE' : 'POST'
        const res = await fetch('/api/wishlist', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })

        if (!res.ok) {
          throw new Error('Request failed')
        }

        if (currentlyWishlisted) {
          toast.success(productName ? `Removed ${productName} from wishlist` : 'Removed from wishlist')
        } else {
          toast.success(productName ? `Added ${productName} to wishlist` : 'Added to wishlist')
        }
      } catch (err) {
        // Revert on failure
        const revertSet = new Set(wishlistIds)
        if (currentlyWishlisted) {
          revertSet.add(productId)
        } else {
          revertSet.delete(productId)
        }
        setWishlistIds(revertSet)
        toast.error('Failed to update wishlist')
      }
    },
    [session?.user, wishlistIds]
  )

  return {
    wishlistIds,
    isWishlisted,
    toggle,
    isLoading,
    isAuthenticated: !!session?.user,
  }
}
