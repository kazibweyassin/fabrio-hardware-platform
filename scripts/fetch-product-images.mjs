/**
 * Fetches product images from Wikimedia Commons, Openverse, and optional Google CSE,
 * then saves them under public/uploads/products/ and updates the database.
 *
 * Run:
 *   node scripts/fetch-product-images.mjs
 *   node scripts/fetch-product-images.mjs --limit 50
 *   node scripts/fetch-product-images.mjs --sku gh-hacksaw-frame
 *   node scripts/fetch-product-images.mjs --dry-run
 *
 * Optional env for Google Image Search (100 free queries/day):
 *   GOOGLE_CSE_API_KEY=...
 *   GOOGLE_CSE_CX=...
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products')
const prisma = new PrismaClient()

const USER_AGENT = 'FabrioHardware/1.0 (product-image-seeder; +https://fabrio.com)'

const DIRECT_IMAGE_URLS = {
  'gh-cutting-disc-4-5in': [
    'https://cdn.aabtools.com/images/gazelle-gmc4-5-4-5-in-metal-cutting-disc-115mm-0.jpg',
  ],
}

/** Reuse a suitable image from a closely related SKU when search fails */
const SIBLING_IMAGE_SKUS = {
  'gh-bowsaw-blades': 'gh-bowsaw-frame',
  'gh-budget-emulsion-matt-20l': 'gh-vinyl-matt-20l',
  'gh-budget-emulsion-undercoat-20l': 'gh-budget-gloss-4l',
  'gh-budget-emulsion-undercoat-4l': 'gh-budget-gloss-1l',
  'gh-shade-net-g105': 'gh-building-line-b',
  'gh-shade-net-g95': 'gh-building-line-b',
  'gh-casa-40x50x60': 'gh-casa-94mm',
  'gh-mindy-70ng': 'gh-silicon-tube',
  'gh-rubber-squeezer-s01': 'gh-squeezer-s',
  'gh-thread-tape-b': 'gh-thread-tape-s',
  'gh-welding-rods-6013-a': 'ppe-welding-goggles',
  'gh-welding-rods-6013-b': 'ppe-welding-goggles',
}

