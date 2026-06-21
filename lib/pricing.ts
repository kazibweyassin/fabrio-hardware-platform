import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, TAX_RATE } from './constants'

export function calculateOrderTotals(subtotal: number) {
  const tax = subtotal * TAX_RATE
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + tax + shipping

  return { subtotal, tax, shipping, total }
}