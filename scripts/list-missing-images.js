const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const missing = await prisma.product.findMany({
    where: { OR: [{ image: null }, { image: '' }] },
    select: {
      sku: true,
      name: true,
      subcategory: true,
      category: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  })
  console.log(`Missing images: ${missing.length}`)
  missing.forEach((p) => console.log(`${p.sku} | ${p.name} | ${p.category?.name || ''}`))
}

main()
  .finally(() => prisma.$disconnect())