const SEARCH_OVERRIDES = {
  'gh-pick-axe': 'pickaxe tool',
  'gh-hoe-head': 'garden hoe head',
  'gh-panga-19in': 'machete panga knife',
  'gh-panga-18in': 'machete panga knife',
  'gh-slashers': 'brush slasher machete',
  'gh-steel-handle-spades': 'garden spade shovel',
  'gh-tin-snip-cutters': 'tin snips',
  'gh-paper-cutter': 'utility knife cutter',
  'gh-silicon-tube': 'silicone sealant tube',
  'gh-industrial-silicon': 'silicone sealant construction',
  'gh-art-brush': 'paint brush',
  'gh-bowsaw-frame': 'woodworking bow saw tool',
  'gh-bowsaw-blades': 'woodworking bow saw blade',
  'gh-broom-br001': 'cleaning broom',
  'gh-brush-bs001': 'scrub brush cleaning',
  'gh-soft-broom-s': 'soft broom',
  'gh-hard-brush-b': 'hard scrub brush',
  'gh-hard-brush-s': 'hard scrub brush small',
  'gh-trowel-6in': 'bricklaying trowel',
  'gh-trowel-7in': 'bricklaying trowel',
  'gh-trowel-8in': 'bricklaying trowel',
  'gh-hacksaw-frame': 'hacksaw frame',
  'gh-hacksaw-blades': 'hacksaw blade',
  'gh-chisel-set-blue': 'wood chisel set',
  'gh-chisel-set-red': 'wood chisel set',
  'gh-building-square': 'carpenter square tool',
  'gh-building-line-b': 'mason line string reel',
  'gh-building-line-s': 'mason line string reel',
  'gh-plumb-bob': 'plumb bob tool',
  'gh-spirit-level-1ft': 'spirit level tool',
  'gh-spirit-level-1-5ft': 'spirit level tool',
  'gh-spirit-level-2ft': 'spirit level tool',
  'gh-try-square-6in': 'try square tool',
  'gh-try-square-10in': 'try square tool',
  'gh-wd40': 'WD-40 spray can',
  'gh-spray-paint': 'spray paint can',
  'gh-white-spirit-5l': 'white spirit paint thinner',
  'ppe-raincoat-adult': 'yellow raincoat waterproof',
  'ppe-raincoat-kids': 'kids raincoat',
  'ppe-mask-afton': 'dust mask respirator',
  'ppe-mask-double-canister': 'respirator mask double filter',
  'ppe-mask-single-canister': 'respirator mask single filter',
  'ppe-helmet-vented': 'construction safety helmet vented',
  'ppe-helmet-rocky': 'construction safety helmet',
  'ppe-helmet-rocky-orange': 'construction safety helmet orange',
  'ppe-gumboots-yellow': 'rubber safety gumboots yellow',
  'ppe-gumboots-black': 'rubber safety gumboots black',
  'ppe-gumboots-ordinary': 'rubber gumboots',
  'ppe-fire-ext-6kg': 'fire extinguisher 6kg red',
  'ppe-fire-ext-9kg': 'fire extinguisher 9kg red',
  'ppe-first-aid-25p': 'first aid kit box',
  'ppe-ear-muffs': 'ear muffs hearing protection',
  'ppe-ear-plug': 'ear plugs hearing protection',
  'ppe-silicon-ear-plug': 'silicone ear plugs',
  'ppe-gloves-leather': 'leather work gloves',
  'ppe-gloves-black': 'work gloves black',
  'ppe-gloves-blue': 'work gloves blue',
  'ppe-gloves-grey': 'work gloves grey',
  'ppe-gloves-pvc-black': 'PVC chemical gloves black',
  'ppe-gloves-welding': 'welding gloves',
  'ppe-welding-goggles': 'welding goggles',
  'ppe-welding-shield': 'welding face shield',
  'ppe-welding-aprons': 'leather welding apron',
  'ppe-glasses-clear': 'safety glasses clear',
  'ppe-glasses-dark': 'safety glasses dark',
  'ppe-caution-men-at-work': 'men at work caution sign',
  'ppe-caution-wet-floor': 'wet floor caution sign',
  'ppe-warning-tape-300m': 'warning barrier tape roll',
  'ppe-warning-tape-500m': 'warning barrier tape roll',
  'ppe-refl-jacket-orange-p': 'high visibility reflective jacket orange',
  'ppe-refl-jacket-blue-p': 'high visibility reflective jacket blue',
  'ppe-refl-jacket-black-p': 'high visibility reflective jacket black',
  'ppe-reflective-belts': 'reflective safety belt',
  'ppe-bin-100l-green': 'wheelie trash bin green',
  'ppe-bin-120l-blue': 'wheelie trash bin blue',
  'gh-thread-tape-b': 'PTFE thread seal tape roll',
  'gh-thread-tape-s': 'PTFE thread seal tape roll',
  'gh-sandpaper-p60': 'sandpaper abrasive sheet',
  'gh-sandpaper-p80': 'sandpaper abrasive sheet',
  'gh-sandpaper-p120': 'sandpaper abrasive sheet',
  'gh-mop-head-sdb01': 'mop head refill cleaning',
  'gh-mop-head-sdb02': 'mop head refill cleaning',
  'gh-ring-spanner-30x32': 'ring spanner wrench',
  'gh-padlock-32x38x50': 'brass padlock',
  'gh-shade-net-g105': 'construction shade net cloth',
  'gh-shade-net-g95': 'construction shade net cloth',
  'gh-welding-rods-6013-a': '6013 welding electrodes rods',
  'gh-welding-rods-6013-b': '6013 welding electrodes rods',
  'ppe-knee-elbow-guard': 'knee elbow protector guards',
  'ppe-mask-single-canister': 'industrial respirator mask filter',
  'gh-budget-emulsion-matt-20l': 'white emulsion paint bucket',
  'gh-budget-emulsion-undercoat-20l': 'white undercoat paint bucket',
  'gh-budget-emulsion-undercoat-4l': 'white undercoat paint bucket',
  'HH-YELLOW-OSHA': 'yellow hard hat construction safety',
  'gh-rubber-squeezer-s01': 'rubber floor squeegee tool',
  'gh-mindy-70ng': 'construction sealant adhesive tube',
  'gh-casa-40x50x60': 'PVC pipe connector fitting',
}

const BLOCKED_URL_TERMS = [
  'pdf',
  '.svg',
  'logo',
  'icon',
  'avatar',
  'diagram',
  'chart',
  'map',
  'flag',
  'cartoon',
  'clip-art',
  'clipart',
  'amputation',
  'wellcome',
  'medical',
  'hospital',
  'anatomy',
  'wikipedia.org/wiki',
  'back-ache',
]

const POSITIVE_URL_TERMS = [
  'tool',
  'hardware',
  'equipment',
  'product',
  'safety',
  'construction',
  'industrial',
  'glove',
  'helmet',
  'boot',
  'spanner',
  'wrench',
  'hammer',
  'paint',
  'brush',
  'trowel',
  'saw',
  'drill',
  'mask',
  'vest',
  'extinguisher',
]

