/**
 * Downloads product photos from Wikimedia Commons into public/uploads/products/
 * and updates the database image field.
 *
 * Run: node scripts/fetch-product-images.mjs
 *      node scripts/fetch-product-images.mjs --limit 50
 *      node scripts/fetch-product-images.mjs --category general-hardware
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products')
const prisma = new PrismaClient()

const DIRECT_IMAGE_URLS = {
  'gh-cutting-disc-4-5in': [
    'https://cdn.aabtools.com/images/gazelle-gmc4-5-4-5-in-metal-cutting-disc-115mm-0.jpg',
  ],
}

const SEARCH_OVERRIDES = {
  'gh-pick-axe': 'pickaxe tool',
  'gh-hoe-head': 'garden hoe',
  'gh-panga-19in': 'machete tool',
  'gh-panga-18in': 'machete tool',
  'gh-slashers': 'slasher brush cutter',
  'gh-steel-handle-spades': 'garden spade shovel',
  'gh-tin-snip-cutters': 'tin snips',
  'gh-paper-cutter': 'utility knife cutter',
  'gh-silicon-tube': 'silicone sealant tube',
  'gh-industrial-silicon': 'silicone sealant construction',
  'gh-art-brush': 'paint brush',
  'gh-baby-roller': 'paint roller',
  'gh-roller-9in-acron': 'paint roller',
  'gh-roller-9in-robinson': 'paint roller',
  'gh-roller-9in-wiseup': 'paint roller',
  'gh-baby-roller-4in-wiseup': 'paint roller small',
  'gh-extension-4way': 'power strip extension cord',
  'gh-extension-6way': 'power strip extension cord',
  'ppe-raincoat-adult': 'raincoat waterproof',
  'ppe-mask-afton': 'dust mask respirator',
  'SV-ANSI-2-ORG': 'high visibility safety vest orange',
  'gh-ara-circle-32x38x50': 'pipe fitting plumbing',
  'gh-baoling-100mm': 'grinding wheel abrasive disc',
  'gh-bowsaw-frame': 'bow saw frame',
  'gh-bowsaw-blades': 'bow saw blade',
  'gh-art-brush': 'paint brush art',
  'gh-baby-roller-4in-wiseup': 'paint roller',
  'gh-trowel-6in': 'bricklaying trowel',
  'gh-trowel-7in': 'bricklaying trowel',
  'gh-trowel-8in': 'bricklaying trowel',
  'gh-broom-br001': 'cleaning broom',
  'gh-brush-bs001': 'scrub brush',
  'gh-building-square': 'carpenter square tool',
  'gh-building-line-b': 'mason line string',
  'gh-building-line-s': 'mason line string',
  'gh-chisel-set-blue': 'wood chisel set',
  'gh-chisel-set-red': 'wood chisel set',
  'gh-hacksaw-frame': 'hacksaw',
  'gh-hacksaw-blades': 'hacksaw blade',
  'gh-pick-axe': 'pickaxe',
  'gh-hoe-head': 'garden hoe',
  'gh-panga-19in': 'machete',
  'gh-panga-18in': 'machete',
  'gh-slashers': 'brush slasher',
  'gh-steel-handle-spades': 'garden spade',
  'gh-tin-snip-cutters': 'tin snips',
  'gh-paper-cutter': 'utility knife',
  'gh-wd40': 'WD-40',
  'gh-silicon-tube': 'silicone sealant',
  'gh-industrial-silicon': 'silicone sealant tube',
  'ppe-raincoat-adult': 'yellow raincoat',
  'ppe-mask-afton': 'surgical face mask',
  'ppe-helmet-vented': 'construction safety helmet',
  'ppe-helmet-rocky': 'construction safety helmet',
  'ppe-helmet-rocky-orange': 'construction safety helmet orange',
  'ppe-gumboots-yellow': 'rubber gumboots yellow',
  'ppe-gumboots-black': 'rubber gumboots',
  'ppe-gumboots-ordinary': 'rubber gumboots',
}

function parseArgs() {
  const args = process.argv.slice(2)
  let limit = 40
  let category

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = Number(args[i + 1])
      i += 1
    } else if (args[i] === '--category' && args[i + 1]) {
      category = args[i + 1].replace(/-/g, ' ')
      i += 1
    }
  }

  return { limit, category }
}

function ensureDir() {
  fs.mkdirSync(uploadDir, { recursive: true })
}

function imageExists(sku) {
  return ['.jpg', '.jpeg', '.png', '.webp'].some((ext) =>
    fs.existsSync(path.join(uploadDir, `${sku}${ext}`)),
  )
}

function extFromContentType(contentType = '', url = '') {
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg'
  if (url.endsWith('.png')) return '.png'
  if (url.endsWith('.webp')) return '.webp'
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return '.jpg'
  return '.jpg'
}

function buildSearchQuery(name, subcategory) {
  const cleaned = name
    .replace(/"/g, '')
    .replace(/\s+-\s+.+$/, '')
    .replace(/\d+mm|\d+x\d+x\d+/gi, '')
    .trim()

  if (cleaned.length >= 4) return `${cleaned} tool`
  if (subcategory) return subcategory.split('&')[0].trim()
  return name
}

async function downloadUrl(url, sku) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'FabrioHardware/1.0 (product-image-fetch)' },
    signal: AbortSignal.timeout(20000),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 800) {
    throw new Error('File too small')
  }

  const ext = extFromContentType(response.headers.get('content-type'), url)
  const outPath = path.join(uploadDir, `${sku}${ext}`)
  fs.writeFileSync(outPath, buffer)
  return `/uploads/products/${sku}${ext}`
}

async function searchWikimedia(query) {
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.searchParams.set('action', 'query')
  api.searchParams.set('format', 'json')
  api.searchParams.set('generator', 'search')
  api.searchParams.set('gsrsearch', query)
  api.searchParams.set('gsrnamespace', '6')
  api.searchParams.set('gsrlimit', '8')
  api.searchParams.set('prop', 'imageinfo')
  api.searchParams.set('iiprop', 'url|mime')
  api.searchParams.set('iiurlwidth', '640')

  const response = await fetch(api, {
    headers: { 'User-Agent': 'FabrioHardware/1.0 (product-image-fetch)' },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Wikimedia HTTP ${response.status}`)
  }

  const data = await response.json()
  const pages = Object.values(data?.query?.pages ?? {})

  return pages
    .map((page) => ({
      title: page.title ?? '',
      info: page.imageinfo?.[0],
    }))
    .filter(({ info, title }) => {
      if (!info?.url) return false
      const mime = info.mime ?? ''
      if (mime.includes('svg')) return false
      if (title.toLowerCase().includes('.svg')) return false
      return true
    })
    .map(({ info }) => info.thumburl || info.url)
}

async function fetchProductImage(product) {
  const directUrls = DIRECT_IMAGE_URLS[product.sku] ?? []
  for (const url of directUrls) {
    try {
      const imagePath = await downloadUrl(url, product.sku)
      return { status: 'ok', detail: `direct → ${imagePath}` }
    } catch {
      return { status: 'ok', detail: `direct → ${url}` }
    }
  }

  const queries = [
    SEARCH_OVERRIDES[product.sku],
    buildSearchQuery(product.name, product.subcategory),
    product.subcategory,
    product.name.replace(/"/g, ''),
  ].filter(Boolean)

  const uniqueQueries = [...new Set(queries)]

  for (const query of uniqueQueries) {
    try {
      const urls = await searchWikimedia(query)
      for (const url of urls) {
        try {
          const imagePath = await downloadUrl(url, product.sku)
          return { status: 'ok', detail: `${query} → ${imagePath}` }
        } catch {
          // try next image result
        }
      }
    } catch {
      // try next query
    }
  }

  return { status: 'miss', detail: 'no suitable Wikimedia image found' }
}

async function main() {
  const { limit, category } = parseArgs()
  ensureDir()

  const where = {
    image: null,
    active: true,
  }

  if (category) {
    where.category = {
      name: { equals: category, mode: 'insensitive' },
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: 'asc' },
    take: limit,
  })

  console.log(`Fetching images for up to ${products.length} products...\n`)

  let ok = 0
  let miss = 0

  for (const product of products) {
    if (imageExists(product.sku)) {
      const existing = fs
        .readdirSync(uploadDir)
        .find((file) => file.startsWith(`${product.sku}.`))
      const imageUrl = `/uploads/products/${existing}`
      await prisma.product.update({
        where: { id: product.id },
        data: { image: imageUrl },
      })
      console.log(`· ${product.name.padEnd(36)} already on disk`)
      ok += 1
      continue
    }

    const result = await fetchProductImage(product)
    if (result.status === 'ok') {
      const image = result.detail.split('→')[1].trim()
      await prisma.product.update({
        where: { id: product.id },
        data: { image },
      })
      console.log(`✓ ${product.name.padEnd(36)} ${result.detail}`)
      ok += 1
    } else {
      console.log(`✗ ${product.name.padEnd(36)} ${result.detail}`)
      miss += 1
    }

    await new Promise((resolve) => setTimeout(resolve, 350))
  }

  const withImg = await prisma.product.count({ where: { image: { not: null } } })
  const total = await prisma.product.count()

  console.log(`\nDone: ${ok} with images, ${miss} not found this run.`)
  console.log(`Catalogue total: ${withImg}/${total} products now have images.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())