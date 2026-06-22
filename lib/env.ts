const DEV_AUTH_SECRET = 'dev-only-auth-secret-change-before-production'

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || 'postgresql://localhost:5432/fabrio'
}

export function getAuthSecret(): string {
  return process.env.NEON_AUTH_COOKIE_SECRET || DEV_AUTH_SECRET
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export function getStripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET
}

export type MtnMomoEnvironment = 'sandbox' | 'production'

export function isMtnMomoConfigured(): boolean {
  return Boolean(
    process.env.MTN_MOMO_API_USER &&
      process.env.MTN_MOMO_API_KEY &&
      process.env.MTN_MOMO_SUBSCRIPTION_KEY
  )
}

export function isMtnMomoApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MTN_MOMO_API_ENABLED === 'true' && isMtnMomoConfigured()
}

export function getMtnMomoWebhookSecret(): string | undefined {
  return process.env.MTN_MOMO_WEBHOOK_SECRET
}

export function getMtnMomoConfig() {
  const environment = (process.env.MTN_MOMO_ENVIRONMENT || 'sandbox') as MtnMomoEnvironment
  return {
    environment,
    apiUser: process.env.MTN_MOMO_API_USER || '',
    apiKey: process.env.MTN_MOMO_API_KEY || '',
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY || '',
    targetEnvironment:
      process.env.MTN_MOMO_TARGET_ENVIRONMENT ||
      (environment === 'production' ? 'mtnuganda' : 'sandbox'),
    currency: process.env.MTN_MOMO_CURRENCY || (environment === 'production' ? 'UGX' : 'EUR'),
    callbackUrl: `${getAppUrl()}/api/webhooks/mtn-momo`,
  }
}

export function getTrustedOrigins(): string[] {
  const origins = new Set<string>()
  const appUrl = getAppUrl()
  origins.add(appUrl)

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`)
  }

  const extra = process.env.TRUSTED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? []
  for (const origin of extra) origins.add(origin)

  return [...origins]
}

export function isProductionAppUrl(): boolean {
  const url = process.env.NEXT_PUBLIC_APP_URL
  return Boolean(url && url.startsWith('https://') && !url.includes('localhost'))
}

export function validateProductionEnv(): string[] {
  if (process.env.NODE_ENV !== 'production') return []

  const missing: string[] = []
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!process.env.DIRECT_DATABASE_URL) missing.push('DIRECT_DATABASE_URL')
  if (!process.env.NEON_AUTH_COOKIE_SECRET) missing.push('NEON_AUTH_COOKIE_SECRET')
  if (!process.env.NEXT_PUBLIC_APP_URL) missing.push('NEXT_PUBLIC_APP_URL')
  if (!isProductionAppUrl()) {
    missing.push('NEXT_PUBLIC_APP_URL (must be a public https URL, not localhost)')
  }
  if (!process.env.NEXT_PUBLIC_MTN_MERCHANT_NUMBER) missing.push('NEXT_PUBLIC_MTN_MERCHANT_NUMBER')
  if (!process.env.NEXT_PUBLIC_AIRTEL_MERCHANT_NUMBER) missing.push('NEXT_PUBLIC_AIRTEL_MERCHANT_NUMBER')
  if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY')
  if (!process.env.EMAIL_FROM) missing.push('EMAIL_FROM')
  if (process.env.NEON_AUTH_COOKIE_SECRET === DEV_AUTH_SECRET) {
    missing.push('NEON_AUTH_COOKIE_SECRET (must not use dev fallback in production)')
  }
  if (isMtnMomoApiEnabled() && !process.env.MTN_MOMO_WEBHOOK_SECRET) {
    missing.push('MTN_MOMO_WEBHOOK_SECRET (required when MTN MoMo API is enabled)')
  }
  return missing
}