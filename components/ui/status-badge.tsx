import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
  variantClass: string
}

export default function StatusBadge({ status, className, variantClass }: StatusBadgeProps) {
  return (
    <span className={cn('status-pill', variantClass, className)}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}