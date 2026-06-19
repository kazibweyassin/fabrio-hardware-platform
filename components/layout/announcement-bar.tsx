import { Truck, ShieldCheck, Phone } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'

export default function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-9 gap-4 overflow-hidden">
          <div className="flex items-center gap-6 min-w-0">
            <span className="hidden sm:flex items-center gap-1.5 shrink-0 font-medium text-brand">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              Enterprise B2B Platform
            </span>
            <span className="flex items-center gap-1.5 truncate opacity-90">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 shrink-0 opacity-90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              OSHA Certified
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              1-800-FABRIO
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}