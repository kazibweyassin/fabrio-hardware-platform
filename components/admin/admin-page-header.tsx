import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      <div>
        {eyebrow && <p className="type-eyebrow mb-1">{eyebrow}</p>}
        <h2 className="type-h2">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}