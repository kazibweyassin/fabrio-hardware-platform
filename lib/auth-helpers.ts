import { auth } from '@/lib/auth'
import type { Session } from '@/lib/auth'

type AuthSession = Session & {
  user: Session['user'] & { role?: string }
}

export async function getSession(headers: Headers): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers })
  return session as AuthSession | null
}

export async function requireAuth(headers: Headers): Promise<AuthSession> {
  const session = await getSession(headers)
  if (!session?.user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return session
}

export async function requireAdmin(headers: Headers): Promise<AuthSession> {
  const session = await requireAuth(headers)
  if (session.user.role !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return session
}

export function isAdmin(session: AuthSession | null): boolean {
  return session?.user?.role === 'admin'
}