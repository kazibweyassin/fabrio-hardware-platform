import { getMtnMomoConfig, isMtnMomoConfigured } from './env'

export type MtnMomoTransactionStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED'

type TokenCache = {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

function getCollectionBaseUrl(): string {
  const config = getMtnMomoConfig()
  return config.environment === 'production'
    ? 'https://proxy.momoapi.mtn.com/collection'
    : 'https://sandbox.momodeveloper.mtn.com/collection'
}

async function getAccessToken(): Promise<string> {
  if (!isMtnMomoConfigured()) {
    throw new Error('MTN MoMo API is not configured')
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token
  }

  const config = getMtnMomoConfig()
  const credentials = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString('base64')
  const res = await fetch(`${getCollectionBaseUrl()}/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MTN MoMo token request failed (${res.status}): ${body}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data.access_token
}

export async function requestToPay(params: {
  referenceId: string
  amount: number
  currency: string
  externalId: string
  payerMsisdn: string
  payerMessage: string
  payeeNote: string
  callbackUrl: string
}): Promise<void> {
  const config = getMtnMomoConfig()
  const token = await getAccessToken()

  const res = await fetch(`${getCollectionBaseUrl()}/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Reference-Id': params.referenceId,
      'X-Target-Environment': config.targetEnvironment,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'X-Callback-Url': params.callbackUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(Math.round(params.amount)),
      currency: params.currency,
      externalId: params.externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: params.payerMsisdn,
      },
      payerMessage: params.payerMessage,
      payeeNote: params.payeeNote,
    }),
  })

  if (res.status !== 202) {
    const body = await res.text()
    throw new Error(`MTN MoMo requestToPay failed (${res.status}): ${body}`)
  }
}

export async function getRequestToPayStatus(referenceId: string): Promise<{
  status: MtnMomoTransactionStatus
  financialTransactionId?: string
  reason?: string
}> {
  const config = getMtnMomoConfig()
  const token = await getAccessToken()

  const res = await fetch(`${getCollectionBaseUrl()}/v1_0/requesttopay/${referenceId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Target-Environment': config.targetEnvironment,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MTN MoMo status check failed (${res.status}): ${body}`)
  }

  const data = (await res.json()) as {
    status: MtnMomoTransactionStatus
    financialTransactionId?: string
    reason?: { message?: string }
  }

  return {
    status: data.status,
    financialTransactionId: data.financialTransactionId,
    reason: data.reason?.message,
  }
}

export function mapMtnStatusToPaymentStatus(
  status: MtnMomoTransactionStatus
): 'pending' | 'processing' | 'completed' | 'failed' {
  switch (status) {
    case 'SUCCESSFUL':
      return 'completed'
    case 'FAILED':
      return 'failed'
    case 'PENDING':
    default:
      return 'processing'
  }
}