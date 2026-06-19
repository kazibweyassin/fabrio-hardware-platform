/**
 * Set a product image by SKU.
 * Usage: node scripts/set-product-image.js <sku> <image-url>
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const sku = process.argv[2]
  const image = process.argv[3]

  if (!sku || !image) {
    console.error('Usage: node scripts/set-product-image.js <sku> <image-url>')
    process.exit(1)
  }

  const product = await prisma.product.update({
    where: { sku },
    data: { image },
    select: { name: true, sku: true, image: true },
  })

  console.log(`Updated image for: ${product.name}`)
  console.log(product.image)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())