import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({
      status: 'ok',
      timestamp,
      database: 'connected',
    })
  } catch {
    return Response.json(
      {
        status: 'degraded',
        timestamp,
        database: 'unreachable',
      },
      { status: 503 }
    )
  }
}