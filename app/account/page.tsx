'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/format'
import PageHeader from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Package, User, Heart, Repeat } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import toast from 'react-hot-toast'

interface CustomerProfile {
  id: string
  businessName?: string | null
  phone?: string | null
  orders?: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    items?: Array<{
      productId: string
      quantity: number
      unitPrice: number
      product: { name: string }
    }>
  }>
}

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'default' | 'destructive'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'default',
  cancelled: 'destructive',
}

export default function AccountPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const addToCart = useCart((s) => s.addItem)

  const handleReorder = (order: NonNullable<CustomerProfile['orders']>[number]) => {
    if (!order.items?.length) {
      toast.error('No items available to reorder')
      return
    }
    order.items.forEach((item) => {
      addToCart({
        productId: item.productId,
        productName: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.unitPrice,
      })
    })
    toast.success(`Added ${order.items.length} item(s) from order to cart`)
    router.push('/cart')
  }

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth/login?redirect=/account')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (!session?.user) return

    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setProfile(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [session?.user])

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="h-9 w-56 bg-muted rounded mb-3 animate-pulse" />
          <div className="h-5 w-72 bg-muted rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-elevated p-6 h-64 animate-pulse bg-muted/30 rounded-2xl" />
            <div className="card-elevated p-6 h-64 animate-pulse bg-muted/30 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <PageHeader
          eyebrow="My Account"
          title={`Hello, ${session.user.name?.split(' ')[0] || 'there'}`}
          description="Manage your profile and track orders"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 text-primary">
                <User className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-lg">Profile</h2>
            </div>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border/60">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{session.user.name || '—'}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{session.user.email}</dd>
              </div>
              {profile?.businessName && (
                <div className="flex justify-between py-2 border-b border-border/60">
                  <dt className="text-muted-foreground">Business</dt>
                  <dd className="font-medium">{profile.businessName}</dd>
                </div>
              )}
              {profile?.phone && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{profile.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 text-primary">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-lg">Order History</h2>
            </div>
            {!profile?.orders?.length ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No orders yet.</p>
                <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
                  Start shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.orders.slice(0, 12).map((order) => (
                  <div
                    key={order.id}
                    className="block p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-surface transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                          <Badge variant={statusVariant[order.status] || 'secondary'} className="capitalize text-xs">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{formatCurrency(order.total)}</div>
                        <div className="mt-2 flex gap-2 justify-end">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-xs px-3 py-1 rounded-lg border hover:bg-background"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleReorder(order)}
                            className="text-xs px-3 py-1 rounded-lg border hover:bg-background flex items-center gap-1"
                          >
                            <Repeat className="w-3 h-3" /> Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick access to wishlist */}
        <div className="mt-6">
          <Link
            href="/wishlist"
            className="card-elevated p-5 flex items-center justify-between hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Saved Items</div>
                <div className="text-sm text-muted-foreground">View and manage your wishlist</div>
              </div>
            </div>
            <span className="text-sm font-semibold text-primary group-hover:underline">Open Wishlist →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}