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
    <span className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
      <Icon className="w-6 h-6" strokeWidth={1.75} aria-hidden />
    </span>
  )
}