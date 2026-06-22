/**
 * Downloads products that still use remote image URLs into public/uploads/products/
 */
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products')

function extFromContentType(contentType = '', url = '') {
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (url.includes('.png')) return '.png'
  return '.jpg'
}

async function download(url, sku) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'FabrioHardware/1.0' },
    signal: AbortSignal.timeout(25000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 800) throw new Error('too small')
  const ext = extFromContentType(response.headers.get('content-type'), url)
  fs.mkdirSync(uploadDir, { recursive: true })
  const out = path.join(uploadDir, `${sku}${ext}`)
  fs.writeFileSync(out, buffer)
  return `/uploads/products/${sku}${ext}`
}

async function main() {
  const products = await prisma.product.findMany({
    where: { image: { startsWith: 'http' } },
    select: { id: true, sku: true, image: true, name: true },
  })

  console.log(`Downloading ${products.length} remote images...\n`)

  let ok = 0
  let fail = 0

  for (const product of products) {
    try {
      const localPath = await download(product.image, product.sku)
      await prisma.product.update({ where: { id: product.id }, data: { image: localPath } })
      console.log(`✓ ${product.sku} → ${localPath}`)
      ok += 1
    } catch (error) {
      console.log(`✗ ${product.sku} ${error.message} — searching fallback`)
      fail += 1
    }
    await new Promise((r) => setTimeout(r, 300))
  }

  console.log(`\nDone: ${ok} downloaded, ${fail} failed`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())