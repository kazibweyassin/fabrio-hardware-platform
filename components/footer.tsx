import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone } from 'lucide-react'
import NewsletterForm from '@/components/layout/newsletter-form'

const productLinks = [
  { href: '/products?category=safety-&-ppe', label: 'Safety & PPE' },
  { href: '/products?category=hand-tools', label: 'Hand Tools' },
  { href: '/products?category=power-tools', label: 'Power Tools' },
  { href: '/products?category=protective-gear', label: 'Protective Gear' },
]

const companyLinks = [
  { href: '/products', label: 'Product Catalog' },
  { href: '/auth/signup', label: 'Create Account' },
  { href: '/auth/login', label: 'Sign In' },
]


export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <Image src="/fabrio-logo.png" alt="Fabrio" width={48} height={48} className="w-12 h-12" />
              <div>
                <h3 className="font-bold text-xl tracking-tight">Fabrio Hardware</h3>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">Est. 2025</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm mb-6">
              Building your safety for success. Premium industrial hardware and OSHA-certified PPE for enterprises, contractors, and manufacturing operations.
            </p>
            <div className="space-y-2.5 text-sm text-white/60">
              <p className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                 Industrial Area Bweyogerere, Uganda
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand shrink-0" />
                +256 700 123 456
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand shrink-0" />
                support@fabrio.com
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/90 mb-4">Products</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/90 mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/90 mb-4">Stay Updated</h4>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Get bulk pricing alerts, new product launches, and industry safety updates.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Fabrio Hardware Corporation. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <span>ISO 9001 Certified</span>
            <span>•</span>
            <span>OSHA Compliant</span>
            <span>•</span>
            <span>ANSI Standards</span>
          </div>
        </div>
      </div>
    </footer>
  )
}