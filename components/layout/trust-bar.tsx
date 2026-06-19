import Image from 'next/image'
import { Handshake } from 'lucide-react'
import { getPartnerBrands } from '@/lib/partner-brands'

function BrandBadge({ name, logo }: { name: string; logo?: string }) {
  if (logo) {
    return (
      <div className="flex h-14 min-w-[9rem] items-center justify-center rounded-xl border border-border/60 bg-card px-6 shadow-sm">
        <Image
          src={logo}
          alt={name}
          width={140}
          height={48}
          className="h-9 w-auto max-w-[8.5rem] object-contain opacity-90"
        />
      </div>
    )
  }

  return (
    <div className="flex h-14 min-w-[9rem] items-center justify-center rounded-xl border border-border/60 bg-card px-6 shadow-sm">
      <span className="text-sm font-bold tracking-wide text-foreground/80 whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export default function TrustBar() {
  const partnerBrands = getPartnerBrands()
  const marqueeBrands = [...partnerBrands, ...partnerBrands]

  return (
    <section className="border-y border-border bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Handshake className="w-4 h-4 text-primary" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Brands we supply
          </p>
        </div>

        <div className="brand-marquee relative">
          <div className="brand-marquee-track flex w-max items-center gap-4">
            {marqueeBrands.map((brand, index) => (
              <BrandBadge key={`${brand.slug}-${index}`} name={brand.name} logo={brand.logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}