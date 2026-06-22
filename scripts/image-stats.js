const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.product.findMany({ select: { sku: true, image: true } })
  const remote = rows.filter((r) => r.image?.startsWith('http'))
  const local = rows.filter((r) => r.image?.startsWith('/uploads'))
  const none = rows.filter((r) => !r.image)

  console.log({ total: rows.length, local: local.length, remote: remote.length, none: none.length })
  if (remote.length) {
    console.log('\nRemote URLs (first 10):')
    remote.slice(0, 10).forEach((r) => console.log(r.sku, r.image))
  }
}

main().finally(() => prisma.$disconnect())