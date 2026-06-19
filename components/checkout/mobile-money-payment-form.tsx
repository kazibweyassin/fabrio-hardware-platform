'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOBILE_MONEY_BUSINESS_NAME, MOBILE_MONEY_PROVIDERS } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { Loader2, Smartphone } from 'lucide-react'

type MobileMoneyProvider = keyof typeof MOBILE_MONEY_PROVIDERS

const MTN_API_ENABLED = process.env.NEXT_PUBLIC_MTN_MOMO_API_ENABLED === 'true'

interface MobileMoneyPaymentFormProps {
  orderId: string
  orderNumber: string
  total: number
  onSuccess: () => void
}

export default function MobileMoneyPaymentForm({
  orderId,
  orderNumber,
  total,
  onSuccess,
}: MobileMoneyPaymentFormProps) {
  const [provider, setProvider] = useState<MobileMoneyProvider>('mtn')
  const [payerPhone, setPayerPhone] = useState('')
  const [transactionRef, setTransactionRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [awaitingApproval, setAwaitingApproval] = useState(false)

  const selected = MOBILE_MONEY_PROVIDERS[provider]
  const useMtnApi = provider === 'mtn' && MTN_API_ENABLED

  useEffect(() => {
    if (!awaitingApproval || !useMtnApi) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/payment/mtn/status`)
        const data = await res.json()

        if (!res.ok) return

        if (data.paymentStatus === 'completed') {
          setPolling(false)
          setAwaitingApproval(false)
          toast.success('Payment confirmed!')
          onSuccess()
        } else if (data.paymentStatus === 'failed') {
          setPolling(false)
          setAwaitingApproval(false)
          toast.error(data.payment?.notes || 'Payment failed. Please try again.')
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [awaitingApproval, useMtnApi, orderId, onSuccess])

  const handleMtnApiPayment = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/payment/mtn/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payerPhone }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to send payment request')
        return
      }

      toast.success(data.message || 'Check your phone to approve the payment')
      setAwaitingApproval(true)
      setPolling(true)
    } catch (error) {
      console.error(error)
      toast.error('Failed to send payment request')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, payerPhone, transactionRef }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit payment')
        return
      }

      toast.success(data.message || 'Payment submitted')
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit payment')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = useMtnApi
    ? (e: React.FormEvent) => {
        e.preventDefault()
        handleMtnApiPayment()
      }
    : handleManualSubmit

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground mb-1">Amount to pay</p>
        <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Payment reference: <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Select Mobile Money Provider</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(MOBILE_MONEY_PROVIDERS) as MobileMoneyProvider[]).map((key) => {
            const item = MOBILE_MONEY_PROVIDERS[key]
            const active = provider === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setProvider(key)
                  setAwaitingApproval(false)
                  setPolling(false)
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    {!useMtnApi || key !== 'mtn' ? (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.merchantNumber}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Instant API payment</p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {useMtnApi ? (
        <div className="rounded-xl border border-border p-5 space-y-3">
          <p className="font-semibold text-sm">Pay with MTN MoMo</p>
          <p className="text-sm text-muted-foreground">
            Enter your MTN number below. You will receive a prompt on your phone to approve{' '}
            <strong>{formatCurrency(total)}</strong>.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-5 space-y-3">
          <p className="font-semibold text-sm">How to pay with {selected.label}</p>
          <p className="text-sm text-muted-foreground">
            Send <strong>{formatCurrency(total)}</strong> to <strong>{MOBILE_MONEY_BUSINESS_NAME}</strong> at{' '}
            <span className="font-mono font-semibold">{selected.merchantNumber}</span>
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            {selected.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {useMtnApi ? 'MTN Mobile Money number *' : 'Phone number used to pay *'}
          </label>
          <Input
            type="tel"
            value={payerPhone}
            onChange={(e) => setPayerPhone(e.target.value)}
            placeholder="0771234567"
            required
            disabled={awaitingApproval}
          />
        </div>
        {!useMtnApi && (
          <div>
            <label className="block text-sm font-medium mb-2">Transaction ID *</label>
            <Input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="From your mobile money confirmation SMS"
              required
            />
          </div>
        )}
      </div>

      {awaitingApproval && useMtnApi && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3 text-sm text-amber-900">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <p>Waiting for approval on your phone. Enter your MTN MoMo PIN when prompted.</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || (awaitingApproval && polling)}
        className="w-full h-12 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold shadow-sm gap-2"
      >
        <Smartphone className="w-4 h-4" />
        {loading
          ? 'Processing...'
          : awaitingApproval && polling
            ? 'Waiting for approval...'
            : useMtnApi
              ? 'Send Payment Request to My Phone'
              : 'I Have Paid — Submit Payment'}
      </Button>
    </form>
  )
}