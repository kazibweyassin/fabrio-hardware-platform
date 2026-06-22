import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  children?: React.ReactNode
  className?: string
  dark?: boolean
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  children,
  className,
  dark = false,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 sm:mb-8 lg:mb-10', className)}>
      {eyebrow && (
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-widest mb-3',
            dark ? 'text-brand' : 'text-accent'
          )}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-2xl">
          <h1
            className={cn(
              'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight',
              dark ? 'text-white' : 'text-foreground'
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                'mt-3 text-base sm:text-lg leading-relaxed',
                dark ? 'text-white/70' : 'text-muted-foreground'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  )
}