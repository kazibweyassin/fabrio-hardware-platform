import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:customers', RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer record for user
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        orders: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: { product: true },
            },
          },
        },
        quotations: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    })

    if (!customer) {
      // Create customer record if doesn't exist
      const newCustomer = await prisma.customer.create({
        data: {
          userId: session.user.id,
          businessName: session.user.name || undefined,
          creditLimit: 50000,
        },
      })
      return Response.json(newCustomer)
    }

    return Response.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return Response.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const rateLimited = checkRateLimit(req, 'api:customers:write', 30, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const updatedCustomer = await prisma.customer.update({
      where: { userId: session.user.id },
      data: {
        businessName: body.businessName,
        phone: body.phone,
        taxId: body.taxId,
        billingAddress: body.billingAddress,
        billingCity: body.billingCity,
        billingState: body.billingState,
        billingZip: body.billingZip,
        billingCountry: body.billingCountry,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingState: body.shippingState,
        shippingZip: body.shippingZip,
        shippingCountry: body.shippingCountry,
      },
    })

    return Response.json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return Response.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}
