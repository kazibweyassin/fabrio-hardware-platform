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

export function validateProductionEnv(): string[] {
  if (process.env.NODE_ENV !== 'production') return []

  const missing: string[] = []
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!process.env.NEON_AUTH_COOKIE_SECRET) missing.push('NEON_AUTH_COOKIE_SECRET')
  if (!process.env.NEXT_PUBLIC_MTN_MERCHANT_NUMBER) missing.push('NEXT_PUBLIC_MTN_MERCHANT_NUMBER')
  if (!process.env.NEXT_PUBLIC_AIRTEL_MERCHANT_NUMBER) missing.push('NEXT_PUBLIC_AIRTEL_MERCHANT_NUMBER')
  if (process.env.NEON_AUTH_COOKIE_SECRET === DEV_AUTH_SECRET) {
    missing.push('NEON_AUTH_COOKIE_SECRET (must not use dev fallback in production)')
  }
  return missing
}