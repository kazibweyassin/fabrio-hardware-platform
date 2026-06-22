import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { validateProductionEnv, isProductionAppUrl, getTrustedOrigins } from './env'

describe('validateProductionEnv', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns empty list in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(validateProductionEnv()).toEqual([])
  })

  it('flags missing production variables', () => {
    delete process.env.DATABASE_URL
    delete process.env.DIRECT_DATABASE_URL
    delete process.env.NEON_AUTH_COOKIE_SECRET
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.RESEND_API_KEY
    delete process.env.EMAIL_FROM

    const missing = validateProductionEnv()
    expect(missing).toContain('DATABASE_URL')
    expect(missing).toContain('DIRECT_DATABASE_URL')
    expect(missing).toContain('NEON_AUTH_COOKIE_SECRET')
    expect(missing).toContain('NEXT_PUBLIC_APP_URL')
    expect(missing).toContain('RESEND_API_KEY')
    expect(missing).toContain('EMAIL_FROM')
  })

  it('rejects localhost app URL in production', () => {
    process.env.DATABASE_URL = 'postgresql://x'
    process.env.DIRECT_DATABASE_URL = 'postgresql://x'
    process.env.NEON_AUTH_COOKIE_SECRET = 'real-secret'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.NEXT_PUBLIC_MTN_MERCHANT_NUMBER = '077'
    process.env.NEXT_PUBLIC_AIRTEL_MERCHANT_NUMBER = '070'
    process.env.RESEND_API_KEY = 're_test'
    process.env.EMAIL_FROM = 'Fabrio <a@b.com>'

    const missing = validateProductionEnv()
    expect(missing.some((m) => m.includes('NEXT_PUBLIC_APP_URL'))).toBe(true)
  })
})

describe('isProductionAppUrl', () => {
  it('accepts https production URLs', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://fabrio.com'
    expect(isProductionAppUrl()).toBe(true)
  })

  it('rejects localhost', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    expect(isProductionAppUrl()).toBe(false)
  })
})

describe('getTrustedOrigins', () => {
  it('includes app URL and Vercel preview URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://fabrio.com'
    process.env.VERCEL_URL = 'fabrio-git-main-user.vercel.app'

    const origins = getTrustedOrigins()
    expect(origins).toContain('https://fabrio.com')
    expect(origins).toContain('https://fabrio-git-main-user.vercel.app')
  })
})