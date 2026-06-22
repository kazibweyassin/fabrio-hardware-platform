import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function urlWorks(url) {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'FabrioHardware/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    return r.ok
  } catch {
    return false
  }
}

async function main() {
  const products = await prisma.product.findMany({
    where: { image: { startsWith: 'http' } },
    select: { id: true, sku: true, image: true },
  })

  let broken = 0
  for (const product of products) {
    const ok = await urlWorks(product.image)
    if (!ok) {
      await prisma.product.update({ where: { id: product.id }, data: { image: null } })
      console.log(`reset ${product.sku}`)
      broken += 1
    }
  }

  console.log(`\nReset ${broken} broken remote image URLs`)
}

main().finally(() => prisma.$disconnect())