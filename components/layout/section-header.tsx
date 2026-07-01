import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: { href: string; label: string }
  icon?: LucideIcon
  iconVariant?: 'primary' | 'accent'
  className?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  icon: Icon,
  iconVariant = 'primary',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-6 mb-10', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
              iconVariant === 'accent' ? 'bg-accent/15 text-accent' : 'bg-primary/5 text-primary'
            )}
          >
            <Icon className="w-5 h-5" aria-hidden />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="type-eyebrow mb-2">{eyebrow}</p>}
          <h2 className="type-h2">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <Link
          href={action.href}
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all shrink-0"
        >
          {action.label} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}