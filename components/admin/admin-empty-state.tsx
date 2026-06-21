import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: AdminEmptyStateProps) {
  return (
    <div className="card-elevated p-12 text-center">
      <Icon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="type-h3 mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button className="rounded-xl gradient-brand text-brand-foreground border-0 font-semibold">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}