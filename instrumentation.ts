import * as Sentry from '@sentry/nextjs'
import { validateProductionEnv } from './lib/env'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const missing = validateProductionEnv()
    if (missing.length > 0) {
      throw new Error(`Missing required production environment variables: ${missing.join(', ')}`)
    }
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError