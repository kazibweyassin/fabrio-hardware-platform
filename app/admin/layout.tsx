import AdminShell from '@/components/admin/admin-shell'
import { NOINDEX_METADATA } from '@/lib/seo'

export const metadata = NOINDEX_METADATA

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}