function parseArgs() {
  const args = process.argv.slice(2)
  let limit = 250
  let category
  let sku
  let dryRun = false

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = Number(args[i + 1])
      i += 1
    } else if (args[i] === '--category' && args[i + 1]) {
      category = args[i + 1].replace(/-/g, ' ')
      i += 1
    } else if (args[i] === '--sku' && args[i + 1]) {
      sku = args[i + 1]
      i += 1
    } else if (args[i] === '--dry-run') {
      dryRun = true
    }
  }

  return { limit, category, sku, dryRun }
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

function normalizeName(name) {
  return name
    .replace(/"/g, '')
    .replace(/\s+-\s+.+$/, '')
    .replace(/\b\d+(\.\d+)?(mm|in|"|ft|m|kg|g|l|ltr|oz|ply)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSearchQueries(product) {
  const base = normalizeName(product.name)
  const sub = product.subcategory?.split('&')[0]?.trim()
  const category = product.category?.name || ''

  const queries = [
    SEARCH_OVERRIDES[product.sku],
    `${base} product photo`,
    `${base} tool hardware`,
    sub ? `${sub} ${base}` : null,
    category.includes('PPE') ? `${base} safety equipment` : `${base} hardware tool`,
    base,
  ].filter(Boolean)

  if (/spanner/i.test(product.name)) {
    queries.unshift(`${base} combination wrench spanner`)
  }
  if (/nails?|screws?/i.test(product.name)) {
    queries.unshift(`${base} hardware fasteners`)
  }
  if (/paint|emulsion|gloss|vinyl|varnish/i.test(product.name)) {
    queries.unshift(`${base} paint tin can`)
  }
  if (/tape measure/i.test(product.name)) {
    queries.unshift('tape measure tool construction')
  }

  return [...new Set(queries)]
}

function scoreCandidate(url, title = '', query = '') {
  const haystack = `${url} ${title}`.toLowerCase()
  const qWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  let score = 0

  for (const word of qWords) {
    if (haystack.includes(word)) score += 3
  }

  if (url.includes('wikimedia.org')) score += 4
  if (url.includes('upload.wikimedia.org')) score += 2
  if (haystack.includes('product') || haystack.includes('tool')) score += 1

  for (const blocked of BLOCKED_URL_TERMS) {
    if (haystack.includes(blocked)) score -= 20
  }

  for (const positive of POSITIVE_URL_TERMS) {
    if (haystack.includes(positive)) score += 2
  }

  return score
}

function isBlockedUrl(url, title = '') {
  const haystack = `${url} ${title}`.toLowerCase()
  return BLOCKED_URL_TERMS.some((term) => haystack.includes(term))
}

async function urlReachable(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10000),
    })
    if (response.ok) return true
    if (response.status === 405 || response.status === 403) {
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(10000),
      })
      return getResponse.ok
    }
    return false
  } catch {
    return false
  }
}

async function downloadUrl(url, sku) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(25000),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 1200) {
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
  api.searchParams.set('gsrlimit', '12')
  api.searchParams.set('prop', 'imageinfo')
  api.searchParams.set('iiprop', 'url|mime|size')
  api.searchParams.set('iiurlwidth', '900')

  const response = await fetch(api, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) throw new Error(`Wikimedia HTTP ${response.status}`)

  const data = await response.json()
  const pages = Object.values(data?.query?.pages ?? {})

  return pages
    .map((page) => ({
      url: page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url,
      title: page.title ?? '',
      width: page.imageinfo?.[0]?.thumbwidth || page.imageinfo?.[0]?.width || 0,
      height: page.imageinfo?.[0]?.thumbheight || page.imageinfo?.[0]?.height || 0,
      source: 'wikimedia',
    }))
    .filter((item) => item.url && !isBlockedUrl(item.url, item.title))
    .filter((item) => item.width >= 250 || item.height >= 250)
}

async function searchOpenverse(query) {
  const api = new URL('https://api.openverse.org/v1/images/')
  api.searchParams.set('q', query)
  api.searchParams.set('page_size', '15')
  api.searchParams.set('license_type', 'commercial,modification')

  const response = await fetch(api, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) throw new Error(`Openverse HTTP ${response.status}`)

  const data = await response.json()

  return (data.results || [])
    .map((item) => ({
      url: item.url,
      title: item.title ?? '',
      width: item.width || 0,
      height: item.height || 0,
      source: 'openverse',
    }))
    .filter((item) => item.url && !isBlockedUrl(item.url, item.title))
    .filter((item) => item.width >= 350 && item.height >= 250)
}

