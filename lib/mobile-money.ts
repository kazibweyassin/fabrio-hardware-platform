import { MOBILE_MONEY_PROVIDERS, type MobileMoneyProvider } from './constants'

export function normalizeUgandaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('256') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 10) return `256${digits.slice(1)}`
  if (digits.length === 9) return `256${digits}`
  return digits
}

export function isValidUgandaPhone(phone: string): boolean {
  const normalized = normalizeUgandaPhone(phone)
  return /^256(7[0-9]|3[0-9])\d{7}$/.test(normalized)
}

export function getMobileMoneyRecipient(provider: MobileMoneyProvider) {
  return MOBILE_MONEY_PROVIDERS[provider]
}

export function formatUgandaPhoneDisplay(phone: string): string {
  const normalized = normalizeUgandaPhone(phone)
  if (normalized.startsWith('256') && normalized.length === 12) {
    return `0${normalized.slice(3)}`
  }
  return phone
}