import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Customers</h2>

      {customers.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No customers yet</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Business</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Phone</th>
                <th className="text-left p-4 font-semibold">Tax ID</th>
                <th className="text-left p-4 font-semibold">Credit Limit</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="p-4 font-medium">{customer.user.name || 'N/A'}</td>
                  <td className="p-4 text-sm">{customer.businessName || 'N/A'}</td>
                  <td className="p-4 text-sm text-muted-foreground">{customer.user.email}</td>
                  <td className="p-4 text-sm">{customer.phone || 'N/A'}</td>
                  <td className="p-4 text-sm font-mono">{customer.taxId || 'N/A'}</td>
                  <td className="p-4 font-semibold">{formatCurrency(customer.creditLimit)}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/customers/${customer.id}`}
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
