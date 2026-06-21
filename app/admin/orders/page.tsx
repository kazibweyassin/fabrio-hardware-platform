'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, Search, ShoppingCart } from 'lucide-react'
import TableSkeleton from '@/components/skeletons/table-skeleton'
import { formatCurrency } from '@/lib/format'
import { getOrderStatusClass, getPaymentStatusClass } from '@/lib/status-colors'
import StatusBadge from '@/components/ui/status-badge'
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

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  customer: { businessName?: string | null }
  items: { id: string }[]
  payment?: { status: string } | null
}

async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders')
    if (!res.ok) return []
    const data = await res.json()
    return data.orders || []
  } catch {
    return []
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.businessName || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="type-eyebrow mb-1">Fulfillment</p>
          <h2 className="type-h2">Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders or customers..."
              className="pl-9 h-10 rounded-xl border border-border bg-surface text-sm w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface text-sm px-3"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={10} columns={8} />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={search || statusFilter ? 'Try adjusting your search or filters.' : 'Orders will appear here once customers checkout.'}
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminTableHead>
              <AdminTableHeaderCell>Order #</AdminTableHeaderCell>
              <AdminTableHeaderCell>Customer</AdminTableHeaderCell>
              <AdminTableHeaderCell>Items</AdminTableHeaderCell>
              <AdminTableHeaderCell>Total</AdminTableHeaderCell>
              <AdminTableHeaderCell>Payment</AdminTableHeaderCell>
              <AdminTableHeaderCell>Status</AdminTableHeaderCell>
              <AdminTableHeaderCell>Date</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Actions</AdminTableHeaderCell>
            </AdminTableHead>
            <AdminTableBody>
              {filtered.map((order) => (
                <AdminTableRow key={order.id}>
                  <AdminTableCell className="font-mono">{order.orderNumber}</AdminTableCell>
                  <AdminTableCell className="font-medium">
                    {order.customer?.businessName || 'N/A'}
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {order.items?.length || 0} items
                  </AdminTableCell>
                  <AdminTableCell className="font-semibold">
                    {formatCurrency(Number(order.total))}
                  </AdminTableCell>
                  <AdminTableCell>
                    <StatusBadge
                      status={order.payment?.status || 'pending'}
                      variantClass={getPaymentStatusClass(order.payment?.status || 'pending')}
                    />
                  </AdminTableCell>
                  <AdminTableCell>
                    <StatusBadge status={order.status} variantClass={getOrderStatusClass(order.status)} />
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <Link
                      href={`/admin/orders/${order.id}`}
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