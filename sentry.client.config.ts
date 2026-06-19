import * as Sentry from '@sentry/nextjs'

const rawDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || ''
const dsn = rawDsn && !rawDsn.includes('...') ? rawDsn : ''

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
    environment: process.env.NODE_ENV,
  })
}