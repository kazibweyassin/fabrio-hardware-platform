import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:inventory', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(req.headers)
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (productId) {
      const inventory = await prisma.inventory.findMany({
        where: { productId },
        include: { warehouse: true, product: true },
      })
      return Response.json(inventory)
    }

    const inventory = await prisma.inventory.findMany({
      include: { product: true, warehouse: true },
      orderBy: { quantity: 'asc' },
    })

    const lowStockInventory = inventory.filter(
      (item) => item.quantity <= item.reorderLevel
    )

    return Response.json(lowStockInventory.slice(0, 50))
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error fetching inventory:', error)
    return Response.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:inventory:write', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(req.headers)
    const body = await req.json()
    const { inventoryId, quantity } = body

    if (!inventoryId || quantity === undefined || quantity < 0) {
      return Response.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        quantity,
        lastRestocked: new Date(),
      },
      include: { product: true, warehouse: true },
    })

    return Response.json(updatedInventory)
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error updating inventory:', error)
    return Response.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}