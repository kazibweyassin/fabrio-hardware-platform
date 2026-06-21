import { randomBytes } from 'crypto'

function uniqueSuffix() {
  return randomBytes(6).toString('hex').toUpperCase()
}

export function generateOrderNumber() {
  return `ORD-${uniqueSuffix()}`
}

export function generateQuotationNumber() {
  return `QT-${uniqueSuffix()}`
}