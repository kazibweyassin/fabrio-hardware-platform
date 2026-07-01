import Image from 'next/image'
import { Handshake } from 'lucide-react'
import { getPartnerBrands } from '@/lib/partner-brands'

function BrandBadge({ name, logo }: { name: string; logo: string }) {
  return (
    <div
      className="flex h-14 min-w-[9.5rem] shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card px-5 shadow-sm"
      title={name}
    >
      <Image
        src={logo}
        alt={`${name} logo`}
        width={140}
        height={48}
        className="h-9 w-auto max-w-[8.5rem] object-contain opacity-90 grayscale-[15%] transition-all duration-300 hover:opacity-100 hover:grayscale-0"
      />
    </div>
  )
}

export default function TrustBar() {
  const partnerBrands = getPartnerBrands()
  const marqueeBrands = [...partnerBrands, ...partnerBrands]

  return (
    <section className="section-surface overflow-hidden">
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