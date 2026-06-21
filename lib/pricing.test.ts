import { describe, expect, it } from 'vitest'
import { calculateOrderTotals } from './pricing'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, TAX_RATE } from './constants'

describe('calculateOrderTotals', () => {
  it('applies shipping below the free shipping threshold', () => {
    const subtotal = FREE_SHIPPING_THRESHOLD - 1
    const result = calculateOrderTotals(subtotal)

    expect(result.subtotal).toBe(subtotal)
    expect(result.tax).toBe(subtotal * TAX_RATE)
    expect(result.shipping).toBe(SHIPPING_FEE)
    expect(result.total).toBe(subtotal + result.tax + SHIPPING_FEE)
  })

  it('waives shipping at or above the free shipping threshold', () => {
    const subtotal = FREE_SHIPPING_THRESHOLD
    const result = calculateOrderTotals(subtotal)

    expect(result.shipping).toBe(0)
    expect(result.total).toBe(subtotal + subtotal * TAX_RATE)
  })
})