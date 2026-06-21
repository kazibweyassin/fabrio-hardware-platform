'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomerOption {
  id: string
  businessName?: string | null
  user?: { name?: string | null; email: string }
}

interface ProductOption {
  id: string
  name: string
  sku: string
  retailPrice: number
}

interface LineItem {
  productId: string
  quantity: number
  unitPrice: number
}

export default function NewQuotationPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [customerId, setCustomerId] = useState('')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1, unitPrice: 0 }])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/customers?admin=1').then((r) => r.json()),
      fetch('/api/products?limit=100').then((r) => r.json()),
    ])
      .then(([customersData, productsData]) => {
        setCustomers(customersData.customers || [])
        setProducts(productsData.products || [])
      })
      .catch(() => toast.error('Failed to load form data'))
  }, [])

  const updateItem = (index: number, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const next = { ...item, ...patch }
        if (patch.productId) {
          const product = products.find((p) => p.id === patch.productId)
          if (product) next.unitPrice = product.retailPrice
        }
        return next
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      toast.error('Select a customer')
      return
    }

    const validItems = items.filter((item) => item.productId && item.quantity > 0)
    if (validItems.length === 0) {
      toast.error('Add at least one line item')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, items: validItems, discount, notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create quotation')
        return
      }
      toast.success('Quotation created')
      router.push(`/admin/quotations/${data.id}`)
    } catch {
      toast.error('Failed to create quotation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to quotations
        </Link>
        <h2 className="text-2xl font-bold">New Quotation</h2>
      </div>

      <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background"
            required
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.businessName || customer.user?.name || customer.user?.email}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Line Items</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0 }])}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add item
            </Button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2">
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, { productId: e.target.value })}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                className="rounded-xl border border-border px-3 py-2 text-sm bg-background"
                placeholder="Qty"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-sm bg-background"
                  placeholder="Unit price"
                />
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background"
              placeholder="Optional notes"
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="rounded-xl">
          {submitting ? 'Creating...' : 'Create Quotation'}
        </Button>
      </form>
    </div>
  )
}