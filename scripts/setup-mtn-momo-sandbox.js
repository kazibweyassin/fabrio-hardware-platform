/**
 * Provision MTN MoMo sandbox API user + key.
 * Run: node scripts/setup-mtn-momo-sandbox.js
 *
 * Requires MTN_MOMO_SUBSCRIPTION_KEY in .env (Collections primary key).
 */
const { randomUUID } = require('crypto')
const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx)
    const value = trimmed.slice(idx + 1)
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

const SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!SUBSCRIPTION_KEY) {
  console.error('Missing MTN_MOMO_SUBSCRIPTION_KEY in .env')
  process.exit(1)
}

const callbackHost = new URL(APP_URL).hostname || 'localhost'
const referenceId = randomUUID()

async function createApiUser() {
  const res = await fetch('https://sandbox.momodeveloper.mtn.com/v1_0/apiuser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Reference-Id': referenceId,
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
    },
    body: JSON.stringify({ providerCallbackHost: callbackHost }),
  })

  if (res.status !== 201) {
    const body = await res.text()
    throw new Error(`Create API user failed (${res.status}): ${body}`)
  }

  return referenceId
}

async function createApiKey(apiUserId) {
  const res = await fetch(`https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${apiUserId}/apikey`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
    },
  })

  if (res.status !== 201) {
    const body = await res.text()
    throw new Error(`Create API key failed (${res.status}): ${body}`)
  }

  const data = await res.json()
  return data.apiKey
}

function updateEnvFile(apiUser, apiKey) {
  const envPath = path.join(__dirname, '..', '.env')
  let content = fs.readFileSync(envPath, 'utf8')

  const upsert = (key, value) => {
    const line = `${key}=${value}`
    const pattern = new RegExp(`^${key}=.*$`, 'm')
    content = pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`
  }

  upsert('NEXT_PUBLIC_MTN_MOMO_API_ENABLED', 'true')
  upsert('MTN_MOMO_ENVIRONMENT', 'sandbox')
  upsert('MTN_MOMO_API_USER', apiUser)
  upsert('MTN_MOMO_API_KEY', apiKey)
  upsert('MTN_MOMO_SUBSCRIPTION_KEY', SUBSCRIPTION_KEY)
  upsert('MTN_MOMO_TARGET_ENVIRONMENT', 'sandbox')
  upsert('MTN_MOMO_CURRENCY', 'EUR')
  upsert('NEXT_PUBLIC_MOBILE_MONEY_BUSINESS_NAME', 'Fabrio Hardware')

  fs.writeFileSync(envPath, content)
}

async function main() {
  console.log('Provisioning MTN MoMo sandbox credentials...')
  console.log(`Callback host: ${callbackHost}`)

  const apiUser = await createApiUser()
  console.log(`API User created: ${apiUser}`)

  const apiKey = await createApiKey(apiUser)
  console.log('API Key created successfully')

  updateEnvFile(apiUser, apiKey)
  console.log('.env updated with MTN MoMo sandbox credentials')
  console.log('Restart the dev server (npm run dev) to apply changes.')
}

main().catch((error) => {
  console.error(error.message)
  console.error('\nIf you see 401/403, also subscribe to the Collections product (not just Collection Widget)')
  console.error('at https://momodeveloper.mtn.com/Product-descriptions')
  process.exit(1)
})