export const TAX_RATE = 0.08
export const SHIPPING_FEE = 200_000 // UGX
export const FREE_SHIPPING_THRESHOLD = 2_000_000 // UGX
export const CURRENCY = 'UGX'
export const CURRENCY_LOCALE = 'en-UG'

export const MOBILE_MONEY_BUSINESS_NAME =
  process.env.NEXT_PUBLIC_MOBILE_MONEY_BUSINESS_NAME || 'Fabrio Hardware'

export const MOBILE_MONEY_PROVIDERS = {
  mtn: {
    id: 'mtn',
    label: 'MTN Mobile Money',
    merchantNumber: process.env.NEXT_PUBLIC_MTN_MERCHANT_NUMBER || '0770000000',
    color: '#FFCC00',
    instructions: [
      'Dial *165# on your MTN line',
      'Select Send Money / Pay Bill',
      'Enter the merchant number shown below',
      'Enter the exact order amount',
      'Use your order number as the payment reference',
      'Complete the transaction and enter the Transaction ID below',
    ],
  },
  airtel: {
    id: 'airtel',
    label: 'Airtel Money',
    merchantNumber: process.env.NEXT_PUBLIC_AIRTEL_MERCHANT_NUMBER || '0700000000',
    color: '#ED1C24',
    instructions: [
      'Dial *185# on your Airtel line',
      'Select Make Payment / Send Money',
      'Enter the merchant number shown below',
      'Enter the exact order amount',
      'Use your order number as the payment reference',
      'Complete the transaction and enter the Transaction ID below',
    ],
  },
} as const

export type MobileMoneyProvider = keyof typeof MOBILE_MONEY_PROVIDERS

export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]