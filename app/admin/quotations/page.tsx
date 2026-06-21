import { prisma } from '@/lib/db'
import { guardAdminPage } from '@/lib/admin-guard'
import Link from 'next/link'
import { Plus, Eye, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { getQuotationStatusClass } from '@/lib/status-colors'
import StatusBadge from '@/components/ui/status-badge'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import { Button } from '@/components/ui/button'
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableElement,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '@/components/admin/admin-table'

async function getQuotations() {
  try {
    return await prisma.quotation.findMany({
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  } catch {
    return []
  }
}

export default async function AdminQuotationsPage() {
  await guardAdminPage()
  const quotations = await getQuotations()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="B2B Sales"
        title="Quotations"
        description="Manage bulk quotes and enterprise pricing"
      >
        <Link href="/admin/quotations/new">
          <Button className="gap-2 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold">
            <Plus className="w-4 h-4" />
            New Quotation
          </Button>
        </Link>
      </AdminPageHeader>

      {quotations.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title="No quotations yet"
          description="Create a quotation when a customer requests bulk pricing."
          actionHref="/admin/quotations/new"
          actionLabel="Create quotation"
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminTableHead>
              <AdminTableHeaderCell>Quote #</AdminTableHeaderCell>
              <AdminTableHeaderCell>Customer</AdminTableHeaderCell>
              <AdminTableHeaderCell>Items</AdminTableHeaderCell>
              <AdminTableHeaderCell>Total</AdminTableHeaderCell>
              <AdminTableHeaderCell>Status</AdminTableHeaderCell>
              <AdminTableHeaderCell>Valid Until</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Actions</AdminTableHeaderCell>
            </AdminTableHead>
            <AdminTableBody>
              {quotations.map((quote) => (
                <AdminTableRow key={quote.id}>
                  <AdminTableCell className="font-mono">{quote.quotationNumber}</AdminTableCell>
                  <AdminTableCell className="font-medium">
                    {quote.customer.businessName || 'N/A'}
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">{quote.items.length} items</AdminTableCell>
                  <AdminTableCell className="font-semibold">{formatCurrency(quote.total)}</AdminTableCell>
                  <AdminTableCell>
                    <StatusBadge status={quote.status} variantClass={getQuotationStatusClass(quote.status)} />
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {new Date(quote.validUntil).toLocaleDateString()}
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <Link
                      href={`/admin/quotations/${quote.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTableElement>
        </AdminTable>
      )}
    </div>
  )
}