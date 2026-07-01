import { Building2, CreditCard, Headphones, Warehouse } from 'lucide-react'

const values = [
  {
    icon: Building2,
    title: 'Volume Pricing',
    description: 'Tiered wholesale rates for orders of 10+ units',
  },
  {
    icon: CreditCard,
    title: 'Net-30 Terms',
    description: 'Flexible payment options for verified enterprise accounts',
  },
  {
    icon: Warehouse,
    title: '12 Warehouses',
    description: 'Multi-location inventory with same-day dispatch',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'B2B account managers for procurement teams',
  },
]

export default function B2BValueStrip() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {values.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group flex flex-col sm:flex-row sm:items-start gap-3 p-4 sm:p-5 rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-brand/30 hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 text-brand shrink-0 transition-colors group-hover:bg-brand/15">
                  <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}