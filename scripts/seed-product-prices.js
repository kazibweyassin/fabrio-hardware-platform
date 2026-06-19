/**
 * Assign retail, wholesale, and base prices to all catalogue products.
 * Run: node scripts/seed-product-prices.js
 *      node scripts/seed-product-prices.js --force   (re-price products that already have prices)
 */

const { PrismaClient } = require('@prisma/client')
const { computeProductPrices } = require('../lib/product-pricing')

const prisma = new PrismaClient()
const force = process.argv.includes('--force')

async function main() {
  const products = await prisma.product.findMany({
    where: force ? { active: true } : { retailPrice: 0 },
    select: {
      id: true,
      name: true,
      sku: true,
      subcategory: true,
      retailPrice: true,
    },
    orderBy: { name: 'asc' },
  })

  if (products.length === 0) {
    console.log('No products need pricing.')
    return
  }

  console.log(`Pricing ${products.length} product${products.length === 1 ? '' : 's'}...\n`)

  let updated = 0

  for (const product of products) {
    const prices = computeProductPrices(product)

    await prisma.product.update({
      where: { id: product.id },
      data: prices,
    })

    console.log(
      `✓ ${product.name.padEnd(40)} ${prices.retailPrice.toLocaleString()} UGX (wholesale ${prices.wholesalePrice.toLocaleString()})`
    )
    updated += 1
  }

  const remaining = await prisma.product.count({ where: { retailPrice: 0 } })
  console.log(`\nDone: ${updated} updated. ${remaining} products still at 0 UGX.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())