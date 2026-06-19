import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowRight, BarChart3, DollarSign, Package, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

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
  { href: '/admin/quotations', title: 'Quotations', desc: 'Manage B2B quotes', color: 'bg-emerald-50 text-emerald-700' },
  { href: '/admin/customers', title: 'Customers', desc: 'Account management', color: 'bg-blue-50 text-blue-700' },
]

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart },
    { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: BarChart3 },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign },
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
            <div key={stat.label} className="card-elevated p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 text-primary">
                  <Icon className="w-5 h-5" />
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
              className="group p-5 rounded-2xl border border-border hover:border-primary/20 hover:shadow-md transition-all"
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
    </div>
  )
}