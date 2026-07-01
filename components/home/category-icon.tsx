import {
  Hammer,
  HardHat,
  Package,
  Shield,
  ShieldCheck,
  Shirt,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Safety & PPE': Shield,
  'Hand Tools': Hammer,
  'Power Tools': Zap,
  'Protective Gear': ShieldCheck,
  'Workwear & Apparel': Shirt,
  'Hard Hats & Helmets': HardHat,
}

interface CategoryIconProps {
  name: string
}

export default function CategoryIcon({ name }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[name] ?? Package

  return (
    <span className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/8 to-brand/8 text-primary ring-1 ring-border/60 group-hover:from-primary/12 group-hover:to-brand/12 group-hover:ring-brand/25 transition-all duration-300">
      <Icon className="w-6 h-6" strokeWidth={1.75} aria-hidden />
    </span>
  )
}