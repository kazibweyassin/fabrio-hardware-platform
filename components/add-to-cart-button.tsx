'use client'

import { useCart, type CartItem } from '@/lib/store/cart'
import { cn } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    retailPrice: number
    image?: string | null
  }
  quantity?: number
  className?: string
  showIcon?: boolean
  label?: string
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className = '',
  showIcon = true,
  label = 'Add',
}: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem)

  const handleAdd = () => {
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.retailPrice,
      image: product.image || undefined,
    }

    addItem(item)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        className
      )}
    >
      {showIcon && <ShoppingCart className="w-4 h-4 shrink-0" />}
      <span>{label}</span>
    </button>
  )
}