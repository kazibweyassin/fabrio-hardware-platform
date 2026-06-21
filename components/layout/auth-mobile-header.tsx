import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function AuthMobileHeader() {
  return (
    <div className="lg:hidden mb-8">
      <Link href="/" className="flex items-center gap-3 mb-6">
        <Image src="/fabrio-logo.png" alt="Fabrio" width={40} height={40} className="w-10 h-10" />
        <div>
          <p className="font-bold text-lg leading-none">Fabrio</p>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
            Industrial Supply
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 text-accent text-xs font-semibold w-fit">
        <ShieldCheck className="w-3.5 h-3.5" />
        OSHA & ANSI certified B2B platform
      </div>
    </div>
  )
}