'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface RequestQuoteModalProps {
  product: {
    id: string
    name: string
    retailPrice: number
    sku: string
  }
}

export default function RequestQuoteModal({ product }: RequestQuoteModalProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    quantity: 10,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/quotations/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: form.quantity,
          notes: form.notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed')

      toast.success('Quote request submitted! Our team will contact you shortly.')
      setOpen(false)
      setForm({ quantity: 10, notes: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quote request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl font-semibold gap-2"
        onClick={() => setOpen(true)}
      >
        <FileText className="w-4 h-4" />
        Request Bulk Quote
      </Button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md card-elevated p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-1">Request Quote</h3>
            <p className="text-sm text-muted-foreground mb-5">
              For {product.name} (SKU: {product.sku})
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Estimated Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground mt-1">We offer tiered wholesale pricing for 10+ units.</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Additional Notes / Project Details</label>
                <textarea
                  className="w-full rounded-xl border border-border p-3 text-sm min-h-[90px]"
                  placeholder="Delivery timeline, specific certifications needed, etc."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Quote Request'}
                </Button>
              </div>
            </form>

            <p className="text-[11px] text-center text-muted-foreground mt-4">
              A member of our B2B team will respond within 1 business day.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
