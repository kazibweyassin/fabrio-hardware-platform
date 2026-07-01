import { prisma } from '@/lib/db'
import { guardAdminPage } from '@/lib/admin-guard'
import Link from 'next/link'
import { ArrowRight, BarChart3, DollarSign, Package, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { getOrderStatusClass } from '@/lib/status-colors'
import StatusBadge from '@/components/ui/status-badge'
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableElement,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '@/components/admin/admin-table'

async function getDashboardStats() {
  try {
    // Run sequentially to avoid exhausting the Neon pool (connection_limit is low in dev).
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()
    const totalCustomers = await prisma.customer.count()
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    })

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.amount || 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { totalProducts: 0, totalOrders: 0, totalCustomers: 0, totalRevenue: 0 }
  }
}

const quickActions = [
  { href: '/admin/products', title: 'Manage Products', desc: 'View and edit catalog', color: 'bg-primary/5 text-primary' },
  { href: '/admin/orders', title: 'View Orders', desc: 'Process customer orders', color: 'bg-accent/10 text-accent-foreground' },
  { href: '/admin/quotations', title: 'Quotations', desc: 'Manage B2B quotes', color: 'bg-success text-success-foreground' },
  { href: '/admin/customers', title: 'Customers', desc: 'Account management', color: 'bg-info text-info-foreground' },
]

async function getRecentOrders() {
  try {
    return await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        payment: true,
      },
    })
  } catch {
    return []
  }
}

export default async function AdminDashboard() {
  await guardAdminPage()
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()])

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, accent: 'bg-primary/5 text-primary' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, accent: 'bg-accent/10 text-accent-foreground' },
    { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: BarChart3, accent: 'bg-info text-info-foreground' },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, accent: 'bg-success text-success-foreground' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Overview</p>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Monitor your store performance at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card-interactive p-6 hover:border-primary/15">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{stat.value}</p>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${stat.accent}`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card-elevated p-6 lg:p-8">
        <h3 className="font-semibold text-lg mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group card-interactive p-5 hover:border-primary/20"
            >
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${action.color} mb-4`}>
                <ArrowRight className="w-4 h-4" />
              </div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">{action.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="type-h3">Recent Orders</h3>
            <p className="text-sm text-muted-foreground mt-1">Latest customer activity</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <AdminTableElement>
              <AdminTableHead>
                <AdminTableHeaderCell>Order</AdminTableHeaderCell>
                <AdminTableHeaderCell>Customer</AdminTableHeaderCell>
                <AdminTableHeaderCell>Total</AdminTableHeaderCell>
                <AdminTableHeaderCell>Status</AdminTableHeaderCell>
                <AdminTableHeaderCell>Date</AdminTableHeaderCell>
              </AdminTableHead>
              <AdminTableBody>
                {recentOrders.map((order) => (
                  <AdminTableRow key={order.id}>
                    <AdminTableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-primary hover:underline">
                        {order.orderNumber}
                      </Link>
                    </AdminTableCell>
                    <AdminTableCell>{order.customer?.businessName || '—'}</AdminTableCell>
                    <AdminTableCell className="font-semibold">{formatCurrency(order.total)}</AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge status={order.status} variantClass={getOrderStatusClass(order.status)} />
                    </AdminTableCell>
                    <AdminTableCell className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTableElement>
          </div>
        )}
      </div>
    </div>
  )
}