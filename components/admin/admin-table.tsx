import { cn } from '@/lib/utils'

interface AdminTableProps {
  children: React.ReactNode
  className?: string
}

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className={cn('card-elevated overflow-hidden', className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function AdminTableElement({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm">{children}</table>
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface border-b border-border">
      <tr>{children}</tr>
    </thead>
  )
}

export function AdminTableHeaderCell({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={cn(
        'p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      {children}
    </th>
  )
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function AdminTableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-surface/80 transition-colors">
      {children}
    </tr>
  )
}

export function AdminTableCell({
  children,
  align = 'left',
  className,
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}) {
  return (
    <td className={cn('p-4', align === 'right' ? 'text-right' : 'text-left', className)}>
      {children}
    </td>
  )
}