'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { getQuotationStatusClass } from '@/lib/status-colors'
import StatusBadge from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'

interface QuotationDetail {
  id: string
  quotationNumber: string
  status: string
  subtotal: number
  discount: number | null
  tax: number
  total: number
  validUntil: string
  notes?: string | null
  createdAt: string
  customer: { businessName?: string | null; phone?: string | null }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    total: number
    product: { name: string; sku: string }
  }>
}

const STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const

export default function AdminQuotationDetailPage() {
  const params = useParams()
  const quotationId = params.id as string
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const loadQuotation = () => {
    fetch(`/api/quotations?id=${quotationId}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load quotation')
        setQuotation(data)
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (quotationId) loadQuotation()
  }, [quotationId])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId, status }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update quotation')
        return
      }
      toast.success('Quotation updated')
      setQuotation(data)
    } catch {
      toast.error('Failed to update quotation')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading quotation...</p>
  }

  if (!quotation) {
    return <p className="text-sm text-muted-foreground">Quotation not found</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to quotations
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-mono">{quotation.quotationNumber}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {quotation.customer.businessName || 'Customer'} · Valid until{' '}
              {new Date(quotation.validUntil).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={quotation.status} variantClass={getQuotationStatusClass(quotation.status)} />
        </div>
      </div>

      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-semibold">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">SKU</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3">{item.product.name}</td>
                  <td className="py-3 font-mono text-muted-foreground">{item.product.sku}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border pt-4 space-y-1 text-sm max-w-xs ml-auto">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(quotation.subtotal)}</span>
          </div>
          {quotation.discount != null && quotation.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrency(quotation.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(quotation.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Total</span>
            <span>{formatCurrency(quotation.total)}</span>
          </div>
        </div>
      </div>

      {quotation.notes && (
        <div className="card-elevated p-6">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground">{quotation.notes}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <Button
            key={status}
            variant={quotation.status === status ? 'default' : 'outline'}
            size="sm"
            disabled={updating || quotation.status === status}
            onClick={() => updateStatus(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>
    </div>
  )
}