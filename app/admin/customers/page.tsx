import { prisma } from '@/lib/db'
import { guardAdminPage } from '@/lib/admin-guard'
import Link from 'next/link'
import { Eye, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableElement,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '@/components/admin/admin-table'

async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  } catch {
    return []
  }
}

function getInitials(name?: string | null, email?: string) {
  const source = name || email || '?'
  return source
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default async function AdminCustomersPage() {
  await guardAdminPage()
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Accounts"
        title="Customers"
        description={`${customers.length} registered B2B accounts`}
      />

      {customers.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No customers yet"
          description="Customer accounts are created when users sign up for a B2B account."
          actionHref="/auth/signup"
          actionLabel="View signup page"
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminTableHead>
              <AdminTableHeaderCell>Customer</AdminTableHeaderCell>
              <AdminTableHeaderCell>Business</AdminTableHeaderCell>
              <AdminTableHeaderCell>Email</AdminTableHeaderCell>
              <AdminTableHeaderCell>Phone</AdminTableHeaderCell>
              <AdminTableHeaderCell>Credit Limit</AdminTableHeaderCell>
              <AdminTableHeaderCell>Joined</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Actions</AdminTableHeaderCell>
            </AdminTableHead>
            <AdminTableBody>
              {customers.map((customer) => (
                <AdminTableRow key={customer.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {getInitials(customer.user.name, customer.user.email)}
                      </div>
                      <span className="font-medium">{customer.user.name || 'N/A'}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {customer.businessName || '—'}
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">{customer.user.email}</AdminTableCell>
                  <AdminTableCell>{customer.phone || '—'}</AdminTableCell>
                  <AdminTableCell className="font-semibold">
                    {formatCurrency(customer.creditLimit)}
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <Link
                      href={`/admin/customers/${customer.id}`}
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