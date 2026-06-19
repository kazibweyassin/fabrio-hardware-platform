import * as Sentry from '@sentry/nextjs'

const rawDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || ''
const dsn = rawDsn && !rawDsn.includes('...') ? rawDsn : ''

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
  })
}