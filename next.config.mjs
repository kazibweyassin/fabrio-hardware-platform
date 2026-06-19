import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
}

const rawDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || ''
// Only enable Sentry if a plausible DSN is configured (avoid placeholder values like https://...@sentry.io/...)
const sentryEnabled = rawDsn && !rawDsn.includes('...') && rawDsn.startsWith('https://')

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      // debug: false, // uncomment to see more Sentry logs
    })
  : nextConfig