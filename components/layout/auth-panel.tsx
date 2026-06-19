import Image from 'next/image'
import Link from 'next/link'
import { Award, Building2, ShieldCheck, Truck } from 'lucide-react'

const highlights = [
  { icon: ShieldCheck, text: 'OSHA & ANSI certified products' },
  { icon: Truck, text: 'Same-day dispatch from 12 warehouses' },
  { icon: Building2, text: 'Volume pricing for enterprise accounts' },
  { icon: Award, text: 'Dedicated B2B account managers' },
]

export default function AuthPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
        <Link href="/" className="flex items-center gap-3 group w-fit">
          <Image
            src="/fabrio-logo.png"
            alt="Fabrio"
            width={48}
            height={48}
            className="w-12 h-12 transition-transform group-hover:scale-105"
          />
          <div>
            <p className="font-bold text-xl text-white tracking-tight">Fabrio</p>
            <p className="text-[11px] font-medium text-white/50 uppercase tracking-widest">Industrial Supply</p>
          </div>
        </Link>

        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-4">Enterprise B2B Platform</p>
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight text-balance">
            Industrial-grade hardware for teams that build the future
          </h2>
          <p className="mt-4 text-white/60 leading-relaxed">
            Join thousands of contractors, manufacturers, and safety officers who trust Fabrio for certified PPE, power tools, and bulk supply.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.text} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-brand shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.text}
                </li>
              )
            })}
          </ul>
        </div>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Fabrio Hardware Corporation
        </p>
      </div>
    </div>
  )
}