async function searchGoogleCse(query) {
  const key = process.env.GOOGLE_CSE_API_KEY
  const cx = process.env.GOOGLE_CSE_CX
  if (!key || !cx) return []

  const api = new URL('https://www.googleapis.com/customsearch/v1')
  api.searchParams.set('key', key)
  api.searchParams.set('cx', cx)
  api.searchParams.set('searchType', 'image')
  api.searchParams.set('num', '8')
  api.searchParams.set('q', `${query} product`)
  api.searchParams.set('safe', 'active')

  const response = await fetch(api, { signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`Google CSE HTTP ${response.status}`)

  const data = await response.json()
  return (data.items || [])
    .map((item) => ({
      url: item.link,
      title: item.title ?? '',
      width: item.image?.width || 0,
      height: item.image?.height || 0,
      source: 'google',
    }))
    .filter((item) => item.url && !isBlockedUrl(item.url, item.title))
}

async function collectCandidates(product) {
  const queries = buildSearchQueries(product)
  const candidates = []
  const seen = new Set()

  for (const query of queries) {
    const sources = [
      searchWikimedia(query),
      searchOpenverse(query),
      searchGoogleCse(query),
    ]

    const results = await Promise.allSettled(sources)
    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      for (const item of result.value) {
        if (!item.url || seen.has(item.url)) continue
        seen.add(item.url)
        candidates.push({ ...item, query, score: scoreCandidate(item.url, item.title, query) })
      }
    }

    if (candidates.some((c) => c.score >= 6)) break
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return candidates.sort((a, b) => b.score - a.score)
}

async function fetchProductImage(product, dryRun) {
  const directUrls = DIRECT_IMAGE_URLS[product.sku] ?? []
  for (const url of directUrls) {
    try {
      if (dryRun) return { status: 'ok', detail: `direct → ${url}`, image: url }
      const imagePath = await downloadUrl(url, product.sku)
      return { status: 'ok', detail: `direct → ${imagePath}`, image: imagePath }
    } catch {
      // try next direct URL
    }
  }

  const candidates = await collectCandidates(product)
  for (const candidate of candidates.slice(0, 12)) {
    if (candidate.score < 3) continue
    try {
      if (dryRun) {
        return {
          status: 'ok',
          detail: `${candidate.source}:${candidate.query} → ${candidate.url}`,
          image: candidate.url,
        }
      }
      const imagePath = await downloadUrl(candidate.url, product.sku)
      return {
        status: 'ok',
        detail: `${candidate.source}:${candidate.query} → ${imagePath}`,
        image: imagePath,
      }
    } catch {
      if (candidate.url.includes('wikimedia.org') && (await urlReachable(candidate.url))) {
        return {
          status: 'ok',
          detail: `${candidate.source}-url → ${candidate.url}`,
          image: candidate.url,
        }
      }
    }
  }

  const siblingSku = SIBLING_IMAGE_SKUS[product.sku]
  if (siblingSku) {
    const sibling = await prisma.product.findUnique({
      where: { sku: siblingSku },
      select: { image: true },
    })
    if (sibling?.image) {
      return {
        status: 'ok',
        detail: `sibling:${siblingSku} → ${sibling.image}`,
        image: sibling.image,
      }
    }
  }

  return { status: 'miss', detail: 'no suitable image found' }
}

async function main() {
  const { limit, category, sku, dryRun } = parseArgs()
  ensureDir()

  const where = {
    OR: [{ image: null }, { image: '' }],
    active: true,
  }

  if (sku) where.sku = sku
  if (category) {
    where.category = { name: { equals: category, mode: 'insensitive' } }
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: 'asc' },
    take: limit,
  })

  console.log(`Fetching images for ${products.length} products${dryRun ? ' (dry run)' : ''}...\n`)

  let ok = 0
  let miss = 0

  for (const product of products) {
    if (!dryRun && imageExists(product.sku)) {
      const existing = fs.readdirSync(uploadDir).find((file) => file.startsWith(`${product.sku}.`))
      const imageUrl = `/uploads/products/${existing}`
      await prisma.product.update({ where: { id: product.id }, data: { image: imageUrl } })
      console.log(`· ${product.sku.padEnd(28)} already on disk`)
      ok += 1
      continue
    }

    const result = await fetchProductImage(product, dryRun)
    if (result.status === 'ok') {
      if (!dryRun) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: result.image },
        })
      }
      console.log(`✓ ${product.sku.padEnd(28)} ${result.detail}`)
      ok += 1
    } else {
      console.log(`✗ ${product.sku.padEnd(28)} ${result.detail}`)
      miss += 1
    }

    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  const withImg = await prisma.product.count({ where: { image: { not: null } } })
  const total = await prisma.product.count()

  console.log(`\nDone: ${ok} matched, ${miss} not found this run.`)
  console.log(`Catalogue total: ${withImg}/${total} products now have images.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())