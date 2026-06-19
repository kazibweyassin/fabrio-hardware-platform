import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

async function getQuotations() {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return quotations
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return []
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'sent':
      return 'bg-blue-100 text-blue-800'
    case 'accepted':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'expired':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function AdminQuotationsPage() {
  const quotations = await getQuotations()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Quotations</h2>
        <Link
          href="/admin/quotations/new"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Quotation
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No quotations yet</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Quote #</th>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Items</th>
                <th className="text-left p-4 font-semibold">Total</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Valid Until</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quote) => (
                <tr key={quote.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="p-4 font-mono text-sm">{quote.quotationNumber}</td>
                  <td className="p-4 font-medium">{quote.customer.businessName || 'N/A'}</td>
                  <td className="p-4 text-sm text-muted-foreground">{quote.items.length} items</td>
                  <td className="p-4 font-semibold">{formatCurrency(quote.total)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(quote.validUntil).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/quotations/${quote.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
