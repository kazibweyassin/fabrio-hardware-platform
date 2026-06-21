import { prisma } from '@/lib/db'
import { guardAdminPage } from '@/lib/admin-guard'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

async function getCustomer(id: string) {
  try {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { payment: true },
        },
        quotations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await guardAdminPage()
  const { id } = await params
  const customer = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to customers
        </Link>
        <h2 className="text-2xl font-bold">{customer.user.name || customer.businessName || 'Customer'}</h2>
        <p className="text-sm text-muted-foreground mt-1">{customer.user.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-elevated p-6 space-y-4">
          <h3 className="font-semibold">Profile</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Business</dt>
              <dd className="font-medium">{customer.businessName || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{customer.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tax ID</dt>
              <dd className="font-mono">{customer.taxId || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Credit Limit</dt>
              <dd className="font-semibold">{formatCurrency(customer.creditLimit)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{new Date(customer.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="card-elevated p-6 space-y-4">
          <h3 className="font-semibold">Addresses</h3>
          <div className="text-sm space-y-4">
            <div>
              <p className="text-muted-foreground mb-1">Billing</p>
              <p>{customer.billingAddress || '—'}</p>
              {(customer.billingCity || customer.billingCountry) && (
                <p className="text-muted-foreground">
                  {[customer.billingCity, customer.billingState, customer.billingZip, customer.billingCountry]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Shipping</p>
              <p>{customer.shippingAddress || '—'}</p>
              {(customer.shippingCity || customer.shippingCountry) && (
                <p className="text-muted-foreground">
                  {[customer.shippingCity, customer.shippingState, customer.shippingZip, customer.shippingCountry]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold">Recent Orders</h3>
        </div>
        {customer.orders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left p-4">Order #</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Payment</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60 last:border-0">
                    <td className="p-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-primary hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="p-4 capitalize">{order.status}</td>
                    <td className="p-4 capitalize">{order.payment?.status || '—'}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}