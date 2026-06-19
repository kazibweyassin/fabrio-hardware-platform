'use client'

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'

interface PaymentFormProps {
  orderId: string
  onSuccess: () => void
}

export default function PaymentForm({ orderId, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!')
        onSuccess()
        return
      }

      toast.error('Payment was not completed. Please try again.')
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-12 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold shadow-sm"
      >
        {loading ? 'Processing payment...' : 'Complete Payment'}
      </Button>
    </form>
  )
}