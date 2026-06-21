import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession, isAdmin } from '@/lib/auth-helpers'

export async function guardAdminPage() {
  const session = await getSession(await headers())

  if (!session?.user) {
    redirect('/auth/login?redirect=/admin')
  }

  if (!isAdmin(session)) {
    redirect('/')
  }
}